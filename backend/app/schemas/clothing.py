# backend/app/schemas/clothing.py
from pydantic import BaseModel
from uuid import UUID
from typing import Optional

# Shared base schema properties
class ClothingItemBase(BaseModel):
    name: str
    category: str  # Tops, Bottoms, Outerwear, Shoes, Accessories
    subcategory: Optional[str] = None
    color: Optional[str] = None
    brand: Optional[str] = None
    style_tag: Optional[str] = None
    image_url: str  # URL where the photo is stored in the cloud

# Schema used when creating an item (incoming data)
class ClothingItemCreate(ClothingItemBase):
    pass

# Schema used when editing/updating an item (incoming data)
# Every field is optional so you can update only what has changed (PATCH/PUT)
class ClothingItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    color: Optional[str] = None
    brand: Optional[str] = None
    style_tag: Optional[str] = None
    image_url: Optional[str] = None
    is_favorite: Optional[bool] = None
    wears_count: Optional[int] = None

# Schema used when returning an item (outgoing response data)
class ClothingItemResponse(ClothingItemBase):
    id: UUID
    user_id: UUID
    wears_count: int
    is_favorite: bool

    class Config:
        from_attributes = True
        
# The frontend sends us the public URL of the uploaded image to scan
class ImageScanRequest(BaseModel):
    image_url: str

# The structured output that our AI scanner returns to the frontend
class ClothingItemScanResponse(BaseModel):
    name: str
    category: str
    subcategory: Optional[str] = None
    color: Optional[str] = None
    style_tag: Optional[str] = None