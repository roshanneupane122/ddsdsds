import pandas as pd
import joblib
import os
from xgboost import XGBClassifier
from sklearn.preprocessing import LabelEncoder

# Adjust path to find the CSV in the Ml folder
csv_path = os.path.join("..", "..", "Ml", "rupandehi_digital_twin_varied.csv")

print(f"Loading dataset from {csv_path}...")
df = pd.read_csv(csv_path)

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

print("Training XGBoost Classifier...")
xgb_model = XGBClassifier(n_estimators=100, random_state=42)
xgb_model.fit(X, y_encoded)

# Save the model and label encoder
model_path = "xgb_model.pkl"
le_path = "label_encoder.pkl"
features_path = "model_cols.pkl"
mun_stats_path = "mun_stats.pkl" # Needed for relative feature engineering at inference

joblib.dump(xgb_model, model_path)
joblib.dump(label_encoder, le_path)
joblib.dump(model_cols, features_path)

# For relative feature engineering at inference time, we need the municipality means
mun_means = df.groupby('municipality_name')[['footfall_index', 'agriculture_pct', 'average_income_npr']].mean()
joblib.dump(mun_means, mun_stats_path)

print(f"Models and encoders saved to {model_path}, {le_path}, {features_path}, {mun_stats_path}")
