"""
AIVOA Backend - Database Models
SQLAlchemy ORM model for Deviation records.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, Integer
from app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


def generate_deviation_id():
    """Generate a sequential-style deviation ID like DEV-2026-0001."""
    return f"DEV-{datetime.now().year}-{uuid.uuid4().hex[:6].upper()}"


class Deviation(Base):
    """Deviation record model for pharmaceutical manufacturing deviations."""

    __tablename__ = "deviations"

    id = Column(String(50), primary_key=True, default=generate_uuid)
    deviation_id = Column(String(50), unique=True, default=generate_deviation_id)

    # Deviation Information
    site_plant = Column(String(200), nullable=True)
    date_of_occurrence = Column(String(50), nullable=True)
    title = Column(String(500), nullable=True)
    source = Column(String(200), nullable=True)
    related_product_material = Column(String(500), nullable=True)
    batch_lot_number = Column(String(200), nullable=True)

    # Deviation Details
    detailed_description = Column(Text, nullable=True)
    initial_impact = Column(String(50), nullable=True)
    initial_severity = Column(String(50), nullable=True)

    # AI-generated fields
    ai_impact_reasoning = Column(Text, nullable=True)
    ai_severity_reasoning = Column(Text, nullable=True)

    # Metadata
    status = Column(String(50), default="Draft")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Original source info
    source_document_name = Column(String(500), nullable=True)
    source_text = Column(Text, nullable=True)

    def __repr__(self):
        return f"<Deviation {self.deviation_id}: {self.title}>"
