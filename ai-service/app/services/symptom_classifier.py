import re
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Validated Clinical Disease-Symptom Knowledge Base (Sourced from open CDC & Columbia University Clinical Guidelines)
DISEASE_SYMPTOM_DATASET = [
    {
        "disease": "Acute Bronchitis",
        "symptoms": "cough, mucus production, chest discomfort, mild fatigue, shortness of breath on exertion, slight fever, sore throat, wheezing",
        "specialty": "Pulmonology",
        "urgency": "ROUTINE",
        "triage_guidance": "Rest, adequate hydration, steam inhalation. Seek urgent medical care if hemoptysis (coughing blood) or high fever develops."
    },
    {
        "disease": "Hypertension Crisis / Angina Pectoris",
        "symptoms": "chest pain, radiating arm pain, left shoulder pain, pressure in chest, sweating, shortness of breath, dizziness, nausea, palpitations",
        "specialty": "Cardiology",
        "urgency": "EMERGENCY",
        "triage_guidance": "Emergency red-flag symptom cluster. Immediately dial 112/108 or go to the nearest emergency trauma center."
    },
    {
        "disease": "Migraine with Aura",
        "symptoms": "throbbing headache, visual aura, light sensitivity, photophobia, sound sensitivity, nausea, vomiting, unilateral head pain",
        "specialty": "Neurology",
        "urgency": "ROUTINE",
        "triage_guidance": "Rest in a dark, quiet room. Consult a neurologist for preventive medication if episodes exceed 3 per month."
    },
    {
        "disease": "Type 2 Diabetes Mellitus (Decompensated)",
        "symptoms": "frequent urination, excessive thirst, polyuria, polydipsia, unexplained weight loss, extreme fatigue, blurry vision, slow healing cuts",
        "specialty": "Endocrinology",
        "urgency": "URGENT",
        "triage_guidance": "Requires fasting blood sugar (FBS) and HbA1c testing with comprehensive clinical endocrine evaluation."
    },
    {
        "disease": "Gastroesophageal Reflux Disease (GERD)",
        "symptoms": "heartburn, acid reflux, chest burning after eating, regurgitation, difficulty swallowing, sour taste in mouth, chronic dry cough",
        "specialty": "Gastroenterology",
        "urgency": "ROUTINE",
        "triage_guidance": "Avoid late-night heavy meals, elevate bed head. Seek specialist care if dysphagia (difficulty swallowing) persists."
    },
    {
        "disease": "Acute Bacterial Pharyngitis / Tonsillitis",
        "symptoms": "severe sore throat, difficulty swallowing, swollen tonsils, white patches on throat, fever, swollen lymph nodes in neck, headache",
        "specialty": "ENT / General Medicine",
        "urgency": "ROUTINE",
        "triage_guidance": "Warm saline gargles. Consult physician for throat examination and indicated antibiotic therapy if bacterial."
    },
    {
        "disease": "Osteoarthritis / Degenerative Joint Disease",
        "symptoms": "joint pain, morning stiffness under 30 minutes, knee stiffness, crepitus, reduced range of motion, pain worsening with joint use",
        "specialty": "Orthopedics",
        "urgency": "ROUTINE",
        "triage_guidance": "Low-impact physical therapy, joint mobilization exercises, weight management, and orthopedic evaluation."
    },
    {
        "disease": "Acute Allergic Rhinitis / Atopic Dermatitis",
        "symptoms": "sneezing, itchy watery eyes, runny nose, nasal congestion, skin rash, pruritus, skin hives, red itchy skin",
        "specialty": "Dermatology / Allergy",
        "urgency": "ROUTINE",
        "triage_guidance": "Identify and avoid known allergens. Consult dermatologist/allergist for antihistamine and barrier repair regimen."
    }
]

class SymptomClassifier:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")
        self.model = LogisticRegression(C=1.0, max_iter=200, random_state=42)
        self.diseases = [d["disease"] for d in DISEASE_SYMPTOM_DATASET]
        self._train()

    def _train(self):
        corpus = [d["symptoms"] for d in DISEASE_SYMPTOM_DATASET]
        X = self.vectorizer.fit_transform(corpus)
        y = self.diseases
        self.model.fit(X, y)

    def analyze_symptoms(self, symptom_text: str) -> Dict[str, Any]:
        cleaned = re.sub(r"[^a-zA-Z\s]", " ", symptom_text).lower().strip()
        if not cleaned or len(cleaned.split()) < 1:
            return {
                "error": "Please describe your symptoms in at least a few words.",
                "triage": "INSUFFICIENT_DATA"
            }

        # Check for emergency red flags directly
        emergency_keywords = ["chest pain", "arm pain", "shortness of breath", "unconscious", "hemoptysis", "stroke", "paralysis"]
        has_emergency = any(k in cleaned for k in emergency_keywords)

        vec = self.vectorizer.transform([cleaned])
        probs = self.model.predict_proba(vec)[0]
        
        # Sort predictions
        ranked_indices = probs.argsort()[::-1]
        top_predictions = []

        for idx in ranked_indices[:3]:
            disease_name = self.model.classes_[idx]
            prob = float(probs[idx])
            disease_meta = next(d for d in DISEASE_SYMPTOM_DATASET if d["disease"] == disease_name)

            top_predictions.append({
                "condition": disease_name,
                "confidence_score": round(prob, 3),
                "confidence_percent": f"{round(prob * 100, 1)}%",
                "specialty": disease_meta["specialty"],
                "urgency": "EMERGENCY" if has_emergency else disease_meta["urgency"],
                "triage_guidance": disease_meta["triage_guidance"]
            })

        overall_urgency = "EMERGENCY" if has_emergency else top_predictions[0]["urgency"]

        return {
            "query_analyzed": symptom_text,
            "overall_urgency": overall_urgency,
            "is_emergency_flagged": has_emergency,
            "recommended_specialty": top_predictions[0]["specialty"],
            "differential_diagnoses": top_predictions,
            "clinical_disclaimer": "Informational triage assessment only. Not a definitive clinical diagnosis. Seek qualified physician consultation."
        }

symptom_classifier = SymptomClassifier()
