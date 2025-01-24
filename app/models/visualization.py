from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum


class VisualizationType(str, enum.Enum):
    BAR = "bar"
    PIE = "pie"
    LINE = "line"
    SCATTER = "scatter"
    BOX = "box"
    HEATMAP = "heatmap"


class Visualization(Base):
    __tablename__ = "visualization"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    type = Column(Enum(VisualizationType), nullable=False)
    config = Column(JSON)  # Visualization configuration
    dataset_id = Column(
        Integer, ForeignKey("dataset.id", ondelete="CASCADE"), nullable=False
    )
    user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    dataset = relationship("Dataset", back_populates="visualizations")
    user = relationship("User", back_populates="visualizations")
