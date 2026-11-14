# backend/app/routes/preferences.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from collections import Counter

from app.database.connection import get_db
from app.database.models import StylePreference, ClothingItem, User
from app.core.deps import get_current_user
from app.schemas.preferences import StylePreferenceUpdate, StylePreferenceResponse

router = APIRouter(prefix="/api/preferences", tags=["Preferences"])

@router.get("", response_model=StylePreferenceResponse)
def get_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pref = db.query(StylePreference).filter(StylePreference.user_id == current_user.id).first()
    if not pref:
        pref = StylePreference(user_id=current_user.id)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref

@router.put("", response_model=StylePreferenceResponse)
def update_preferences(
    payload: StylePreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pref = db.query(StylePreference).filter(StylePreference.user_id == current_user.id).first()
    if not pref:
        pref = StylePreference(user_id=current_user.id)
        db.add(pref)
    
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(pref, key, value)
        
    db.commit()
    db.refresh(pref)
    return pref

# DYNAMIC STYLE DNA CALCULATOR
@router.get("/dna")
def get_style_dna(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch all user clothing items from database to compute real-time composition
    items = db.query(ClothingItem).filter(ClothingItem.user_id == current_user.id).all()
    
    # Fallback: If closet is empty, distribute Style DNA equally based on onboarding selections
    if not items:
        pref = db.query(StylePreference).filter(StylePreference.user_id == current_user.id).first()
        if pref and pref.styles:
            base_val = int(100 / len(pref.styles))
            return {
                "composition": [{"label": style, "value": base_val} for style in pref.styles],
                "insights": [
                    "We will refine your Style DNA as you upload clothes to your wardrobe.",
                    f"Your baseline preference is set to {', '.join(pref.styles)}."
                ]
            }
        return {
            "composition": [
                {"label": "Minimalist", "value": 50},
                {"label": "Casual", "value": 50}
            ],
            "insights": ["Complete onboarding or upload clothing to see your Style DNA."]
        }
    
    # Compile style_tag statistics
    style_tags = [item.style_tag for item in items if item.style_tag]
    if not style_tags:
        return {
            "composition": [{"label": "Casual", "value": 100}],
            "insights": ["Add style tags to your clothing items to refine your DNA composition."]
        }
        
    total = len(style_tags)
    counts = Counter(style_tags)
    
    composition = []
    for style, count in counts.items():
        percentage = int((count / total) * 100)
        composition.append({"label": style, "value": percentage})
        
    composition = sorted(composition, key=lambda x: x["value"], reverse=True)
    
    # Generate tailored fashion insights based on actual wardrobe statistics
    colors = [item.color.lower() for item in items if item.color]
    categories = [item.category for item in items]
    
    insights = []
    if len(composition) > 0:
        insights.append(f"Your wardrobe is primarily styled around {composition[0]['label']}.")
        
    if colors:
        most_common_color = Counter(colors).most_common(1)[0][0]
        insights.append(f"You seem to prefer {most_common_color} colored items in your wardrobe.")
        
    neutrals = {"black", "white", "gray", "grey", "beige", "navy"}
    neutral_count = sum(1 for c in colors if c in neutrals)
    if len(colors) > 0 and (neutral_count / len(colors)) > 0.6:
        insights.append("You heavily favor neutral color palettes in your closet.")
        
    if "Shoes" in categories:
        insights.append("Your shoe collection is active and matching your style coordinates.")
        
    if len(insights) < 3:
        insights.append("Upload more items to unlock deeper visual insights.")
        
    return {
        "composition": composition,
        "insights": insights[:4]
    }