from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.api.health import router as health_router
from app.api.clinical_ai import router as clinical_ai_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("healthmate.ai_service")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing HealthMate AI Microservice...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Primary LLM Gateway: {settings.LLM_PRIMARY_PROVIDER} (Model: {settings.OPENROUTER_MODEL_NAME})")
    logger.info(f"Fallback LLM Provider: {settings.LLM_FALLBACK_PROVIDER} (Model: {settings.GEMINI_MODEL_NAME})")
    yield
    logger.info("Shutting down HealthMate AI Microservice...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
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

# Mount health routes
app.include_router(health_router, prefix="", tags=["System Health"])
app.include_router(health_router, prefix="/internal/v1", tags=["Internal Health"])
app.include_router(clinical_ai_router)

@app.get("/")
async def root():
    return {
        "message": "HealthMate AI - Intelligent ML & LLM Microservice",
        "health_check": "/health",
        "version": settings.VERSION
    }
