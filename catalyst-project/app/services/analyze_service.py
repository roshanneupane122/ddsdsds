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

    def calculate_opportunity_score(self, municipality_name: str, ward_no: int, proposed_business: str, override_features: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Calculates a deterministic 0-100 Opportunity Score combining ML probability 
        and local economic indices, and generates Explainable AI (XAI) factors.
        """
        ward_features = override_features if override_features else ml_service.get_ward_features(municipality_name, ward_no)
        if not ward_features:
            # Fallback to municipality average or standard baseline indicators
            if ml_service.ward_data is not None:
                muni_df = ml_service.ward_data[ml_service.ward_data['municipality_name'].str.lower() == municipality_name.strip().lower()]
                if not muni_df.empty:
                    ward_features = muni_df.mean(numeric_only=True).to_dict()

            if not ward_features:
                ward_features = {
                    'population': 45000,
                    'footfall_index': 65,
                    'purchasing_power_index': 70,
                    'electricity_access_pct': 85,
                    'internet_access_pct': 65,
                    'water_access_pct': 75,
                    'road_distance_km': 3.5,
                    'market_distance_km': 4.0,
                    'business_density': 12,
                    'crime_rate_index': 15,
                    'flood_risk_index': 20,
                    'agriculture_pct': 40,
                    'tourist_distance_km': 10
                }
            
        ml_eval = ml_service.evaluate(municipality_name, ward_features, proposed_business)
        ml_confidence = ml_eval['feasibility_score'] # 0-100
        sector = proposed_business.strip().lower()
        
        # Base indicators
        footfall = min(ward_features.get('footfall_index', 50), 100)
        purchasing_power = min(ward_features.get('purchasing_power_index', 50), 100)
        elec = ward_features.get('electricity_access_pct', 50)
        inet = ward_features.get('internet_access_pct', 50)
        water = ward_features.get('water_access_pct', 50)
        road_dist = ward_features.get('road_distance_km', 5)
        market_dist = ward_features.get('market_distance_km', 10)
        density = ward_features.get('business_density', 50)
        crime = ward_features.get('crime_rate_index', 50)
        flood = ward_features.get('flood_risk_index', 50)
        agri = ward_features.get('agriculture_pct', 10)
        tourist_dist = ward_features.get('tourist_distance_km', 20)

        # Sector-specific calculations
        demand = purchasing_power
        infrastructure = (elec + inet) / 2
        accessibility = max(0, 100 - (road_dist * 5) - (market_dist * 2))
        competition = min(density * 1.5, 100)
        risk = (crime + flood) / 2
        
        positive_factors = []
        negative_factors = []
        
        if "agri" in sector:
            demand = max(agri, purchasing_power)
            infrastructure = (elec + water) / 2
            if agri > 60: positive_factors.append("Strong agricultural base and farming participation.")
            if water < 60: negative_factors.append("Limited water access or irrigation infrastructure.")
        elif "tour" in sector:
            demand = max(0, 100 - (tourist_dist * 2))
            footfall = min(footfall * 1.2, 100)
            if tourist_dist < 5: positive_factors.append("Close proximity to major tourist attractions.")
            if infrastructure < 60: negative_factors.append("Infrastructure might not support high-end tourism.")
        elif "digital" in sector or "it" in sector:
            demand = purchasing_power
            infrastructure = inet
            if inet > 80: positive_factors.append("Excellent digital connectivity.")
            if inet < 50: negative_factors.append("Poor internet penetration restricts digital services.")
        elif "logistics" in sector or "manufacturing" in sector:
            demand = min(density * 2, 100)
            accessibility = max(0, 100 - (road_dist * 8))
            if road_dist < 2: positive_factors.append("Excellent road accessibility for freight.")
            if elec < 80: negative_factors.append("Power grid may not support heavy industrial loads.")
        else:
            if footfall > 75: positive_factors.append("High local footfall and strong market demand.")
            if purchasing_power > 70: positive_factors.append("Strong local purchasing power.")
            if accessibility > 75: positive_factors.append("Good road and market accessibility.")
            if infrastructure < 60: negative_factors.append("Infrastructure readiness is currently lacking.")
            if competition > 70: negative_factors.append("Existing business competition is relatively high.")
            
        if ml_confidence >= 50: positive_factors.append("ML model strongly aligns this sector with local ward features.")
        elif ml_confidence < 20 and ml_confidence > 0: negative_factors.append("ML model finds low historical precedent for this sector here.")
        
        if risk > 60: negative_factors.append("Environmental or security risk factors are elevated.")

        # Overall Opportunity Score (30% ML, 70% Deterministic)
        if ml_confidence > 0:
            score = (ml_confidence * 0.3) + (demand * 0.2) + (infrastructure * 0.2) + (accessibility * 0.15) + (footfall * 0.15)
        else:
            base_score = (demand * 0.2) + (infrastructure * 0.2) + (accessibility * 0.15) + (footfall * 0.15)
            score = base_score / 0.7
            
        # Penalties
        if competition > 80: score -= 10
        if risk > 70: score -= 10
        
        score = min(max(score, 0), 100)
        
        if score >= 80:
            interpretation = f"The municipality shows excellent potential for {proposed_business}, driven primarily by strong readiness and market factors."
        elif score >= 60:
            interpretation = f"The municipality shows moderate potential for {proposed_business}. While some drivers are positive, specific infrastructure or market constraints exist."
        else:
            interpretation = f"The municipality currently shows weak potential for {proposed_business} due to significant infrastructural or demand constraints."

        return {
            "proposed_business": proposed_business.upper(),
            "opportunity_score": round(score),
            "ml_feasibility": round(ml_confidence) if ml_confidence > 0 else 0,
            "breakdown": {
                "market_demand": round(demand),
                "infrastructure_readiness": round(infrastructure),
                "accessibility": round(accessibility),
                "footfall": round(footfall),
                "competition": round(competition),
                "business_risk": round(risk)
            },
            "positive_factors": positive_factors if positive_factors else ["Sufficient baseline conditions."],
            "negative_factors": negative_factors if negative_factors else ["No major constraints identified."],
            "interpretation": interpretation
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
        elec = ward_features.get('electricity_access_pct', 100)
        if elec < 80:
            gaps.append({
                "type": "Power Grid",
                "severity": "High",
                "score": round(100 - elec),
                "evidence": f"Electricity access is {elec}%.",
                "description": "Insufficient power infrastructure for commercial or industrial expansion.",
                "priority": "HIGH"
            })
            
        # Check Internet Access
        inet = ward_features.get('internet_access_pct', 100)
        if inet < 60:
            gaps.append({
                "type": "Digital Connectivity",
                "severity": "Medium" if inet > 40 else "High",
                "score": round(100 - inet),
                "evidence": f"Internet penetration at {inet}%.",
                "description": "Digital readiness is too low to support modern tech services.",
                "priority": "MEDIUM" if inet > 40 else "HIGH"
            })
            
        # Check Road Connectivity
        hosp = ward_features.get('hospital_distance_km', 0)
        road = ward_features.get('road_distance_km', 0)
        market = ward_features.get('market_distance_km', 0)
        if road > 5 or market > 10:
            gaps.append({
                "type": "Market Access",
                "severity": "High",
                "score": round(min((road + market)*5, 100)),
                "evidence": f"Average market distance: {market}km. Road distance: {road}km.",
                "description": "Poor transport logistics limit agricultural and manufacturing trade.",
                "priority": "HIGH"
            })

        if hosp > 10:
            gaps.append({
                "type": "Healthcare",
                "severity": "High",
                "score": round(min(hosp*8, 100)),
                "evidence": f"Average hospital distance is {hosp}km.",
                "description": "Critical lack of accessible healthcare facilities.",
                "priority": "HIGH"
            })
            
        # If no major gaps found
        if not gaps:
            gaps.append({
                "type": "None",
                "severity": "Low",
                "score": 0,
                "evidence": "Indicators above threshold.",
                "description": "Infrastructure levels are adequate relative to district averages.",
                "priority": "LOW"
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

        # Top Opportunities - generate full breakdowns for predefined sectors
        sectors_to_check = ["Agriculture", "Tourism", "Retail", "Healthcare", "Digital Services", "Logistics", "Manufacturing"]
        opportunities = []
        for sector in sectors_to_check:
            opp = self.calculate_opportunity_score(municipality_name, 1, sector, override_features=agg)
            if opp:
                opportunities.append(opp)
                
        # Sort opportunities by score descending and take top 5
        opportunities.sort(key=lambda x: x.get('opportunity_score', 0), reverse=True)
        top_opportunities = opportunities[:5]
        
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

        def _get_status(val):
            if val >= 75: return "High"
            if val >= 50: return "Moderate"
            return "Low"

        # Priorities
        priorities = []
        if digital < 50: priorities.append("Digital Connectivity & IT Infrastructure")
        if infrastructure < 60: priorities.append("Basic Infrastructure & Road Networks")
        if economic < 50: priorities.append("Commercial Zone Development")
        if social < 60: priorities.append("Healthcare & Education Facilities")
        if len(priorities) == 0: priorities.append("Advanced Industrial Hubs")
        if len(priorities) == 1: priorities.append("Agricultural Processing Facilities")

        return {
            "name": municipality_name,
            "overview": {
                "population": agg['population'],
                "households": agg['households'],
                "urbanization_rate": round(agg.get('urbanization_rate', 0), 1)
            },
            "development_index": {
                "overall": {"score": round(dev_overall), "status": _get_status(dev_overall), "text": "Aggregated index of all socio-economic factors."},
                "economic": {"score": round(economic), "status": _get_status(economic), "text": "Based on business density and purchasing power."},
                "infrastructure": {"score": round(infrastructure), "status": _get_status(infrastructure), "text": "Based on electricity, water, and internet access."},
                "social": {"score": round(social), "status": _get_status(social), "text": "Derived from school and hospital accessibility."},
                "accessibility": {"score": round(accessibility), "status": _get_status(accessibility), "text": "Derived from road and market distance."},
                "digital": {"score": round(digital), "status": _get_status(digital), "text": "Based on internet penetration."}
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
            "opportunities": top_opportunities,
            "priorities": priorities[:4],
            "similar_municipalities": self.find_similar_municipalities(municipality_name, top_k=3)
        }

analyze_service = AnalyzeService()
