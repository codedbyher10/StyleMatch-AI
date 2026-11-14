# backend/app/routes/stylist.py (High-Speed Groq Qwen 3.8 Chatbot)
import os
import re
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import User, ClothingItem, StylePreference
from app.core.deps import get_current_user
from app.schemas.stylist import ChatRequest, ChatResponse

router = APIRouter(prefix="/api/stylist", tags=["AI Stylist"])

# Load verified Groq API Key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


@router.post("/chat", response_model=ChatResponse)
async def chat_with_stylist(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not GROQ_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GROQ_API_KEY is missing from the server configuration."
        )

    # 1. Fetch user's live wardrobe
    wardrobe = db.query(ClothingItem).filter(ClothingItem.user_id == current_user.id).all()
    
    # 2. Fetch user's style preferences
    pref = db.query(StylePreference).filter(StylePreference.user_id == current_user.id).first()

    # 3. Format Style Preferences Context
    pref_text = ""
    if pref:
        pref_text += f"- Preferred Styles: {', '.join(pref.styles or ['None selected yet'])}\n"
        pref_text += f"- Preferred Colors: {', '.join(pref.preferred_colors or ['None selected yet'])}\n"
        pref_text += f"- Avoided Colors: {', '.join(pref.avoided_colors or ['None'])}\n"
        pref_text += f"- Sizes: Shirt Size {pref.shirt_size or 'M'}, Shoe Size {pref.shoe_size or 'US 10'}\n"
        if pref.bio:
            pref_text += f"- Style Motto: {pref.bio}\n"
    else:
        pref_text = "No custom style preferences configured yet."

    # 4. Format Wardrobe Inventory Context (Smart Color Deduplication)
    wardrobe_text = ""
    if wardrobe:
        for idx, item in enumerate(wardrobe, 1):
            brand_str = f" by {item.brand}" if item.brand else ""
            subcategory_str = f" ({item.subcategory})" if item.subcategory else ""
            
            color = (item.color or "").strip()
            name = (item.name or "").strip()
            
            if color and color.lower() in name.lower():
                full_item_name = name
            elif color:
                full_item_name = f"{color} {name}"
            else:
                full_item_name = name
                
            wardrobe_text += f"{idx}. {full_item_name}{subcategory_str} [Category: {item.category}, Style: {item.style_tag or 'Casual'}{brand_str}]\n"
    else:
        wardrobe_text = "The user has no clothes in their digital wardrobe yet. Advise them to upload some clothes first."

    # 5. Build Aria's System Persona with Modern Trend Directives
    system_prompt = (
        "You are Aria, an elite, trend-forward, and chic AI personal fashion stylist for StyleMatch AI. "
        "You possess deep, up-to-date knowledge of modern runway fashion, contemporary streetwear, and current high-end styling aesthetics.\n"
        "Your tone is charming, lively, and stylish—like a luxury celebrity stylist texting a close friend. "
        "Always use tasteful fashion emojis (✨, 👗, 🧥, 👖, 👟, 👠, 🕶️, 💫, 🤍, 🌿, 👜) throughout your response. "
        "Always refer to the user warmly (e.g., 'darling ✨', 'my friend 💫').\n\n"
        "CONTEMPORARY FASHION & TREND DIRECTIVES:\n"
        "1. SILHOUETTES & FITS: Prioritize modern relaxed, straight-leg, wide-leg, and baggy silhouettes. "
        "Outdated aesthetics like skinny jeans, spray-on fits, or ultra-tight bottoms are strictly discouraged. Always champion effortless, modern proportions and relaxed drapery.\n"
        "2. PROPORTIONS: Pair relaxed/baggy bottoms with boxy, clean-cut, or French-tucked tops to create contemporary visual balance.\n"
        "3. MODERN COLOR HARMONY: Emphasize tonal layering, earthy neutrals (olive, chocolate brown, slate grey, off-white, taupe), and intentional accent pops over dated high-contrast combos.\n"
        "4. CONTEMPORARY WEARING TIPS: Advise modern hem breaks (e.g., letting wide/straight hems drape cleanly over sneakers, or casual loose unbuttoning) rather than dated tight pinrolls.\n\n"
        f"USER STYLE PROFILE:\n{pref_text}\n"
        f"USER'S REAL CLOSET INVENTORY:\n{wardrobe_text}\n\n"
        "STRICT SHOWCASE SLIDE FORMATTING RULES:\n"
        "1. NEVER group or merge multiple clothing items into a single line. EVERY item MUST be on its own line starting with '* ' and a garment emoji.\n"
        "2. When suggesting multi-day looks or multiple outfit options, format each separate look with an explicit header line and double newlines:\n\n"
        "### 🌟 Day 1: [Look Title]\n"
        "* 👕 **[Item Name 1]**\n"
        "* 👖 **[Item Name 2]**\n"
        "* 👟 **[Item Name 3]**\n\n"
        "### 🌟 Day 2: [Look Title]\n"
        "* 👕 **[Item Name 1]**\n"
        "* 👖 **[Item Name 2]**\n"
        "* 👟 **[Item Name 3]**\n\n"
        "3. Always include your styling secret on its own separate line starting strictly with 'Quick tip:'.\n"
        "   Example: Quick tip: Let the relaxed jeans drape naturally over the sneakers for a clean, modern street silhouette! 👟✨\n"
        "4. NEVER duplicate color names (say 'Classic Black Button-Down Shirt', NOT 'Black Classic Black Button-Down Shirt').\n"
        "5. Strictly coordinate outfits using ONLY items listed in 'USER'S REAL CLOSET INVENTORY'. Never invent items they do not own."
    )

    # 6. Format chat history
    messages = [{"role": "system", "content": system_prompt}]
    
    for msg in (payload.history or []):
        if "tangled" in msg.content or "trouble connecting" in msg.content:
            continue
        role = "assistant" if msg.role == "assistant" else "user"
        messages.append({
            "role": role,
            "content": msg.content
        })
        
    messages.append({
        "role": "user",
        "content": payload.message
    })

    groq_url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    groq_payload = {
        "model": "qwen/qwen3.8-27b",
        "messages": messages,
        "temperature": 0.7,
        "max_completion_tokens": 800,
        "reasoning_effort": "none"
    }

    async with httpx.AsyncClient(timeout=40.0) as client:
        try:
            response = await client.post(groq_url, headers=headers, json=groq_payload)
            if response.status_code != 200:
                print(f"❌ Groq API Error [{response.status_code}]: {response.text}")
                raise Exception(f"Groq API Error: {response.text}")
            
            result = response.json()
            aria_response = result["choices"][0]["message"]["content"] or ""
            
            if "</think>" in aria_response:
                aria_response = aria_response.split("</think>")[-1].strip()
            else:
                aria_response = re.sub(r"<think>.*?</think>", "", aria_response, flags=re.DOTALL).strip()
            
            aria_response = re.sub(r"^<think>", "", aria_response).strip()
            
            if not aria_response.strip():
                aria_response = "I'd love to help you style this! Could you please share a little more about the vibe you want today? ✨"
            
            return {"response": aria_response}
            
        except Exception as e:
            print(f"❌ Stylist Error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Aria was unable to answer: {str(e)}"
            )