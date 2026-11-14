# backend/app/schemas/preferences.py
from pydantic import BaseModel
from typing import List, Optional

class StylePreferenceUpdate(BaseModel):
    bio: Optional[str] = None
    styles: Optional[List[str]] = None
    occasions: Optional[List[str]] = None
    preferred_colors: Optional[List[str]] = None
    avoided_colors: Optional[List[str]] = None
    shirt_size: Optional[str] = None
    shoe_size: Optional[str] = None

class StylePreferenceResponse(BaseModel):
    bio: Optional[str]
    styles: List[str]
    occasions: List[str]
    preferred_colors: List[str]
    avoided_colors: List[str]
    shirt_size: str
    shoe_size: str

    class Config:
        from_attributes = True