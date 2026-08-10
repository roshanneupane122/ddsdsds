from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.services.ml_inference import ml_service
from app.services.analyze_service import analyze_service
from app.api.dependencies import DBSession
from sqlalchemy import text

router = APIRouter()

@router.get("/layers", summary="Get Spatial Layers as GeoJSON")
async def get_spatial_layers(db: DBSession):
    """
    Returns a GeoJSON FeatureCollection where each feature is a municipality.
    Properties include dynamic ML-derived scores (agriculture, infrastructure, economic, etc.)
    """
    if ml_service.ward_data is None:
        raise HTTPException(status_code=503, detail="ML Service data not loaded.")
        
    # We will fetch geometries from the DB if available, else we mock points.
    # In a full PostGIS setup, we query ST_AsGeoJSON(geom).
    # Since we might not have full polygons in this MVP (only points), we'll do our best.
    
    query = text("""
        SELECT municipality_id, name, district, province, total_population,
               ST_AsGeoJSON(geom) as geojson
        FROM municipalities
    """)
    result = await db.execute(query)
    db_muns = result.fetchall()
    
    # We'll use the raw data from analyze_service which contains aggregated stats per municipality
    stats_df = analyze_service.raw_data
    
    features = []
    
    for row in db_muns:
        # Match with stats_df
        mun_name = row.name
        
        props = {
            "id": str(row.municipality_id),
            "name": mun_name,
            "district": row.district,
            "province": row.province,
            "population": row.total_population,
            # Fallbacks in case stats aren't found
            "agricultureScore": 50,
            "tourismScore": 50,
            "infrastructureScore": 50,
            "economicScore": 50,
            "digitalScore": 50
        }
        
        if stats_df is not None:
            # Try to find this municipality in the stats
            stat_row = stats_df[stats_df['municipality_name'].str.lower() == mun_name.lower()]
            if not stat_row.empty:
                sr = stat_row.iloc[0]
                
                # Derive scores (0-100) from the indicators
                # This is a simplified normalization for the spatial layer visualization
                
                props["agricultureScore"] = min(sr.get('agriculture_pct', 50) * 1.5, 100)
                props["tourismScore"] = min(sr.get('development_index', 50) + 10, 100) # Proxy
                
                # Infrastructure = avg of electricity and internet
                infra = (sr.get('electricity_access_pct', 50) + sr.get('internet_access_pct', 50)) / 2
                props["infrastructureScore"] = infra
                
                # Economic = function of income and urbanization
                income_normalized = min((sr.get('average_income_npr', 10000) / 50000) * 100, 100)
                econ = (income_normalized + sr.get('urbanization_rate', 50)) / 2
                props["economicScore"] = econ
                
                # Digital = internet access
                props["digitalScore"] = min(sr.get('internet_access_pct', 50) * 1.2, 100)
                
        # Parse geojson
        import json
        geom = {"type": "Point", "coordinates": [83.4735, 27.6186]}
        if row.geojson:
            try:
                geom = json.loads(row.geojson)
            except:
                pass
                
        features.append({
            "type": "Feature",
            "geometry": geom,
            "properties": props
        })
        
    return {
        "type": "FeatureCollection",
        "features": features
    }
