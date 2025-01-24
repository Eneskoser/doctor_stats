from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.dataset import Dataset
from app.api.v1.auth import get_current_user
from typing import List, Optional
import pandas as pd
import json
from pydantic import BaseModel
import os
import shutil
import logging

router = APIRouter()

logger = logging.getLogger(__name__)


class DatasetCreate(BaseModel):
    name: str
    description: Optional[str] = None


class DatasetResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    row_count: int
    column_info: dict
    created_at: str


@router.post("/upload", response_model=DatasetResponse)
async def upload_dataset(
    file: UploadFile = File(...),
    name: str = Form(...),
    description: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Validate file type
    if not file.filename.endswith((".xlsx", ".xls", ".csv")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only Excel and CSV files are supported.",
        )

    # Read file content
    if file.filename.endswith(".csv"):
        df = pd.read_csv(file.file)
    else:
        df = pd.read_excel(file.file)

    # Check row limit based on subscription
    row_limit = 1000000 if current_user.subscription_tier.value == "premium" else 100000
    if len(df) > row_limit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Dataset exceeds the {row_limit} row limit for your subscription tier",
        )

    try:
        # Get column information
        column_info = {col: str(dtype) for col, dtype in df.dtypes.items()}

        # TODO: Save file to disk or cloud storage
        file_path = f"data/datasets/{current_user.id}/{file.filename}"
        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        # Save the file
        with open(file_path, "wb+") as file_object:
            file.file.seek(0)
            shutil.copyfileobj(file.file, file_object)

        # Add logging
        logger.info(f"Creating dataset record: name={name}, user_id={current_user.id}")
        dataset = Dataset(
            name=name,
            description=description,
            file_path=file_path,
            row_count=len(df),
            column_info=column_info,
            user_id=current_user.id,
        )

        db.add(dataset)
        db.commit()
        logger.info(f"Dataset created successfully: id={dataset.id}")

        return DatasetResponse(
            id=dataset.id,
            name=dataset.name,
            description=dataset.description,
            row_count=dataset.row_count,
            column_info=dataset.column_info,
            created_at=dataset.created_at.isoformat(),
        )

    except Exception as e:
        logger.error(f"Error creating dataset: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/", response_model=List[DatasetResponse])
def list_datasets(
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    datasets = (
        db.query(Dataset)
        .filter(Dataset.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        DatasetResponse(
            id=dataset.id,
            name=dataset.name,
            description=dataset.description,
            row_count=dataset.row_count,
            column_info=dataset.column_info,
            created_at=dataset.created_at.isoformat(),
        )
        for dataset in datasets
    ]


@router.get("/{dataset_id}", response_model=DatasetResponse)
def get_dataset(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dataset = (
        db.query(Dataset)
        .filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id)
        .first()
    )

    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found"
        )

    return DatasetResponse(
        id=dataset.id,
        name=dataset.name,
        description=dataset.description,
        row_count=dataset.row_count,
        column_info=dataset.column_info,
        created_at=dataset.created_at.isoformat(),
    )


@router.delete("/{dataset_id}")
def delete_dataset(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dataset = (
        db.query(Dataset)
        .filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id)
        .first()
    )

    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found"
        )

    # TODO: Delete file from S3

    db.delete(dataset)
    db.commit()

    return {
        "success": True,
        "data": {"message": "Dataset deleted successfully"},
        "error": None,
    }
