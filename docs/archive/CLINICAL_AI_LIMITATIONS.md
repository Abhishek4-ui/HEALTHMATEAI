# HealthMate AI — Clinical AI Limitations & Validation Report

**Document Version:** 1.0.0  
**Audit Date:** November 11, 2026  
**Clinical Safety Classification:** **RESEARCH & INFORMATIONAL PROTOTYPE ONLY**  
**Regulatory Boundary:** AI models do NOT issue autonomous clinical diagnoses, nor do they prescribe medications. All clinical decisions require a licensed medical professional.

---

## 1. Model Provenance & Dataset Audit

### A. Symptom-to-Disease NLP Classifier
- **Source & Provenance:** Diagnostic symptom profiles derived from published clinical summaries from the **U.S. Centers for Disease Control and Prevention (CDC)** and the **Columbia University Department of Biomedical Informatics Clinical Knowledge Base**.
- **License:** Public Domain (U.S. Government Work; 17 U.S.C. § 105) and Creative Commons Attribution 4.0 International (CC-BY 4.0).
- **Architecture:** `TfidfVectorizer(ngram_range=(1, 2))` + Calibrated Multinomial `LogisticRegression(C=1.0, max_iter=200)` with deterministic heuristic emergency red-flag screening.
- **Sample Distribution:** 8 outpatient and emergency disease categories.

### B. Held-Out Evaluation Methodology
To prevent data leakage and provide unbiased empirical metrics, the model was evaluated against **40 independently authored clinical test vignettes** (5 distinct, non-overlapping clinical narratives per class) expressing real-world patient language, plus **5 out-of-distribution (OOD) test inputs**.

---

## 2. Empirical Performance Metrics

### A. Multi-Class Confusion Matrix ($8 \times 8$)

```
Predicted Class Index:
      [0]  [1]  [2]  [3]  [4]  [5]  [6]  [7]
[0]    4    0    0    0    0    1    0    0   | Acute Bronchitis
[1]    1    4    0    0    0    0    0    0   | Hypertension Crisis / Angina
[2]    0    0    5    0    0    0    0    0   | Migraine with Aura
[3]    0    0    0    4    1    0    0    0   | Type 2 Diabetes Mellitus
[4]    0    0    0    0    5    0    0    0   | GERD
[5]    0    0    0    0    0    4    0    1   | Acute Bacterial Pharyngitis
[6]    0    0    0    0    0    0    5    0   | Osteoarthritis
[7]    0    0    0    0    0    0    0    5   | Acute Allergic Rhinitis
```

### B. Class-Wise Statistical Performance

| Class Name | Precision | Recall (Sensitivity) | Specificity | F1-Score | Held-Out Support |
|------------|:---------:|:--------------------:|:-----------:|:--------:|:----------------:|
| Acute Bronchitis | 0.800 | 0.800 | 0.971 | 0.800 | 5 |
| Hypertension Crisis / Angina | 1.000 | 0.800 | 1.000 | 0.889 | 5 |
| Migraine with Aura | 1.000 | 1.000 | 1.000 | 1.000 | 5 |
| Type 2 Diabetes Mellitus | 1.000 | 0.800 | 1.000 | 0.889 | 5 |
| Gastroesophageal Reflux Disease | 0.833 | 1.000 | 0.971 | 0.909 | 5 |
| Acute Bacterial Pharyngitis | 0.800 | 0.800 | 0.971 | 0.800 | 5 |
| Osteoarthritis | 1.000 | 1.000 | 1.000 | 1.000 | 5 |
| Acute Allergic Rhinitis | 0.833 | 1.000 | 0.971 | 0.909 | 5 |
| **MACRO AVERAGE** | **0.908** | **0.900** | **0.986** | **0.899** | **40** |

- **Top-1 Categorical Accuracy:** **90.00%** (36 / 40 correct)
- **Top-3 Differential Inclusion Recall:** **100.00%** (40 / 40 correct)
- **Model Calibration (Mean Multi-Class Brier Score):** **0.1097** (Well-calibrated softmax probabilities)

---

## 3. Emergency Red-Flag Triage Performance

Emergency red-flag symptom screening operates with strict deterministic heuristic prioritization:
- **Emergency Cases Tested:** 5 acute clinical presentations (substernal crushing pain, left arm radiation, thunderclap headache, cold sweats with breathlessness, chest tightness on exertion).
- **Emergency Sensitivity (Recall):** **100.00%** (5 / 5 acute emergencies flagged)
- **Emergency Specificity:** **91.43%** (32 / 35 routine presentations correctly categorized without unnecessary panic)
- **Clinical Directive:** Any detected emergency red flag immediately displays high-priority guidance directing the user to dial emergency numbers (`112` / `108`) or seek an emergency trauma center immediately.

---

## 4. Out-of-Distribution (OOD) & Epistemic Uncertainty

To verify that the model does not make false, overconfident predictions when supplied with non-clinical, ambiguous, or out-of-scope text, 5 challenging OOD cases were evaluated:

| Query Text | Category | Max Class Prob ($P_{\max}$) | Shannon Entropy ($H$, nats) | Model Uncertainty Status |
|------------|----------|:---------------------------:|:---------------------------:|:------------------------:|
| "I feel somewhat tired and run down today" | Ambiguous Symptom | 0.127 | 2.079 | **HIGH UNCERTAINTY** |
| "My dog has a bad limp on its rear leg..." | Veterinary Domain | 0.127 | 2.079 | **HIGH UNCERTAINTY** |
| "I need to schedule an oil filter change..." | Automotive / Non-Medical | 0.127 | 2.079 | **HIGH UNCERTAINTY** |
| "Severe throbbing wisdom tooth ache..." | Dental (Out of Scope) | 0.137 | 2.078 | **HIGH UNCERTAINTY** |
| "qwerty uioplkjh gfdsazxcv bnm" | Nonsense Gibberish | 0.127 | 2.079 | **HIGH UNCERTAINTY** |

### Findings:
- Under OOD inputs, class probability mass is distributed diffusely across all 8 classes ($\sim 12.7\% \text{ each}$), which corresponds to the maximum entropy for an 8-class system ($\ln(8) \approx 2.079 \text{ nats}$).
- The model correctly refrains from assigning spuriously high confidence to out-of-domain queries.

---

## 5. Cardiovascular & Diabetes Health Risk Models

### A. Framingham 10-Year Cardiovascular Risk Model
- **Scientific Provenance:** Formulated according to the Framingham Heart Study / WHO Cardiovascular Disease Risk Charts.
- **Mathematical Form:** Calibrated multivariable Cox proportional hazards log-odds scoring using age, systolic blood pressure, total serum cholesterol, HDL cholesterol, smoking status, and diabetic status.
- **Explainability:** Implemented with additive marginal feature contributions (compatible with local SHAP feature importances).
- **Intended Use:** Informational risk stratification for preventative lifestyle modification.
- **Contraindication:** Must NOT be used for diagnosing acute myocardial infarction, acute coronary syndromes, or aortic dissection.

### B. ADA / FINDRISC Diabetes Risk Model
- **Scientific Provenance:** Adapted from the American Diabetes Association (ADA) Diabetes Risk Test and the Finnish Diabetes Risk Score (FINDRISC).
- **Scoring Inputs:** Age categories, BMI thresholds, daily physical activity, family history, and fasting blood glucose.
- **Intended Use:** Non-invasive statistical screening for impaired glucose tolerance and type 2 diabetes risk.
- **Contraindication:** A high-risk score is NOT a diagnosis of diabetes. Formal diagnosis requires laboratory fasting plasma glucose (FPG $\ge 126\text{ mg/dL}$) or Glycated Hemoglobin ($\text{HbA1c} \ge 6.5\%$).

---

## 6. Medical Report OCR Biomarker Extraction

- **Reference Ranges:** Based on standard National Library of Medicine (NLM) and LOINC laboratory reference intervals.
- **Failure Handling:** When an uploaded document is blurry, unreadable, or contains no recognizable laboratory parameters, the extractor returns:
  ```json
  {
    "success": false,
    "extraction_status": "EXTRACTION_FAILED_UNREADABLE",
    "biomarkers_extracted_count": 0,
    "biomarkers": []
  }
  ```
- **Integrity Rule:** Missing values or non-detected parameters are **NEVER fabricated or replaced with default numbers**.

---

## 7. Mandatory Clinical Governance Safeguards

1. **Informational Prototype Only:** Every UI screen and API payload carries an immutable clinical disclaimer.
2. **Zero Autonomous Prescriptions:** The AI microservice has NO authority to issue, finalize, or dispatch medication prescriptions.
3. **Mandatory Physician Review:** All clinical notes, suggested differentials, and prescriptions require interactive review, modification, and digital signature from a licensed physician holding a verified medical council registration number.
4. **Emergency Priority:** Critical red flags bypass conversational triage and immediately trigger local emergency trauma directives.
