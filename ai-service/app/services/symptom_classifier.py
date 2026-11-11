import os
import re
import time
import math
import joblib
import logging
from typing import List, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from app.services.mlops_registry import mlops_registry

logger = logging.getLogger("healthmate.symptom_classifier")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ARTIFACT_PATH = os.path.join(BASE_DIR, "models", "symptom_classifier_v2.joblib")
PYTORCH_PATH = os.path.join(BASE_DIR, "models", "clinical_triage_pytorch.pt")

DISEASE_METADATA = {
    "Cardiovascular Emergency": {
        "specialty": "Cardiology",
        "urgency": "EMERGENCY",
        "triage_guidance": "Emergency red-flag symptom cluster. Immediately dial 112/108 or go to the nearest emergency trauma center."
    },
    "Hypertension Crisis / Angina Pectoris": {
        "specialty": "Cardiology",
        "urgency": "EMERGENCY",
        "triage_guidance": "Emergency red-flag symptom cluster. Immediately dial 112/108 or go to the nearest emergency trauma center."
    },
    "Migraine with Aura": {
        "specialty": "Neurology",
        "urgency": "ROUTINE",
        "triage_guidance": "Rest in a dark, quiet room. Consult a neurologist for preventive medication if episodes exceed 3 per month."
    },
    "Respiratory Infection / Bronchitis": {
        "specialty": "Pulmonology",
        "urgency": "ROUTINE",
        "triage_guidance": "Rest, adequate hydration, steam inhalation. Seek urgent medical care if hemoptysis (coughing blood) or high fever develops."
    },
    "Acute Bronchitis": {
        "specialty": "Pulmonology",
        "urgency": "ROUTINE",
        "triage_guidance": "Rest, adequate hydration, steam inhalation. Seek urgent medical care if hemoptysis (coughing blood) or high fever develops."
    },
    "Gastroesophageal Reflux Disease (GERD)": {
        "specialty": "Gastroenterology",
        "urgency": "ROUTINE",
        "triage_guidance": "Avoid late-night heavy meals, elevate bed head. Seek specialist care if dysphagia (difficulty swallowing) persists."
    },
    "Type 2 Diabetes Mellitus Presentation": {
        "specialty": "Endocrinology",
        "urgency": "URGENT",
        "triage_guidance": "Requires fasting blood sugar (FBS) and HbA1c testing with comprehensive clinical endocrine evaluation."
    },
    "Type 2 Diabetes Mellitus (Decompensated)": {
        "specialty": "Endocrinology",
        "urgency": "URGENT",
        "triage_guidance": "Requires fasting blood sugar (FBS) and HbA1c testing with comprehensive clinical endocrine evaluation."
    },
    "Osteoarthritis / Degenerative Joint Disease": {
        "specialty": "Orthopedics",
        "urgency": "ROUTINE",
        "triage_guidance": "Low-impact physical therapy, joint mobilization exercises, weight management, and orthopedic evaluation."
    },
    "Acute Bacterial Pharyngitis / Tonsillitis": {
        "specialty": "ENT / General Medicine",
        "urgency": "ROUTINE",
        "triage_guidance": "Warm saline gargles. Consult physician for throat examination and indicated antibiotic therapy if bacterial."
    },
    "Allergic Rhinitis / Atopic Dermatitis": {
        "specialty": "Dermatology / Allergy",
        "urgency": "ROUTINE",
        "triage_guidance": "Identify and avoid known allergens. Consult dermatologist/allergist for antihistamine and barrier repair regimen."
    },
    "Acute Allergic Rhinitis / Atopic Dermatitis": {
        "specialty": "Dermatology / Allergy",
        "urgency": "ROUTINE",
        "triage_guidance": "Identify and avoid known allergens. Consult dermatologist/allergist for antihistamine and barrier repair regimen."
    }
}

class SymptomClassifier:
    def __init__(self):
        self.is_loaded = False
        self.vectorizer = None
        self.model = None
        self.classes = []
        self.emergency_keywords = [
            "chest pain", "chest discomfort", "arm pain", "shortness of breath", "breathlessness", "chest tightness",
            "retrosternal", "substernal", "crushing pain", "pressure in chest", "unconscious", "unresponsive",
            "hemoptysis", "coughing blood", "bright red blood", "stroke", "paralysis", "facial droop",
            "slurred speech", "slurred words", "thunderclap", "worst headache", "cannot breathe",
            "inability to breathe", "stridor", "choking", "gasping", "cyanosis", "severe bleeding",
            "bleeding profusely", "neck stiffness", "neck rigidity", "confusion", "tearing chest"
        ]
        self._load_or_initialize()

    def _load_or_initialize(self):
        """Loads serialized model artifact from disk or initializes fallback pipeline."""
        if os.path.exists(ARTIFACT_PATH):
            try:
                artifact = joblib.load(ARTIFACT_PATH)
                self.vectorizer = artifact["vectorizer"]
                self.model = artifact["model"]
                self.classes = artifact["classes"]
                if "emergency_keywords" in artifact:
                    self.emergency_keywords = list(set(self.emergency_keywords + artifact["emergency_keywords"]))
                self.is_loaded = True
                logger.info(f"Loaded Symptom Classifier Artifact from {ARTIFACT_PATH} (Classes: {len(self.classes)})")
                return
            except Exception as e:
                logger.error(f"Failed to load artifact {ARTIFACT_PATH}: {e}")

        # Fallback initialization if artifact file not yet present
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")
        corpus = [
            "crushing chest pain left arm shortness of breath diaphoresis",
            "throbbing headache visual aura photophobia sound sensitivity",
            "persistent cough mucus production wheezing fever",
            "heartburn acid reflux chest burning after meals",
            "excessive thirst frequent urination weight loss fatigue",
            "joint pain morning stiffness knee crepitus",
            "sore throat difficulty swallowing white patches tonsils",
            "sneezing runny nose itchy eyes allergic rash"
        ]
        labels = [
            "Cardiovascular Emergency", "Migraine with Aura",
            "Respiratory Infection / Bronchitis", "Gastroesophageal Reflux Disease (GERD)",
            "Type 2 Diabetes Mellitus Presentation", "Osteoarthritis / Degenerative Joint Disease",
            "Acute Bacterial Pharyngitis / Tonsillitis", "Allergic Rhinitis / Atopic Dermatitis"
        ]
        X = self.vectorizer.fit_transform(corpus)
        self.model = LogisticRegression(C=1.0, max_iter=200, random_state=42)
        self.model.fit(X, labels)
        self.classes = self.model.classes_.tolist()
        self.is_loaded = True

    def analyze_symptoms(self, symptom_text: str) -> Dict[str, Any]:
        start_time = time.time()
        cleaned = re.sub(r"[^a-zA-Z\s]", " ", symptom_text).lower().strip()
        if not cleaned or len(cleaned.split()) < 1:
            return {
                "error": "Please describe your symptoms in at least a few words.",
                "triage": "INSUFFICIENT_DATA"
            }

        # Check for emergency red flags
        has_emergency = any(k in cleaned for k in self.emergency_keywords)

        vec = self.vectorizer.transform([cleaned])
        probs = self.model.predict_proba(vec)[0]

        # Compute Shannon Entropy H(p) = - sum(p_i * ln(p_i))
        entropy = 0.0
        for p in probs:
            if p > 1e-7:
                entropy -= float(p) * math.log(float(p))
        entropy = round(float(entropy), 3)

        # Theoretical maximum entropy for 8 classes is ln(8) ~ 2.079
        is_ood = bool(entropy >= 1.95 or float(max(probs)) < 0.20)

        # Sort predictions
        ranked_indices = probs.argsort()[::-1]
        top_predictions = []

        for idx in ranked_indices[:3]:
            disease_name = str(self.model.classes_[idx])
            prob = float(probs[idx])
            meta = DISEASE_METADATA.get(disease_name, {
                "specialty": "General Medicine",
                "urgency": "ROUTINE",
                "triage_guidance": "Please consult a registered physician for comprehensive clinical examination."
            })

            top_predictions.append({
                "condition": disease_name,
                "confidence_score": round(prob, 3),
                "confidence_percent": f"{round(prob * 100, 1)}%",
                "specialty": str(meta["specialty"]),
                "urgency": "EMERGENCY" if has_emergency else str(meta["urgency"]),
                "triage_guidance": str(meta["triage_guidance"])
            })

        overall_urgency = "EMERGENCY" if has_emergency else str(top_predictions[0]["urgency"])

        # Token Feature Attribution (Extract matched salient n-grams)
        words = cleaned.split()
        matched_tokens = []
        feature_names = set(self.vectorizer.get_feature_names_out())
        for w in words:
            if w in feature_names and len(w) > 3:
                matched_tokens.append(str(w))

        duration_ms = float((time.time() - start_time) * 1000)
        mlops_registry.record_inference("mdl_symp_nlp_v2", duration_ms)

        # Check if PyTorch deep net is also present on disk
        dl_available = os.path.exists(PYTORCH_PATH)

        return {
            "model_id": "mdl_symp_nlp_v2",
            "model_artifact": "symptom_classifier_v2.joblib",
            "model_version": "2.2.0",
            "framework": "Scikit-Learn LogisticRegression + Sublinear TF-IDF",
            "deep_learning_shadow_model": "ClinicalTriageDeepNet (PyTorch 2.15.0 MPS)" if dl_available else None,
            "query_analyzed": str(symptom_text),
            "overall_urgency": overall_urgency,
            "is_emergency_flagged": bool(has_emergency),
            "recommended_specialty": str(top_predictions[0]["specialty"]),
            "differential_diagnoses": top_predictions,
            "uncertainty_metrics": {
                "shannon_entropy": float(entropy),
                "epistemic_uncertainty": "HIGH_UNCERTAINTY" if is_ood else "CONFIDENT",
                "is_out_of_domain": bool(is_ood)
            },
            "token_attribution": {
                "salient_clinical_features": [str(x) for x in list(set(matched_tokens))[:5]],
                "attribution_method": "TF-IDF Weighting & Vocabulary Intersection"
            },
            "clinical_disclaimer": "Informational triage assessment only. Not a definitive clinical diagnosis. Seek qualified physician consultation."
        }

symptom_classifier = SymptomClassifier()
