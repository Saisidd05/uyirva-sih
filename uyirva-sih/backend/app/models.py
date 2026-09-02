from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, Enum, ForeignKey
from sqlalchemy.orm import relationship
import enum
from .db import Base

class RoleEnum(str, enum.Enum):
    FARMER = "farmer"
    BUYER = "buyer"
    FPO = "fpo"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    role = Column(Enum(RoleEnum), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    listings = relationship("Listing", back_populates="owner")
    demands = relationship("Demand", back_populates="buyer")


class Listing(Base):
    __tablename__ = "listings"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), index=True) # ID of the farmer
    crop_name = Column(String, index=True, nullable=False)
    quantity_kg = Column(Integer, nullable=False)
    expected_price = Column(Integer, nullable=True) # Optional expected price per kg
    ai_price_recommendation = Column(String, nullable=True) # e.g. "₹24–₹29/kg"
    ai_quality_score = Column(String, nullable=True) # e.g. "Grade A"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    owner = relationship("User", back_populates="listings")


class Demand(Base):
    __tablename__ = "demands"
    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), index=True) # ID of the buyer
    crop_name = Column(String, index=True, nullable=False)
    required_quantity = Column(Integer, nullable=False)
    status = Column(String, default="open") # open, matched, fulfilled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    buyer = relationship("User", back_populates="demands")


class OrderMatch(Base):
    __tablename__ = "order_matches"
    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), index=True)
    demand_id = Column(Integer, ForeignKey("demands.id"), index=True)
    matched_quantity = Column(Integer, nullable=False)
    escrow_status = Column(String, default="pending") # pending, secured, released
    logistics_savings = Column(String, nullable=True) # e.g. "Reduced by ₹1.50/kg"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
