import pandas as pd
import numpy as np
from typing import List, Dict, Any
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
from app.services.ml_inference import ml_service

class AnalyzeService:
    def __init__(self):
        self.scaler = StandardScaler()
        self.similarity_features = [
            'population', 'household_size', 'electricity_access_pct', 
            'internet_access_pct', 'average_income_npr', 'agriculture_pct', 
            'urbanization_rate', 'development_index'
        ]
        self.is_fitted = False
        self.municipalities = []
        self.scaled_data = None
        self.raw_data = None
        
    def _initialize_similarity_engine(self):
        if self.is_fitted or ml_service.ward_data is None:
            return
            
        # Group ward data to municipality level for comparison
        mun_data = ml_service.ward_data.groupby('municipality_name')[self.similarity_features].mean().reset_index()
        self.municipalities = mun_data['municipality_name'].tolist()
        self.raw_data = mun_data
        
        # Scale features for cosine similarity
        features_only = mun_data[self.similarity_features]
        self.scaled_data = self.scaler.fit_transform(features_only)
        self.is_fitted = True

    def calculate_opportunity_score(self, municipality_name: str, ward_no: int, proposed_business: str) -> Dict[str, Any]:
        """
        Calculates a deterministic 0-100 Opportunity Score combining ML probability 
        and local economic indices, and generates Explainable AI (XAI) factors.
        """
        ward_features = ml_service.get_ward_features(municipality_name, ward_no)
        if not ward_features:
            return None
            
        ml_eval = ml_service.evaluate(municipality_name, ward_features, proposed_business)
        ml_confidence = ml_eval['feasibility_score'] # 0-100
        
        # Breakdown Factors (0-100 scales)
        footfall = min(ward_features.get('footfall_index', 50), 100)
        purchasing_power = min(ward_features.get('purchasing_power_index', 50), 100)
        
        # Accessibility (derived from road/market distance)
        road_dist = ward_features.get('road_distance_km', 5)
        market_dist = ward_features.get('market_distance_km', 10)
        accessibility = max(0, 100 - (road_dist * 5) - (market_dist * 2))
        
        # Infrastructure Readiness
        elec = ward_features.get('electricity_access_pct', 50)
        inet = ward_features.get('internet_access_pct', 50)
        infrastructure = (elec + inet) / 2
        
        # Competition (Inverse of business density, scaled)
        density = ward_features.get('business_density', 50)
        competition = min(density * 1.5, 100) # Higher means more competition
        
        # Business Risk (Flood, Landslide, Crime)
        crime = ward_features.get('crime_rate_index', 50)
        flood = ward_features.get('flood_risk_index', 50)
        risk = (crime + flood) / 2
        
        # Overall Opportunity Score
        # 30% ML, 20% Purchasing, 20% Infrastructure, 15% Accessibility, 15% Footfall
        score = (ml_confidence * 0.3) + (purchasing_power * 0.2) + (infrastructure * 0.2) + (accessibility * 0.15) + (footfall * 0.15)
        
        # Penalize for extreme competition or risk
        if competition > 80: score -= 10
        if risk > 70: score -= 10
        
        score = min(max(score, 0), 100)
        
        # Determine Opportunity Level
        if score >= 90:
            level = "EXCELLENT OPPORTUNITY"
        elif score >= 75:
            level = "STRONG OPPORTUNITY"
        elif score >= 60:
            level = "MODERATE OPPORTUNITY"
        elif score >= 40:
            level = "WEAK OPPORTUNITY"
        else:
            level = "LOW OPPORTUNITY"
            
        # Generate Procedural XAI Factors
        positive_factors = []
        negative_factors = []
        
        if footfall > 75: positive_factors.append("High local footfall and strong market demand.")
        elif footfall < 40: negative_factors.append("Lower than average market demand and footfall.")
        
        if purchasing_power > 70: positive_factors.append("Strong local purchasing power.")
        elif purchasing_power < 45: negative_factors.append("Purchasing power is moderate rather than high.")
        
        if accessibility > 75: positive_factors.append("Good road and market accessibility.")
        elif accessibility < 50: negative_factors.append("Location has logistical and accessibility challenges.")
        
        if infrastructure > 80: positive_factors.append("Adequate electricity and internet availability.")
        elif infrastructure < 60: negative_factors.append("Infrastructure readiness is currently lacking.")
        
        if competition > 70: negative_factors.append("Existing business competition is relatively high.")
        elif competition < 30: positive_factors.append("Low existing competition presents a market gap.")
        
        if risk > 60: negative_factors.append("Environmental or security risk factors are elevated.")
        
        if ml_confidence >= 75: positive_factors.append("AI model strongly aligns this business type with the location's features.")
        elif ml_confidence < 30: negative_factors.append("AI model finds low historical precedent for this business type here.")
        
        # Base description
        summary = f"{proposed_business} appears to be a {level.lower()} in {municipality_name} based on available demographic, accessibility, purchasing-power, and competition indicators."
        
        return {
            "proposed_business": proposed_business,
            "location": f"{municipality_name} - Ward {ward_no}",
            "opportunity_score": round(score),
            "opportunity_level": level,
            "summary": summary,
            "ml_confidence": round(ml_confidence),
            "alternatives": ml_eval.get('alternatives', []),
            "breakdown": {
                "market_demand": round(footfall),
                "purchasing_power": round(purchasing_power),
                "accessibility": round(accessibility),
                "infrastructure_readiness": round(infrastructure),
                "competition": round(competition),
                "business_risk": round(risk)
            },
            "positive_factors": positive_factors,
            "negative_factors": negative_factors,
            "data_used": {
                "population": ward_features.get('population', 0),
                "purchasing_power_index": round(purchasing_power),
                "business_density": round(density),
                "road_distance_km": road_dist,
                "market_distance_km": market_dist,
                "infrastructure_index": round(infrastructure)
            }
        }

    def find_similar_municipalities(self, municipality_name: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Finds similar municipalities based on demographic and economic features using Cosine Similarity.
        """
        self._initialize_similarity_engine()
        
        if not self.is_fitted:
            return []
            
        try:
            mun_idx = self.municipalities.index(municipality_name)
        except ValueError:
            return [] # Municipality not found
            
        target_vector = self.scaled_data[mun_idx].reshape(1, -1)
        similarities = cosine_similarity(target_vector, self.scaled_data)[0]
        
        # Sort by similarity (descending), ignore the first one (which is the municipality itself)
        similar_indices = similarities.argsort()[::-1][1:top_k+1]
        
        results = []
        for idx in similar_indices:
            sim_score = similarities[idx]
            sim_name = self.municipalities[idx]
            
            # Add some key stats for comparison
            stats = self.raw_data.iloc[idx].to_dict()
            stats.pop('municipality_name', None)
            
            results.append({
                "municipality_name": sim_name,
                "similarity_score": round(float(sim_score) * 100, 2),
                "key_stats": stats
            })
            
        return results

    def identify_infrastructure_gaps(self, municipality_name: str, ward_no: int) -> Dict[str, Any]:
        """
        Identifies infrastructure gaps by comparing local ward features against 
        the district or national baseline (using the loaded mun_means).
        """
        ward_features = ml_service.get_ward_features(municipality_name, ward_no)
        if not ward_features:
            return None
            
        gaps = []
        
        # Check Electricity Access
        if ward_features.get('electricity_access_pct', 100) < 80:
            gaps.append({
                "type": "Power Grid",
                "severity": "High",
                "description": f"Only {ward_features.get('electricity_access_pct')}% electricity access."
            })
            
        # Check Internet Access
        if ward_features.get('internet_access_pct', 100) < 60:
            gaps.append({
                "type": "Digital Connectivity",
                "severity": "Medium",
                "description": f"Low internet penetration at {ward_features.get('internet_access_pct')}%."
            })
            
        # Check Road Connectivity (if development index is very low)
        if ward_features.get('development_index', 100) < 30:
            gaps.append({
                "type": "Road / Transport",
                "severity": "High",
                "description": "General development index is critically low, suggesting severe transport and infrastructure deficits."
            })
            
        # If no major gaps found
        if not gaps:
            gaps.append({
                "type": "None",
                "severity": "Low",
                "description": "Infrastructure levels are adequate relative to district averages."
            })
            
        return {
            "location": f"{municipality_name} - Ward {ward_no}",
            "gaps": gaps,
            "overall_assessment": "Critical Investment Needed" if len([g for g in gaps if g['severity'] == 'High']) > 0 else "Adequate"
        }

analyze_service = AnalyzeService()
