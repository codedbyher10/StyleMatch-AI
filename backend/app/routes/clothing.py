# backend/app/routes/clothing.py
import os
import uuid
import json
import re
import httpx
import base64
import asyncio  # Crucial import for retry delays
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from uuid import UUID
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

from app.database.connection import get_db
from app.database.models import ClothingItem, User
from app.core.deps import get_current_user
from app.schemas.clothing import (
    ClothingItemCreate, ClothingItemUpdate, ClothingItemResponse,
    ImageScanRequest, ClothingItemScanResponse
)

router = APIRouter(prefix="/api/wardrobe", tags=["Wardrobe"])

# Initialize secure Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase_client: Optional[Client] = None
if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY and "secret" not in SUPABASE_SERVICE_ROLE_KEY.lower():
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    except Exception as e:
        print(f"❌ Error initializing Supabase storage client: {e}")

# Load Groq API Key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


# 1. HIGH-PERFORMANCE GROQ IMAGE SCANNER (STABILIZED WITH RETRY BACKOFF & MAX_TOKENS CAP)
@router.post("/scan", response_model=ClothingItemScanResponse)
async def scan_clothing_image(
    payload: ImageScanRequest,
    current_user: User = Depends(get_current_user)
):
    if not GROQ_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Groq API Key is missing from the server configuration."
        )

    system_prompt = (
        "You are an elite AI personal fashion stylist. Analyze this clothing item image. "
        "Your task is to identify its features and match them strictly to this JSON Schema format:\n"
        "{\n"
        "  \"name\": \"A clear, descriptive title for the item (e.g., 'Tailored Charcoal Blazer')\",\n"
        "  \"category\": \"Must be exactly one of: 'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories', 'Dresses'\",\n"
        "  \"subcategory\": \"A specific sub-type (e.g., 't-shirt', 'bomber jacket', 'boots')\",\n"
        "  \"color\": \"The primary dominant color of the item (e.g., 'Black', 'Olive')\",\n"
        "  \"style_tag\": \"Must be exactly one of: 'Casual', 'Minimal', 'Streetwear', 'Formal', 'Sporty', 'Vintage', 'Elegant'\"\n"
        "}"
    )

    downloader_headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # A. Download the image
            img_response = await client.get(payload.image_url, headers=downloader_headers)
            if img_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Could not access or download image. Server returned HTTP status: {img_response.status_code}"
                )
            
            # B. Extract actual image MIME type dynamically and normalize
            raw_mime = img_response.headers.get("Content-Type", "image/jpeg").lower()
            if "jpg" in raw_mime or "jpeg" in raw_mime:
                detected_mime_type = "image/jpeg"
            elif "png" in raw_mime:
                detected_mime_type = "image/png"
            elif "webp" in raw_mime:
                detected_mime_type = "image/webp"
            elif "heic" in raw_mime:
                detected_mime_type = "image/heic"
            elif "heif" in raw_mime:
                detected_mime_type = "image/heif"
            else:
                detected_mime_type = "image/jpeg"
            
            img_bytes = img_response.content
            # C. Convert image binary to Base64
            base64_data = base64.b64encode(img_bytes).decode('utf-8')
            
            # D. Post directly to Groq's high-speed endpoint (using qwen/qwen3.8-27b)
            groq_url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            }
            
            groq_payload = {
                "model": "qwen/qwen3.8-27b",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": system_prompt
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{detected_mime_type};base64,{base64_data}"
                                }
                            }
                        ]
                    }
                ],
                "response_format": {"type": "json_object"},  # Enforces valid JSON natively on Groq
                "temperature": 0.1,
                "max_tokens": 250  # Fixes 429 rate limit: caps request under the 1000 OTPM limit
            }

            # Retry configuration to safely handle temporary rate-limits or concurrency spikes
            max_retries = 3
            backoff_delay = 1.5
            last_error = ""

            for attempt in range(1, max_retries + 1):
                try:
                    response = await client.post(groq_url, headers=headers, json=groq_payload)
                    
                    if response.status_code == 200:
                        result = response.json()
                        raw_json_output = result["choices"][0]["message"]["content"].strip()
                        return json.loads(raw_json_output)
                        
                    elif response.status_code in [429, 503]:
                        print(f"⚠️ Groq API returned {response.status_code} (Attempt {attempt}/{max_retries}). Retrying in {backoff_delay}s...")
                        last_error = f"Status {response.status_code}: {response.text}"
                        await asyncio.sleep(backoff_delay)
                        continue
                    else:
                        print(f"❌ Non-retryable Groq error (Status {response.status_code}): {response.text}")
                        raise Exception(f"Groq API Error: Status {response.status_code} - {response.text}")
                        
                except Exception as e:
                    print(f"⚠️ Attempt {attempt}/{max_retries} failed with error: {e}")
                    last_error = str(e)
                    if attempt < max_retries:
                        await asyncio.sleep(backoff_delay)
                    continue
            
            raise Exception(f"Failed to scan image after {max_retries} attempts. Last error: {last_error}")

        except HTTPException as he:
            raise he
        except Exception as e:
            print(f"❌ Groq Vision Scanner failed. Reason: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"AI Scan failed: {str(e)}"
            )

# 2. IMAGE UPLOAD ROUTE (Supabase Storage)
@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_clothing_image(
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_user)
):
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase storage client is not configured on the server."
        )
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only JPEG, PNG, and WEBP images are allowed."
        )
    try:
        file_content = await file.read()
        file_extension = file.filename.split(".")[-1]
        unique_filename = f"{current_user.id}/{uuid.uuid4()}.{file_extension}"
        
        supabase_client.storage.from_("wardrobe").upload(
            path=unique_filename,
            file=file_content,
            file_options={"content-type": file.content_type}
        )
        public_url = supabase_client.storage.from_("wardrobe").get_public_url(unique_filename)
        return {"image_url": public_url}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )

# 3. ADD A NEW CLOTHING ITEM
@router.post("", response_model=ClothingItemResponse, status_code=status.HTTP_201_CREATED)
def add_clothing_item(
    item_data: ClothingItemCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    new_item = ClothingItem(
        **item_data.model_dump(),
        user_id=current_user.id
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

# 4. GET ALL CLOTHING ITEMS (Filtered by logged-in user)
@router.get("", response_model=List[ClothingItemResponse])
def list_wardrobe(
    category: Optional[str] = None,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    query = db.query(ClothingItem).filter(ClothingItem.user_id == current_user.id)
    if category:
        query = query.filter(ClothingItem.category == category)
    return query.all()

# 5. GET A SPECIFIC CLOTHING ITEM
@router.get("/{item_id}", response_model=ClothingItemResponse)
def get_clothing_item(
    item_id: UUID, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    item = db.query(ClothingItem).filter(
        ClothingItem.id == item_id, 
        ClothingItem.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clothing item not found, or you do not have permission to view it."
        )
    return item

# 6. UPDATE A CLOTHING ITEM
@router.put("/{item_id}", response_model=ClothingItemResponse)
def update_clothing_item(
    item_id: UUID, 
    update_data: ClothingItemUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    item = db.query(ClothingItem).filter(
        ClothingItem.id == item_id, 
        ClothingItem.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clothing item not found, or you do not have permission to edit it."
        )
    for key, value in update_data.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item

# 7. DELETE A CLOTHING ITEM
@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_clothing_item(
    item_id: UUID, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    item = db.query(ClothingItem).filter(
        ClothingItem.id == item_id, 
        ClothingItem.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clothing item not found, or you do not have permission to delete it."
        )
    db.delete(item)
    db.commit()
    return

# 8. TOGGLE FAVORITE STATUS (PATCH)
@router.patch("/{item_id}/favorite", response_model=ClothingItemResponse)
def toggle_favorite(
    item_id: UUID, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    item = db.query(ClothingItem).filter(
        ClothingItem.id == item_id, 
        ClothingItem.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clothing item not found, or you do not have permission to modify it."
        )
    item.is_favorite = not item.is_favorite
    db.commit()
    db.refresh(item)
    return item