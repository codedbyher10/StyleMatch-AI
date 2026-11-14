# backend/app/routes/travel.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.database.models import User, ClothingItem
from app.schemas.travel import TravelPlanRequest, TravelPlanResponse, WeatherSummary, PackingListCounts, DayOutfitPlan
from app.schemas.clothing import ClothingItemResponse
from app.services.weather_service import fetch_destination_weather
from app.services.travel_engine import generate_travel_capsule
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/travel", tags=["Travel"])

@router.post("/plan", response_model=TravelPlanResponse)
async def create_travel_packing_plan(
    request: TravelPlanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Builds a weather-aware travel packing list and multi-day outfit schedule
    derived from the authenticated user's digital wardrobe.
    """
    # 1. Fetch user wardrobe
    wardrobe = db.query(ClothingItem).filter(ClothingItem.user_id == current_user.id).all()
    if not wardrobe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your wardrobe is empty. Please add clothing items before planning a trip."
        )

    # 2. Fetch destination weather forecast
    weather = await fetch_destination_weather(
        destination=request.destination,
        duration_days=request.duration
    )

    # 3. Generate destination-smart capsule packing plan
    try:
        capsule_result = generate_travel_capsule(
            wardrobe=wardrobe,
            duration=request.duration,
            trip_type=request.trip_type,
            weather_info=weather,
            destination=request.destination  # Passed for beach/mountain detection
        )
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(err)
        )

    # 4. Construct validated response
    weather_summary = WeatherSummary(
        destination_display=weather["destination_display"],
        avg_temp_c=weather["avg_temp_c"],
        min_temp_c=weather["min_temp_c"],
        max_temp_c=weather["max_temp_c"],
        condition=weather["condition"],
        summary=weather["summary"]
    )

    counts = PackingListCounts(**capsule_result["counts"])
    
    itinerary_plans = [
        DayOutfitPlan(
            day=day["day"],
            title=day["title"],
            description=day["description"],
            items=[ClothingItemResponse.model_validate(item) for item in day["items"]]
        )
        for day in capsule_result["itinerary"]
    ]

    packed_items_res = [
        ClothingItemResponse.model_validate(item) for item in capsule_result["packed_items"]
    ]

    return TravelPlanResponse(
        weather=weather_summary,
        counts=counts,
        packed_items=packed_items_res,
        itinerary=itinerary_plans
    )