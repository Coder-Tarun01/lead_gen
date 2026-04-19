from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Lead(BaseModel):
    id: Optional[str] = None
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    rating: Optional[float] = None
    score: int = 0
    status: str = "New"
    notes: Optional[str] = None
    last_contacted: Optional[datetime] = None
    next_followup: Optional[datetime] = None
    created_at: Optional[datetime] = None

class LeadCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    rating: Optional[float] = None

class LeadUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    next_followup: Optional[datetime] = None
    last_contacted: Optional[datetime] = None
