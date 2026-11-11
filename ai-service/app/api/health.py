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
            "ml_frameworks": ["scikit-learn", "pytorch", "shap"],
            "ocr_engine": "Tesseract OCR v5.5.4 + PyPDF v7.0.1",
            "explainability": "Official SHAP (LinearExplainer & Additive Shapley Decomposition)",
            "vector_store": "Joblib Persistent TF-IDF Vector Index",
            "deep_learning": "PyTorch 2.15.0 (ClinicalTriageDeepNet)"
        },
        "llm_gateway": llm_health
    }
