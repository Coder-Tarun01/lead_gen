from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime
import os

from models import Lead, LeadUpdate
from db.supabase_client import get_supabase
from services.lead_service import fetch_leads_from_serpapi, process_lead

app = FastAPI(title="Lead Gen CRM API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase = get_supabase()

@app.get("/")
async def root():
    return {"message": "Lead Gen CRM API is running"}

@app.get("/leads")
async def get_leads(business: str, location: str):
    """
    Fetch leads from external API, store in DB, and return filtered results.
    """
    print(f"Fetching leads for {business} in {location}...")
    try:
        raw_leads = fetch_leads_from_serpapi(business, location)
    except Exception as e:
        print(f"SerpAPI Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch from Google Maps")
        
    processed_leads = []
    
    for raw in raw_leads:
        try:
            processed = process_lead(raw)
            
            # Only process leads with score >= 5
            if processed["score"] >= 5:
                # Deduplication logic
                query = supabase.table("leads").select("*")
                
                # Use phone if available, otherwise name + address
                if processed.get('phone'):
                    query = query.eq("phone", processed['phone'])
                elif processed.get('name') and processed.get('address'):
                    query = query.match({"name": processed['name'], "address": processed['address']})
                else:
                    # If we don't have enough info to deduplicate, skip storage but return it
                    processed_leads.append(processed)
                    continue

                existing = query.execute()
                
                if not existing.data:
                    res = supabase.table("leads").insert(processed).execute()
                    if res.data:
                        processed_leads.append(res.data[0])
                else:
                    processed_leads.append(existing.data[0])
        except Exception as e:
            print(f"Error processing individual lead: {e}")
            continue
                
    return processed_leads

@app.get("/db-leads")
async def get_db_leads(status: Optional[str] = None, min_score: Optional[int] = None):
    """
    Get leads already stored in the database.
    """
    query = supabase.table("leads").select("*")
    
    if status:
        query = query.eq("status", status)
    if min_score is not None:
        query = query.gte("score", min_score)
        
    res = query.order("created_at", desc=True).execute()
    return res.data

@app.get("/followups")
async def get_followups():
    """
    Get leads where next_followup is today or earlier.
    """
    today = datetime.now().isoformat()
    res = supabase.table("leads").select("*").lte("next_followup", today).execute()
    return res.data

@app.patch("/leads/{lead_id}")
async def update_lead(lead_id: str, update_data: LeadUpdate):
    """
    Update lead status, notes, or follow-up date.
    Auto-updates last_contacted if status changes.
    """
    data = update_data.dict(exclude_unset=True)
    
    if "status" in data:
        data["last_contacted"] = datetime.now().isoformat()
        
    res = supabase.table("leads").update(data).eq("id", lead_id).execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    return res.data[0]

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)
