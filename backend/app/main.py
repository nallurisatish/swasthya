from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.db.session import engine, Base
# Import all models to ensure they are registered with Base metadata
import app.models # noqa: F401

from app.api import (
    auth, documents, health, ai,
    fhir, export, consent, audit, demo
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables on startup
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Your Personal Health Intelligence Platform | Hackathon-Ready AI Copilot",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory for preview
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")

# Include API Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication & Profile"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents & OCR"])
app.include_router(health.router, prefix="/api/health", tags=["Health Intelligence & Timeline"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Summaries"])
app.include_router(fhir.router, prefix="/api/fhir", tags=["ABDM & FHIR R4"])
app.include_router(export.router, prefix="/api/export", tags=["Export & Interoperability"])
app.include_router(consent.router, prefix="/api/consent", tags=["Privacy & Consent"])
app.include_router(audit.router, prefix="/api/audit", tags=["Security Audit"])
app.include_router(demo.router, prefix="/api/demo", tags=["Demo Simulation"])

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "status": "operational",
        "docs_url": "/docs"
    }

@app.get("/api/health-check")
def health_check():
    return {
        "status": "healthy",
        "database": "sqlite_connected",
        "version": settings.VERSION
    }
