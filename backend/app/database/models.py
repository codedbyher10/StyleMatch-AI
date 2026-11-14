# backend/app/database/models.py
import uuid
from sqlalchemy import Column, String, TEXT, Boolean, Integer, ForeignKey, Table, ARRAY, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .connection import Base

# Junction Table: Outfits <-> Clothing Items (Many-to-Many)
outfit_items = Table(
    "outfit_items",
    Base.metadata,
    Column("outfit_id", UUID(as_uuid=True), ForeignKey("outfits.id", ondelete="CASCADE"), primary_key=True),
    Column("clothing_item_id", UUID(as_uuid=True), ForeignKey("clothing_items.id", ondelete="CASCADE"), primary_key=True)
)

# 1. USERS MODEL
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    
    # Relationships
    style_preference = relationship("StylePreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    clothing_items = relationship("ClothingItem", back_populates="user", cascade="all, delete-orphan")
    outfits = relationship("Outfit", back_populates="user", cascade="all, delete-orphan")

# 2. STYLE PREFERENCES MODEL (Onboarding Preferences)
class StylePreference(Base):
    __tablename__ = "style_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    bio = Column(TEXT, nullable=True)
    
    # Postgres Array types matching onboarding lists
    styles = Column(ARRAY(String(50)), default=[])
    occasions = Column(ARRAY(String(50)), default=[])
    preferred_colors = Column(ARRAY(String(50)), default=[])
    avoided_colors = Column(ARRAY(String(50)), default=[])
    
    shirt_size = Column(String(10), default="M")
    shoe_size = Column(String(20), default="US 10")

    user = relationship("User", back_populates="style_preference")

# 3. CLOTHING ITEMS MODEL (Digital Wardrobe)
class ClothingItem(Base):
    __tablename__ = "clothing_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False) 
    subcategory = Column(String(50), nullable=True)
    color = Column(String(50), nullable=True)
    brand = Column(String(100), nullable=True)
    style_tag = Column(String(50), nullable=True)
    image_url = Column(String(1000), nullable=False)
    wears_count = Column(Integer, default=0, nullable=False)
    is_favorite = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="clothing_items")
    outfits = relationship("Outfit", secondary=outfit_items, back_populates="clothing_items")

# 4. OUTFITS MODEL (AI Coordinated Outfits)
class Outfit(Base):
    __tablename__ = "outfits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(150), nullable=True)
    description = Column(TEXT, nullable=True)
    occasion = Column(String(50), nullable=False)
    temperature_c = Column(Integer, nullable=True)
    weather_condition = Column(String(100), nullable=True)
    compatibility_score = Column(Integer, default=0)

    user = relationship("User", back_populates="outfits")
    clothing_items = relationship("ClothingItem", secondary=outfit_items, back_populates="outfits")

# 5. SAVED LOOKS MODEL (NEW: Bookmarking Outfits)
class SavedLook(Base):
    __tablename__ = "saved_looks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    outfit_id = Column(UUID(as_uuid=True), ForeignKey("outfits.id", ondelete="CASCADE"), nullable=False)
    saved_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships to fetch details easily
    user = relationship("User")
    outfit = relationship("Outfit")