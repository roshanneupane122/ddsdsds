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

    def get_municipality_intelligence(self, municipality_name: str) -> Dict[str, Any]:
        """
        Builds a comprehensive intelligence profile for the municipality by aggregating ward data.
        """
        if ml_service.ward_data is None:
            return None
            
        muni_df = ml_service.ward_data[ml_service.ward_data['municipality_name'].str.lower() == municipality_name.lower()]
        if muni_df.empty:
            return None
            
        # Aggregate data
        agg = muni_df.mean(numeric_only=True).to_dict()
        agg['population'] = int(muni_df['population'].sum())
        agg['households'] = int(muni_df['households'].sum())
        
        # Development Index
        dev_overall = min(max(agg.get('development_index', 50), 0), 100)
        economic = min(max((agg.get('average_income_npr', 10000) / 200) + (agg.get('business_density', 5) * 5), 0), 100)
        infrastructure = min(max((agg.get('electricity_access_pct', 50) + agg.get('internet_access_pct', 50) + agg.get('water_access_pct', 50)) / 3, 0), 100)
        social = min(max(100 - (agg.get('hospital_distance_km', 5) * 5) - (agg.get('school_distance_km', 2) * 10), 0), 100)
        accessibility = min(max(100 - (agg.get('road_distance_km', 2) * 10) - (agg.get('market_distance_km', 3) * 5), 0), 100)
        digital = min(max(agg.get('internet_access_pct', 50), 0), 100)
        
        # Strengths and Challenges
        strengths = []
        challenges = []
        if agg.get('agriculture_pct', 0) > 60: strengths.append("Strong agricultural foundation and high farming participation.")
        if agg.get('electricity_access_pct', 0) > 85: strengths.append("Excellent power grid connectivity.")
        if agg.get('market_distance_km', 10) < 2: strengths.append("High market accessibility for local businesses.")
        if agg.get('tourist_distance_km', 10) < 5: strengths.append("Close proximity to tourist attractions.")
        
        if agg.get('internet_access_pct', 100) < 50: challenges.append("Low digital connectivity and internet penetration.")
        if agg.get('hospital_distance_km', 0) > 6: challenges.append("Limited access to healthcare facilities.")
        if agg.get('flood_risk_index', 0) > 0.6: challenges.append("Elevated flood risk requires mitigation.")
        if agg.get('business_density', 10) < 5: challenges.append("Low commercial density suggests lack of business infrastructure.")

        # Top Opportunities (using mean features for the whole municipality)
        ml_eval = ml_service.evaluate(municipality_name, agg, "Retail") # dummy to get alternatives
        
        # Infrastructure gaps based on municipality average
        gaps = []
        if agg.get('electricity_access_pct', 100) < 80:
            gaps.append({"type": "Power Grid", "severity": "High", "description": f"Only {round(agg['electricity_access_pct'], 1)}% electricity access."})
        if agg.get('internet_access_pct', 100) < 60:
            gaps.append({"type": "Digital Connectivity", "severity": "Medium", "description": f"Low internet penetration at {round(agg['internet_access_pct'], 1)}%."})
        if agg.get('hospital_distance_km', 0) > 5:
            gaps.append({"type": "Healthcare", "severity": "Medium", "description": f"Average hospital distance is {round(agg['hospital_distance_km'], 1)}km."})
        if agg.get('bank_distance_km', 0) > 3:
            gaps.append({"type": "Financial Access", "severity": "Low", "description": f"Average bank distance is {round(agg['bank_distance_km'], 1)}km."})

        return {
            "name": municipality_name,
            "overview": {
                "population": agg['population'],
                "households": agg['households'],
                "urbanization_rate": round(agg.get('urbanization_rate', 0), 1)
            },
            "development_index": {
                "overall": round(dev_overall),
                "economic": round(economic),
                "infrastructure": round(infrastructure),
                "social": round(social),
                "accessibility": round(accessibility),
                "digital": round(digital)
            },
            "economy": {
                "average_income_npr": round(agg.get('average_income_npr', 0)),
                "business_density": round(agg.get('business_density', 0), 2),
                "commercial_buildings_avg": round(agg.get('commercial_buildings', 0), 1),
                "industries_avg": round(agg.get('industries', 0), 1),
                "purchasing_power_index": round(agg.get('purchasing_power_index', 0), 1)
            },
            "agriculture": {
                "agriculture_pct": round(agg.get('agriculture_pct', 0), 1)
            },
            "tourism": {
                "tourist_distance_km": round(agg.get('tourist_distance_km', 0), 2)
            },
            "infrastructure": {
                "electricity_access_pct": round(agg.get('electricity_access_pct', 0), 1),
                "internet_access_pct": round(agg.get('internet_access_pct', 0), 1),
                "water_access_pct": round(agg.get('water_access_pct', 0), 1),
                "road_distance_km": round(agg.get('road_distance_km', 0), 2),
                "market_distance_km": round(agg.get('market_distance_km', 0), 2),
                "hospital_distance_km": round(agg.get('hospital_distance_km', 0), 2)
            },
            "strengths": strengths,
            "challenges": challenges,
            "gaps": gaps,
            "opportunities": ml_eval.get('alternatives', [])[:5],
            "similar_municipalities": self.find_similar_municipalities(municipality_name, top_k=3)
        }

analyze_service = AnalyzeService()
