import random
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..utils.jwt import require_role
from ..models import Listing, FarmerProfile
from ..db import get_async_session

router = APIRouter()

class ListingCreate(BaseModel):
    crop_name: str
    quantity_kg: int
    expected_price: float

@router.get("/dashboard")
async def farmer_dashboard(current_user = Depends(require_role(["FARMER", "farmer"])), session: AsyncSession = Depends(get_async_session)):
    # 1. Fetch farmer profile
    result = await session.execute(select(FarmerProfile).where(FarmerProfile.user_id == current_user.id))
    farmer_profile = result.scalar_one_or_none()
    
    if not farmer_profile:
        return {"listings": [], "payout_expected": 0}

    # 2. Fetch active listings for this farmer
    result = await session.execute(
        select(Listing).where(Listing.farmer_id == farmer_profile.id, Listing.status == "ACTIVE")
    )
    listings = result.scalars().all()

    # 3. Mock Payout Settlement
    total_expected = sum((l.quantity * l.expected_price) for l in listings)

    # 4. Format response
    formatted_listings = []
    for l in listings:
        formatted_listings.append({
            "id": str(l.id),
            "crop_name": l.crop,
            "quantity_kg": l.quantity,
            "expected_price": l.expected_price,
            "ai_price_recommendation": f"₹{max(10, int(l.expected_price)-3)}–₹{int(l.expected_price)+4}/kg",
            "ai_quality_score": l.quality or "Grade A"
        })

    return {
        "listings": formatted_listings,
        "payout_expected": total_expected,
        "demand_indicator": {
            "crop": "Tomato",
            "status": "High",
            "message": "Nearby buyer clusters active. Consider listing available harvest early."
        }
    }

@router.post("/listings")
async def create_listing(listing_in: ListingCreate, current_user = Depends(require_role(["FARMER", "farmer"])), session: AsyncSession = Depends(get_async_session)):
    # 1. Ensure farmer profile exists
    result = await session.execute(select(FarmerProfile).where(FarmerProfile.user_id == current_user.id))
    farmer_profile = result.scalar_one_or_none()
    if not farmer_profile:
        farmer_profile = FarmerProfile(user_id=current_user.id)
        session.add(farmer_profile)
        await session.commit()
        await session.refresh(farmer_profile)

    # 2. Mock AI components
    ai_quality = random.choice(["Grade A", "Grade B+", "Grade A-"])

    new_listing = Listing(
        farmer_id=farmer_profile.id,
        crop=listing_in.crop_name,
        quantity=listing_in.quantity_kg,
        unit="kg",
        expected_price=listing_in.expected_price,
        quality=ai_quality,
        status="ACTIVE"
    )
    
    session.add(new_listing)
    await session.commit()
    await session.refresh(new_listing)
    
    return {"message": "Listing created successfully", "listing_id": str(new_listing.id)}
