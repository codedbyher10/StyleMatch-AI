# backend/app/services/outfit_engine.py
import os
import re
import json
import itertools
import httpx
import asyncio
from typing import List, Dict, Any
from app.database.models import ClothingItem

# Retrieve your Groq API Key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

async def generate_hybrid_recommendations(
    wardrobe: List[ClothingItem], 
    requested_style: str, 
    occasion: str, 
    temp_c: int
) -> List[Dict[str, Any]]:
    """
    Two-Stage Hybrid Recommendation Engine:
    Stage 1: Enforces fast Python rules to narrow combinations down to a Top 20 pool,
             utilizing style, occasion, name keyword, and dynamic dress reclassification.
             Sorts garments vertically (Tops/Dresses -> Bottoms -> Outerwear -> Shoes).
    Stage 2: Sends Top 20 to Groq Cloud natively using openai/gpt-oss-120b for ultra-fast aesthetic ranking.
    """
    
    # === STAGE 1: FAST CANDIDATE FILTERING (Python Rules) ===
    
    # Categorize wardrobe dynamically. 
    # Defensive programming: If a dress was miscategorized as a 'Top' by the previous scanner, 
    # intercept it here and dynamically reclassify it as a Dress/One-Piece so it generates correctly.
    tops = []
    bottoms = [item for item in wardrobe if item.category == "Bottoms"]
    shoes = [item for item in wardrobe if item.category == "Shoes"]
    outerwear = [item for item in wardrobe if item.category == "Outerwear"]
    dresses = []

    for item in wardrobe:
        category_lower = item.category.lower() if item.category else ""
        name_lower = item.name.lower() if item.name else ""
        
        # Check if the name strongly implies a standalone dress
        is_dress_by_name = any(kw in name_lower for kw in ["dress", "gown", "onepiece", "one-piece", "jumpsuit", "strapless"])
        
        if "dress" in category_lower or "one-piece" in category_lower or "onepiece" in category_lower or is_dress_by_name:
            dresses.append(item)
        elif "top" in category_lower:
            tops.append(item)

    # Structural Gate: We need at least shoes, and either (tops + bottoms) OR (dresses)
    has_two_piece = len(tops) > 0 and len(bottoms) > 0
    has_one_piece = len(dresses) > 0
    
    if not shoes or (not has_two_piece and not has_one_piece):
        return []

    # Weather Constraint Rule: Require outerwear if temp is under 20°C
    is_cold = temp_c < 20
    
    # Generate all candidate permutations
    combos = []
    
    # Stream A: Generate Two-Piece Outfits (Tops + Bottoms + Shoes)
    if has_two_piece:
        if is_cold and outerwear:
            # Sorted: [Top, Bottom, Jacket, Shoes]
            permutations = list(itertools.product(tops, bottoms, outerwear, shoes))
            for t, b, j, s in permutations:
                combos.append({"items": [t, b, j, s], "has_jacket": True, "type": "two-piece"})
        else:
            # Sorted: [Top, Bottom, Shoes]
            permutations = list(itertools.product(tops, bottoms, shoes))
            for t, b, s in permutations:
                combos.append({"items": [t, b, s], "has_jacket": False, "type": "two-piece"})

    # Stream B: Generate One-Piece Outfits (Dresses + Shoes)
    if has_one_piece:
        if is_cold and outerwear:
            # Sorted: [Dress, Jacket, Shoes]
            permutations = list(itertools.product(dresses, outerwear, shoes))
            for d, j, s in permutations:
                combos.append({"items": [d, j, s], "has_jacket": True, "type": "one-piece"})
        else:
            # Sorted: [Dress, Shoes]
            permutations = list(itertools.product(dresses, shoes))
            for d, s in permutations:
                combos.append({"items": [d, s], "has_jacket": False, "type": "one-piece"})

    # Run a fast local heuristic score to select the top 20 candidates
    candidates = []
    for index, combo in enumerate(combos):
        items = combo["items"]
        combo_type = combo.get("type", "two-piece")
        
        # Style and Occasion matching score
        style_score = 0
        for item in items:
            name_lower = item.name.lower()
            tag_lower = item.style_tag.lower() if item.style_tag else "casual"
            
            # A. Base match to the requested default style
            if tag_lower == requested_style.lower():
                # Reduce default style bias for casual or active occasions so items can mix & match
                if occasion.lower() in ["party", "date", "gym", "travel", "college", "casual"]:
                    style_score += 5
                else:
                    style_score += 15
            
            # B. Occasion-specific heuristics (Strictly mapped to your 8 frontend categories)
            occ_lower = occasion.lower()
            
            if occ_lower == "casual":
                if tag_lower in ["minimal", "streetwear", "casual", "smart casual"]:
                    style_score += 12
                elif tag_lower == "formal":
                    style_score -= 10
                # Keywords
                if any(kw in name_lower for kw in ["t-shirt", "jeans", "sneakers", "hoodie", "shorts", "slides", "tank", "dress"]):
                    style_score += 15
                    
            elif occ_lower == "college":
                if tag_lower in ["streetwear", "minimal", "casual", "smart casual"]:
                    style_score += 12
                elif tag_lower == "formal":
                    style_score -= 10
                # Keywords
                if any(kw in name_lower for kw in ["backpack", "jeans", "sneakers", "hoodie", "t-shirt", "cargo", "tote", "skirt"]):
                    style_score += 15
                    
            elif occ_lower == "office":
                if tag_lower in ["minimal", "smart casual", "elegant", "formal"]:
                    style_score += 12
                elif tag_lower in ["sporty", "streetwear"]:
                    style_score -= 10
                # Keywords
                if any(kw in name_lower for kw in ["trousers", "blazer", "suit", "oxford", "button-down", "pleated", "pumps", "loafers", "midi"]):
                    style_score += 15
                if any(kw in name_lower for kw in ["hoodie", "shorts", "crop", "slides"]):
                    style_score -= 15
                    
            elif occ_lower == "formal":
                if tag_lower in ["elegant", "formal", "minimal"]:
                    style_score += 12
                elif tag_lower in ["sporty", "streetwear", "casual"]:
                    style_score -= 15
                # Keywords
                if any(kw in name_lower for kw in ["suit", "blazer", "trousers", "gown", "dress", "pumps", "patent", "oxford", "vest"]):
                    style_score += 15
                if any(kw in name_lower for kw in ["sneakers", "t-shirt", "hoodie", "shorts", "crop"]):
                    style_score -= 20
                    
            elif occ_lower == "party":
                if tag_lower in ["elegant", "streetwear", "vintage", "casual"]:
                    style_score += 12
                elif tag_lower in ["formal", "sporty"]:
                    style_score -= 10
                # Keywords
                party_keywords = ["pearl", "embellished", "ruffle", "floral", "tie-front", "lace", "crop", "suede", "sandals", "fringe", "sequin", "ribbed", "bow", "dress", "gown", "onepiece", "strapless", "ruched"]
                if any(kw in name_lower for kw in party_keywords):
                    style_score += 15
                work_keywords = ["polo", "trousers", "patent", "pumps", "pleated", "blazer", "suit", "workwear", "oxford"]
                if any(kw in name_lower for kw in work_keywords):
                    style_score -= 15
                    
            elif occ_lower == "date":
                if tag_lower in ["elegant", "smart casual", "vintage", "minimal"]:
                    style_score += 12
                elif tag_lower == "sporty":
                    style_score -= 15
                # Keywords: Strong romantic date-night boosts
                date_keywords = ["dress", "floral", "lace", "suede", "heels", "skirt", "perfume", "silk", "ribbed", "onepiece", "strapless", "ruched", "mini", "sandals"]
                if any(kw in name_lower for kw in date_keywords):
                    style_score += 15
                # Strict Date Penalties on Office Workwear (This keeps formal trousers out of dates)
                work_keywords = ["trousers", "patent", "pumps", "pleated", "blazer", "suit", "workwear", "oxford", "polo"]
                if any(kw in name_lower for kw in work_keywords):
                    style_score -= 15
                    
            elif occ_lower == "gym":
                if tag_lower == "sporty":
                    style_score += 20
                elif tag_lower in ["formal", "elegant"]:
                    style_score -= 15
                # Keywords
                if any(kw in name_lower for kw in ["joggers", "shorts", "tank", "leggings", "sneakers", "hoodie", "activewear", "athletic"]):
                    style_score += 20
                if any(kw in name_lower for kw in ["trousers", "pumps", "blazer", "skirt", "patent"]):
                    style_score -= 20
                    
            elif occ_lower == "travel":
                if tag_lower in ["smart casual", "minimal", "streetwear", "casual"]:
                    style_score += 12
                elif tag_lower == "formal":
                    style_score -= 15
                # Keywords
                if any(kw in name_lower for kw in ["joggers", "sneakers", "hoodie", "backpack", "casual", "t-shirt", "canvas", "tote"]):
                    style_score += 15
        
        # Fast color harmony score
        colors = [item.color.lower() for item in items if item.color]
        unique_colors = len(set(colors))
        color_score = 30 if unique_colors <= 2 else (20 if unique_colors == 3 else 5)
        
        # Slight aesthetic bonus for beautifully layered winter dresses
        if combo_type == "one-piece" and combo["has_jacket"]:
            color_score += 5
            
        heuristic_score = style_score + color_score
        candidates.append({
            "index": index,
            "combo": combo,
            "score": heuristic_score
        })

    # Slice the collection to get the top 20 candidate combinations
    candidates = sorted(candidates, key=lambda x: x["score"], reverse=True)[:20]

    if not candidates:
        return []

    # === STAGE 2: AI RE-RANKING & FASHION REASONING (Groq Cloud) ===
    
    # Fallback to local python rule-based sorting if the Groq API Key is missing
    if not GROQ_API_KEY:
        return [format_candidate_fallback(c["combo"], c["score"], requested_style, occasion, temp_c) for c in candidates[:3]]

    # Format the top 20 candidates into clean structured text
    candidates_text = ""
    for i, c in enumerate(candidates):
        items_desc = []
        for item in c["combo"]["items"]:
            # Check if the name already starts with the color to prevent duplication
            color_prefix = ""
            if item.color and not item.name.lower().startswith(item.color.lower()):
                color_prefix = f"{item.color} "
                
            items_desc.append(f"{color_prefix}{item.name} ({item.category} - {item.style_tag or 'Casual'})")
        candidates_text += f"Candidate ID {i}: " + " + ".join(items_desc) + "\n"

    # Strict JSON formatting for Groq Llama/OSS models.
    # We request a root object containing an 'outfits' array to satisfy Groq's Object JSON mode constraints.
    system_prompt = (
        f"You are an elite, highly critical personal fashion stylist.\n"
        f"The user wants a '{requested_style}' outfit for a '{occasion}' event.\n"
        f"The current temperature is {temp_c}°C.\n\n"
        f"Here are the top candidate outfit combinations selected from the user's wardrobe:\n"
        f"{candidates_text}\n"
        f"Note: An outfit candidate can be a 2-piece/3-piece dress outfit (Dress/One-piece + optional Outerwear jacket + Shoes) "
        f"or a standard multi-piece outfit (Top + Bottom + optional Outerwear jacket + Shoes).\n\n"
        f"Your task is to review these combinations and perform two operations:\n"
        f"1. Aesthetic Re-ranking: Select the top 3 best outfits based on true visual harmony, "
        f"matching silhouette, formality levels, and color coordinating. Ensure the selections match the visual energy of the occasion. "
        f"For example, for a 'Date' occasion, you MUST prioritize romantic, stylish, and high-energy combinations (such as dresses, "
        f"ruched tops, floral details, and suede sandals) over plain, formal, or basic work trousers and office pumps.\n"
        f"2. Styling Commentary: For each of your top 3 picks, write a professional, natural styling explanation "
        f"(up to 2 sentences) describing why the pieces complement each other, and provide a concrete tip.\n\n"
        f"Respond ONLY with a strictly formatted JSON object containing an 'outfits' key mapped to an array of exactly 3 objects. Do not include any markdown, "
        f"backticks, or text outside the JSON block. Follow this structure exactly:\n"
        f"{{\n"
        f"  \"outfits\": [\n"
        f"    {{\n"
        f"      \"candidate_id\": 0,\n"
        f"      \"name\": \"A creative style name for the outfit\",\n"
        f"      \"compatibility_score\": 95,\n"
        f"      \"styling_commentary\": \"styling commentary here...\"\n"
        f"    }}\n"
        f"  ]\n"
        f"}}"
    )

    # Groq API endpoint using openai/gpt-oss-120b
    groq_url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    groq_payload = {
        "model": "openai/gpt-oss-120b",  # Active production text model
        "messages": [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": "Review the candidates, select the top 3, and respond using the requested JSON Schema format."
            }
        ],
        "response_format": {"type": "json_object"},  # Enforce valid JSON natively on Groq
        "temperature": 0.1
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # Retry configuration to safely handle temporary rate-limits or concurrency spikes
            max_retries = 3
            backoff_delay = 1.5
            last_error = ""
            raw_text = ""

            for attempt in range(1, max_retries + 1):
                try:
                    response = await client.post(groq_url, headers=headers, json=groq_payload)
                    
                    if response.status_code == 200:
                        result = response.json()
                        raw_text = result["choices"][0]["message"]["content"].strip()
                        break
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
            
            if not raw_text:
                raise Exception(f"Failed to coordinate outfits after {max_retries} attempts. Last error: {last_error}")

            # Safe extraction of the re-ranking array
            try:
                ai_data = json.loads(raw_text)
                if isinstance(ai_data, dict) and "outfits" in ai_data:
                    ai_rankings = ai_data["outfits"]
                elif isinstance(ai_data, list):
                    ai_rankings = ai_data
                else:
                    raise ValueError("Unexpected JSON output structure from Groq.")
            except json.JSONDecodeError:
                json_match = re.search(r"\[.*\]", raw_text, re.DOTALL)
                if json_match:
                    ai_rankings = json.loads(json_match.group(0))
                else:
                    raise

            final_recommendations = []
            for rank in ai_rankings:
                c_id = int(rank["candidate_id"])
                
                # Safeguard limits
                if 0 <= c_id < len(candidates):
                    selected_combo = candidates[c_id]["combo"]
                    final_recommendations.append({
                        "name": rank["name"],
                        "description": rank["styling_commentary"],  # Maps directly to GeneratedOutfitResponse
                        "occasion": occasion,
                        "compatibility_score": int(rank["compatibility_score"]),
                        "items": selected_combo["items"]
                    })
            
            # Ensure we actually got outputs; if schema parsed empty, use fallback
            if not final_recommendations:
                raise ValueError("Structured schema parsed successfully, but no valid candidates were re-ranked.")
                
            return final_recommendations

        except Exception as e:
            print(f"⚠️ Hybrid Re-ranking failed, falling back to local Python rules. Error: {e}")
            # Fallback to local python rule-based top 3
            return [format_candidate_fallback(c["combo"], c["score"], requested_style, occasion, temp_c) for c in candidates[:3]]

def format_candidate_fallback(combo: Dict[str, Any], score: int, style: str, occasion: str, temp_c: int) -> Dict[str, Any]:
    """Helper fallback formatter to ensure database responses match perfectly in case of api timeouts."""
    items = combo["items"]
    primary = items[0]  # This is either the Top or the Dress
    name = f"{style} {occasion} Ensemble"
    
    if combo.get("type") == "one-piece":
        # One-piece fallback formatting (Dress + Shoes)
        shoes_item = items[-1] # Shoes is always at the last index
        primary_color = f"{primary.color.lower()} " if primary.color and not primary.name.lower().startswith(primary.color.lower()) else ""
        shoes_color = f"{shoes_item.color.lower()} " if shoes_item.color and not shoes_item.name.lower().startswith(shoes_item.color.lower()) else ""
        description = f"An elegant {style.lower()} look featuring your {primary_color}{primary.name.lower()} paired with your {shoes_color}{shoes_item.name.lower()}."
        if combo["has_jacket"]:
            jacket = items[1] # Jacket is at index 1 in [Dress, Jacket, Shoes]
            jacket_color = f"{jacket.color.lower()} " if jacket.color and not jacket.name.lower().startswith(jacket.color.lower()) else ""
            description += f" Layered with your {jacket_color}{jacket.name.lower()} for the {temp_c}°C weather."
    else:
        # Two-piece fallback formatting (Top + Bottom + Shoes)
        primary_bottom = items[1] # Bottom is at index 1
        shoes_item = items[-1] # Shoes is always at the last index
        top_color = f"{primary.color.lower()} " if primary.color and not primary.name.lower().startswith(primary.color.lower()) else ""
        bottom_color = f"{primary_bottom.color.lower()} " if primary_bottom.color and not primary_bottom.name.lower().startswith(primary_bottom.color.lower()) else ""
        description = f"A curated {style.lower()} look pairing your {top_color}{primary.name.lower()} with your {bottom_color}{primary_bottom.name.lower()}."
        if combo["has_jacket"]:
            jacket = items[2] # Jacket is at index 2 in [Top, Bottom, Jacket, Shoes]
            jacket_color = f"{jacket.color.lower()} " if jacket.color and not jacket.name.lower().startswith(jacket.color.lower()) else ""
            description += f" Layered with your {jacket_color}{jacket.name.lower()} for the {temp_c}°C weather."
    
    return {
        "name": name,
        "description": description,
        "occasion": occasion,
        "compatibility_score": min(100, score),
        "items": items
    }