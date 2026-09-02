import uuid
from sqlalchemy import Column, String, DateTime, Enum, Float, Integer, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from ..db.base import Base
from .user import User, UserRole

class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    farm_name = Column(String(255), nullable=True)
    farm_size = Column(Float, nullable=True)  # hectares
    location = Column(String, nullable=True)  # WKT POINT
    crops = Column(JSON, nullable=True)  # list of crops info
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class BuyerProfile(Base):
    __tablename__ = "buyer_profiles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    organization_name = Column(String(255), nullable=True)
    buyer_type = Column(String(100), nullable=True)
    location = Column(String, nullable=True)  # WKT POINT
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class FPOProfile(Base):
    __tablename__ = "fpo_profiles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    organization_name = Column(String(255), nullable=True)
    registration_details = Column(JSON, nullable=True)
    location = Column(String, nullable=True)  # WKT POINT
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Listing(Base):
    __tablename__ = "listings"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_id = Column(UUID(as_uuid=True), ForeignKey("farmer_profiles.id"), nullable=False)
    crop = Column(String(100), nullable=False)
    variety = Column(String(100), nullable=True)
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    quality = Column(String(100), nullable=True)
    expected_price = Column(Float, nullable=False)  # per unit
    location = Column(String, nullable=True)  # WKT POINT
    harvest_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    status = Column(String(50), default="ACTIVE")

class Demand(Base):
    __tablename__ = "buyer_demands"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("buyer_profiles.id"), nullable=False)
    crop = Column(String(100), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    quality = Column(String(100), nullable=True)
    target_price = Column(Float, nullable=False)
    location = Column(String, nullable=True)  # delivery location WKT POINT
    delivery_window_start = Column(DateTime, nullable=True)
    delivery_window_end = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    status = Column(String(50), default="OPEN")

class Match(Base):
    __tablename__ = "matches"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"), nullable=False)
    demand_id = Column(UUID(as_uuid=True), ForeignKey("buyer_demands.id"), nullable=False)
    score = Column(Float, nullable=False)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("buyer_profiles.id"), nullable=False)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("farmer_profiles.id"), nullable=False)
    status = Column(String(50), default="PENDING")
    total_amount = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
