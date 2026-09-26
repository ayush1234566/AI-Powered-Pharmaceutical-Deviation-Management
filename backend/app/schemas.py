"""
AIVOA Backend - Pydantic Schemas
Request/response schemas for API validation and serialization.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# --- Extraction Request/Response ---

class ExtractionRequest(BaseModel):
    """Request body when sending raw text for AI extraction."""
    text: str = Field(..., description="Raw text or pasted deviation notes")


class ExtractedDeviation(BaseModel):
    """Structured deviation data extracted by AI."""
    site_plant: Optional[str] = Field(None, description="Site / Plant name")
    date_of_occurrence: Optional[str] = Field(None, description="Date of occurrence (YYYY-MM-DD)")
    title: Optional[str] = Field(None, description="Title / Short Description")
    source: Optional[str] = Field(None, description="Source of deviation")
    related_product_material: Optional[str] = Field(None, description="Related Product / Material")
    batch_lot_number: Optional[str] = Field(None, description="Batch / Lot Number")
    detailed_description: Optional[str] = Field(None, description="Detailed description of the deviation")
    initial_impact: Optional[str] = Field(None, description="Impact level: Low, Medium, High, or Critical")
    initial_severity: Optional[str] = Field(None, description="Severity level: Minor, Major, or Critical")


class AIRecommendation(BaseModel):
    """AI-generated impact/severity recommendation with reasoning."""
    initial_impact: str = Field(..., description="Recommended impact level")
    initial_severity: str = Field(..., description="Recommended severity level")
    impact_reasoning: str = Field(..., description="Justification for the impact assessment")
    severity_reasoning: str = Field(..., description="Justification for the severity assessment")


class ExtractionResponse(BaseModel):
    """Full response from AI extraction endpoint."""
    success: bool = True
    extracted_data: ExtractedDeviation
    recommendation: AIRecommendation
    ai_message: str = Field(
        default="",
        description="AI assistant message summarizing the extraction"
    )


# --- Deviation CRUD ---

class DeviationCreate(BaseModel):
    """Schema for creating/saving a deviation record."""
    site_plant: Optional[str] = None
    date_of_occurrence: Optional[str] = None
    title: Optional[str] = None
    source: Optional[str] = None
    related_product_material: Optional[str] = None
    batch_lot_number: Optional[str] = None
    detailed_description: Optional[str] = None
    initial_impact: Optional[str] = None
    initial_severity: Optional[str] = None
    ai_impact_reasoning: Optional[str] = None
    ai_severity_reasoning: Optional[str] = None
    source_document_name: Optional[str] = None
    source_text: Optional[str] = None
    status: Optional[str] = "Draft"


class DeviationResponse(BaseModel):
    """Schema for deviation record in API responses."""
    id: str
    deviation_id: str
    site_plant: Optional[str] = None
    date_of_occurrence: Optional[str] = None
    title: Optional[str] = None
    source: Optional[str] = None
    related_product_material: Optional[str] = None
    batch_lot_number: Optional[str] = None
    detailed_description: Optional[str] = None
    initial_impact: Optional[str] = None
    initial_severity: Optional[str] = None
    ai_impact_reasoning: Optional[str] = None
    ai_severity_reasoning: Optional[str] = None
    status: Optional[str] = None
    source_document_name: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Chat ---

class ChatRequest(BaseModel):
    """Request for AI chat interaction."""
    message: str = Field(..., description="User's question about deviations")
    context: Optional[str] = Field(None, description="Optional context from the current deviation form")


class ChatResponse(BaseModel):
    """Response from AI chat."""
    success: bool = True
    response: str = Field(..., description="AI assistant's response")
