import os
import requests
from typing import List, Dict
from models import LeadCreate
from dotenv import load_dotenv

load_dotenv()

SERPAPI_KEY = os.environ.get("SERPAPI_KEY")

def fetch_leads_from_serpapi(business: str, location: str) -> List[Dict]:
    """
    Fetches leads from Google Maps via SerpAPI.
    """
    if not SERPAPI_KEY:
        print("SERPAPI_KEY not found in environment variables.")
        return []

    params = {
        "engine": "google_maps",
        "q": f"{business} in {location}",
        "type": "search",
        "api_key": SERPAPI_KEY
    }

    try:
        response = requests.get("https://serpapi.com/search", params=params)
        response.raise_for_status()
        data = response.json()
        
        results = data.get("local_results", [])
        return results
    except Exception as e:
        print(f"Error fetching from SerpAPI: {e}")
        return []

def calculate_score(lead_data: Dict) -> int:
    """
    Calculates lead score based on requirements.
    No website -> +5
    Website exists -> 0
    """
    score = 0
    website = lead_data.get("website")
    
    if not website:
        score += 5
    
    # Future expansion points:
    # Google search validation
    # Social media presence
    
    return score

def process_lead(lead_data: Dict) -> Dict:
    """
    Transforms SerpAPI result into our Lead format and calculates score.
    """
    score = calculate_score(lead_data)
    
    return {
        "name": lead_data.get("title"),
        "phone": lead_data.get("phone"),
        "address": lead_data.get("address"),
        "website": lead_data.get("website"),
        "rating": lead_data.get("rating"),
        "score": score,
        "status": "New"
    }
