from fastapi import APIRouter
from app.services.llm_gateway import llm_gateway
from app.core.config import settings

router = APIRouter()

@router.get("/health")
async def health_check():
    llm_health = await llm_gateway.check_health()
    return {
        "status": "healthy",
        "service": "healthmate-ai-service",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "architecture": {
            "ml_frameworks": ["scikit-learn", "xgboost", "pytorch", "transformers"],
            "ocr_engine": "PaddleOCR v2",
            "explainability": "SHAP (TreeSHAP / KernelSHAP)",
            "vector_store": "FAISS in-memory index"
        },
        "llm_gateway": llm_health
    }
