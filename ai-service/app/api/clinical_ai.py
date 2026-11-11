from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.services.symptom_classifier import symptom_classifier
from app.services.health_risk_models import health_risk_models
from app.services.report_ocr import report_ocr_extractor
from app.services.clinical_copilot import clinical_copilot
from app.services.clinical_rag import clinical_rag_grounder
from app.services.mlops_registry import mlops_registry

router = APIRouter(prefix="/api/v1/ai", tags=["Clinical Hybrid AI Pipeline"])

# Pydantic Schemas
class SymptomCheckRequest(BaseModel):
    symptom_text: str = Field(..., example="I have had a throbbing headache with light sensitivity and nausea for two days.")

class CardioRiskRequest(BaseModel):
    age: int = Field(50, ge=18, le=100)
    systolic_bp: float = Field(135.0, ge=80, le=240)
    total_cholesterol: float = Field(210.0, ge=100, le=400)
    hdl_cholesterol: float = Field(45.0, ge=20, le=120)
    is_smoker: bool = False
    has_diabetes: bool = False

class DiabetesRiskRequest(BaseModel):
    age: int = Field(45, ge=18, le=100)
    bmi: float = Field(27.5, ge=15.0, le=60.0)
    family_history: bool = True
    physical_activity: bool = False
    fasting_glucose: float = Field(105.0, ge=60.0, le=300.0)

class CopilotQueryRequest(BaseModel):
    query: str
    language: str = "en"
    history: Optional[List[Dict[str, str]]] = None

class SoapSummarizeRequest(BaseModel):
    consultation_text: str
    patient_info: Optional[Dict[str, Any]] = None

class DrugInteractionRequest(BaseModel):
    medications: List[str] = Field(..., example=["Aspirin 75mg", "Warfarin 5mg"])

# Endpoints
@router.post("/symptom-check")
async def check_symptoms(payload: SymptomCheckRequest):
    return symptom_classifier.analyze_symptoms(payload.symptom_text)

@router.post("/health-risk/cardio")
async def assess_cardio_risk(payload: CardioRiskRequest):
    return health_risk_models.calculate_cardiovascular_risk(payload.model_dump())

@router.post("/health-risk/diabetes")
async def assess_diabetes_risk(payload: DiabetesRiskRequest):
    return health_risk_models.calculate_diabetes_risk(payload.model_dump())

@router.post("/ocr-extract")
async def extract_report_ocr(
    raw_text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    text_content = raw_text or ""
    filename = "Uploaded Document"

    ocr_confidence = 0.95
    engine_name = "Direct_Text_Stream"
    transforms = []

    if file:
        filename = file.filename or "Uploaded Document"
        content_bytes = await file.read()
        extracted_text, ocr_confidence, engine_name, transforms = report_ocr_extractor.extract_from_bytes(
            content_bytes=content_bytes,
            content_type=file.content_type or "application/octet-stream",
            filename=filename
        )
        text_content += " " + extracted_text

    return report_ocr_extractor.parse_report_text(
        raw_text=text_content,
        filename=filename,
        ocr_confidence=ocr_confidence,
        engine_name=engine_name,
        transforms=transforms
    )

@router.post("/copilot-chat")
async def copilot_chat(payload: CopilotQueryRequest):
    return await clinical_copilot.answer_patient_query(
        query=payload.query,
        language=payload.language,
        history=payload.history
    )

@router.post("/soap-summarize")
async def soap_summarize(payload: SoapSummarizeRequest):
    return await clinical_copilot.generate_soap_note(
        consultation_text=payload.consultation_text,
        patient_info=payload.patient_info
    )

@router.post("/drug-interactions")
async def drug_interactions(payload: DrugInteractionRequest):
    return clinical_copilot.check_drug_interactions(payload.medications)

class RAGQueryRequest(BaseModel):
    query: str = Field(..., example="What are the diagnostic thresholds for Type 2 Diabetes according to ADA guidelines?")
    top_k: int = Field(2, ge=1, le=5)

@router.post("/rag/retrieve")
async def retrieve_clinical_guidelines(payload: RAGQueryRequest):
    return clinical_rag_grounder.retrieve_guidelines(payload.query, top_k=payload.top_k)

@router.get("/model-metadata")
async def get_model_metadata():
    """
    MLOps Telemetry for Administration Dashboard
    """
    return {
        "models": mlops_registry.get_models()
    }

@router.get("/mlops/models")
async def get_mlops_models():
    return {
        "count": len(mlops_registry.get_models()),
        "models": mlops_registry.get_models()
    }

@router.get("/mlops/models/{model_id}")
async def get_mlops_model(model_id: str):
    model = mlops_registry.get_model_by_id(model_id)
    if not model:
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found in registry.")
    return model

@router.get("/mlops/telemetry")
async def get_mlops_telemetry():
    return mlops_registry.get_telemetry()

class RollbackRequest(BaseModel):
    model_id: str
    target_version: str

@router.get("/mlops/drift")
async def get_mlops_drift():
    if hasattr(mlops_registry, "evaluate_feature_drift"):
        return mlops_registry.evaluate_feature_drift()
    return mlops_registry.detect_data_drift()

@router.post("/mlops/rollback")
async def rollback_mlops_model(payload: RollbackRequest):
    return mlops_registry.rollback_model(payload.model_id, payload.target_version)
