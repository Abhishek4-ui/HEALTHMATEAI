import time
from typing import List, Dict, Any, Optional
from app.services.llm_gateway import LLMGateway
from app.services.clinical_rag import clinical_rag_grounder
from app.services.mlops_registry import mlops_registry
import logging

logger = logging.getLogger("healthmate.clinical_copilot")

# Validated Drug Interaction Knowledge Base (FDA, CDSCO & Lexicomp Clinical High-Risk Interactions)
DOCUMENTED_DRUG_INTERACTIONS = [
    {
        "pair": {"aspirin", "warfarin"},
        "severity": "CRITICAL",
        "mechanism": "Synergistic antiplatelet and anticoagulant effect.",
        "clinical_risk": "Significantly elevated risk of major internal gastrointestinal bleeding and hemorrhagic stroke.",
        "management": "Avoid co-administration unless specifically indicated with rigorous INR monitoring."
    },
    {
        "pair": {"sildenafil", "nitroglycerin"},
        "severity": "CRITICAL",
        "mechanism": "Synergistic cGMP accumulation causing profound systemic vasodilation.",
        "clinical_risk": "Severe refractory hypotension, syncope, and fatal myocardial infarction.",
        "management": "Absolute contraindication. Never administer PDE5 inhibitor with nitrates within 24-48 hours."
    },
    {
        "pair": {"fluoxetine", "tramadol"},
        "severity": "CRITICAL",
        "mechanism": "Combined serotonergic activity and CYP2D6 inhibition.",
        "clinical_risk": "High risk of Serotonin Syndrome (hyperthermia, autonomic instability, neuromuscular rigidity) and seizure.",
        "management": "Contraindicated. Select alternative non-serotonergic analgesic."
    },
    {
        "pair": {"atorvastatin", "clarithromycin"},
        "severity": "HIGH",
        "mechanism": "Clarithromycin strongly inhibits CYP3A4, dramatically elevating serum statin concentrations.",
        "clinical_risk": "Severe rhabdomyolysis, myopathy, and acute kidney injury.",
        "management": "Temporarily suspend atorvastatin during macrolide antibiotic therapy or switch to non-interacting antibiotic."
    },
    {
        "pair": {"metformin", "radiocontrast"},
        "severity": "HIGH",
        "mechanism": "Iodinated radiocontrast may induce acute renal dysfunction, leading to severe metformin accumulation.",
        "clinical_risk": "Metformin-associated lactic acidosis (MALA), a life-threatening metabolic emergency.",
        "management": "Withhold metformin prior to or at the time of procedure; resume only after 48h if eGFR remains stable."
    },
    {
        "pair": {"lisinopril", "spironolactone"},
        "severity": "HIGH",
        "mechanism": "Dual blockade of renin-angiotensin-aldosterone system with impaired potassium excretion.",
        "clinical_risk": "Severe life-threatening hyperkalemia and cardiac dysrhythmias.",
        "management": "Strictly monitor serum potassium and creatinine within 1 week of initiation and periodically."
    },
    {
        "pair": {"ibuprofen", "lisinopril"},
        "severity": "MODERATE",
        "mechanism": "NSAID inhibition of renal prostaglandins attenuates ACE inhibitor antihypertensive action.",
        "clinical_risk": "Risk of acute renal impairment and reduced blood pressure control.",
        "management": "Monitor serum creatinine, potassium, and blood pressure. Consider acetaminophen for mild analgesia."
    },
    {
        "pair": {"metformin", "prednisone"},
        "severity": "MODERATE",
        "mechanism": "Corticosteroids increase hepatic gluconeogenesis and induce peripheral insulin resistance.",
        "clinical_risk": "Hyperglycemia and diminished glycemic control in diabetic patients.",
        "management": "Increase blood glucose monitoring frequency; temporary antidiabetic dosage adjustment may be necessary."
    },
    {
        "pair": {"clopidogrel", "omeprazole"},
        "severity": "MODERATE",
        "mechanism": "Omeprazole competitively inhibits CYP2C19 bioactivation of clopidogrel.",
        "clinical_risk": "Decreased antiplatelet efficacy and increased risk of secondary cardiovascular ischemic events.",
        "management": "Consider pantoprazole or famotidine as gastroprotective agents with lower CYP2C19 affinity."
    }
]

class ClinicalCopilot:
    def __init__(self):
        self.gateway = LLMGateway()

    async def answer_patient_query(self, query: str, language: str = "en", history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        """
        Patient-facing AI Copilot with RAG evidence grounding and citation provenance.
        """
        start_time = time.time()
        # 1. Retrieve statutory clinical guidelines grounding
        rag_result = clinical_rag_grounder.retrieve_guidelines(query, top_k=2)

        evidence_text = ""
        if rag_result["is_grounded"]:
            evidence_text = "\n\nAUTHORITATIVE CLINICAL GUIDELINES GROUNDING:\n"
            for doc in rag_result["retrieved_evidence"]:
                evidence_text += f"[{doc['title']} ({doc['publisher']}, {doc['year']})]: {doc['excerpt']}\n"

        system_prompt = (
            "You are HealthMate AI Clinical Assistant, an empathetic, evidence-based healthcare intelligence guide. "
            "Follow these strict clinical rules:\n"
            "1. Base your answer strictly on the provided evidence and established medical guidelines.\n"
            "2. If red-flag emergency symptoms (severe chest pain, breathing difficulty, stroke signs, sudden paralysis) are mentioned, "
            "immediately advise dialing 112/108 or visiting the emergency room.\n"
            "3. State that you are an AI assistant providing informational guidance and cannot replace an in-person doctor.\n"
            f"4. Respond naturally in {language}.\n"
            f"{evidence_text}"
        )

        res = await self.gateway.generate_response(query, system_prompt=system_prompt, temperature=0.3)
        duration_ms = (time.time() - start_time) * 1000
        mlops_registry.record_inference("mdl_clinical_rag_v1", duration_ms)

        return {
            "query": query,
            "response": res.get("content", ""),
            "provider": res.get("provider", "openrouter"),
            "model": res.get("model", ""),
            "fallback_used": res.get("fallback_used", False),
            "is_rag_grounded": rag_result["is_grounded"],
            "citations": rag_result["citations"],
            "grounding_safeguard": rag_result["hallucination_safeguard"],
            "disclaimer": "AI guidance is for informational awareness only and must not replace professional clinical diagnosis or doctor consultation."
        }

    async def generate_soap_note(self, consultation_text: str, patient_info: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Doctor-facing Copilot: Synthesizes standardized SOAP notes.
        Enforces strict Doctor Approval Workflow: Output is marked as DRAFT and requires doctor signature.
        """
        system_prompt = (
            "You are HealthMate AI Clinical Scribe. Analyze the provided clinical notes/dialogue and synthesize "
            "a formal, standardized medical SOAP note with exactly these four sections:\n"
            "- SUBJECTIVE: Chief complaint, history of present illness, onset, duration, patient-reported symptoms.\n"
            "- OBJECTIVE: Observable clinical findings, vital signs, physical exam notes, lab/diagnostic data.\n"
            "- ASSESSMENT: Differential diagnosis, clinical reasoning, stability assessment.\n"
            "- PLAN: Diagnostic workup, pharmacological interventions, lifestyle advice, follow-up timeline.\n"
            "Be precise, concise, and professional."
        )

        prompt = f"Patient Context: {patient_info or {}}\nConsultation Dialogue / Raw Notes:\n{consultation_text}"
        res = await self.gateway.generate_response(prompt, system_prompt=system_prompt, temperature=0.1)

        raw_soap = res.get("content", "")

        return {
            "soap_summary": raw_soap,
            "approval_status": "DRAFT_REQUIRES_DOCTOR_AUTHORIZATION",
            "is_finalized": False,
            "doctor_signoff_required": True,
            "provider": res.get("provider", "openrouter"),
            "model": res.get("model", ""),
            "is_synthesized": True,
            "clinical_governance_notice": (
                "AI-synthesized clinical draft. Mandatory medical review and digital sign-off by a licensed "
                "medical practitioner is required before this note is committed to the permanent electronic health record."
            )
        }

    def check_drug_interactions(self, medications: List[str]) -> Dict[str, Any]:
        """
        Clinical Pharmacovigilance: Cross-checks proposed drug list against high-risk contraindications
        """
        normalized = [m.lower().strip() for m in medications]
        detected_interactions = []

        for i in range(len(normalized)):
            for j in range(i + 1, len(normalized)):
                m1, m2 = normalized[i], normalized[j]
                for rule in DOCUMENTED_DRUG_INTERACTIONS:
                    pair = rule["pair"]
                    match1 = any(drug in m1 for drug in pair)
                    match2 = any(drug in m2 for drug in pair)
                    if match1 and match2 and m1 != m2:
                        detected_interactions.append({
                            "medication_1": m1.title(),
                            "medication_2": m2.title(),
                            "severity": rule["severity"],
                            "clinical_risk": rule["clinical_risk"],
                            "management": rule["management"],
                        })

        has_critical = any(d["severity"] == "CRITICAL" for d in detected_interactions)
        has_high = any(d["severity"] == "HIGH" for d in detected_interactions)
        has_warnings = len(detected_interactions) > 0

        safety_status = "CONTRAINDICATED" if has_critical else ("HIGH_RISK" if has_high else ("WARNING" if has_warnings else "SAFE"))

        return {
            "medications_checked": medications,
            "interaction_count": len(detected_interactions),
            "interactions": detected_interactions,
            "has_critical_interaction": has_critical,
            "safety_status": safety_status,
            "clinical_guidance": (
                "Critical pharmacological contraindication detected. Do not prescribe together without senior specialist clearance."
                if has_critical else
                ("High-risk drug interaction detected. Close clinical and laboratory monitoring mandatory."
                 if has_high else
                 ("Interaction warnings detected. Monitor clinical markers." if has_warnings else "No critical drug-drug interactions detected among evaluated medications."))
            )
        }

clinical_copilot = ClinicalCopilot()
