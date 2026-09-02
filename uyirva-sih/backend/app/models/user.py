import uuid
from enum import Enum

from sqlalchemy import Column, String, DateTime, Enum as SQLAlchemyEnum, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from ..db.base import Base

class UserRole(str, Enum):
    FARMER = "FARMER"
    BUYER = "BUYER"
    FPO = "FPO"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=True)
    hashed_password = Column(Text, nullable=False)
    role = Column(SQLAlchemyEnum(UserRole), nullable=False)
    location = Column(String, nullable=True)  # WKT POINT string or PostGIS geometry later
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
