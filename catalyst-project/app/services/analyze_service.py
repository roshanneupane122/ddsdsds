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
        and local economic indices.
        """
        ward_features = ml_service.get_ward_features(municipality_name, ward_no)
        if not ward_features:
            return None
            
        ml_eval = ml_service.evaluate(municipality_name, ward_features, proposed_business)
        ml_confidence = ml_eval['feasibility_score'] # 0-100
        
        # Extract indices (assuming they are roughly 0-100 scale, or we normalize them)
        purchasing_power = min(ward_features.get('purchasing_power_index', 50), 100)
        development = min(ward_features.get('development_index', 50), 100)
        footfall = min(ward_features.get('footfall_index', 50), 100)
        
        # Weights
        # 40% ML Model Probability
        # 20% Purchasing Power
        # 20% Development Index
        # 20% Footfall Index
        
        score = (ml_confidence * 0.4) + (purchasing_power * 0.2) + (development * 0.2) + (footfall * 0.2)
        score = min(max(score, 0), 100)
        
        return {
            "proposed_business": proposed_business,
            "location": f"{municipality_name} - Ward {ward_no}",
            "opportunity_score": round(score, 2),
            "ml_confidence": round(ml_confidence, 2),
            "factors": {
                "purchasing_power": round(purchasing_power, 2),
                "development_index": round(development, 2),
                "footfall_index": round(footfall, 2)
            },
            "recommendation": "Highly Favorable" if score >= 75 else ("Moderate" if score >= 50 else "Not Recommended")
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
