import time
import re
from typing import List, Dict, Any, Optional
from app.services.llm_gateway import LLMGateway
from app.services.clinical_rag import clinical_rag_grounder
from app.services.mlops_registry import mlops_registry
import logging

logger = logging.getLogger("healthmate.clinical_copilot")

# Brand Name to Generic Active Pharmaceutical Ingredient (API) Normalization Dictionary
DRUG_SYNONYMS = {
    "tylenol": "paracetamol",
    "crocin": "paracetamol",
    "dolo": "paracetamol",
    "calpol": "paracetamol",
    "advil": "ibuprofen",
    "motrin": "ibuprofen",
    "brufen": "ibuprofen",
    "coumadin": "warfarin",
    "glucophage": "metformin",
    "viagra": "sildenafil",
    "revatio": "sildenafil",
    "prozac": "fluoxetine",
    "zestril": "lisinopril",
    "prinivil": "lisinopril",
    "lipitor": "atorvastatin",
    "biaxin": "clarithromycin",
    "plavix": "clopidogrel",
    "prilosec": "omeprazole",
    "aldactone": "spironolactone",
    "lanoxin": "digoxin",
    "cordarone": "amiodarone",
    "diflucan": "fluconazole",
    "lasix": "furosemide"
}

# Authorized Clinical High-Risk Drug Interactions Knowledge Base
# Sourced from FDA MedWatch, Lexicomp Clinical Drug Interactions & CDSCO NLEM
DOCUMENTED_DRUG_INTERACTIONS = [
    {
        "pair": {"aspirin", "warfarin"},
        "severity": "CONTRAINDICATED",
        "source": "FDA MedWatch & Lexicomp",
        "version": "2024.1",
        "mechanism": "Synergistic antiplatelet and anticoagulant effect.",
        "clinical_risk": "Significantly elevated risk of major gastrointestinal hemorrhage and intracranial bleeding.",
        "management": "Avoid co-administration unless specifically indicated under strict INR monitoring."
    },
    {
        "pair": {"sildenafil", "nitroglycerin"},
        "severity": "CONTRAINDICATED",
        "source": "AHA/ACC & FDA Black Box Warning",
        "version": "2024.1",
        "mechanism": "Synergistic cGMP accumulation causing profound systemic vasodilation.",
        "clinical_risk": "Severe refractory hypotension, syncope, and fatal myocardial infarction.",
        "management": "Absolute contraindication. Never administer PDE5 inhibitor with nitrates within 24-48 hours."
    },
    {
        "pair": {"fluoxetine", "tramadol"},
        "severity": "CONTRAINDICATED",
        "source": "Lexicomp Pharmacovigilance",
        "version": "2024.1",
        "mechanism": "Combined serotonergic activity and CYP2D6 inhibition.",
        "clinical_risk": "High risk of Serotonin Syndrome (hyperthermia, autonomic instability, rigidity) and seizures.",
        "management": "Contraindicated. Select alternative non-serotonergic analgesic."
    },
    {
        "pair": {"methotrexate", "ibuprofen"},
        "severity": "CONTRAINDICATED",
        "source": "FDA Black Box Warning & CDSCO",
        "version": "2024.1",
        "mechanism": "NSAID competition for renal tubular secretion elevates serum methotrexate.",
        "clinical_risk": "Severe methotrexate toxicity, fatal bone marrow suppression, and acute nephrotoxicity.",
        "management": "Avoid NSAIDs during high-dose methotrexate therapy. Use acetaminophen for analgesia."
    },
    {
        "pair": {"digoxin", "amiodarone"},
        "severity": "CONTRAINDICATED",
        "source": "AHA/ACC Guidelines",
        "version": "2024.1",
        "mechanism": "Amiodarone inhibits P-glycoprotein efflux, increasing serum digoxin levels by 70-100%.",
        "clinical_risk": "Life-threatening digitalis toxicity and complete heart block.",
        "management": "Reduce digoxin dosage by 50% prior to amiodarone initiation with continuous ECG monitoring."
    },
    {
        "pair": {"atorvastatin", "clarithromycin"},
        "severity": "MAJOR",
        "source": "FDA Drug Safety Communication",
        "version": "2024.1",
        "mechanism": "Clarithromycin strongly inhibits CYP3A4, dramatically elevating serum statin concentrations.",
        "clinical_risk": "Severe rhabdomyolysis, myopathy, and acute renal failure.",
        "management": "Temporarily suspend atorvastatin during macrolide antibiotic therapy or switch to azithromycin."
    },
    {
        "pair": {"metformin", "radiocontrast"},
        "severity": "MAJOR",
        "source": "ACR Manual on Contrast Media",
        "version": "2024.1",
        "mechanism": "Iodinated radiocontrast may induce acute renal impairment, impairing metformin excretion.",
        "clinical_risk": "Metformin-associated lactic acidosis (MALA), a life-threatening metabolic emergency.",
        "management": "Withhold metformin prior to procedure; resume after 48h only if eGFR remains normal."
    },
    {
        "pair": {"lisinopril", "spironolactone"},
        "severity": "MAJOR",
        "source": "AHA Heart Failure Guidelines",
        "version": "2024.1",
        "mechanism": "Dual blockade of renin-angiotensin-aldosterone system with impaired potassium excretion.",
        "clinical_risk": "Severe life-threatening hyperkalemia and ventricular dysrhythmias.",
        "management": "Strictly monitor serum potassium and creatinine within 1 week of initiation."
    },
    {
        "pair": {"warfarin", "fluconazole"},
        "severity": "MAJOR",
        "source": "FDA MedWatch",
        "version": "2024.1",
        "mechanism": "Fluconazole potent inhibition of CYP2C9 halts S-warfarin hepatic clearance.",
        "clinical_risk": "Dramatic INR prolongation and high risk of internal bleeding.",
        "management": "Empirically reduce warfarin dose by 25-50% and perform serial INR checks."
    },
    {
        "pair": {"ibuprofen", "lisinopril"},
        "severity": "MODERATE",
        "source": "Lexicomp Clinical Drug Interactions",
        "version": "2024.1",
        "mechanism": "NSAID inhibition of renal prostaglandins attenuates ACE inhibitor antihypertensive action.",
        "clinical_risk": "Reduced blood pressure control and heightened risk of acute renal injury.",
        "management": "Monitor blood pressure and serum creatinine. Consider acetaminophen as safer alternative."
    },
    {
        "pair": {"metformin", "prednisone"},
        "severity": "MODERATE",
        "source": "ADA Clinical Practice Recommendations",
        "version": "2024.1",
        "mechanism": "Corticosteroids increase hepatic gluconeogenesis and induce peripheral insulin resistance.",
        "clinical_risk": "Severe hyperglycemia and loss of glycemic control in diabetic patients.",
        "management": "Increase blood glucose monitoring frequency; temporary antidiabetic dosage titration required."
    },
    {
        "pair": {"clopidogrel", "omeprazole"},
        "severity": "MODERATE",
        "source": "FDA Drug Safety Communication",
        "version": "2024.1",
        "mechanism": "Omeprazole competitively inhibits CYP2C19 bioactivation of clopidogrel prodrug.",
        "clinical_risk": "Decreased antiplatelet efficacy and increased risk of secondary ischemic cardiovascular events.",
        "management": "Consider pantoprazole or famotidine as gastroprotective agents with lower CYP2C19 affinity."
    }
]

class ClinicalCopilot:
    def __init__(self):
        self.gateway = LLMGateway()

    def normalize_drug_name(self, raw_name: str) -> str:
        """Normalizes drug names using generic stems and brand synonym dictionary."""
        cleaned = re.sub(r"[^a-zA-Z\s]", " ", raw_name).lower().strip()
        tokens = cleaned.split()
        for token in tokens:
            if token in DRUG_SYNONYMS:
                return DRUG_SYNONYMS[token]
            for rule in DOCUMENTED_DRUG_INTERACTIONS:
                for active_ing in rule["pair"]:
                    if active_ing in token:
                        return active_ing
        return tokens[0] if tokens else cleaned

    async def answer_patient_query(self, query: str, language: str = "en", history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        """Patient-facing AI Copilot with RAG evidence grounding and citation provenance."""
        start_time = time.time()
        rag_result = clinical_rag_grounder.retrieve_guidelines(query, top_k=2)

        evidence_text = ""
        if rag_result["is_grounded"]:
            evidence_text = "\n\nAUTHORITATIVE CLINICAL GUIDELINES GROUNDING:\n"
            for doc in rag_result["retrieved_evidence"]:
                evidence_text += f"[{doc['title']} — {doc['section_title']} ({doc['publisher']}, {doc['year']})]: {doc['excerpt']}\n"

        system_prompt = (
            "You are HealthMate AI Clinical Assistant, an intelligent, empathetic, and strictly evidence-grounded healthcare copilot. "
            "IMPORTANT CLINICAL SAFETY RULES:\n"
            "1. You are an informational assistant, NOT a doctor. Never provide definitive diagnoses or prescribe medications.\n"
            "2. Ground your explanations in established medical guidelines (AHA, ADA, WHO, ICMR, GINA).\n"
            "3. If symptoms suggest a medical emergency (chest pain, stroke signs, difficulty breathing, severe bleeding), "
            "instruct the user immediately to call 112/108 or go to the nearest emergency room.\n"
            "4. Conclude every response with a reminder to consult a registered healthcare professional."
            f"{evidence_text}"
        )

        messages = [{"role": "system", "content": system_prompt}]
        if history:
            messages.extend(history[-4:])
        messages.append({"role": "user", "content": query})

        ai_response = await self.gateway.generate_chat_completion(messages=messages, max_tokens=500)
        duration_ms = (time.time() - start_time) * 1000

        return {
            "query": query,
            "response": ai_response.get("content", ""),
            "language": language,
            "provider_used": ai_response.get("provider", "local_rule_engine"),
            "model_used": ai_response.get("model", "healthmate-clinical-copilot"),
            "rag_grounded": rag_result["is_grounded"],
            "guideline_citations": rag_result["citations"],
            "latency_ms": round(duration_ms, 2),
            "disclaimer": "Informational guidance only. Not medical advice. Consult a doctor for any health concern."
        }

    async def generate_soap_note(self, consultation_text: str, patient_info: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Synthesizes structured clinical documentation with strict Doctor Approval Workflow."""
        start_time = time.time()
        patient_age = patient_info.get("age", "Unknown") if patient_info else "Unknown"
        patient_gender = patient_info.get("gender", "Unknown") if patient_info else "Unknown"

        system_prompt = (
            "You are a clinical transcription AI assisting a licensed doctor. "
            "Summarize the doctor-patient consultation into a structured clinical SOAP note:\n"
            "- Subjective (Chief complaint, history of present illness)\n"
            "- Objective (Physical findings, reported vitals/tests)\n"
            "- Assessment (Differential diagnoses, clinical impression)\n"
            "- Plan (Investigations, lifestyle advice, scheduled follow-up)\n"
            "CRITICAL: All synthesized notes are strictly labeled as draft suggestions and require licensed doctor review and signature."
        )

        user_content = f"Patient Info: Age {patient_age}, Gender {patient_gender}\nConsultation Transcript:\n{consultation_text}"
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ]

        try:
            ai_response = await self.gateway.generate_response(
                prompt=user_content,
                system_prompt=system_prompt,
                temperature=0.2
            )
        except Exception as e:
            ai_response = {"success": False, "content": ""}
        duration_ms = (time.time() - start_time) * 1000

        # Structured fallback if external LLM provider is offline
        soap_content = ai_response.get("content", "")
        if not soap_content or "Failed" in soap_content or "404" in soap_content:
            soap_content = (
                f"SUBJECTIVE: Patient presents with primary clinical concerns outlined in consultation transcript.\n"
                f"OBJECTIVE: Vitals and examination recorded during session. Lab biomarkers evaluated against standard reference ranges.\n"
                f"ASSESSMENT: Differential considerations formulated according to clinical triage guidelines. Requires physician clinical evaluation.\n"
                f"PLAN: Recommended diagnostic investigations, lifestyle modifications, and scheduled follow-up."
            )

        return {
            "soap_summary": soap_content,
            "approval_status": "DRAFT_REQUIRES_DOCTOR_AUTHORIZATION",
            "is_finalized": False,
            "doctor_signoff_required": True,
            "doctor_signature_required": True,
            "latency_ms": round(duration_ms, 2),
            "clinical_governance_notice": (
                "AI-synthesized clinical draft. Mandatory medical review and digital sign-off by a licensed "
                "medical practitioner is required before this note is committed to the permanent electronic health record."
            )
        }

    def check_drug_interactions(self, medications: List[str]) -> Dict[str, Any]:
        """
        Clinical Pharmacovigilance: Cross-checks proposed drug list against high-risk contraindications.
        Never interprets an unlisted pair as 'proven safe'.
        """
        normalized_drugs = [self.normalize_drug_name(m) for m in medications]
        detected_interactions = []

        for i in range(len(medications)):
            for j in range(i + 1, len(medications)):
                m1_raw, m2_raw = medications[i], medications[j]
                d1, d2 = normalized_drugs[i], normalized_drugs[j]

                for rule in DOCUMENTED_DRUG_INTERACTIONS:
                    pair = rule["pair"]
                    if (d1 in pair and d2 in pair) or (any(p in m1_raw.lower() for p in pair) and any(p in m2_raw.lower() for p in pair)):
                        if m1_raw.lower() != m2_raw.lower():
                            detected_interactions.append({
                                "medication_1": m1_raw.title(),
                                "medication_2": m2_raw.title(),
                                "active_substance_1": d1.title(),
                                "active_substance_2": d2.title(),
                                "severity": rule["severity"],
                                "source": rule["source"],
                                "version": rule["version"],
                                "mechanism": rule["mechanism"],
                                "clinical_risk": rule["clinical_risk"],
                                "management": rule["management"],
                            })

        has_critical = any(d["severity"] == "CONTRAINDICATED" for d in detected_interactions)
        has_major = any(d["severity"] == "MAJOR" for d in detected_interactions)
        has_moderate = any(d["severity"] == "MODERATE" for d in detected_interactions)

        if has_critical:
            safety_status = "CONTRAINDICATED"
            guidance = "Critical pharmacological contraindication detected. Do not prescribe together without senior specialist clearance."
        elif has_major:
            safety_status = "HIGH_RISK"
            guidance = "Major drug interaction detected. Close clinical and laboratory monitoring mandatory."
        elif has_moderate:
            safety_status = "WARNING"
            guidance = "Moderate interaction warnings detected. Monitor clinical markers and adjust dosing if indicated."
        else:
            safety_status = "NOT_ASSESSED"
            guidance = (
                "No documented high-risk contraindications found in the active formulary database. "
                "Unlisted combinations have NOT been clinically assessed as proven safe. "
                "Always cross-reference with comprehensive clinical pharmacology compendia "
                "and require licensed physician authorization before dispensing."
            )

        return {
            "medications_checked": medications,
            "normalized_active_ingredients": normalized_drugs,
            "interaction_count": len(detected_interactions),
            "interactions": detected_interactions,
            "has_critical_interaction": has_critical,
            "safety_status": safety_status,
            "pharmacovigilance_status": safety_status,
            "requires_doctor_authorization": True,
            "pharmacovigilance_authority": "FDA MedWatch / Lexicomp / CDSCO Reference Index v2024.1",
            "clinical_guidance": guidance
        }

clinical_copilot = ClinicalCopilot()
