import asyncio
import pandas as pd
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.models.municipality import Municipality
import uuid

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:jaynepal@db:5432/nepal_opportunity_map")
engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def seed_data():
    csv_path = os.path.join(os.path.dirname(__file__), "ml_models", "rupandehi_digital_twin_varied.csv")
    print(f"Loading data from {csv_path}")
    try:
        df = pd.read_csv(csv_path)
    except FileNotFoundError:
        print("CSV not found.")
        return
        
    muns = df.groupby('municipality_name').agg({
        'population': 'sum',
        'latitude': 'mean',
        'longitude': 'mean'
    }).reset_index()

    async with async_session() as session:
        # Note: We need PostGIS installed. 'geom' requires WKBElement. 
        # For a simple seed to avoid GIS errors if PostGIS isn't set up yet, 
        # we might need to skip inserting if the DB schema strictly requires WKBElement.
        # But let's construct a simple WKT point for the municipality center to populate `geom`.
        print("Seeding municipalities...")
        for _, row in muns.iterrows():
            m_name = row['municipality_name']
            lon = row['longitude']
            lat = row['latitude']
            wkt = f"SRID=4326;POINT({lon} {lat})"
            
            # This is a very simplified seed just to get names into the DB so the Frontend doesn't crash
            new_mun = Municipality(
                municipality_id=str(uuid.uuid4()),
                name=m_name,
                district="Rupandehi",
                province="Lumbini",
                total_population=int(row['population']),
                geom=wkt
            )
            session.add(new_mun)
        
        try:
            await session.commit()
            print("Successfully seeded municipalities.")
        except Exception as e:
            print(f"Error seeding data: {e}")

if __name__ == "__main__":
    asyncio.run(seed_data())
