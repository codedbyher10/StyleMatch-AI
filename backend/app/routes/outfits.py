# backend/app/routes/outfits.py
import os
import re
import json
import base64
import io
import httpx
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from uuid import UUID

from app.database.connection import get_db
from app.database.models import ClothingItem, User, Outfit, SavedLook, outfit_items
from app.core.deps import get_current_user
from app.schemas.outfits import OutfitRequest, GeneratedOutfitResponse, SaveOutfitRequest
from app.schemas.clothing import ClothingItemResponse
from app.services.outfit_engine import generate_hybrid_recommendations

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

router = APIRouter(prefix="/api/outfits", tags=["Outfits"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


# 1. GENERATE OUTFIT ENDPOINT
@router.post("/generate", response_model=List[GeneratedOutfitResponse])
async def generate_user_outfit(
    request: OutfitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wardrobe = db.query(ClothingItem).filter(ClothingItem.user_id == current_user.id).all()
    if not wardrobe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your digital wardrobe is empty! Upload some clothes first."
        )

    recommendations = await generate_hybrid_recommendations(
        wardrobe=wardrobe,
        requested_style=request.style,
        occasion=request.occasion,
        temp_c=request.temperature_c
    )

    if not recommendations:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="We couldn't coordinate an outfit. Ensure you have added at least one Top, one Bottom, and one pair of Shoes."
        )

    return recommendations


# 2. SAVE OUTFIT ENDPOINT
@router.post("/save", response_model=GeneratedOutfitResponse, status_code=status.HTTP_201_CREATED)
def save_outfit(
    payload: SaveOutfitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items = db.query(ClothingItem).filter(
        ClothingItem.id.in_(payload.item_ids),
        ClothingItem.user_id == current_user.id
    ).all()

    if len(items) != len(payload.item_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more clothing items were not found or do not belong to you."
        )

    new_outfit = Outfit(
        user_id=current_user.id,
        name=payload.name,
        description=payload.description,
        occasion=payload.occasion,
        compatibility_score=payload.compatibility_score
    )
    db.add(new_outfit)
    db.flush()

    for item in items:
        db.execute(outfit_items.insert().values(outfit_id=new_outfit.id, clothing_item_id=item.id))

    new_saved_look = SavedLook(
        user_id=current_user.id,
        outfit_id=new_outfit.id
    )
    db.add(new_saved_look)
    db.commit()
    db.refresh(new_outfit)

    return {
        "id": new_outfit.id,
        "name": new_outfit.name,
        "description": new_outfit.description,
        "occasion": new_outfit.occasion,
        "compatibility_score": new_outfit.compatibility_score,
        "items": items
    }


# 3. GET ALL SAVED OUTFITS ENDPOINT
@router.get("/saved", response_model=List[GeneratedOutfitResponse])
def get_saved_outfits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    saved_entries = db.query(SavedLook).filter(SavedLook.user_id == current_user.id).all()
    saved_outfits = []
    for entry in saved_entries:
        outfit = entry.outfit
        if outfit:
            saved_outfits.append({
                "id": outfit.id,
                "name": outfit.name,
                "description": outfit.description,
                "occasion": outfit.occasion,
                "compatibility_score": outfit.compatibility_score,
                "items": outfit.clothing_items
            })
    return saved_outfits[::-1]


# 4. DELETE / UNSAVE OUTFIT ENDPOINT
@router.delete("/saved/{outfit_id}", status_code=status.HTTP_204_NO_CONTENT)
def unsave_outfit(
    outfit_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = db.query(SavedLook).filter(
        SavedLook.outfit_id == outfit_id,
        SavedLook.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved look not found."
        )
        
    db.delete(entry)
    db.commit()
    return


# =========================================================
# 5. DYNAMIC MULTI-MODAL INSPIRATION VISION MATCHER
# =========================================================
COLOR_FAMILIES = {
    "white": ["white", "ivory", "cream", "off-white", "ecru", "pearl", "milk"],
    "black": ["black", "charcoal", "onyx", "ebony", "jet"],
    "grey": ["grey", "gray", "heather", "silver", "slate", "ash"],
    "blue": ["blue", "navy", "denim", "indigo", "cobalt", "sky", "powder blue", "pastel blue", "baby blue", "slate blue"],
    "beige": ["beige", "tan", "khaki", "camel", "taupe", "sand", "oat", "nude", "champagne"],
    "brown": ["brown", "espresso", "chocolate", "mocha", "chestnut", "rust"],
    "pink": ["pink", "blush", "dusty pink", "rose", "mauve", "magenta", "coral"],
    "red": ["red", "burgundy", "maroon", "wine", "crimson", "scarlet"],
    "green": ["green", "olive", "sage", "emerald", "forest", "mint", "lime"],
    "purple": ["purple", "lavender", "lilac", "violet", "plum"],
    "yellow": ["yellow", "mustard", "gold", "butter", "lemon"],
}


def get_color_family(color_str: str) -> str:
    c = (color_str or "").lower()
    for family, keywords in COLOR_FAMILIES.items():
        if any(kw in c for kw in keywords):
            return family
    return c


def classify_wardrobe_slot(item: ClothingItem) -> str:
    cat_lower = (item.category or "").lower()
    name_lower = (item.name or "").lower()

    is_dress_by_name = any(
        kw in name_lower
        for kw in ["dress", "gown", "onepiece", "one-piece", "jumpsuit", "sundress", "romper", "strapless"]
    )

    if "dress" in cat_lower or "one-piece" in cat_lower or "onepiece" in cat_lower or is_dress_by_name:
        return "dress"
    if any(kw in cat_lower for kw in ["outerwear", "jacket", "coat", "blazer", "cardigan"]):
        return "outerwear"
    if any(kw in cat_lower for kw in ["bottom", "pant", "jean", "skirt", "trouser", "legging", "short"]):
        return "bottom"
    if any(kw in cat_lower for kw in ["shoe", "footwear", "sandal", "sneaker", "boot", "heel", "pump", "loafer", "flat"]):
        return "shoes"
    return "top"


def extract_pixel_tones(image_bytes: bytes) -> Dict[str, Any]:
    if not HAS_PIL:
        return {"top": "neutral", "bottom": "neutral", "top_hex": "#E5E7EB", "bottom_hex": "#9CA3AF"}
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        # Focus tighter on center garment region to minimize background bias
        w, h = img.size
        center_top = img.crop((int(w * 0.3), int(h * 0.2), int(w * 0.7), int(h * 0.55)))
        center_bot = img.crop((int(w * 0.3), int(h * 0.55), int(w * 0.7), int(h * 0.85)))

        def avg_rgb(crop):
            colors = crop.getcolors(maxcolors=50000)
            if not colors:
                return [180, 180, 180]
            tot = sum(c[0] for c in colors)
            return [sum(c[0] * c[1][i] for c in colors) // tot for i in range(3)]

        avg_top = avg_rgb(center_top)
        avg_bot = avg_rgb(center_bot)

        def classify(rgb):
            r, g, b = rgb
            bright = (r + g + b) / 3
            if bright < 45: return "black"
            if bright > 205: return "cream"
            if r > 175 and g > 155 and b > 125: return "cream"
            if abs(r - g) < 18 and abs(g - b) < 18 and abs(r - b) < 18: return "grey"
            if b > r + 15 and b > g: return "blue"
            if g > r + 10 and g > b: return "green"
            if r > 160 and g > 120 and b < 110: return "beige"
            return "neutral"

        return {
            "top": classify(avg_top),
            "bottom": classify(avg_bot),
            "top_hex": f"#{avg_top[0]:02x}{avg_top[1]:02x}{avg_top[2]:02x}",
            "bottom_hex": f"#{avg_bot[0]:02x}{avg_bot[1]:02x}{avg_bot[2]:02x}",
        }
    except Exception as e:
        print(f"Pixel tone fallback: {e}")
        return {"top": "neutral", "bottom": "neutral", "top_hex": "#E5E7EB", "bottom_hex": "#9CA3AF"}


def score_garment_affinity(
    item: ClothingItem,
    target_color: str,
    target_name_hints: List[str],
    target_vibe_hints: List[str] = None,
) -> int:
    score = 0
    name = (item.name or "").lower()
    color = (item.color or "").lower()
    style = (item.style_tag or "").lower()

    if target_color:
        tcol = target_color.lower().strip()
        if tcol in color or color in tcol:
            score += 55
        elif get_color_family(tcol) == get_color_family(color):
            score += 40
        elif any(c in color for c in tcol.split()):
            score += 25

    for hint in (target_name_hints or []):
        h = hint.lower().strip()
        if h and (h in name or h in style or h in color):
            score += 20

    for vhint in (target_vibe_hints or []):
        vh = vhint.lower().strip()
        if vh and (vh in name or vh in style):
            score += 15

    return score


@router.post("/match-inspiration")
async def match_inspiration(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wardrobe = db.query(ClothingItem).filter(ClothingItem.user_id == current_user.id).all()
    if not wardrobe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your digital wardrobe is empty! Upload some clothing items first."
        )

    # 1. Fast Image Compression
    image_bytes = await file.read()
    if HAS_PIL:
        try:
            img = Image.open(io.BytesIO(image_bytes))
            if img.mode != "RGB":
                img = img.convert("RGB")
            img.thumbnail((720, 720))
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=80)
            image_bytes = buf.getvalue()
        except Exception as e:
            print(f"Image resize note: {e}")

    pixel_dna = extract_pixel_tones(image_bytes)
    base64_image = base64.b64encode(image_bytes).decode("utf-8")

    # Classify user's wardrobe cleanly into slots
    dresses, tops, bottoms, outerwear, shoes = [], [], [], [], []
    inventory_summary = []

    for it in wardrobe:
        slot = classify_wardrobe_slot(it)
        if slot == "dress":
            dresses.append(it)
        elif slot == "outerwear":
            outerwear.append(it)
        elif slot == "bottom":
            bottoms.append(it)
        elif slot == "shoes":
            shoes.append(it)
        else:
            tops.append(it)

        inventory_summary.append({
            "id": str(it.id),
            "slot": slot,
            "name": it.name,
            "category": it.category,
            "color": it.color or "Neutral",
            "style_tag": it.style_tag or "Casual"
        })

    # 2. Vision AI Prompt with true garment extraction + dress/separates awareness
    vision_prompt = (
        "You are an expert fashion stylist for StyleMatch AI.\n"
        "Carefully inspect the GARMENTS in the outfit photo (ignore the background room/wall/furniture).\n"
        "Then recreate the look as closely as possible using ONLY items from the USER WARDROBE INVENTORY below.\n\n"
        f"USER WARDROBE INVENTORY:\n{json.dumps(inventory_summary)}\n\n"
        "Rules:\n"
        "1. First decide `outfit_type`: use 'dress' if the photo shows a dress/gown/jumpsuit/one-piece, otherwise 'separates'.\n"
        "2. If `outfit_type` is 'dress' AND the inventory has items with slot='dress', select `selected_dress_id` (leave `selected_top_id` and `selected_bottom_id` empty). "
        "If no dress exists in the inventory, fall back to the closest color/vibe `selected_top_id` + `selected_bottom_id` and note in `missing_element_tip` that adding a dress would make it a 1:1 match.\n"
        "3. Prioritize matching COLOR FAMILY, SILHOUETTE, and AESTHETIC VIBE (e.g., cream/ivory/white/light-blue for romantic looks; do not pick dark work trousers for a pastel mini dress unless no better option exists).\n"
        "4. Select `selected_outerwear_id` ONLY if the reference photo clearly includes a jacket/blazer/coat.\n"
        "5. `detected_tags` must be 3-4 short tags accurately describing the actual photo (garment type, fabric/detail, aesthetic).\n"
        "6. `extracted_palette` must be 3 color swatches of the GARMENT ONLY (exclude dark backgrounds), with hex codes and percentages summing to 100.\n"
        "7. Be honest with `similarity_score` (0-100) based on how close the user's actual wardrobe pieces are to the photo.\n\n"
        "Return ONLY a strict JSON object with this exact schema:\n"
        "{\n"
        '  "outfit_type": "dress" or "separates",\n'
        '  "inspo_vibe": "Short distinctive name of the reference look",\n'
        '  "similarity_score": 85,\n'
        '  "vibe_match_score": 88,\n'
        '  "color_match_score": 82,\n'
        '  "silhouette_match_score": 84,\n'
        '  "detected_tags": ["Cream Ruffled Mini Dress", "Butterfly Embroidery", "Pastel Blue Ribbon", "Romantic Coquette"],\n'
        '  "extracted_palette": [\n'
        '    {"name": "Ivory Cream", "hex": "#F3EDE2", "percentage": 60},\n'
        '    {"name": "Powder Blue", "hex": "#8DA9C4", "percentage": 25},\n'
        '    {"name": "Warm Taupe", "hex": "#C8B8A6", "percentage": 15}\n'
        '  ],\n'
        '  "selected_dress_id": "Exact UUID from wardrobe if dress, else empty string",\n'
        '  "selected_top_id": "Exact UUID from wardrobe if separates, else empty string",\n'
        '  "selected_bottom_id": "Exact UUID from wardrobe if separates, else empty string",\n'
        '  "selected_outerwear_id": "Exact UUID if jacket/coat present in photo, else empty string",\n'
        '  "selected_shoes_id": "Exact UUID of best matching footwear from wardrobe",\n'
        '  "garment_detected": {"color": "cream", "style": "romantic", "keywords": ["ruffle", "lace", "floral", "mini", "pastel"]},\n'
        '  "top_detected": {"color": "cream", "style": "top", "keywords": ["top", "blouse"]},\n'
        '  "bottom_detected": {"color": "beige", "style": "bottom", "keywords": ["skirt", "trousers"]},\n'
        '  "shoes_detected": {"color": "nude", "style": "sandals", "keywords": ["heels", "sandals", "flats"]},\n'
        '  "styling_breakdown": "1-2 honest sentences explaining how the matched pieces channel the inspiration look.",\n'
        '  "missing_element_tip": "One specific piece or accessory to make this a closer 1:1 match."\n'
        "}"
    )

    groq_url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    inspo_data: Dict[str, Any] = {}

    if GROQ_API_KEY:
        async with httpx.AsyncClient(timeout=20.0) as client:
            try:
                payload = {
                    "model": "qwen/qwen3.8-27b",
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": vision_prompt},
                                {
                                    "type": "image_url",
                                    "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                                }
                            ]
                        }
                    ],
                    "temperature": 0.2,
                    "max_tokens": 1200,
                    "reasoning_effort": "none",
                    "response_format": {"type": "json_object"}
                }

                response = await client.post(groq_url, headers=headers, json=payload)
                if response.status_code == 200:
                    raw_json = response.json()["choices"][0]["message"]["content"]
                    json_match = re.search(r"\{.*\}", raw_json, re.DOTALL)
                    if json_match:
                        inspo_data = json.loads(json_match.group(0))
                else:
                    print(f"Groq Vision API non-200 ({response.status_code}): {response.text}")
            except Exception as e:
                print(f"Vision call fallback: {e}")

    # 3. Dynamic Wardrobe Matching with Dresses + Separates + Clean Alternatives
    garment_spec = inspo_data.get("garment_detected", {})
    top_spec = inspo_data.get("top_detected", {"color": pixel_dna["top"], "keywords": [pixel_dna["top"]]})
    bot_spec = inspo_data.get("bottom_detected", {"color": pixel_dna["bottom"], "keywords": [pixel_dna["bottom"]]})
    shoe_spec = inspo_data.get("shoes_detected", {"color": "white", "keywords": ["sandals", "sneakers", "heels"]})
    vibe_keywords = garment_spec.get("keywords", [])

    sorted_dresses = sorted(
        dresses,
        key=lambda it: score_garment_affinity(
            it, garment_spec.get("color", pixel_dna["top"]), vibe_keywords, [garment_spec.get("style", "")]
        ),
        reverse=True,
    ) if dresses else []

    sorted_tops = sorted(
        tops,
        key=lambda it: score_garment_affinity(
            it, top_spec.get("color", pixel_dna["top"]), top_spec.get("keywords", []), vibe_keywords
        ),
        reverse=True,
    ) if tops else []

    sorted_bottoms = sorted(
        bottoms,
        key=lambda it: score_garment_affinity(
            it, bot_spec.get("color", pixel_dna["bottom"]), bot_spec.get("keywords", []), vibe_keywords
        ),
        reverse=True,
    ) if bottoms else []

    sorted_outerwear = sorted(
        outerwear,
        key=lambda it: score_garment_affinity(
            it, garment_spec.get("color", ""), vibe_keywords
        ),
        reverse=True,
    ) if outerwear else []

    sorted_shoes = sorted(
        shoes,
        key=lambda it: score_garment_affinity(
            it, shoe_spec.get("color", "white"), shoe_spec.get("keywords", []), vibe_keywords
        ),
        reverse=True,
    ) if shoes else []

    matched_items: List[ClothingItem] = []
    outfit_type = (inspo_data.get("outfit_type") or "separates").lower()

    if outfit_type == "dress" and sorted_dresses:
        ai_dress_id = inspo_data.get("selected_dress_id")
        chosen_dress = next((it for it in dresses if str(it.id) == ai_dress_id), sorted_dresses[0])
        matched_items.append(chosen_dress)
    else:
        ai_top_id = inspo_data.get("selected_top_id")
        chosen_top = next((it for it in tops if str(it.id) == ai_top_id), sorted_tops[0] if sorted_tops else None)
        if chosen_top:
            matched_items.append(chosen_top)

        ai_bot_id = inspo_data.get("selected_bottom_id")
        chosen_bot = next((it for it in bottoms if str(it.id) == ai_bot_id), sorted_bottoms[0] if sorted_bottoms else None)
        if chosen_bot:
            matched_items.append(chosen_bot)

    ai_outer_id = inspo_data.get("selected_outerwear_id")
    if ai_outer_id and outerwear:
        chosen_outer = next((it for it in outerwear if str(it.id) == ai_outer_id), None)
        if chosen_outer:
            matched_items.append(chosen_outer)

    ai_shoe_id = inspo_data.get("selected_shoes_id")
    chosen_shoe = next((it for it in shoes if str(it.id) == ai_shoe_id), sorted_shoes[0] if sorted_shoes else None)
    if chosen_shoe:
        matched_items.append(chosen_shoe)

    chosen_ids = {str(it.id) for it in matched_items}

    # Build clean tags & palette (prefer Vision AI, smart fallback if AI failed)
    raw_tags = inspo_data.get("detected_tags")
    if isinstance(raw_tags, list) and len(raw_tags) > 0:
        detected_tags = [str(t) for t in raw_tags[:4]]
    else:
        detected_tags = [
            f"{pixel_dna['top'].title()} Primary Tone",
            "Dress Silhouette" if outfit_type == "dress" else f"{pixel_dna['bottom'].title()} Bottoms",
            (shoe_spec.get("style") or "Footwear").title()
        ]

    raw_palette = inspo_data.get("extracted_palette")
    if isinstance(raw_palette, list) and len(raw_palette) > 0:
        extracted_palette = [
            {
                "name": str(sw.get("name", "Accent")),
                "hex": str(sw.get("hex", "#E5E7EB")),
                "percentage": int(sw.get("percentage", 33)),
            }
            for sw in raw_palette[:3]
            if isinstance(sw, dict)
        ]
    else:
        extracted_palette = [
            {"name": f"{pixel_dna['top'].title()} Tone", "hex": pixel_dna["top_hex"], "percentage": 55},
            {"name": f"{pixel_dna['bottom'].title()} Tone", "hex": pixel_dna["bottom_hex"], "percentage": 30},
            {"name": "Neutral Accent", "hex": "#F4F4F5", "percentage": 15},
        ]

    vibe_name = inspo_data.get("inspo_vibe") or (
        f"{matched_items[0].color} Aesthetic Re-creation".strip().title() if matched_items and matched_items[0].color else "Curated Wardrobe Match"
    )
    item_names = ", ".join(it.name for it in matched_items) if matched_items else "your wardrobe pieces"
    styling_text = inspo_data.get("styling_breakdown") or (
        f"Aria coordinated {item_names} to mirror the silhouette and color harmony of your reference photo."
    )

    return {
        "inspo_vibe": vibe_name,
        "similarity_score": int(inspo_data.get("similarity_score", 88)),
        "match_breakdown": {
            "vibe_match": int(inspo_data.get("vibe_match_score", 90)),
            "color_match": int(inspo_data.get("color_match_score", 86)),
            "silhouette_match": int(inspo_data.get("silhouette_match_score", 88)),
        },
        "detected_tags": detected_tags,
        "extracted_palette": extracted_palette,
        "styling_breakdown": styling_text,
        "missing_element_tip": inspo_data.get(
            "missing_element_tip",
            "Add a close-tone statement piece or accessory to bring this even closer to a 1:1 match."
        ),
        "matched_items": [ClothingItemResponse.model_validate(it) for it in matched_items],
        "alternatives": {
            "dresses": [ClothingItemResponse.model_validate(it) for it in sorted_dresses if str(it.id) not in chosen_ids][:3],
            "tops": [ClothingItemResponse.model_validate(it) for it in sorted_tops if str(it.id) not in chosen_ids][:3],
            "bottoms": [ClothingItemResponse.model_validate(it) for it in sorted_bottoms if str(it.id) not in chosen_ids][:3],
            "outerwear": [ClothingItemResponse.model_validate(it) for it in sorted_outerwear if str(it.id) not in chosen_ids][:3],
            "shoes": [ClothingItemResponse.model_validate(it) for it in sorted_shoes if str(it.id) not in chosen_ids][:3],
        },
    }