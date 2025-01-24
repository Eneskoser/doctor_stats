from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime

from app.db.session import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.analysis import Analysis, AnalysisType, AnalysisStatus
from app.models.dataset import Dataset
from app.services.analysis import AnalysisService
from app.schemas.analysis import (
    AnalysisCreate,
    AnalysisResponse,
    AnalysisResult,
    BasicStatistics,
    ComparativeStatistics,
)

router = APIRouter()
analysis_service = AnalysisService()


async def run_analysis_task(
    analysis_id: str, db: Session, analysis_service: AnalysisService
):
    """Background task to run analysis."""
    try:
        # Get analysis from database
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if not analysis:
            return

        # Update status to processing
        analysis.status = AnalysisStatus.PROCESSING
        db.commit()

        # Get dataset
        dataset = db.query(Dataset).filter(Dataset.id == analysis.dataset_id).first()
        if not dataset:
            raise ValueError("Dataset not found")

        # Load dataset
        df = await analysis_service.load_dataset(dataset.file_path)

        # Run analysis
        results = await analysis_service.run_analysis(
            df, analysis.type.value, analysis.config
        )

        # Update analysis with results
        analysis.results = results
        analysis.status = AnalysisStatus.COMPLETED
        db.commit()

    except Exception as e:
        # Update analysis with error
        analysis.status = AnalysisStatus.FAILED
        analysis.error = str(e)
        db.commit()


@router.post("/analysis", response_model=AnalysisResponse)
async def create_analysis(
    *,
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    analysis_in: AnalysisCreate,
):
    """Create a new analysis."""
    # Validate dataset exists and user has access
    dataset = (
        db.query(Dataset)
        .filter(
            Dataset.id == analysis_in.dataset_id, Dataset.user_id == current_user.id
        )
        .first()
    )
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    # Create analysis record
    analysis = Analysis(
        id=str(uuid.uuid4()),
        dataset_id=dataset.id,
        user_id=current_user.id,
        name=f"Analysis {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}",
        type=AnalysisType(analysis_in.analysis_type),
        config=analysis_in.config.dict(),
        status=AnalysisStatus.PENDING,
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    # Start background task
    background_tasks.add_task(run_analysis_task, analysis.id, db, analysis_service)

    return analysis


@router.get("/analysis/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get analysis by ID."""
    analysis = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis


@router.get("/analysis/{analysis_id}/results", response_model=AnalysisResult)
async def get_analysis_results(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get analysis results."""
    analysis = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    if analysis.status == AnalysisStatus.PENDING:
        raise HTTPException(status_code=202, detail="Analysis pending")
    elif analysis.status == AnalysisStatus.PROCESSING:
        raise HTTPException(status_code=202, detail="Analysis in progress")
    elif analysis.status == AnalysisStatus.FAILED:
        raise HTTPException(
            status_code=500, detail=f"Analysis failed: {analysis.error}"
        )

    return analysis.results


@router.get("/analysis", response_model=List[AnalysisResponse])
async def list_analyses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
):
    """List user's analyses."""
    analyses = (
        db.query(Analysis)
        .filter(Analysis.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return analyses
