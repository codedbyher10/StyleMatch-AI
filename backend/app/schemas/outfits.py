# backend/app/schemas/outfits.py
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from app.schemas.clothing import ClothingItemResponse

# The request sent by the frontend "Generate Outfit" form
class OutfitRequest(BaseModel):
    occasion: str           # E.g. "Office", "Date"
    style: str              # E.g. "Minimal", "Streetwear"
    temperature_c: int      # E.g. 18
    weather_condition: Optional[str] = "Sunny"

# The structured outfit recommendation returned to the user
class GeneratedOutfitResponse(BaseModel):
    id: Optional[UUID] = None  # Added ID to support database tracking for Saved Looks
    name: str
    description: str        # Maps your AI custom styling tips
    occasion: str
    compatibility_score: int
    items: List[ClothingItemResponse]

# The request payload to save a generated outfit
class SaveOutfitRequest(BaseModel):
    name: str
    description: str
    occasion: str
    compatibility_score: int
    item_ids: List[UUID]    # The raw UUIDs of the 3 or 4 clothes in the outfit