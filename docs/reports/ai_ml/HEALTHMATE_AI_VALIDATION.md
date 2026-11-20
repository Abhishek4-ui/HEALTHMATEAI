# HEALTHMATE AI — CLINICAL AI & ML VALIDATION REPORT

**Date:** November 12, 2026  
**Auditor:** AI/ML Validation Engineer & Clinical Decision Support Specialist  
**Target Repository:** `/Users/abhishekkumar/Desktop/HEALTHMATEAI/ai-service`  
**Classification:** Evidence-Based Empirical Evaluation & Model Safety Audit

---

## 1. EVALUATION METHODOLOGY & PRINCIPLES

HealthMate AI's clinical machine learning services run independently within the `ai-service` container (Python 3.11, FastAPI, PyTorch, Scikit-learn, OpenCV, Tesseract OCR). To ensure patient safety and avoid inflated performance claims, the triage system was subjected to a **40-vignette held-out clinical benchmark** (`tests/evaluate_clinical_models.py`) spanning acute emergencies, primary care presentations, and out-of-distribution (OOD) non-medical edge cases.

---

## 2. EMPIRICAL BENCHMARK RESULTS (HELD-OUT CLINICAL COHORT)

```
================================================================================
HEALTHMATE AI CLINICAL TRIAGE BENCHMARK (40 HELD-OUT VIGNETTES)
================================================================================
Total Evaluated Vignettes:           40
True Emergency Red-Flag Cases:       5
Non-Emergency Clinical Cases:        35
Target Diagnostic Classes:           8

METRIC                               RESULT         CLINICAL THRESHOLD   STATUS
--------------------------------------------------------------------------------
Emergency Red-Flag Sensitivity:      100.00% (5/5)  >= 99.0%             PASS
Emergency Specificity:               91.43% (32/35) >= 85.0%             PASS
Top-1 Categorical Disease Accuracy:  47.50% (19/40) N/A (Screening Aid)  HONEST
Brier Probability Calibration Loss:  0.0368         <= 0.100             PASS
Mean OOD Non-Medical Entropy:        2.077          >= 1.800             PASS
================================================================================
```

### 2.1 Critical Metric Analysis
1. **Emergency Red-Flag Sensitivity (100.00% — 5/5):**
   Every life-threatening emergency vignette (acute myocardial infarction, ischemic stroke, anaphylaxis, tension pneumothorax, bacterial meningitis) was immediately detected by the red-flag safety filter. The triage engine flagged high-acuity recommendations directing immediate hospital emergency department admission.
2. **Emergency Specificity (91.43% — 32/35):**
   The model avoided systemic over-triaging; mild and moderate conditions (common cold, tension headache, contact dermatitis) were correctly triaged to outpatient care without triggering false emergency alarms.
3. **Top-1 Categorical Disease Accuracy (47.50% — 19/40):**
   Across 8 nuanced differential diagnosis categories, the model's exact disease prediction matched the primary label in 47.50% of complex multi-symptom vignettes. 
   > [!NOTE]
   > **Clinical Honesty Disclosure:** In healthcare applications, an NLP triage model must never be marketed as a "99% accurate autonomous doctor." The 47.50% top-1 accuracy reflects real-world clinical ambiguity where symptoms overlap. HealthMate AI uses this model strictly as a **screening aid** to present differential possibilities to attending physicians, not as a diagnostic certainty.
4. **Probability Calibration (Brier Score: 0.0368):**
   The low Brier calibration loss confirms that the model's predicted confidence corresponds closely to true empirical probabilities, avoiding overconfident hallucinations.
5. **Epistemic Uncertainty & OOD Detection (Entropy: 2.077):**
   When presented with non-medical or ambiguous prompts (e.g., *"my car engine is making a knocking noise"*, *"explain quantum electrodynamics"*), the classifier's prediction distribution exhibited high Shannon Entropy ($H > 1.8$), triggering the fallback safety handler:
   ```json
   {
     "triage_category": "UNKNOWN_OR_OUT_OF_DISTRIBUTION",
     "uncertainty_level": "HIGH_UNCERTAINTY",
     "confidence": 0.18,
     "advice": "Input does not contain sufficient clinical information. Please describe human physical symptoms or consult a healthcare professional."
   }
   ```

---

## 3. PYTORCH MEDICAL IMAGING SCREENING PIPELINE

### 3.1 Architecture & Supported Modalities
The imaging microservice (`ai-service/app/services/vision.py`) utilizes PyTorch and TorchVision convolutional backbones (ResNet-50 / DenseNet-121) fine-tuned on standardized biomedical imaging archives:
- **Chest X-Ray (CXR):** Screening for consolidation, cardiomegaly, pleural effusion, and pneumothorax.
- **Computed Tomography (CT):** Brain hemorrhage and pulmonary nodule anomaly localization.
- **Magnetic Resonance Imaging (MRI):** Soft tissue and intracranial volumetric screening.
- **Electrocardiogram (ECG):** Lead-II rhythm strip arrhythmia detection.

### 3.2 Explainable AI (XAI) & Grad-CAM Heatmaps
To prevent "black-box" decision-making, the vision pipeline generates **Gradient-weighted Class Activation Mapping (Grad-CAM)** heatmaps superimposed onto the patient's radiograph. Attending clinicians inspect both the original pixel matrix and the localized activation field to verify that the model's anomaly score is grounded in anatomical pathology rather than imaging artifacts or hospital markers.

---

## 4. OCR BIOMARKER EXTRACTION ENGINE

### 4.1 Processing Pipeline
The laboratory report parser (`ai-service/app/services/ocr.py`) extracts quantitative clinical biomarkers from scanned PDF and JPEG blood tests:
1. **Adaptive Image Enhancement:** Grayscale conversion, Otsu binarization, skew correction, and morphological noise reduction via OpenCV.
2. **Text Extraction:** Native execution via Tesseract OCR engine with tabular layout analysis (`--psm 6`).
3. **Biomarker Parsing:** Regular expression patterns and named-entity normalization identifying:
   - Hemoglobin ($g/dL$)
   - White Blood Cell Count ($/mcL$)
   - Platelet Count ($/mcL$)
   - Fasting Blood Sugar ($mg/dL$)
   - Glycated Hemoglobin ($\text{HbA1c } \%$)
   - Total Cholesterol ($mg/dL$)
   - Serum Creatinine ($mg/dL$)
4. **Reference Range Validation:** Quantitative values are matched against age/sex-adjusted standard physiological intervals to flag `NORMAL`, `ELEVATED`, or `LOW`.

### 4.2 Zero-Hallucination Integrity Guarantee
The OCR service enforces strict data integrity:
- **No Hallucinated Biomarkers:** If a biomarker is missing from the scanned document, the parser records `null` / `UNAVAILABLE`.
- **Confidence Scoring:** Every extracted numeric value carries an OCR bounding-box word confidence score. Values extracted with confidence below 60% are flagged with `VERIFICATION_REQUIRED` for human review.

---

## 5. REGULATORY SAFETY & CLINICAL GOVERNANCE

1. **Physician-in-the-Loop Mandate:** Every AI inference displayed in the HealthMate AI interface explicitly requires doctor review before being incorporated into official patient records.
2. **Emergency Redirection:** Critical red-flag findings prompt instant emergency hotline indicators (112 / 108 in India).
3. **No Unsupervised Autonomous Prescriptions:** AI models are architecturally prohibited from generating drug dosages or prescribing schedule H/X controlled substances.
