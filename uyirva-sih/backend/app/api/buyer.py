import random
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..utils.jwt import require_role
from ..models import Demand, Match, BuyerProfile, Listing, Order
from ..db import get_async_session

router = APIRouter()

class DemandCreate(BaseModel):
    crop_name: str = Field(min_length=1, max_length=100)
    quantity_kg: float = Field(gt=0)
    target_price: float = Field(gt=0)


async def get_or_create_buyer_profile(current_user, session: AsyncSession) -> BuyerProfile:
    result = await session.execute(select(BuyerProfile).where(BuyerProfile.user_id == current_user.id))
    buyer_profile = result.scalar_one_or_none()
    if buyer_profile is None:
        buyer_profile = BuyerProfile(user_id=current_user.id)
        session.add(buyer_profile)
        await session.flush()
    return buyer_profile

@router.get("/dashboard")
async def buyer_dashboard(current_user = Depends(require_role(["BUYER", "buyer"])), session: AsyncSession = Depends(get_async_session)):
    # 1. Fetch buyer profile
    buyer_profile = await get_or_create_buyer_profile(current_user, session)
    await session.commit()
        
    # 2. Fetch demands for this buyer
    result = await session.execute(
        select(Demand).where(Demand.buyer_id == buyer_profile.id, Demand.status == "OPEN")
    )
    demands = result.scalars().all()

    # 3. Compile match data
    matches_data = []
    demands_data = []
    total_matches = 0
    
    for d in demands:
        # See if there are any matches in DB for this demand
        match_result = await session.execute(select(Match).where(Match.demand_id == d.id))
        matches = match_result.scalars().all()
        
        demands_data.append({"id": str(d.id), "crop_name": d.crop, "quantity_kg": d.quantity, "target_price": d.target_price, "status": d.status})
        if matches:
            total_matches += len(matches)
            total_available = sum((m.details or {}).get("matched_qty", 0) for m in matches)
            matches_data.append({
                "demand_id": str(d.id),
                "crop_name": d.crop,
                "demand_quantity": d.quantity,
                "farmer_count": len(matches),
                "total_available_kg": total_available,
                "match_score": round(max(m.score for m in matches) * 100),
            })

    # Return structured data
    return {
        "demands": demands_data,
        "matches": matches_data,
        "pooled_orders": {
            "is_pooled": total_matches > 0,
            "nearby_buyers": random.randint(1, 3) if total_matches > 0 else 0,
            "route_savings_km": random.randint(10, 30) if total_matches > 0 else 0,
            "cost_reduction": "₹1.50/kg" if total_matches > 0 else "₹0.00/kg"
        },
        "escrow": {
            "order_id": f"#ORD-{random.randint(100,999)}" if total_matches > 0 else None,
            "status": "Funds Secured in Escrow" if total_matches > 0 else "No Active Orders",
            "action_required": "Confirm Delivery & Release Funds" if total_matches > 0 else None
        }
    }


@router.post("/demands")
async def create_demand(demand_in: DemandCreate, current_user = Depends(require_role(["BUYER", "buyer"])), session: AsyncSession = Depends(get_async_session)):
    # 1. Ensure buyer profile exists
    buyer_profile = await get_or_create_buyer_profile(current_user, session)

    new_demand = Demand(
        buyer_id=buyer_profile.id,
        crop=demand_in.crop_name.strip(),
        quantity=demand_in.quantity_kg,
        unit="kg",
        target_price=demand_in.target_price,
        status="OPEN"
    )
    session.add(new_demand)
    await session.flush()

    # 2. Simulate AI Matching logic
    # Find active listings with the same crop
    listing_result = await session.execute(
        select(Listing).where(
            Listing.crop.ilike(new_demand.crop),
            Listing.status == "ACTIVE",
            Listing.quantity >= new_demand.quantity,
        )
    )
    compatible_listings = listing_result.scalars().all()

    match_count = 0
    for lst in compatible_listings:
        # Create a match
        new_match = Match(
            listing_id=lst.id,
            demand_id=new_demand.id,
            score=random.uniform(0.75, 0.99), # Mock AI match score
            details={"matched_qty": min(lst.quantity, new_demand.quantity)}
        )
        session.add(new_match)
        match_count += 1
        
    await session.commit()
    await session.refresh(new_demand)

    return {
        "message": "Demand created successfully", 
        "demand_id": str(new_demand.id),
        "matches_found": match_count
    }
