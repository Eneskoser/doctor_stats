from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.dataset import Dataset
from app.models.analysis import Analysis
from app.models.visualization import Visualization
from app.models.report import Report
from app.core.auth import get_current_user
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


class ReportBase(BaseModel):
    title: str
    description: Optional[str] = None
    dataset_id: int


class ReportCreate(ReportBase):
    pass


class ReportSection(BaseModel):
    title: str
    content_type: str  # "analysis" or "visualization"
    content_id: int
    order: int


class ReportRequest(ReportBase):
    sections: List[ReportSection]


class ReportResponse(ReportBase):
    id: int
    created_at: datetime
    sections: List[Dict[str, Any]]

    class Config:
        from_attributes = True


@router.post("/", response_model=ReportResponse)
async def create_report(
    request: ReportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify dataset access
    dataset = (
        db.query(Dataset)
        .filter(Dataset.id == request.dataset_id, Dataset.user_id == current_user.id)
        .first()
    )

    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found"
        )

    try:
        # Collect all sections
        sections = []
        for section in request.sections:
            if section.content_type == "analysis":
                content = (
                    db.query(Analysis)
                    .filter(
                        Analysis.id == section.content_id,
                        Analysis.user_id == current_user.id,
                        Analysis.dataset_id == request.dataset_id,
                    )
                    .first()
                )
                if not content:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Analysis with id {section.content_id} not found",
                    )
                sections.append(
                    {
                        "title": section.title,
                        "type": "analysis",
                        "content": {
                            "type": content.type.value,
                            "results": content.results,
                        },
                        "order": section.order,
                    }
                )
            elif section.content_type == "visualization":
                content = (
                    db.query(Visualization)
                    .filter(
                        Visualization.id == section.content_id,
                        Visualization.user_id == current_user.id,
                        Visualization.dataset_id == request.dataset_id,
                    )
                    .first()
                )
                if not content:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Visualization with id {section.content_id} not found",
                    )
                sections.append(
                    {
                        "title": section.title,
                        "type": "visualization",
                        "content": {
                            "type": content.type.value,
                            "plot_data": content.plot_data,
                        },
                        "order": section.order,
                    }
                )

        # Sort sections by order
        sections.sort(key=lambda x: x["order"])

        # Create report
        report = Report(
            title=request.title,
            description=request.description,
            content={"sections": sections},
            dataset_id=request.dataset_id,
            user_id=current_user.id,
        )

        db.add(report)
        db.commit()
        db.refresh(report)

        return ReportResponse(
            id=report.id,
            title=report.title,
            description=report.description,
            dataset_id=report.dataset_id,
            created_at=report.created_at,
            sections=report.content["sections"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = (
        db.query(Report)
        .filter(Report.id == report_id, Report.user_id == current_user.id)
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Report not found"
        )

    return ReportResponse(
        id=report.id,
        title=report.title,
        description=report.description,
        dataset_id=report.dataset_id,
        created_at=report.created_at,
        sections=report.content["sections"],
    )


@router.get("/", response_model=List[ReportResponse])
async def list_reports(
    dataset_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Report).filter(Report.user_id == current_user.id)

    if dataset_id:
        query = query.filter(Report.dataset_id == dataset_id)

    reports = query.all()

    return [
        ReportResponse(
            id=report.id,
            title=report.title,
            description=report.description,
            dataset_id=report.dataset_id,
            created_at=report.created_at,
            sections=report.content["sections"],
        )
        for report in reports
    ]


@router.delete("/{report_id}")
async def delete_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = (
        db.query(Report)
        .filter(Report.id == report_id, Report.user_id == current_user.id)
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Report not found"
        )

    db.delete(report)
    db.commit()

    return {"status": "success"}
