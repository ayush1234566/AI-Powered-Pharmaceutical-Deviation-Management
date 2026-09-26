"""
AIVOA Backend - Deviation API Routes
Endpoints for deviation extraction, CRUD operations, statistics, and AI chat.
"""

import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Deviation
from app.schemas import (
    ExtractionRequest,
    ExtractionResponse,
    ExtractedDeviation,
    AIRecommendation,
    DeviationCreate,
    DeviationResponse,
    ChatRequest,
    ChatResponse,
)
from app.services.document_parser import parse_document
from app.services.ai_service import process_deviation_text, chat_with_assistant
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/deviations", tags=["Deviations"])


# ---------------------------------------------------------------------------
# Extraction Endpoints
# ---------------------------------------------------------------------------

@router.post("/extract", response_model=ExtractionResponse)
async def extract_from_text(request: ExtractionRequest):
    """
    Extract deviation fields from pasted text using AI or domain engine.
    POST /api/deviations/extract
    Body: { "text": "..." }
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text content is required.")

    try:
        result = await process_deviation_text(request.text)

        extracted = result.get("extracted_data", {})
        recommendation = result.get("recommendation", {})

        return ExtractionResponse(
            success=True,
            extracted_data=ExtractedDeviation(**extracted),
            recommendation=AIRecommendation(
                initial_impact=recommendation.get("initial_impact", "Medium"),
                initial_severity=recommendation.get("initial_severity", "Major"),
                impact_reasoning=recommendation.get("impact_reasoning", "Assessment pending."),
                severity_reasoning=recommendation.get("severity_reasoning", "Assessment pending."),
            ),
            ai_message=result.get("ai_message", "Extraction complete."),
        )
    except Exception as e:
        logger.error(f"Extraction failed: {e}")
        raise HTTPException(status_code=500, detail=f"AI extraction failed: {str(e)}")


@router.post("/extract-file", response_model=ExtractionResponse)
async def extract_from_file(file: UploadFile = File(...)):
    """
    Extract deviation fields from an uploaded document using AI.
    POST /api/deviations/extract-file
    Body: multipart/form-data with 'file'
    """
    file_bytes = await file.read()
    if len(file_bytes) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {settings.MAX_UPLOAD_SIZE // (1024*1024)}MB."
        )

    import os
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    try:
        raw_text = parse_document(file_bytes, file.filename or "document")

        if not raw_text or raw_text.startswith("[Could not extract"):
            raise HTTPException(status_code=422, detail=raw_text or "Could not extract text from file.")

        result = await process_deviation_text(raw_text)

        extracted = result.get("extracted_data", {})
        recommendation = result.get("recommendation", {})

        return ExtractionResponse(
            success=True,
            extracted_data=ExtractedDeviation(**extracted),
            recommendation=AIRecommendation(
                initial_impact=recommendation.get("initial_impact", "Medium"),
                initial_severity=recommendation.get("initial_severity", "Major"),
                impact_reasoning=recommendation.get("impact_reasoning", "Assessment pending."),
                severity_reasoning=recommendation.get("severity_reasoning", "Assessment pending."),
            ),
            ai_message=result.get("ai_message", "Extraction complete."),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File extraction failed: {e}")
        raise HTTPException(status_code=500, detail=f"AI extraction failed: {str(e)}")


# ---------------------------------------------------------------------------
# Statistics Endpoint
# ---------------------------------------------------------------------------

@router.get("/stats/summary")
async def get_deviation_stats(db: Session = Depends(get_db)):
    """
    Get summary statistics of deviations for the dashboard.
    GET /api/deviations/stats/summary
    """
    total = db.query(Deviation).count()
    
    # By severity
    minor = db.query(Deviation).filter(Deviation.initial_severity == "Minor").count()
    major = db.query(Deviation).filter(Deviation.initial_severity == "Major").count()
    critical = db.query(Deviation).filter(Deviation.initial_severity == "Critical").count()

    # By impact
    low_impact = db.query(Deviation).filter(Deviation.initial_impact == "Low").count()
    med_impact = db.query(Deviation).filter(Deviation.initial_impact == "Medium").count()
    high_impact = db.query(Deviation).filter(Deviation.initial_impact == "High").count()
    crit_impact = db.query(Deviation).filter(Deviation.initial_impact == "Critical").count()

    # By status
    draft_count = db.query(Deviation).filter(Deviation.status == "Draft").count()
    saved_count = db.query(Deviation).filter(Deviation.status == "Saved").count()
    under_inv = db.query(Deviation).filter(Deviation.status == "Under Investigation").count()
    closed = db.query(Deviation).filter(Deviation.status == "Closed").count()

    return {
        "total": total,
        "by_severity": {"Minor": minor, "Major": major, "Critical": critical},
        "by_impact": {"Low": low_impact, "Medium": med_impact, "High": high_impact, "Critical": crit_impact},
        "by_status": {"Draft": draft_count, "Saved": saved_count, "Under Investigation": under_inv, "Closed": closed},
    }


# ---------------------------------------------------------------------------
# CRUD Endpoints
# ---------------------------------------------------------------------------

@router.post("/", response_model=DeviationResponse)
async def create_deviation(deviation: DeviationCreate, db: Session = Depends(get_db)):
    """
    Save a deviation record to the database.
    POST /api/deviations/
    """
    try:
        db_deviation = Deviation(
            site_plant=deviation.site_plant,
            date_of_occurrence=deviation.date_of_occurrence,
            title=deviation.title,
            source=deviation.source,
            related_product_material=deviation.related_product_material,
            batch_lot_number=deviation.batch_lot_number,
            detailed_description=deviation.detailed_description,
            initial_impact=deviation.initial_impact,
            initial_severity=deviation.initial_severity,
            ai_impact_reasoning=deviation.ai_impact_reasoning,
            ai_severity_reasoning=deviation.ai_severity_reasoning,
            source_document_name=deviation.source_document_name,
            source_text=deviation.source_text,
            status=deviation.status or "Draft",
        )
        db.add(db_deviation)
        db.commit()
        db.refresh(db_deviation)

        logger.info(f"Deviation saved: {db_deviation.deviation_id}")
        return db_deviation
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to save deviation: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save deviation: {str(e)}")


@router.get("/", response_model=List[DeviationResponse])
async def list_deviations(
    skip: int = 0,
    limit: int = 50,
    search: str = "",
    db: Session = Depends(get_db),
):
    """
    List all saved deviations with optional search filtering.
    GET /api/deviations/?skip=0&limit=50&search=xyz
    """
    query = db.query(Deviation)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (Deviation.title.ilike(s)) |
            (Deviation.deviation_id.ilike(s)) |
            (Deviation.batch_lot_number.ilike(s)) |
            (Deviation.related_product_material.ilike(s)) |
            (Deviation.site_plant.ilike(s))
        )

    deviations = (
        query.order_by(Deviation.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return deviations


@router.get("/{deviation_id}", response_model=DeviationResponse)
async def get_deviation(deviation_id: str, db: Session = Depends(get_db)):
    """
    Get a single deviation by ID.
    GET /api/deviations/{deviation_id}
    """
    deviation = db.query(Deviation).filter(
        (Deviation.id == deviation_id) | (Deviation.deviation_id == deviation_id)
    ).first()

    if not deviation:
        raise HTTPException(status_code=404, detail="Deviation not found.")
    return deviation


@router.put("/{deviation_id}", response_model=DeviationResponse)
async def update_deviation(
    deviation_id: str,
    update_data: DeviationCreate,
    db: Session = Depends(get_db),
):
    """
    Update an existing deviation by ID or deviation_id.
    PUT /api/deviations/{deviation_id}
    """
    deviation = db.query(Deviation).filter(
        (Deviation.id == deviation_id) | (Deviation.deviation_id == deviation_id)
    ).first()

    if not deviation:
        raise HTTPException(status_code=404, detail="Deviation not found.")

    for field, val in update_data.model_dump(exclude_unset=True).items():
        setattr(deviation, field, val)

    db.commit()
    db.refresh(deviation)
    return deviation


@router.delete("/{deviation_id}")
async def delete_deviation(deviation_id: str, db: Session = Depends(get_db)):
    """
    Delete a deviation record.
    DELETE /api/deviations/{deviation_id}
    """
    deviation = db.query(Deviation).filter(
        (Deviation.id == deviation_id) | (Deviation.deviation_id == deviation_id)
    ).first()

    if not deviation:
        raise HTTPException(status_code=404, detail="Deviation not found.")

    db.delete(deviation)
    db.commit()
    return {"success": True, "message": f"Deviation {deviation_id} deleted successfully."}


# ---------------------------------------------------------------------------
# Chat Endpoint
# ---------------------------------------------------------------------------

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat with the AI Deviation Assistant.
    POST /api/deviations/chat
    Body: { "message": "...", "context": "optional form context" }
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message is required.")

    try:
        response = await chat_with_assistant(request.message, request.context)
        return ChatResponse(success=True, response=response)
    except Exception as e:
        logger.error(f"Chat failed: {e}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")
