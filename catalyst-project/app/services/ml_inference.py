import os
import pandas as pd
from typing import Dict, Any, List

SECTOR_MAPPING = {
    "agriculture": ["Dairy Farm", "Fertilizer Store", "Agro-vet Clinic"],
    "agro-processing": ["Dairy Farm", "Cold Storage", "Agro-vet Clinic"],
    "tourism": ["Restaurant", "Boutique Hotel", "Cafe", "Travel Agency"],
    "healthcare": ["Pharmacy", "Polyclinic", "Medical Supply Store"],
    "education": ["Tutoring Center", "Bookstore", "Stationery Shop"],
    "retail": ["Grocery Store", "Supermarket", "Hardware Store", "Fashion Boutique", "Mobile Repair Shop", "Electronics Shop", "Handicraft Shop", "Tailoring Shop"],
    "logistics": ["Logistics/Freight Service", "Wholesale Distributor"],
    "manufacturing": ["Hardware Store", "Handicraft Shop"], 
    "digital services": ["IT Services", "Electronics Shop", "Mobile Repair Shop"]
}

class MLInferenceService:
    def __init__(self):
        self.ward_data = None
        self.is_loaded = False

    def load_models(self):
        # We assume the models are in a directory named 'ml_models' at the root of the catalyst-project
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        ml_models_dir = os.path.join(base_dir, "ml_models")
        
        try:
            csv_path = os.path.join(ml_models_dir, "rupandehi_digital_twin_varied.csv")
            if os.path.exists(csv_path):
                self.ward_data = pd.read_csv(csv_path)
            else:
                self.ward_data = None
                
            self.is_loaded = True
            print("Successfully loaded dataset from disk (XGBoost removed).")
        except Exception as e:
            print(f"Error loading dataset: {e}")
            self.is_loaded = False

    def get_ward_features(self, municipality_name: str, ward_no: int) -> Dict[str, Any]:
        if self.ward_data is None:
            return {}
        
        filtered = self.ward_data[
            (self.ward_data['municipality_name'].str.lower() == municipality_name.strip().lower()) & 
            (self.ward_data['ward_no'] == ward_no)
        ]
        if filtered.empty:
            return {}
        return filtered.iloc[0].to_dict()

    def evaluate(self, municipality_name: str, ward_features: Dict[str, Any], proposed_business: str) -> Dict[str, Any]:
        if not self.is_loaded or self.ward_data is None:
            raise RuntimeError("ML Models/Dataset are not loaded.")

        ward_no = ward_features.get('ward_no')
        if not ward_no:
            return {"proposed_business": proposed_business, "recommendation": "NO, NOT RECOMMENDED", "feasibility_score": 0.0, "user_rank": 5, "alternatives": []}

        filtered = self.ward_data[
            (self.ward_data['municipality_name'].str.lower() == municipality_name.strip().lower()) & 
            (self.ward_data['ward_no'] == ward_no)
        ]
        
        if filtered.empty:
            return {"proposed_business": proposed_business, "recommendation": "NO, NOT RECOMMENDED", "feasibility_score": 0.0, "user_rank": 5, "alternatives": []}
            
        ward_row = filtered.iloc[0]
        top_recommendation = ward_row['recommended_business']
        top_confidence = ward_row['business_success_probability'] * 100
        
        user_bus_clean = proposed_business.strip().lower()
        
        # Check if the requested business is a broad sector
        mapped_classes = SECTOR_MAPPING.get(user_bus_clean)
        
        is_feasible = False
        user_confidence = 0.0
        user_rank = 5
        
        if mapped_classes:
            if top_recommendation in mapped_classes:
                is_feasible = True
                user_confidence = top_confidence
                user_rank = 1
        else:
            if top_recommendation.lower() == user_bus_clean or user_bus_clean in top_recommendation.lower():
                is_feasible = True
                user_confidence = top_confidence
                user_rank = 1
                
        decision_verdict = "YES, RECOMMENDED" if is_feasible else "NO, NOT RECOMMENDED"
        
        alternatives = []
        if not is_feasible:
            alternatives.append({
                "business": top_recommendation,
                "confidence": top_confidence
            })
        
        return {
            "proposed_business": proposed_business,
            "recommendation": decision_verdict,
            "feasibility_score": min(user_confidence, 100.0), # cap at 100
            "user_rank": user_rank,
            "alternatives": alternatives
        }

ml_service = MLInferenceService()
