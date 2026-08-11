import os
import joblib
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
        self.model = None
        self.label_encoder = None
        self.model_cols = None
        self.mun_means = None
        self.is_loaded = False

    def load_models(self):
        # We assume the models are in a directory named 'ml_models' at the root of the catalyst-project
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        ml_models_dir = os.path.join(base_dir, "ml_models")
        
        try:
            self.model = joblib.load(os.path.join(ml_models_dir, "xgb_model.pkl"))
            self.label_encoder = joblib.load(os.path.join(ml_models_dir, "label_encoder.pkl"))
            self.model_cols = joblib.load(os.path.join(ml_models_dir, "model_cols.pkl"))
            self.mun_means = joblib.load(os.path.join(ml_models_dir, "mun_stats.pkl"))
            
            csv_path = os.path.join(ml_models_dir, "rupandehi_digital_twin_varied.csv")
            if os.path.exists(csv_path):
                self.ward_data = pd.read_csv(csv_path)
            else:
                self.ward_data = None
                
            self.is_loaded = True
            print("Successfully loaded ML models from disk.")
        except Exception as e:
            print(f"Error loading ML models: {e}")
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
        if not self.is_loaded:
            raise RuntimeError("ML Models are not loaded.")

        # Convert input features to a DataFrame row
        df_input = pd.DataFrame([ward_features])
        
        # We need to perform relative feature engineering using mun_means
        if municipality_name in self.mun_means.index:
            mun_stats = self.mun_means.loc[municipality_name]
            df_input['footfall_diff_from_mun'] = df_input['footfall_index'] - mun_stats['footfall_index']
            df_input['agri_diff_from_mun'] = df_input['agriculture_pct'] - mun_stats['agriculture_pct']
            df_input['income_diff_from_mun'] = df_input['average_income_npr'] - mun_stats['average_income_npr']
        else:
            # Fallback if municipality is completely unknown to the model
            df_input['footfall_diff_from_mun'] = 0.0
            df_input['agri_diff_from_mun'] = 0.0
            df_input['income_diff_from_mun'] = 0.0

        # Ensure all columns match the trained model
        # Fill missing features with 0 for robustness, although in a real scenario we'd query the DB
        for col in self.model_cols:
            if col not in df_input.columns:
                df_input[col] = 0.0
                
        # Reorder to match model
        X = df_input[self.model_cols]
        
        # Predict probabilities
        probabilities = self.model.predict_proba(X)[0]
        top_indices = probabilities.argsort()[::-1]
        
        top_classes = self.label_encoder.inverse_transform(top_indices)
        top_probs = probabilities[top_indices]
        
        user_bus_clean = proposed_business.strip().lower()
        
        # Check if the requested business is a broad sector
        mapped_classes = SECTOR_MAPPING.get(user_bus_clean)
        
        if mapped_classes:
            # Aggregate probabilities for all mapped classes
            agg_prob = 0.0
            for i, cls in enumerate(top_classes):
                if cls in mapped_classes:
                    agg_prob += top_probs[i]
            user_confidence = float(agg_prob * 100)
            user_rank = 1 if user_confidence > 15.0 else 5 # Rough rank equivalent
        else:
            # Fallback to single class matching
            user_match_idx = -1
            for idx, cls in enumerate(top_classes):
                if cls.lower() == user_bus_clean or user_bus_clean in cls.lower():
                    user_match_idx = idx
                    break
                    
            if user_match_idx != -1:
                user_confidence = float(top_probs[user_match_idx] * 100)
                user_rank = user_match_idx + 1
            else:
                user_confidence = 0.0
                user_rank = len(top_classes)
                
        # Get top alternatives, skipping mapped classes if sector was requested
        alternatives = []
        for i in range(len(top_classes)):
            if len(alternatives) >= 4:
                break
            if mapped_classes and top_classes[i] in mapped_classes:
                continue
            if not mapped_classes and user_match_idx == i:
                continue
                
            alternatives.append({
                "business": top_classes[i],
                "confidence": float(top_probs[i] * 100)
            })
            
        is_feasible = user_confidence >= 15.0
        decision_verdict = "YES, RECOMMENDED" if is_feasible else "NO, NOT RECOMMENDED"
        
        return {
            "proposed_business": proposed_business,
            "recommendation": decision_verdict,
            "feasibility_score": min(user_confidence, 100.0), # cap at 100
            "user_rank": user_rank,
            "alternatives": alternatives
        }

ml_service = MLInferenceService()
