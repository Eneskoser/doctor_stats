from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship, foreign
from app.db.base_class import Base
import enum


class AnalysisType(str, enum.Enum):
    BASIC = "basic"
    COMPARATIVE = "comparative"
    CORRELATION = "correlation"
    CHI_SQUARE = "chi_square"
    REGRESSION = "regression"


class AnalysisStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class Analysis(Base):
    __tablename__ = "analysis"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(AnalysisType), nullable=False)
    status = Column(Enum(AnalysisStatus), default=AnalysisStatus.PENDING)
    parameters = Column(JSON)
    results = Column(JSON)
    error_message = Column(String)
    dataset_id = Column(Integer, ForeignKey("dataset.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    dataset = relationship("Dataset", back_populates="analyses")
    user = relationship("User", back_populates="analyses")
    reports = relationship(
        "Report",
        back_populates="analysis",
        cascade="all, delete-orphan",
        primaryjoin="and_(Analysis.id == foreign(Report.analysis_id))",
    )
