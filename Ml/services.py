import os
import pandas as pd
import torch
from transformers import pipeline
from fastapi import HTTPException
import re
import difflib

# Data loading
df = pd.read_csv('rupandehi_digital_twin_varied.csv')

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

    ward_data = filtered_data.iloc[0]
    m_name = ward_data['municipality_name']
    
    # Dataset values
    top_recommendation = ward_data['recommended_business']
    top_confidence = ward_data['business_success_probability'] * 100
    
    user_bus_clean = proposed_business.strip().lower()
    
    is_feasible = False
    if top_recommendation.lower() == user_bus_clean or user_bus_clean in top_recommendation.lower():
        is_feasible = True
        user_confidence = top_confidence
        user_rank = 1
    else:
        user_confidence = 0.0
        user_rank = 5
        
    decision_verdict = "YES, RECOMMENDED" if is_feasible else "NO, NOT RECOMMENDED"

    messages = [
        {"role": "system", "content": "You are a commercial feasibility analyst in Nepal. Evaluate if a user's proposed business should be opened in a specific ward based on dataset insights. State YES or NO clearly in your reasoning."},
        {"role": "user", "content": f"""
Location & Business Input:
- Location: {m_name}, Ward {ward_no}
- Proposed Business: {proposed_business}
- Model Verdict: {decision_verdict} (Feasibility Score: {user_confidence:.1f}%)
- Highest Potential Business for Ward: {top_recommendation} ({top_confidence:.1f}% viability)

Ward Economic Indicators:
- Footfall Index: {ward_data['footfall_index']:.1f}
- Agriculture Land: {ward_data['agriculture_pct']:.1f}%
- Urbanization Rate: {ward_data['urbanization_rate']:.1f}%
- Average Monthly Income: NPR {ward_data['average_income_npr']:,.0f}

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

    ward_data = filtered_data.iloc[0]
    m_name = ward_data['municipality_name']
    
    top_recommendation = ward_data['recommended_business']
    top_confidence = ward_data['business_success_probability'] * 100

    messages = [
        {"role": "system", "content": "You are a commercial feasibility analyst in Nepal. Based on local economic indicators, explain why the recommended business is the most suitable for the location."},
        {"role": "user", "content": f"""
Location: {m_name}, Ward {ward_no}
Recommended Business: {top_recommendation} (Confidence: {top_confidence:.1f}%)

Ward Economic Indicators:
- Footfall Index: {ward_data['footfall_index']:.1f}
- Agriculture Land: {ward_data['agriculture_pct']:.1f}%
- Urbanization Rate: {ward_data['urbanization_rate']:.1f}%
- Average Monthly Income: NPR {ward_data['average_income_npr']:,.0f}

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

def process_chat(user_input: str):
    businesses = df['recommended_business'].dropna().str.lower().unique().tolist()
    municipalities = df['municipality_name'].dropna().str.lower().unique().tolist()
    
    def find_best_location(business_name):
        filtered = df[df['recommended_business'].str.lower() == business_name.lower()]
        if filtered.empty:
            filtered = df[df['recommended_business'].str.lower().str.contains(business_name.lower())]
        if filtered.empty:
            return None
        best = filtered.sort_values(
            by=['business_success_probability', 'footfall_index'], 
            ascending=[False, False]
        ).iloc[0]
        return best

    target_business = None
    for b in businesses:
        if b in user_input.lower():
            target_business = b
            break
            
    found_municipalities = []
    for m in municipalities:
        if m in user_input.lower():
            found_municipalities.append(m)
    
    words = user_input.lower().split()
    for word in words:
        matches = difflib.get_close_matches(word, municipalities, n=1, cutoff=0.75)
        if matches and matches[0] not in found_municipalities:
            found_municipalities.append(matches[0])
            
    ward_matches = re.findall(r'ward\s*(?:no\.?)?\s*(\d+)', user_input.lower())
    found_wards = [int(w) for w in ward_matches]
    if not found_wards:
        numbers = re.findall(r'\b(\d+)\b', user_input.lower())
        found_wards = [int(num) for num in numbers if 1 <= int(num) <= 50]
        
    locations_to_query = []
    if len(found_municipalities) >= 2 and len(found_wards) >= 2:
        locations_to_query = [(found_municipalities[0], found_wards[0]), (found_municipalities[1], found_wards[1])]
    elif len(found_municipalities) == 1 and len(found_wards) >= 2:
        locations_to_query = [(found_municipalities[0], found_wards[0]), (found_municipalities[0], found_wards[1])]
    elif len(found_municipalities) >= 1:
        locations_to_query = [(found_municipalities[0], found_wards[0] if found_wards else None)]

    prompt_comparison = """You are Catalyst AI, an AI-powered Business Location Comparison Assistant.

Your job is to compare two locations using ONLY the information provided in the context.

Rules:
- Never invent values.
- Never assume missing information.
- Compare every feature objectively.
- Explain which location performs better for each feature.
- At the end, recommend the better location for opening the requested business.
- Keep the answer professional and easy to understand."""

    prompt_profile = """You are Catalyst AI, an AI-powered Business Decision Support Assistant for Rupandehi District, Nepal.

Your task is to write a short paragraph describing the municipality's strengths, weaknesses, and overall suitability for starting a business based ONLY on the provided data. Do not invent values or estimate missing information."""

    prompt_general = "You are a helpful AI assistant that recommends business locations in Rupandehi district based on provided dataset insights. Be direct, natural, and use the provided context to answer the user's query. Keep it short and do not repeat yourself."

    context = ""
    pre_response_text = ""
    system_prompt = prompt_general
    is_comparison = len(locations_to_query) == 2
    is_profile_request = any(word in user_input.lower() for word in ["about", "detail", "profile", "tell me", "info"])

    if is_comparison:
        system_prompt = prompt_comparison
        loc1_m, loc1_w = locations_to_query[0]
        loc2_m, loc2_w = locations_to_query[1]
        
        df1 = df[df['municipality_name'].str.lower() == loc1_m]
        if loc1_w is not None: df1 = df1[df1['ward_no'] == loc1_w]
        
        df2 = df[df['municipality_name'].str.lower() == loc2_m]
        if loc2_w is not None: df2 = df2[df2['ward_no'] == loc2_w]
        
        if not df1.empty and not df2.empty:
            d1, d2 = df1.iloc[0], df2.iloc[0]
            biz_text = f"a '{target_business}'" if target_business else "a business"
            context = (f"The user wants to compare opening {biz_text} at {d1['municipality_name']} Ward {d1['ward_no']} "
                       f"and {d2['municipality_name']} Ward {d2['ward_no']}.\n\n"
                       f"Location 1 ({d1['municipality_name']} Ward {d1['ward_no']}):\n"
                       f"- Business Success Probability: {d1['business_success_probability']}\n"
                       f"- Footfall Index: {d1['footfall_index']}\n"
                       f"- Purchasing Power Index: {d1['purchasing_power_index']}\n\n"
                       f"Location 2 ({d2['municipality_name']} Ward {d2['ward_no']}):\n"
                       f"- Business Success Probability: {d2['business_success_probability']}\n"
                       f"- Footfall Index: {d2['footfall_index']}\n"
                       f"- Purchasing Power Index: {d2['purchasing_power_index']}\n\n"
                       f"Please compare them following your rules."
                       )
        else:
            context = "The user asked to compare two locations but one or both could not be found in the dataset. Apologize."
    elif len(locations_to_query) == 1:
        target_municipality, target_ward = locations_to_query[0]
        loc_df = df[df['municipality_name'].str.lower() == target_municipality]
        if target_ward is not None:
            loc_df = loc_df[loc_df['ward_no'] == target_ward]
            
        if not loc_df.empty:
            if target_business:
                system_prompt = prompt_general
                biz_matches = loc_df[loc_df['recommended_business'].str.lower() == target_business.lower()]
                if not biz_matches.empty:
                    loc_data = biz_matches.sort_values('business_success_probability', ascending=False).iloc[0]
                    context = (
                        f"The user asked about opening a '{target_business}' in {loc_data['municipality_name']} Ward {loc_data['ward_no']}. "
                        f"You MUST tell them YES, this is highly recommended with a success probability of {loc_data['business_success_probability']}. "
                        f"Footfall index is {loc_data['footfall_index']}."
                    )
                else:
                    best_in_ward = loc_df.sort_values('business_success_probability', ascending=False).iloc[0]
                    context = (
                        f"The user wants to open a '{target_business}' in {best_in_ward['municipality_name']} Ward {best_in_ward['ward_no']}. "
                        f"You MUST tell them NO, but recommend opening a '{best_in_ward['recommended_business']}' which has a success probability of {best_in_ward['business_success_probability']}. "
                        f"Footfall Index is {best_in_ward['footfall_index']}."
                    )
            else:
                loc_data = loc_df.sort_values('business_success_probability', ascending=False).iloc[0]
                if is_profile_request:
                    system_prompt = prompt_profile
                    pre_response_text = f"Here is the profile for {loc_data['municipality_name']} Ward {loc_data['ward_no']}:\n\n"
                    context = (
                        f"Data for {loc_data['municipality_name']} Ward {loc_data['ward_no']}:\n"
                        f"- Population: {loc_data['population']}\n"
                        f"- Recommended Business: {loc_data['recommended_business']}\n"
                        f"- Success Probability: {loc_data['business_success_probability']}\n"
                        "Please write a short paragraph summarizing this location."
                    )
                else:
                    system_prompt = prompt_general
                    context = f"The user asked what business they should open in {loc_data['municipality_name']} Ward {loc_data['ward_no']}. Tell them the dataset strongly recommends opening a '{loc_data['recommended_business']}' there with a success probability of {loc_data['business_success_probability']}."
        else:
            system_prompt = prompt_general
            context = "The user asked about a location, but we couldn't find it. Apologize."
    elif target_business:
        system_prompt = prompt_general
        best_loc = find_best_location(target_business)
        if best_loc is not None:
            context = (
                f"The user wants to open a '{target_business}'. "
                f"The best location is {best_loc['municipality_name']} Ward {best_loc['ward_no']}. "
                f"It has a high business success probability of {best_loc['business_success_probability']:.2f}. "
                f"Recommend this location directly."
            )
        else:
            context = f"The user asked about opening a {target_business}, but there is no data for it. Apologize."
    else:
        system_prompt = prompt_general
        context = f"User said: '{user_input}'. The user didn't mention a specific business or location from our dataset. Answer politely."

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": context}
    ]
    
    prompt = llm_pipeline.tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    response = llm_pipeline(prompt, max_new_tokens=100, do_sample=False)
    explanation = response[0]['generated_text'].split("<|im_start|>assistant\n")[-1].strip()
        
    return {"response": pre_response_text + explanation}
