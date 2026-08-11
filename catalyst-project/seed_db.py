import asyncio
import pandas as pd
import json
import os
import uuid
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.models.municipality import Municipality

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:jaynepal@db:5432/nepal_opportunity_map")
engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

def clean_name(name):
    """Normalize names for matching."""
    if not name: return ""
    name = name.lower().replace("municipality", "").replace("rural", "").replace("sub-metropolitan city", "").replace("metropolitan city", "").strip()
    # Spelling corrections for GeoJSON matching
    if name == "tillotama": return "tilottama"
    if name == "suddhodhan": return "sudhodhan"
    return name

async def seed_data():
    base_dir = os.path.dirname(__file__)
    csv_path = os.path.join(base_dir, "ml_models", "rupandehi_digital_twin_varied.csv")
    geojson_path = os.path.join(base_dir, "nepal-municipalities.geojson")
    
    print(f"Loading CSV data from {csv_path}")
    try:
        df = pd.read_csv(csv_path)
    except FileNotFoundError:
        print("CSV not found.")
        return
        
    print(f"Loading GeoJSON data from {geojson_path}")
    try:
        with open(geojson_path, 'r', encoding='utf-8') as f:
            geojson_data = json.load(f)
    except FileNotFoundError:
        print("GeoJSON not found.")
        return

    # Create a mapping of clean name to GeoJSON feature geometry
    geo_map = {}
    for feature in geojson_data['features']:
        props = feature.get('properties', {})
        name = props.get('NAME', '')
        district = props.get('DISTRICT', '')
        geom = feature.get('geometry', {})
        if name and district.lower() == 'rupandehi':
            geo_map[clean_name(name)] = json.dumps(geom)

    muns = df.groupby('municipality_name').agg({
        'population': 'sum'
    }).reset_index()

    async with async_session() as session:
        print("Seeding municipalities with actual Polygon geometries...")
        
        # Clear existing to prevent duplicates during testing
        await session.execute(text("TRUNCATE TABLE municipalities CASCADE"))
        
        for _, row in muns.iterrows():
            m_name = row['municipality_name']
            clean_m = clean_name(m_name)
            
            # Find geometry from geo_map, fallback to null (or we could skip)
            geom_json = geo_map.get(clean_m)
            if not geom_json:
                print(f"Warning: No geometry found for {m_name}")
                continue
                
            mun_id = str(uuid.uuid4())
            
            # We must use raw SQL to insert GeoJSON into PostGIS properly
            query = text("""
                INSERT INTO municipalities (municipality_id, name, district, province, total_population, geom)
                VALUES (:id, :name, :district, :province, :pop, ST_SetSRID(ST_GeomFromGeoJSON(:geom), 4326))
            """)
            
            await session.execute(query, {
                "id": mun_id,
                "name": m_name,
                "district": "Rupandehi",
                "province": "Lumbini",
                "pop": int(row['population']),
                "geom": geom_json
            })
            print(f"Inserted {m_name} with polygon geometry.")
        
        try:
            await session.commit()
            print("Successfully seeded municipalities.")
        except Exception as e:
            print(f"Error seeding data: {e}")

if __name__ == "__main__":
    asyncio.run(seed_data())
