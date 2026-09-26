"""
AIVOA Backend - FastAPI Application Entry Point
Main application setup with CORS, routes, and database initialization.
"""

import sys
from pathlib import Path
import logging

# Ensure backend root directory is at the top of sys.path
backend_dir = str(Path(__file__).resolve().parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.routes.deviations import router as deviations_router

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Create FastAPI App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="AIVOA - AI-Powered Deviation Management",
    description="Backend API for the AIVOA Deviation Intake Module. "
                "Handles document extraction, AI-powered field population, "
                "and deviation record management for pharmaceutical manufacturing.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS Middleware
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        *settings.CORS_ORIGINS,
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Include Routers
# ---------------------------------------------------------------------------

app.include_router(deviations_router)

# ---------------------------------------------------------------------------
# Startup / Shutdown Events
# ---------------------------------------------------------------------------

@app.on_event("startup")
async def startup_event():
    """Initialize database tables and validate configuration on startup."""
    logger.info("=" * 60)
    logger.info("  AIVOA Backend Starting...")
    logger.info("=" * 60)

    # Initialize database
    init_db()
    logger.info("[OK] Database initialized.")

    # Validate Groq API key
    if settings.validate():
        logger.info(f"[OK] Groq API configured (model: {settings.GROQ_MODEL})")
    else:
        logger.warning("[WARNING] Groq API key not set - AI features disabled.")

    logger.info(f"CORS origins: {settings.CORS_ORIGINS}")
    logger.info(f"Database: {settings.DATABASE_URL}")
    logger.info("=" * 60)
    logger.info("  Server ready! Visit http://localhost:8000/docs for API docs")
    logger.info("=" * 60)


# ---------------------------------------------------------------------------
# Root / Health Endpoint
# ---------------------------------------------------------------------------

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "service": "AIVOA Deviation Management API",
        "version": "1.0.0",
        "status": "running",
        "ai_configured": settings.validate(),
    }


@app.get("/health")
async def health():
    """Health check for monitoring."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

