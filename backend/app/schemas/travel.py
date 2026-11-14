# backend/app/schemas/travel.py
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from app.schemas.clothing import ClothingItemResponse

class TravelPlanRequest(BaseModel):
    destination: str
    duration: int = Field(default=5, ge=1, le=14)
    trip_type: str = Field(default="Beach") # Beach, Leisure, Date, Business, Party, Adventure

class WeatherSummary(BaseModel):
    destination_display: str
    avg_temp_c: int
    min_temp_c: int
    max_temp_c: int
    condition: str
    summary: str

class DayOutfitPlan(BaseModel):
    day: int
    title: str
    description: str
    items: List[ClothingItemResponse]

class PackingListCounts(BaseModel):
    tops: int
    bottoms: int
    shoes: int
    outerwear: int
    total_pieces: int

class TravelPlanResponse(BaseModel):
    weather: WeatherSummary
    counts: PackingListCounts
    packed_items: List[ClothingItemResponse]  # Distinct list for the suitcase checklist
    itinerary: List[DayOutfitPlan]           # Day 1..N looks