import pandas as pd
import torch
from xgboost import XGBClassifier
from sklearn.preprocessing import LabelEncoder
from transformers import pipeline
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

# Initialize FastAPI App
app = FastAPI(
    title="Business Feasibility Evaluator API",
    description="API to evaluate commercial feasibility in Rupandehi using ML and Qwen LLM",
    version="1.0.0"
)

# -------------------------------------------------------------
# 1. Load Dataset & Train Model (Runs once on startup)
# -------------------------------------------------------------
print("Loading dataset and training XGBoost model...")
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

# Relative feature engineering
df['footfall_diff_from_mun'] = df['footfall_index'] - df.groupby('municipality_name')['footfall_index'].transform('mean')
df['agri_diff_from_mun'] = df['agriculture_pct'] - df.groupby('municipality_name')['agriculture_pct'].transform('mean')
df['income_diff_from_mun'] = df['average_income_npr'] - df.groupby('municipality_name')['average_income_npr'].transform('mean')

model_cols = base_29_features + ['footfall_diff_from_mun', 'agri_diff_from_mun', 'income_diff_from_mun']

X = df[model_cols]
y = df['recommended_business']

label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

xgb_mode = XGBClassifier(n_estimators=100, random_state=42)
xgb_mode.fit(X, y_encoded)

# -------------------------------------------------------------
# 2. Load Qwen 0.5B LLM (Runs once on startup)
# -------------------------------------------------------------
print("Loading Qwen 0.5B model...")
llm_pipeline = pipeline(
    "text-generation", 
    model="Qwen/Qwen2.5-0.5B-Instruct", 
    dtype=torch.float16, 
    device_map="auto"
)
print("Models loaded successfully! Server ready.")

# -------------------------------------------------------------
# 3. Request / Response Models
# -------------------------------------------------------------
class FeasibilityRequest(BaseModel):
    municipality_name: str
    ward_no: int
    proposed_business: str

class FeasibilityResponse(BaseModel):
    location: str
    proposed_business: str
    recommendation: str
    feasibility_score: str
    top_alternative_if_no: str
    reasoning: str

# -------------------------------------------------------------
# 4. FastAPI Endpoints
# -------------------------------------------------------------

@app.get("/")
def read_root():
    return {"message": "Welcome to the Business Feasibility Evaluator API. Go to /docs for the interactive Swagger UI."}

@app.post("/evaluate", response_model=FeasibilityResponse)
def evaluate_business_feasibility(request: FeasibilityRequest):
    municipality_name = request.municipality_name
    ward_no = request.ward_no
    proposed_business = request.proposed_business

    # Filter matching ward data
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

    # Mean features across ward
    ward_features = filtered_data[model_cols].mean().to_frame().T
    
    # Calculate probabilities across all business classes
    probabilities = xgb_mode.predict_proba(ward_features)[0]
    top_indices = probabilities.argsort()[::-1]
    
    top_classes = label_encoder.inverse_transform(top_indices)
    top_probs = probabilities[top_indices]
    
    # Check probability of user's proposed business
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
        
    # Decision Rule: Feasible if it's the #1 recommendation or has >= 20% model probability
    is_feasible = (user_rank == 1) or (user_confidence >= 20.0)
    decision_verdict = "YES, RECOMMENDED" if is_feasible else "NO, NOT RECOMMENDED"

    m_name = filtered_data.iloc[0]['municipality_name']

    # Prompt construction for Qwen
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

if __name__ == "__main__":
    uvicorn.run("ml_prj:app", host="0.0.0.0", port=8000, reload=True)
