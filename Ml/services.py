import os
import pickle
import pandas as pd
import torch
from xgboost import XGBClassifier
from sklearn.preprocessing import LabelEncoder
from transformers import pipeline
from fastapi import HTTPException

# Data loading and feature engineering
df = pd.read_csv('rupandehi_digital_twin_varied.csv')

base_29_features = [
    'population', 'household_size', 'households', 'road_distance_km',
    'highway_distance_km', 'hospital_distance_km', 'school_distance_km',
    'bank_distance_km', 'market_distance_km', 'bus_stop_distance_km',
    'tourist_distance_km', 'electricity_access_pct', 'internet_access_pct',
    'water_access_pct', 'average_income_npr', 'land_price_per_kattha_npr',
    'rent_price_npr', 'commercial_buildings', 'industries',
    'agriculture_pct', 'footfall_index', 'crime_rate_index',
    'flood_risk_index', 'landslide_risk_index', 'purchasing_power_index',
    'business_density', 'urbanization_rate', 'development_index',
    'investment_score'
]

df['footfall_diff_from_mun'] = df['footfall_index'] - df.groupby('municipality_name')['footfall_index'].transform('mean')
df['agri_diff_from_mun'] = df['agriculture_pct'] - df.groupby('municipality_name')['agriculture_pct'].transform('mean')
df['income_diff_from_mun'] = df['average_income_npr'] - df.groupby('municipality_name')['average_income_npr'].transform('mean')

model_cols = base_29_features + ['footfall_diff_from_mun', 'agri_diff_from_mun', 'income_diff_from_mun']

X = df[model_cols]
y = df['recommended_business']


# Model Loading or Training
MODEL_PATH = 'xgb_model.pkl'
ENCODER_PATH = 'label_encoder.pkl'

if os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH):
    print("Loading existing XGBoost model and LabelEncoder...")
    with open(MODEL_PATH, 'rb') as f:
        xgb_mode = pickle.load(f)
    with open(ENCODER_PATH, 'rb') as f:
        label_encoder = pickle.load(f)
else:
    print("Training XGBoost model...")
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    xgb_mode = XGBClassifier(n_estimators=100, random_state=42)
    xgb_mode.fit(X, y_encoded)
    
    print("Saving model and encoder to disk...")
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(xgb_mode, f)
    with open(ENCODER_PATH, 'wb') as f:
        pickle.dump(label_encoder, f)

print("Loading Qwen 0.5B model...")
llm_pipeline = pipeline(
    "text-generation", 
    model="Qwen/Qwen2.5-0.5B-Instruct", 
    dtype=torch.float16, 
    device_map="auto"
)
print("Models loaded successfully! Server ready.")


def process_feasibility(municipality_name: str, ward_no: int, proposed_business: str):
    filtered_data = df[
        (df['municipality_name'].str.lower() == municipality_name.strip().lower()) & 
        (df['ward_no'] == ward_no)
    ]
    
    if filtered_data.empty:
        valid_muns = df['municipality_name'].unique().tolist()
        raise HTTPException(
            status_code=404, 
            detail=f"Location '{municipality_name}' Ward {ward_no} not found. Available municipalities: {valid_muns}"
        )

    ward_features = filtered_data[model_cols].mean().to_frame().T
    
    probabilities = xgb_mode.predict_proba(ward_features)[0]
    top_indices = probabilities.argsort()[::-1]
    
    top_classes = label_encoder.inverse_transform(top_indices)
    top_probs = probabilities[top_indices]
    
    user_bus_clean = proposed_business.strip().lower()
    
    user_match_idx = -1
    for idx, cls in enumerate(top_classes):
        if cls.lower() == user_bus_clean or user_bus_clean in cls.lower():
            user_match_idx = idx
            break
            
    top_recommendation = top_classes[0]
    top_confidence = top_probs[0] * 100
    
    if user_match_idx != -1:
        user_confidence = top_probs[user_match_idx] * 100
        user_rank = user_match_idx + 1
    else:
        user_confidence = 0.0
        user_rank = len(top_classes)
        
    is_feasible = (user_rank == 1) or (user_confidence >= 20.0)
    decision_verdict = "YES, RECOMMENDED" if is_feasible else "NO, NOT RECOMMENDED"

    m_name = filtered_data.iloc[0]['municipality_name']

    messages = [
        {"role": "system", "content": "You are a commercial feasibility analyst in Nepal. Evaluate if a user's proposed business should be opened in a specific ward based on machine learning probability and local economic indicators. State YES or NO clearly in your reasoning."},
        {"role": "user", "content": f"""
Location & Business Input:
- Location: {m_name}, Ward {ward_no}
- Proposed Business: {proposed_business}
- Model Verdict: {decision_verdict} (Feasibility Score: {user_confidence:.1f}%, Model Rank: #{user_rank})
- Highest Potential Alternative Business for Ward: {top_recommendation} ({top_confidence:.1f}% viability)

Ward Economic Indicators:
- Footfall Index: {ward_features['footfall_index'].iloc[0]:.1f}
- Agriculture Land: {ward_features['agriculture_pct'].iloc[0]:.1f}%
- Urbanization Rate: {ward_features['urbanization_rate'].iloc[0]:.1f}%
- Average Monthly Income: NPR {ward_features['average_income_npr'].iloc[0]:,.0f}

Task: Write a concise 2-sentence assessment. Start by stating whether the user SHOULD or SHOULD NOT open {proposed_business} in {m_name} Ward {ward_no}, followed by the primary reason based on the ward metrics.
"""}
    ]
    
    prompt = llm_pipeline.tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    response = llm_pipeline(prompt, max_new_tokens=120, do_sample=False)
    explanation = response[0]['generated_text'].split("<|im_start|>assistant\n")[-1].strip()
    
    return {
        "location": f"{m_name} - Ward {ward_no}",
        "proposed_business": proposed_business,
        "recommendation": decision_verdict,
        "feasibility_score": f"{user_confidence:.1f}%",
        "top_alternative_if_no": top_recommendation,
        "reasoning": explanation
    }


def process_recommendation(municipality_name: str, ward_no: int):
    filtered_data = df[
        (df['municipality_name'].str.lower() == municipality_name.strip().lower()) & 
        (df['ward_no'] == ward_no)
    ]
    
    if filtered_data.empty:
        valid_muns = df['municipality_name'].unique().tolist()
        raise HTTPException(
            status_code=404, 
            detail=f"Location '{municipality_name}' Ward {ward_no} not found. Available municipalities: {valid_muns}"
        )

    ward_features = filtered_data[model_cols].mean().to_frame().T
    
    probabilities = xgb_mode.predict_proba(ward_features)[0]
    top_indices = probabilities.argsort()[::-1]
    
    top_classes = label_encoder.inverse_transform(top_indices)
    top_probs = probabilities[top_indices]
    
    top_recommendation = top_classes[0]
    top_confidence = top_probs[0] * 100
    
    m_name = filtered_data.iloc[0]['municipality_name']

    messages = [
        {"role": "system", "content": "You are a commercial feasibility analyst in Nepal. Based on local economic indicators, explain why the recommended business is the most suitable for the location."},
        {"role": "user", "content": f"""
Location: {m_name}, Ward {ward_no}
Recommended Business: {top_recommendation} (Confidence: {top_confidence:.1f}%)

Ward Economic Indicators:
- Footfall Index: {ward_features['footfall_index'].iloc[0]:.1f}
- Agriculture Land: {ward_features['agriculture_pct'].iloc[0]:.1f}%
- Urbanization Rate: {ward_features['urbanization_rate'].iloc[0]:.1f}%
- Average Monthly Income: NPR {ward_features['average_income_npr'].iloc[0]:,.0f}

Task: Write a concise 2-sentence assessment explaining why opening a {top_recommendation} is the best choice in {m_name} Ward {ward_no} based on these metrics.
"""}
    ]
    
    prompt = llm_pipeline.tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    response = llm_pipeline(prompt, max_new_tokens=120, do_sample=False)
    explanation = response[0]['generated_text'].split("<|im_start|>assistant\n")[-1].strip()
    
    return {
        "location": f"{m_name} - Ward {ward_no}",
        "recommended_business": top_recommendation,
        "confidence_score": f"{top_confidence:.1f}%",
        "reasoning": explanation
    }
