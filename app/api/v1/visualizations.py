from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.dataset import Dataset
from app.models.visualization import Visualization, VisualizationType
from app.core.auth import get_current_user
from typing import List, Optional, Dict, Any
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from pydantic import BaseModel

router = APIRouter()


class VisualizationRequest(BaseModel):
    dataset_id: int
    name: str
    type: str
    columns: List[str]
    parameters: Optional[Dict[str, Any]] = None


class VisualizationResponse(BaseModel):
    id: int
    name: str
    type: str
    plot_data: Dict[str, Any]


def load_dataset(file_path: str) -> pd.DataFrame:
    if file_path.endswith(".csv"):
        return pd.read_csv(file_path)
    return pd.read_excel(file_path)


def create_visualization(
    df: pd.DataFrame,
    viz_type: str,
    columns: List[str],
    parameters: Dict[str, Any] = None,
) -> Dict[str, Any]:
    try:
        if viz_type == "bar":
            fig = px.bar(df, x=columns[0], y=columns[1], **parameters or {})
        elif viz_type == "pie":
            fig = px.pie(df, values=columns[0], names=columns[1], **parameters or {})
        elif viz_type == "line":
            fig = px.line(df, x=columns[0], y=columns[1], **parameters or {})
        elif viz_type == "scatter":
            fig = px.scatter(df, x=columns[0], y=columns[1], **parameters or {})
        elif viz_type == "box":
            fig = px.box(df, x=columns[0], y=columns[1], **parameters or {})
        elif viz_type == "heatmap":
            correlation_matrix = df[columns].corr()
            fig = go.Figure(
                data=go.Heatmap(
                    z=correlation_matrix.values,
                    x=correlation_matrix.columns,
                    y=correlation_matrix.columns,
                )
            )
        else:
            raise ValueError(f"Unsupported visualization type: {viz_type}")

        return fig.to_dict()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error creating visualization: {str(e)}",
        )


@router.post("/", response_model=VisualizationResponse)
async def create_visualization_endpoint(
    request: VisualizationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Get dataset
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
        # Load data
        df = load_dataset(dataset.file_path)

        # Validate columns
        if not all(col in df.columns for col in request.columns):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid column names"
            )

        # Create visualization
        plot_data = create_visualization(
            df, request.type, request.columns, request.parameters
        )

        # Save visualization
        viz = Visualization(
            name=request.name,
            type=VisualizationType[request.type.upper()],
            parameters={
                "columns": request.columns,
                "additional_params": request.parameters,
            },
            plot_data=plot_data,
            dataset_id=dataset.id,
            user_id=current_user.id,
        )

        db.add(viz)
        db.commit()
        db.refresh(viz)

        return VisualizationResponse(
            id=viz.id, name=viz.name, type=viz.type.value, plot_data=viz.plot_data
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/", response_model=List[VisualizationResponse])
async def list_visualizations(
    dataset_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Visualization).filter(Visualization.user_id == current_user.id)

    if dataset_id:
        query = query.filter(Visualization.dataset_id == dataset_id)

    visualizations = query.all()

    return [
        VisualizationResponse(
            id=viz.id, name=viz.name, type=viz.type.value, plot_data=viz.plot_data
        )
        for viz in visualizations
    ]


@router.delete("/{visualization_id}")
async def delete_visualization(
    visualization_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    viz = (
        db.query(Visualization)
        .filter(
            Visualization.id == visualization_id,
            Visualization.user_id == current_user.id,
        )
        .first()
    )

    if not viz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Visualization not found"
        )

    db.delete(viz)
    db.commit()

    return {"status": "success"}
