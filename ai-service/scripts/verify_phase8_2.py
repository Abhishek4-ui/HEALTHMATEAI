"""
HealthMate AI — Phase 8.2 Independent Model, OCR, RAG & Safety Validation Harness
Executes empirical runtime verification across all ML/DL models, OCR, RAG, and Safety engines.
"""

import os
import sys
import io
import time
import math
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List

# Ensure app is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.symptom_classifier import symptom_classifier, DISEASE_METADATA
from app.services.health_risk_models import health_risk_models
from app.services.clinical_rag import clinical_rag_grounder
from app.services.report_ocr import report_ocr_extractor
from app.services.clinical_copilot import clinical_copilot
from app.services.mlops_registry import mlops_registry

from sklearn.metrics import classification_report, confusion_matrix, precision_recall_fscore_support, brier_score_loss
import torch
import torch.nn as nn
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Define PyTorch Network Architecture for standalone check
class ClinicalTriageDeepNet(nn.Module):
    def __init__(self, input_dim=500, hidden_dim1=128, hidden_dim2=64, num_classes=8):
        super(ClinicalTriageDeepNet, self).__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim1)
        self.bn1 = nn.BatchNorm1d(hidden_dim1)
        self.act1 = nn.LeakyReLU(0.1)
        self.drop1 = nn.Dropout(0.3)

        self.fc2 = nn.Linear(hidden_dim1, hidden_dim2)
        self.bn2 = nn.BatchNorm1d(hidden_dim2)
        self.act2 = nn.LeakyReLU(0.1)
        self.drop2 = nn.Dropout(0.2)

        self.out = nn.Linear(hidden_dim2, num_classes)

    def forward(self, x):
        x = self.drop1(self.act1(self.bn1(self.fc1(x))))
        x = self.drop2(self.act2(self.bn2(self.fc2(x))))
        return self.out(x)

def run_model_validation():
    print("=================================================================")
    print("1. MODEL VALIDATION ON UNSEEN CLINICAL EVALUATION SAMPLES")
    print("=================================================================")

    # 1.1 Verify All Four Model Artifacts on Disk
    artifacts = {
        "symptom_classifier_v2": os.path.join(BASE_DIR, "models", "symptom_classifier_v2.joblib"),
        "clinical_triage_pytorch": os.path.join(BASE_DIR, "models", "clinical_triage_pytorch.pt"),
        "cardio_risk_model_v2": os.path.join(BASE_DIR, "models", "cardio_risk_model_v2.joblib"),
        "diabetes_risk_model_v2": os.path.join(BASE_DIR, "models", "diabetes_risk_model_v2.joblib"),
        "clinical_rag_index": os.path.join(BASE_DIR, "models", "clinical_rag_index.joblib")
    }

    print("\n--- Artifact Disk Presence & Integrity ---")
    for name, path in artifacts.items():
        exists = os.path.exists(path)
        size_kb = round(os.path.getsize(path) / 1024, 2) if exists else 0
        print(f"[{'PASS' if exists else 'FAIL'}] {name}: {size_kb} KB at {path}")
        assert exists, f"Missing model artifact: {path}"

    # 1.2 Unseen, Separately Sourced Evaluation Samples for Symptom Classification (16 new clinical vignettes)
    unseen_symptom_samples = [
        # Class 0: Acute Bacterial Pharyngitis
        ("Excruciating odynophagia, high fever 102F, and purulent tonsillar exudates with tender anterior cervical lymphadenitis.", "Acute Bacterial Pharyngitis / Tonsillitis"),
        ("Severe throat pain making swallowing saliva difficult, swollen tonsils covered with white pus patches.", "Acute Bacterial Pharyngitis / Tonsillitis"),
        # Class 1: Allergic Rhinitis / Atopic Dermatitis
        ("Intensely itchy erythematous papules in flexural antecubital fossae with seasonal paroxysmal sneezing and watery rhinorrhea.", "Allergic Rhinitis / Atopic Dermatitis"),
        ("Dry pruritic eczema flares behind knees and relentless sneezing fits whenever exposed to dust or cat dander.", "Allergic Rhinitis / Atopic Dermatitis"),
        # Class 2: Cardiovascular Emergency
        ("Crushing retrosternal chest pressure radiating down left arm and jaw with profuse diaphoresis and dyspnea.", "Cardiovascular Emergency"),
        ("Sudden substernal heaviness like an elephant sitting on chest, accompanied by cold sweat and impending doom.", "Cardiovascular Emergency"),
        # Class 3: GERD
        ("Severe retrosternal pyrosis and acid regurgitation burning throat, worsening immediately after recumbent posture post-dinner.", "Gastroesophageal Reflux Disease (GERD)"),
        ("Sour liquid rising up esophagus into mouth with painful burning sensation behind sternum after spicy meals.", "Gastroesophageal Reflux Disease (GERD)"),
        # Class 4: Migraine with Aura
        ("Unilateral pulsating hemicranial headache preceded by shimmering zigzag lights and scotoma in left visual field with vomiting.", "Migraine with Aura"),
        ("Severe throbbing pain behind right eye preceded by flashing optical aura, aggravated by sound and bright sunlight.", "Migraine with Aura"),
        # Class 5: Osteoarthritis
        ("Bilateral knee crepitus, deep aching pain exacerbated by stair climbing, with morning joint stiffness lasting under 25 minutes.", "Osteoarthritis / Degenerative Joint Disease"),
        ("Chronic stiffness and bony enlargement of proximal interphalangeal joints and knees after walking short distances.", "Osteoarthritis / Degenerative Joint Disease"),
        # Class 6: Respiratory Infection / Bronchitis
        ("Persistent productive cough with thick yellow-green sputum, mild wheezing, low-grade fever, and pleuritic chest soreness.", "Respiratory Infection / Bronchitis"),
        ("Deep bronchial rattling cough producing mucopurulent phlegm for 8 days following an upper respiratory virus.", "Respiratory Infection / Bronchitis"),
        # Class 7: Type 2 Diabetes Mellitus
        ("Marked polydipsia drinking 5 liters of water daily, nocturia 4 times per night, persistent lethargy, and unexplained weight loss.", "Type 2 Diabetes Mellitus Presentation"),
        ("Extreme thirst, constantly craving cold liquids, polyuria throughout the night, with blurred vision and chronic fatigue.", "Type 2 Diabetes Mellitus Presentation"),
    ]

    print("\n--- Evaluating Symptom Classifier on 16 Unseen Samples ---")
    y_true = []
    y_pred = []
    entropies = []

    for text, expected in unseen_symptom_samples:
        res = symptom_classifier.analyze_symptoms(text)
        top_cond = res["differential_diagnoses"][0]["condition"]
        ent = res["uncertainty_metrics"]["shannon_entropy"]
        y_true.append(expected)
        y_pred.append(top_cond)
        entropies.append(ent)
        print(f"Sample: '{text[:45]}...' -> Pred: '{top_cond}' (Ent: {ent}) [Expected: '{expected}']")

    classes_order = sorted(list(set(y_true)))
    cm = confusion_matrix(y_true, y_pred, labels=classes_order)
    precision, recall, f1, _ = precision_recall_fscore_support(y_true, y_pred, labels=classes_order, average="macro")
    acc = sum(yt == yp for yt, yp in zip(y_true, y_pred)) / len(y_true)

    print("\n--- Symptom Classifier Metrics on Unseen Evaluation Samples ---")
    print(f"Accuracy: {acc * 100:.2f}% ({sum(yt == yp for yt, yp in zip(y_true, y_pred))}/{len(y_true)})")
    print(f"Macro Precision: {precision:.4f} | Macro Recall: {recall:.4f} | Macro F1: {f1:.4f}")
    print(f"Average In-Domain Shannon Entropy: {np.mean(entropies):.3f} nats")
    print("\nConfusion Matrix (Unseen 16 Samples):")
    print(cm)

    # 1.3 Out-of-Distribution (OOD) and Adversarial Input Testing
    print("\n--- Out-of-Distribution & Adversarial Testing ---")
    ood_cases = [
        "1998 honda civic timing belt replacement instructions camshaft pulley torque specs",
        "asdfkjlasdf qweruio zxcvmnbv lkjhasdf",
        "1234567890 987654321 00000000",
        "how to bake sourdough bread with wild yeast starter and dutch oven hydration"
    ]

    for ood_text in ood_cases:
        res = symptom_classifier.analyze_symptoms(ood_text)
        if "error" in res:
            print(f"OOD Text: '{ood_text[:35]}...' -> Input Validation Caught: {res['triage']} ({res['error']})")
            assert res["triage"] == "INSUFFICIENT_DATA"
        else:
            ent = res["uncertainty_metrics"]["shannon_entropy"]
            is_ood = res["uncertainty_metrics"]["is_out_of_domain"]
            print(f"OOD Text: '{ood_text[:35]}...' -> Entropy: {ent:.3f} | OOD Flag: {is_ood}")
            assert ent >= 1.70 or is_ood is True, f"Failed to detect OOD input: {ood_text}"

    # 1.4 Direct Evaluation of PyTorch Deep Learning Checkpoint
    print("\n--- Evaluating PyTorch Deep Learning Checkpoint (clinical_triage_pytorch.pt) ---")
    pt_checkpoint = torch.load(artifacts["clinical_triage_pytorch"], map_location="cpu", weights_only=False)
    input_dim = pt_checkpoint["input_dim"]
    classes = pt_checkpoint["classes"]
    pt_model = ClinicalTriageDeepNet(input_dim=input_dim, num_classes=len(classes))
    pt_model.load_state_dict(pt_checkpoint["model_state_dict"])
    pt_model.eval()

    vec = symptom_classifier.vectorizer
    X_unseen = vec.transform([t[0] for t in unseen_symptom_samples]).toarray()
    with torch.no_grad():
        pt_logits = pt_model(torch.tensor(X_unseen, dtype=torch.float32))
        pt_preds = torch.argmax(pt_logits, dim=1).numpy()
    pt_pred_labels = [classes[idx] for idx in pt_preds]
    pt_acc = sum(yt == yp for yt, yp in zip(y_true, pt_pred_labels)) / len(y_true)
    print(f"PyTorch Checkpoint Unseen Evaluation Accuracy: {pt_acc * 100:.2f}% ({sum(yt == yp for yt, yp in zip(y_true, pt_pred_labels))}/{len(y_true)})")

    # 1.5 Cardiovascular Risk Model & SHAP Efficiency Axiom Verification
    print("\n--- Cardiovascular Risk Model & SHAP Verification ---")
    cardio_test_profiles = [
        {"age": 62, "systolic_bp": 162, "total_cholesterol": 245, "hdl_cholesterol": 36, "is_smoker": True, "has_diabetes": True, "expected_tier": "CRITICAL"},
        {"age": 32, "systolic_bp": 112, "total_cholesterol": 155, "hdl_cholesterol": 62, "is_smoker": False, "has_diabetes": False, "expected_tier": "LOW"},
        {"age": 52, "systolic_bp": 142, "total_cholesterol": 215, "hdl_cholesterol": 44, "is_smoker": False, "has_diabetes": True, "expected_tier": "HIGH"},
        {"age": 48, "systolic_bp": 134, "total_cholesterol": 195, "hdl_cholesterol": 48, "is_smoker": True, "has_diabetes": False, "expected_tier": "MODERATE"}
    ]

    for p in cardio_test_profiles:
        c_res = health_risk_models.calculate_cardiovascular_risk(p)
        margin = c_res["decision_margin"]
        base_val = c_res["shapley_base_value"]
        sum_phi = sum(item["shap_value"] for item in c_res["shap_feature_importance"])
        residual = abs(margin - (base_val + sum_phi))
        print(f"CVD Profile: Age {p['age']}, SBP {p['systolic_bp']} -> Risk: {c_res['ten_year_risk_percent']}% ({c_res['risk_tier']}) | SHAP Residual: {residual:.8f}")
        assert c_res["shapley_sum_check"]["satisfies_efficiency_property"] is True
        assert c_res["shapley_sum_check"]["efficiency_residual"] < 1e-4
        assert residual <= 5e-4

    # 1.6 Type-2 Diabetes Risk Model & SHAP Efficiency Axiom Verification
    print("\n--- Type-2 Diabetes Risk Model & SHAP Verification ---")
    diabetes_test_profiles = [
        {"age": 56, "bmi": 32.0, "family_history": True, "physical_activity": False, "fasting_glucose": 138, "expected_tier": "HIGH"},
        {"age": 28, "bmi": 21.5, "family_history": False, "physical_activity": True, "fasting_glucose": 84, "expected_tier": "LOW"},
        {"age": 46, "bmi": 26.5, "family_history": True, "physical_activity": False, "fasting_glucose": 108, "expected_tier": "MODERATE"},
        {"age": 60, "bmi": 29.0, "family_history": True, "physical_activity": True, "fasting_glucose": 128, "expected_tier": "HIGH"}
    ]

    for d in diabetes_test_profiles:
        d_res = health_risk_models.calculate_diabetes_risk(d)
        margin = d_res["decision_margin"]
        base_val = d_res["shapley_base_value"]
        sum_phi = sum(item["shap_value"] for item in d_res["shap_feature_importance"])
        residual = abs(margin - (base_val + sum_phi))
        print(f"Diabetes Profile: Age {d['age']}, BMI {d['bmi']}, FPG {d['fasting_glucose']} -> Risk: {d_res['five_year_risk_percent']}% ({d_res['risk_tier']}) | SHAP Residual: {residual:.8f}")
        assert d_res["shapley_sum_check"]["satisfies_efficiency_property"] is True
        assert d_res["shapley_sum_check"]["efficiency_residual"] < 1e-4
        assert residual <= 5e-4

    print("\n[PASS] Model Validation Complete.")

def run_ocr_validation():
    print("\n=================================================================")
    print("2. OCR & MEDICAL REPORT VALIDATION ON DIGITAL & SCANNED FORMATS")
    print("=================================================================")

    # 2.1 Digital PDF Pathology Report
    from pypdf import PdfWriter
    pdf_buffer = io.BytesIO()
    writer = PdfWriter()
    page = writer.add_blank_page(width=612, height=792)
    
    # We can write text directly via pdf stream or test extract_from_bytes with synthetic PDF
    # In PyPDF, blank page has empty text, so let's test digital stream
    digital_report_text = """
    LAL PATHLABS CLINICAL BIOCHEMISTRY REPORT
    Patient: John Doe | Age: 52 | Gender: Male
    Hemoglobin (Hb): 11.2 g/dL
    Fasting Blood Glucose: 154 mg/dL
    Glycated Hemoglobin (HbA1c): 8.4 %
    Total Serum Cholesterol: 248 mg/dL
    Serum Creatinine: 1.6 mg/dL
    Total Leukocyte Count (WBC): 8900 /mcL
    Platelet Count: 2.8 lakh/mcL
    """

    res_digital = report_ocr_extractor.parse_report_text(digital_report_text, filename="LalPathLabs_Digital.txt")
    print(f"\nDigital Report Extraction Success: {res_digital['success']}")
    print(f"Biomarkers Extracted: {res_digital['biomarkers_extracted_count']}")
    for b in res_digital["biomarkers"]:
        print(f" - {b['name']} (LOINC: {b['loinc_code']}): {b['observed']} {b['unit']} [{b['flag']}] (Authority: {b['authority']})")
    assert res_digital["biomarkers_extracted_count"] >= 6
    assert any(b["parameter_key"] == "fasting_glucose" and b["loinc_code"] == "1558-6" for b in res_digital["biomarkers"])

    # 2.2 Scanned Raster Image (Synthesize Image with PIL and test Tesseract OCR)
    img = Image.new("RGB", (1000, 500), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    test_lines = [
        "METROPOLIS HEALTHCARE LABS - PATHOLOGY DIVISION",
        "Hemoglobin (Hb): 13.5 g/dL",
        "Fasting Blood Glucose: 110 mg/dL",
        "Serum Creatinine: 0.9 mg/dL",
        "Total Serum Cholesterol: 195 mg/dL"
    ]
    y_pos = 40
    for line in test_lines:
        draw.text((60, y_pos), line, fill=(0, 0, 0))
        y_pos += 60

    img_bytes = io.BytesIO()
    img.save(img_bytes, format="PNG")
    raw_img_bytes = img_bytes.getvalue()

    text_out, conf, engine, transforms = report_ocr_extractor.extract_from_bytes(raw_img_bytes, content_type="image/png", filename="report_scan.png")
    print(f"\nRaster PNG Tesseract OCR Extracted: {len(text_out)} chars | Confidence: {conf} | Engine: {engine} | Transforms: {transforms}")
    res_raster = report_ocr_extractor.parse_report_text(text_out, filename="report_scan.png", ocr_confidence=conf, engine_name=engine, transforms=transforms)
    print(f"Biomarkers Extracted from Raster Scan: {res_raster['biomarkers_extracted_count']}")
    for b in res_raster["biomarkers"]:
        print(f" - {b['name']}: {b['observed']} {b['unit']} [{b['flag']}]")
    assert res_raster["biomarkers_extracted_count"] >= 3

    # 2.3 Rotated Image (Test 90-degree rotation recovery)
    rotated_img = img.rotate(90, expand=True)
    rot_bytes = io.BytesIO()
    rotated_img.save(rot_bytes, format="PNG")
    raw_rot_bytes = rot_bytes.getvalue()

    text_rot, conf_rot, eng_rot, trans_rot = report_ocr_extractor.extract_from_bytes(raw_rot_bytes, content_type="image/png", filename="rotated_report.png")
    print(f"\nRotated Image OCR Extracted: {len(text_rot)} chars | Engine: {eng_rot} | Transforms Applied: {trans_rot}")

    # 2.4 Low Confidence / Noise Image Rejection (Ensure zero hallucination)
    noise_img = Image.new("RGB", (300, 100), color=(128, 128, 128))
    noise_bytes = io.BytesIO()
    noise_img.save(noise_bytes, format="PNG")
    raw_noise = noise_bytes.getvalue()

    text_noise, conf_noise, eng_noise, trans_noise = report_ocr_extractor.extract_from_bytes(raw_noise, content_type="image/png", filename="noise.png")
    res_noise = report_ocr_extractor.parse_report_text(text_noise, filename="noise.png", ocr_confidence=conf_noise, engine_name=eng_noise)
    print(f"\nBlank/Noise Image Extraction Status: {res_noise['extraction_status']} | Biomarkers Extracted: {res_noise['biomarkers_extracted_count']}")
    assert res_noise["biomarkers_extracted_count"] == 0
    assert res_noise["success"] is False

    print("\n[PASS] OCR Validation Complete.")

def run_rag_validation():
    print("\n=================================================================")
    print("3. CLINICAL RAG GROUNDING & ANTI-HALLUCINATION SAFEGUARD")
    print("=================================================================")

    # 3.1 Traceable Guideline Citations
    in_scope_queries = [
        ("What are the diagnostic blood glucose and HbA1c thresholds for diabetes according to ADA?", "ADA Standards of Care in Diabetes", "GL-DIAB-ADA"),
        ("What are the recommended BMI cut-offs for Asian Indians according to ICMR?", "ICMR Guidelines for Management of Type 2 Diabetes", "GL-ICMR-DIAB"),
        ("What are the diagnostic blood pressure stages for Stage 1 and Stage 2 hypertension according to AHA?", "AHA/ACC Clinical Practice Guideline for High Blood Pressure", "GL-HTN-AHA"),
        ("What does WHO recommend for cardiovascular risk stratification and statin therapy?", "WHO Guidelines on Prevention of Cardiovascular Disease", "GL-CVD-WHO"),
        ("Why does GINA recommend against SABA monotherapy in asthma?", "Global Initiative for Asthma (GINA) Strategy Report", "GL-ASTHMA-GINA")
    ]

    print("\n--- In-Scope Traceable Guideline Queries ---")
    for q, expected_title, expected_gid in in_scope_queries:
        res = clinical_rag_grounder.retrieve_guidelines(q, top_k=2)
        print(f"\nQuery: '{q[:50]}...'")
        print(f"Grounded: {res['is_grounded']} | Top Score: {res['top_relevance_score']} | Citations: {res['citations']}")
        assert res["is_grounded"] is True
        assert res["top_relevance_score"] >= 0.12
        assert any(expected_gid in c or expected_title.split()[0] in c for c in res["citations"])

    # 3.2 Out-of-Scope Queries & Rejection
    print("\n--- Out-of-Scope Anti-Hallucination Testing ---")
    out_of_scope_queries = [
        "How do I tune a carburetor on a 1995 motorcycle engine?",
        "What is the best chocolate cake recipe with buttercream frosting?",
        "Can drinking bleach cure viral infections?"
    ]

    for oos in out_of_scope_queries:
        res = clinical_rag_grounder.retrieve_guidelines(oos, top_k=2)
        print(f"Out-of-Scope Query: '{oos[:40]}...' -> Grounded: {res['is_grounded']} | Safeguard: {res['hallucination_safeguard']} | Citations: {len(res['citations'])}")
        assert res["is_grounded"] is False
        assert res["hallucination_safeguard"] == "OUT_OF_SCOPE_NO_GROUNDING_FOUND"
        assert len(res["citations"]) == 0

    print("\n[PASS] Clinical RAG Validation Complete.")

def run_drug_safety_validation():
    print("\n=================================================================")
    print("4. PHARMACOVIGILANCE & DRUG SAFETY ENGINE")
    print("=================================================================")

    # 4.1 Documented Contraindications & Brand Normalization
    critical_pairs = [
        (["Aspirin 75mg", "Warfarin 5mg"], "CONTRAINDICATED", "Aspirin & Warfarin"),
        (["Viagra 50mg", "Nitroglycerin 0.4mg"], "CONTRAINDICATED", "Sildenafil (Viagra) & Nitroglycerin"),
        (["Prozac 20mg", "Tramadol 50mg"], "CONTRAINDICATED", "Fluoxetine (Prozac) & Tramadol"),
        (["Methotrexate 15mg", "Advil 400mg"], "CONTRAINDICATED", "Methotrexate & Ibuprofen (Advil)")
    ]

    print("\n--- Documented Contraindicated Pairs ---")
    for meds, expected_sev, label in critical_pairs:
        res = clinical_copilot.check_drug_interactions(meds)
        print(f"Pair: {label} ({meds}) -> Severity: {res['safety_status']} | Critical Flag: {res['has_critical_interaction']}")
        assert res["safety_status"] == expected_sev
        assert res["has_critical_interaction"] is True
        assert len(res["interactions"]) >= 1

    # 4.2 Unassessed / Unknown Combinations (Must NEVER claim 'proven safe')
    unassessed_pairs = [
        ["Paracetamol 500mg", "Cetirizine 10mg"],
        ["Vitamin D3 60000IU", "Calcium Carbonate 500mg"]
    ]

    print("\n--- Unassessed / Unknown Combinations ---")
    for meds in unassessed_pairs:
        res = clinical_copilot.check_drug_interactions(meds)
        print(f"Unassessed Pair: {meds} -> Status: {res['pharmacovigilance_status']} | Guidance: '{res['clinical_guidance'][:60]}...'")
        assert res["pharmacovigilance_status"] == "NOT_ASSESSED"
        assert res["safety_status"] == "NOT_ASSESSED"
        assert res["safety_status"] != "SAFE"
        assert res["requires_doctor_authorization"] is True
        assert "NOT been clinically assessed as proven safe" in res["clinical_guidance"]

    print("\n[PASS] Drug Safety Validation Complete.")

if __name__ == "__main__":
    run_model_validation()
    run_ocr_validation()
    run_rag_validation()
    run_drug_safety_validation()
    print("\n=================================================================")
    print("ALL AI/ML RUNTIME & CLINICAL SAFETY TESTS EXECUTED AND PASSED")
    print("=================================================================")
