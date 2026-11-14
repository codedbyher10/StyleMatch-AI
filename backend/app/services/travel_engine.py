# backend/app/services/travel_engine.py
import re
from typing import List, Dict, Any, Optional, Set
from app.database.models import ClothingItem

NEUTRAL_COLORS = {"black", "white", "grey", "gray", "navy", "beige", "cream", "brown", "denim", "khaki", "tan", "ivory"}

BEACH_KEYWORDS = {
    "goa", "bali", "maldives", "phuket", "beach", "hawaii", "miami", "cancun", 
    "pattaya", "ibiza", "santorini", "krabi", "boracay", "bahamas", "caribbean", 
    "mykonos", "coast", "island", "resort", "havana", "tropical"
}

COLD_KEYWORDS = {
    "kashmir", "manali", "shimla", "ladakh", "leh", "switzerland", "alps", 
    "gulmarg", "pahalgam", "aspen", "himalaya", "snow", "winter", "iceland", "tromso"
}

# Strictly athletic keywords (must NEVER pair with heels, waistcoats, or evening wear)
ATHLETIC_KEYWORDS = [
    "gym", "biker", "cycling", "running", "compression", "athletic", 
    "workout", "legging", "leggings", "sweatpant", "sweatpants", "yoga", "track"
]

# Elevated / Heeled footwear keywords (must NEVER pair with gym shorts/workout wear)
ELEVATED_SHOES_KEYWORDS = [
    "heel", "heels", "block heel", "stiletto", "kitten heel", "platform", 
    "pump", "pumps", "patent", "strappy heel"
]


def classify_clothing_item(item: ClothingItem) -> str:
    """Bulletproof classifier using strict word boundaries."""
    cat = (item.category or "").strip().lower()
    name = (item.name or "").strip().lower()
    subcat = (getattr(item, "subcategory", "") or "").strip().lower()
    combined = f"{cat} {name} {subcat}"

    # 1. DRESSES
    if any(re.search(rf"\b{k}\b", combined) for k in [
        "dress", "gown", "jumpsuit", "romper", "one-piece", "onepiece", 
        "sundress", "maxidress", "mididress"
    ]) or "dress" in cat:
        return "dresses"

    # 2. FOOTWEAR
    if "shoe" in cat or "footwear" in cat or any(re.search(rf"\b{k}\b", combined) for k in [
        "shoe", "shoes", "sneaker", "sneakers", "boot", "boots", "loafer", "loafers", 
        "heel", "heels", "pump", "pumps", "sandal", "sandals", "footwear", "runner", 
        "runners", "trainer", "trainers", "slide", "slides", "flip-flop", "mule", "mules", "oxford"
    ]):
        return "shoes"

    # 3. OUTERWEAR (Must use \bcoat\b so 'waistcoat' is NOT treated as a coat!)
    if "outer" in cat or any(re.search(rf"\b{k}\b", combined) for k in [
        "outerwear", "jacket", "jackets", "coat", "coats", "blazer", "blazers", 
        "cardigan", "cardigans", "hoodie", "hoodies", "trench", "windbreaker", 
        "bomber", "puffer", "overshirt", "shacket"
    ]):
        if not any(top_word in name for top_word in ["waistcoat", "vest top"]):
            return "outerwear"

    # 4. BOTTOMS
    if "bottom" in cat or any(re.search(rf"\b{k}\b", combined) for k in [
        "bottom", "bottoms", "pant", "pants", "jean", "jeans", "trouser", "trousers", 
        "sweatpant", "sweatpants", "shorts?", "jogger", "joggers", "chino", 
        "chinos", "skirt", "skirts", "cargo", "cargos", "legging", "leggings"
    ]):
        if not any(top_word in name for top_word in ["shirt", "top", "tee", "blouse", "waistcoat"]):
            return "bottoms"

    # 5. TOPS
    if "top" in cat or any(re.search(rf"\b{k}\b", combined) for k in [
        "top", "tops", "shirt", "shirts", "t-shirt", "t-shirts", "tshirt", "tshirts", 
        "tee", "tees", "polo", "polos", "tank", "blouse", "blouses", "waistcoat",
        "crop", "camisole", "button-down", "sweater", "sweaters", "pullover", "jersey", "vest"
    ]):
        return "tops"

    # 6. ACCESSORIES
    if "accessor" in cat or any(re.search(rf"\b{k}\b", combined) for k in [
        "bracelet", "watch", "belt", "sunglasses?", "glasses", "hat", "cap", 
        "ring", "necklace", "jewelry", "jewellery", "bag", "handbag", 
        "tote", "backpack", "wallet", "scarf", "bowtie", "necktie", "earrings?"
    ]):
        return "accessories"

    if "bottom" in cat: return "bottoms"
    if "shoe" in cat: return "shoes"
    if "outer" in cat: return "outerwear"
    if "accessor" in cat: return "accessories"
    return "tops"


def is_strictly_athletic(item: ClothingItem) -> bool:
    """Detects gym running shorts, workout leggings, and spandex."""
    text = f"{item.name} {getattr(item, 'subcategory', '')} {getattr(item, 'style_tag', '')}".lower()
    return any(re.search(rf"\b{k}\b", text) for k in ATHLETIC_KEYWORDS)


def is_heeled_shoe(item: ClothingItem) -> bool:
    """Detects block heels, stilettos, pumps, and dressy heeled sandals."""
    text = f"{item.name} {getattr(item, 'subcategory', '')} {getattr(item, 'style_tag', '')}".lower()
    return any(re.search(rf"\b{k}\b", text) for k in ELEVATED_SHOES_KEYWORDS)


def is_casual_resort_short(item: ClothingItem) -> bool:
    """Detects genuine resort/casual shorts (denim, linen, chino) while excluding workout gym shorts."""
    if is_strictly_athletic(item):
        return False
    text = f"{item.name} {getattr(item, 'subcategory', '')}".lower()
    return any(re.search(rf"\b{k}\b", text) for k in ["short", "shorts", "bermuda", "boardshort", "linen short", "denim short"])


def is_flat_open_shoe(item: ClothingItem) -> bool:
    """Flat casual sandals, slides, espadrilles for beach walking (excludes high heels)."""
    if is_heeled_shoe(item):
        return False
    text = f"{item.name} {getattr(item, 'subcategory', '')}".lower()
    return any(re.search(rf"\b{k}\b", text) for k in ["sandal", "sandals", "slide", "slides", "flip-flop", "mule", "espadrille"])


def calculate_pair_harmony(
    top_or_dress: ClothingItem,
    bottom: Optional[ClothingItem],
    shoes: ClothingItem,
    trip_type: str,
    is_beach: bool,
    is_evening_dinner: bool
) -> int:
    score = 50

    top_text = f"{top_or_dress.name} {getattr(top_or_dress, 'style_tag', '')}".lower()
    shoes_is_heeled = is_heeled_shoe(shoes)
    shoes_is_flat_sandals = is_flat_open_shoe(shoes)
    bottom_is_gym = is_strictly_athletic(bottom) if bottom else False
    bottom_is_resort_short = is_casual_resort_short(bottom) if bottom else False

    # =========================================================
    # ❌ HARD FASHION DISASTERS (INSTANT BAN -1000)
    # =========================================================
    
    # 1. NEVER pair gym/compression shorts or leggings with heeled sandals or pumps!
    if bottom_is_gym and shoes_is_heeled:
        return -1000

    # 2. NEVER pair gym workout shorts with dressy tops (waistcoats, corset, ruffle blouses, blazers)
    if bottom_is_gym and any(k in top_text for k in ["waistcoat", "blouse", "ruffle", "corset", "lace", "blazer", "button-down", "silk", "pleated"]):
        return -1000

    # 3. For an evening dinner look, NEVER wear workout gym shorts or flip-flops
    if is_evening_dinner and (bottom_is_gym or any(k in shoes.name.lower() for k in ["flip-flop", "runner", "trainer"])):
        return -1000

    # 4. On a daytime beach stroll, do not force 4-inch block heels onto sand
    if is_beach and not is_evening_dinner and shoes_is_heeled:
        score -= 80

    # =========================================================
    # ✅ STUNNING COMBINATION BOOSTS
    # =========================================================

    # Evening Dinner / Date Night: Boost elegant dress or chic bottom with heeled sandals
    if is_evening_dinner:
        if shoes_is_heeled:
            score += 40
        if "dress" in top_or_dress.name.lower() or any(k in top_text for k in ["ruffle", "silk", "blouse", "waistcoat", "floral", "lace"]):
            score += 35

    # Daytime Beach / Coastal Stroll: Boost casual shorts + flats/slides + breezy tops
    if is_beach and not is_evening_dinner:
        if bottom_is_resort_short:
            score += 45
        if shoes_is_flat_sandals:
            score += 40
        if any(k in top_text for k in ["tee", "t-shirt", "tank", "linen", "casual", "crop", "camisole"]):
            score += 25

    # Color Coordination (bonus for monochrome or neutral + 1 pop of color)
    colors = [c.lower() for c in [top_or_dress.color, getattr(bottom, "color", None), shoes.color] if c]
    unique_colors = set(colors)
    non_neutrals = [c for c in unique_colors if not any(n in c for n in NEUTRAL_COLORS)]
    if len(non_neutrals) <= 1:
        score += 20
    elif len(non_neutrals) >= 3:
        score -= 25

    # Suppress pure gym shorts on vacation unless trip type is 'Adventure'
    if bottom_is_gym and "adventure" not in trip_type.lower():
        score -= 60

    return score


def generate_travel_capsule(
    wardrobe: List[ClothingItem],
    duration: int,
    trip_type: str,
    weather_info: Dict[str, Any],
    destination: str = ""
) -> Dict[str, Any]:
    temp_c = weather_info.get("avg_temp_c", 24)
    dest_str = f"{destination} {weather_info.get('destination_display', '')}".lower()
    
    is_beach = any(k in dest_str for k in BEACH_KEYWORDS) or "beach" in trip_type.lower() or (temp_c >= 26 and "business" not in trip_type.lower())
    is_cold = any(k in dest_str for k in COLD_KEYWORDS) or temp_c < 18

    # 1. Categorize Wardrobe
    tops, dresses, bottoms, shoes, outerwear, accessories = [], [], [], [], [], []

    for item in wardrobe:
        classification = classify_clothing_item(item)
        if classification == "accessories": accessories.append(item)
        elif classification == "shoes": shoes.append(item)
        elif classification == "bottoms": bottoms.append(item)
        elif classification == "outerwear": outerwear.append(item)
        elif classification == "dresses": dresses.append(item)
        else: tops.append(item)

    if not tops and not dresses:
        raise ValueError("Please add at least one Top or Dress to your wardrobe.")
    if not shoes:
        raise ValueError("Please add at least one pair of Shoes to your wardrobe.")

    # 2. Smart Bottoms Capsule (Filter OUT pure gym shorts for beach unless user has nothing else)
    resort_shorts = [b for b in bottoms if is_casual_resort_short(b)]
    general_pants = [b for b in bottoms if not is_strictly_athletic(b) and not is_casual_resort_short(b)]
    athletic_bottoms = [b for b in bottoms if is_strictly_athletic(b)]

    num_bottoms = max(1, min(len(bottoms), (duration + 1) // 2))
    capsule_bottoms = []

    if is_beach:
        # Prioritize true resort shorts, then casual pants/skirts
        if resort_shorts:
            capsule_bottoms.extend(resort_shorts[:max(1, num_bottoms - 1)])
        remaining = num_bottoms - len(capsule_bottoms)
        if remaining > 0 and general_pants:
            capsule_bottoms.extend(general_pants[:remaining])
        # Only fallback to athletic shorts if user has ZERO other bottoms
        if not capsule_bottoms and athletic_bottoms:
            capsule_bottoms.extend(athletic_bottoms[:1])
    else:
        # General/City trip: Prioritize clean trousers/jeans/skirts
        non_gym = general_pants + resort_shorts
        capsule_bottoms = non_gym[:num_bottoms] if non_gym else bottoms[:num_bottoms]

    if not capsule_bottoms and bottoms:
        capsule_bottoms = bottoms[:num_bottoms]

    # Shoes Capsule: Balance walking shoes with elevated dinner shoes
    heeled_shoes = [s for s in shoes if is_heeled_shoe(s)]
    flat_shoes = [s for s in shoes if not is_heeled_shoe(s)]
    
    capsule_shoes = []
    if flat_shoes: capsule_shoes.append(flat_shoes[0])
    if heeled_shoes and len(capsule_shoes) < 2: capsule_shoes.append(heeled_shoes[0])
    if not capsule_shoes: capsule_shoes = shoes[:2]

    # Outerwear Capsule
    num_jackets = 2 if (is_cold and duration >= 5) else (1 if (is_cold or (outerwear and not is_beach)) else 0)
    capsule_outerwear = outerwear[:num_jackets] if outerwear else []

    # 3. Dynamic Curated Themes
    if is_beach:
        themes = [
            ("Coastal Arrival & Sunset Stroll", "Effortless, breezy arrival look styled for sunset coastal vibes.", False),
            ("Oceanfront Lounging & Beach Walk", "Sun-ready look with casual shorts and relaxed footwear.", False),
            ("Romantic Seaside Dinner", "Elevated evening dinner look styled for golden hour cocktails.", True),
            ("Island Discovery & Boutique Stroll", "Chic discovery outfit optimized for beachside cafés and walks.", False),
            ("Sunset Catamaran & Farewell Dinner", "Showstopper seaside dinner ensemble celebrating the trip.", True)
        ]
    else:
        themes = [
            ("Arrival & City Café Stroll", "Polished, comfortable arrival outfit for settling into the city.", False),
            ("Daytime Sightseeing & Culture", "Effortless look balancing walking comfort with chic aesthetics.", False),
            ("Evening Dinner & Cocktails", "Magnetic, elevated ensemble designed for dining and nightlife.", True),
            ("Boutique Discovery & Gallery Walk", "Curated chic pairing for shopping and leisure.", False),
            ("Farewell Celebration Night", "Refined evening look celebrating the trip in style.", True)
        ]

    itinerary = []
    packed_items_set = set()
    
    # STRICT ANTI-REPEAT TRACKERS
    used_top_ids: Set[Any] = set()
    used_combo_signatures: Set[str] = set()

    for day in range(1, duration + 1):
        theme_title, theme_desc, is_evening = themes[(day - 1) % len(themes)]

        best_combo = None
        best_score = -9999

        # A. Try One-Piece Dresses (especially for evening dinner)
        if dresses:
            for d in dresses:
                # Disallow repeating the exact same dress if unused dresses exist
                d_repeat_penalty = 100 if (d.id in used_top_ids and len(used_top_ids) < (len(dresses) + len(tops))) else 0

                for s in capsule_shoes:
                    sig = f"dress_{d.id}_{s.id}"
                    if sig in used_combo_signatures:
                        continue  # 🚫 STRICT: Never repeat the exact same dress + shoe look!

                    harmony = calculate_pair_harmony(d, None, s, trip_type, is_beach, is_evening) - d_repeat_penalty
                    if harmony > best_score:
                        best_score = harmony
                        best_combo = {"type": "dress", "dress": d, "bottom": None, "shoes": s, "sig": sig}

        # B. Try Two-Piece (Top + Bottom) combinations
        if tops and capsule_bottoms:
            for t in tops:
                # Strongly prefer an UNUSED top for each day so every day is a fresh look!
                t_repeat_penalty = 80 if (t.id in used_top_ids and len(used_top_ids) < len(tops)) else 0

                for b in capsule_bottoms:
                    for s in capsule_shoes:
                        sig = f"twopiece_{t.id}_{b.id}"
                        if sig in used_combo_signatures:
                            continue  # 🚫 STRICT: Never repeat the exact same Top + Bottom pair!

                        harmony = calculate_pair_harmony(t, b, s, trip_type, is_beach, is_evening) - t_repeat_penalty
                        if harmony > best_score:
                            best_score = harmony
                            best_combo = {"type": "two-piece", "top": t, "bottom": b, "shoes": s, "sig": sig}

        # Fallback safeguard if all combinations were exhausted
        if not best_combo:
            avail_top = next((t for t in tops if t.id not in used_top_ids), tops[0] if tops else None)
            best_combo = {
                "type": "two-piece" if (avail_top and capsule_bottoms) else "dress",
                "top": avail_top,
                "dress": dresses[0] if dresses else None,
                "bottom": capsule_bottoms[0] if capsule_bottoms else None,
                "shoes": capsule_shoes[0],
                "sig": f"fallback_{day}"
            }

        # Record combination signature so it NEVER repeats
        used_combo_signatures.add(best_combo.get("sig", f"day_{day}"))

        day_items = []
        if best_combo["type"] == "dress" and best_combo.get("dress"):
            chosen_dress = best_combo["dress"]
            used_top_ids.add(chosen_dress.id)
            day_items.append(chosen_dress)
            title = f"Day {day}: {chosen_dress.name}"
            desc = f"Styling your {chosen_dress.name} with {best_combo['shoes'].name} for {theme_title.lower()}."
        else:
            chosen_top = best_combo.get("top") or tops[0]
            chosen_bottom = best_combo.get("bottom") or (capsule_bottoms[0] if capsule_bottoms else None)
            used_top_ids.add(chosen_top.id)
            day_items.append(chosen_top)
            if chosen_bottom:
                day_items.append(chosen_bottom)
            
            bottom_desc = chosen_bottom.name if chosen_bottom else "tailored bottoms"
            desc = f"Pairing {chosen_top.name} with {bottom_desc}, grounded by {best_combo['shoes'].name}."

        day_items.append(best_combo["shoes"])

        # Add outerwear only if cold
        if is_cold and capsule_outerwear:
            jacket = capsule_outerwear[(day - 1) % len(capsule_outerwear)]
            day_items.append(jacket)
            desc += f" Layered with {jacket.name}."

        # Add genuine jewelry/accessory (only on evening/date looks or real sunglasses)
        if accessories:
            if is_evening:
                # Bow earrings, jewelry, elegant accessories belong on dinner nights!
                dinner_accs = [a for a in accessories if any(k in a.name.lower() for k in ["earring", "necklace", "bracelet", "ring", "bow"])]
                chosen_acc = dinner_accs[(day - 1) % len(dinner_accs)] if dinner_accs else accessories[(day - 1) % len(accessories)]
                day_items.append(chosen_acc)
                desc += f" Accented with {chosen_acc.name}."
            elif is_beach:
                sun_accs = [a for a in accessories if any(k in a.name.lower() for k in ["sunglass", "glasses", "hat", "cap", "tote"])]
                if sun_accs:
                    chosen_acc = sun_accs[(day - 1) % len(sun_accs)]
                    day_items.append(chosen_acc)
                    desc += f" Accented with {chosen_acc.name}."

        for item in day_items:
            packed_items_set.add(item)

        itinerary.append({
            "day": day,
            "title": f"Day {day}: {theme_title}",
            "description": desc,
            "items": day_items
        })

    packed_items = list(packed_items_set)

    return {
        "itinerary": itinerary,
        "packed_items": packed_items,
        "counts": {
            "tops": len(set(it.id for it in packed_items if classify_clothing_item(it) in ["tops", "dresses"])),
            "bottoms": len(set(it.id for it in packed_items if classify_clothing_item(it) == "bottoms")),
            "shoes": len(set(it.id for it in packed_items if classify_clothing_item(it) == "shoes")),
            "outerwear": len(set(it.id for it in packed_items if classify_clothing_item(it) == "outerwear")),
            "total_pieces": len(packed_items)
        }
    }