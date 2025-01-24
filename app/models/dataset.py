from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Dataset(Base):
    __tablename__ = "dataset"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    description = Column(String)
    row_count = Column(Integer)
    column_info = Column(JSON)
    user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="datasets")
    analyses = relationship(
        "Analysis", back_populates="dataset", cascade="all, delete-orphan"
    )
    visualizations = relationship(
        "Visualization", back_populates="dataset", cascade="all, delete-orphan"
    )
