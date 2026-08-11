from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.services.ml_inference import ml_service
from app.services.analyze_service import analyze_service
from app.api.dependencies import DBSession
from sqlalchemy import text

router = APIRouter()

@router.get("/layers", summary="Get Spatial Layers as GeoJSON")
async def get_spatial_layers(db: DBSession, sector: str = None, gap: str = None):
    """
    Returns a GeoJSON FeatureCollection where each feature is a municipality.
    Properties include dynamic ML-derived scores (agriculture, infrastructure, economic, etc.)
    """
    if ml_service.ward_data is None:
        raise HTTPException(status_code=503, detail="ML Service data not loaded.")
        
    query = text("""
        SELECT municipality_id, name, district, province, total_population,
               ST_AsGeoJSON(geom) as geojson
        FROM municipalities
    """)
    result = await db.execute(query)
    db_muns = result.fetchall()
    
    features = []
    import json
    
    for row in db_muns:
        mun_name = row.name
        
        props = {
            "id": str(row.municipality_id),
            "name": mun_name,
            "district": row.district,
            "province": row.province,
            "population": row.total_population,
            "agricultureScore": 0,
            "tourismScore": 0,
            "infrastructureScore": 0,
            "economicScore": 0,
            "digitalScore": 0,
            "opportunityScore": 0,
            "infrastructureGapScore": 0
        }
        
        intel = analyze_service.get_municipality_intelligence(mun_name)
        if intel:
            props["agricultureScore"] = intel["agriculture"]["agriculture_pct"]
            props["infrastructureScore"] = intel["development_index"]["infrastructure"]["score"]
            props["economicScore"] = intel["development_index"]["economic"]["score"]
            props["digitalScore"] = intel["development_index"]["digital"]["score"]
            
            # Tourism proxy (could be based on tourist_distance_km)
            dist = intel["tourism"]["tourist_distance_km"]
            props["tourismScore"] = max(0, 100 - (dist * 2))
            
            # Sector-specific opportunity
            target_sector = sector if sector else "Retail"
            opp_eval = analyze_service.calculate_opportunity_score(mun_name, 1, target_sector)
            if opp_eval:
                props["opportunityScore"] = opp_eval.get("opportunity_score", 0)
                
            # Infrastructure Gap Score based on severity
            gap_score = 0
            target_gap = gap.lower() if gap else None
            for g in intel.get("gaps", []):
                if target_gap and target_gap not in g["type"].lower() and target_gap not in g["description"].lower():
                    continue
                if g["severity"] == "High": gap_score = max(gap_score, 100)
                elif g["severity"] == "Medium": gap_score = max(gap_score, 60)
                elif g["severity"] == "Low": gap_score = max(gap_score, 30)
            props["infrastructureGapScore"] = gap_score

        geom = None
        if row.geojson:
            try:
                geom = json.loads(row.geojson)
            except:
                pass
                
        if geom:
            features.append({
                "type": "Feature",
                "geometry": geom,
                "properties": props
            })
        
    return {
        "type": "FeatureCollection",
        "features": features
    }
