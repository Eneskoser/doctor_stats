from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum


class SubscriptionTier(str, enum.Enum):
    free = "free"
    premium = "premium"


class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String)
    organization = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    subscription_tier = Column(
        Enum(SubscriptionTier), default=SubscriptionTier.free, nullable=False
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    datasets = relationship(
        "Dataset", back_populates="user", cascade="all, delete-orphan"
    )
    analyses = relationship(
        "Analysis", back_populates="user", cascade="all, delete-orphan"
    )
    reports = relationship(
        "Report", back_populates="user", cascade="all, delete-orphan"
    )
    visualizations = relationship(
        "Visualization", back_populates="user", cascade="all, delete-orphan"
    )
