from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.api.v1.auth import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class UserUpdate(BaseModel):
    name: Optional[str] = None
    organization: Optional[str] = None


class UserProfile(BaseModel):
    email: str
    name: str
    organization: Optional[str]
    subscription_tier: str


@router.get("/me", response_model=UserProfile)
def get_user_profile(current_user: User = Depends(get_current_user)):
    return UserProfile(
        email=current_user.email,
        name=current_user.name,
        organization=current_user.organization,
        subscription_tier=current_user.subscription_tier.value,
    )


@router.put("/me", response_model=UserProfile)
def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user_update.name is not None:
        current_user.name = user_update.name
    if user_update.organization is not None:
        current_user.organization = user_update.organization

    db.commit()
    db.refresh(current_user)

    return UserProfile(
        email=current_user.email,
        name=current_user.name,
        organization=current_user.organization,
        subscription_tier=current_user.subscription_tier.value,
    )


@router.get("/subscription")
def get_subscription_details(current_user: User = Depends(get_current_user)):
    return {
        "success": True,
        "data": {
            "tier": current_user.subscription_tier.value,
            "features": {
                "max_requests_per_hour": 1000
                if current_user.subscription_tier.value == "premium"
                else 100,
                "max_dataset_rows": 100000
                if current_user.subscription_tier.value == "premium"
                else 1000,
                "advanced_analysis": current_user.subscription_tier.value == "premium",
                "advanced_visualizations": current_user.subscription_tier.value
                == "premium",
            },
        },
        "error": None,
    }
