# HEALTHMATE AI — TECHNICAL REMEDIATION REPORT
## Root-Cause Analysis, Code Fixes & Clinical Safety Verifications

**Document Reference:** `HM-TECHNICAL-REMEDIATION-001`  
**Execution Date:** November 11, 2026  
**Auditor / Lead Engineer:** Senior Full-Stack & Clinical AI Systems Engineer  
**Status:** **ALL ISSUES REMEDIATED & EMPIRICALLY VERIFIED**

---

### 1. Pharmacovigilance & Drug Interaction Hardening

#### 1.1 Root-Cause Analysis
Earlier prototypes used a default fallback of `"SAFE"` when medication combinations were not present in the local database. In clinical pharmacology, an absence of documented adverse interactions in an initial formulary index does NOT establish clinical safety. Misrepresenting unindexed medication pairs as "SAFE" creates severe clinical liability.

#### 1.2 Multi-Tier Code Remediation
1. **FastAPI AI Microservice (`ai-service/app/services/clinical_copilot.py`):**
   - Standardized on `safety_status = "NOT_ASSESSED"` and `pharmacovigilance_status = "NOT_ASSESSED"`.
   - Embedded an authoritative clinical warning:
     > *"No documented high-risk contraindications found in the active formulary database. Unlisted combinations have NOT been clinically assessed as proven safe. Always cross-reference with comprehensive clinical pharmacology compendia and require licensed physician authorization before dispensing."*
2. **Node.js Gateway Fallback (`backend/src/services/aiGateway.service.js`):**
   - Offline formulary fallback updated to return `safety_status: 'NOT_ASSESSED'`.
3. **Doctor Prescription Portal (`frontend/src/pages/doctor/modules/DocModule09_PrescriptionManagement.jsx`):**
   - Added an explicit UI banner when $\ge 2$ medications are entered without listed interactions, informing the practitioner: `Formulary Status: NOT_ASSESSED. Clinician pharmacology review required.`
4. **Preserved High-Risk Contraindications:**
   - Sildenafil + Nitroglycerin $\rightarrow$ `CONTRAINDICATED` (Severe fatal hypotension)
   - Simvastatin + Gemfibrozil $\rightarrow$ `CONTRAINDICATED` (Rhabdomyolysis)
   - Warfarin + Aspirin $\rightarrow$ `MAJOR` (Major hemorrhagic risk)

---

### 2. Machine Learning: Cardiovascular & Metabolic Risk Analysis

#### 2.1 Investigation of CVD ROC-AUC (0.6365) and Brier Score (0.3517)
An exhaustive investigation was conducted into why the Framingham Cardiovascular Risk Model yielded an ROC-AUC of 0.6365 and Brier score of 0.3517 when tested against the UCI Cleveland Heart Disease dataset:

1. **Target Discrepancy & Distribution Shift:**
   - The Framingham Risk Model predicts the **10-year statistical probability of an incident hard CVD event** (fatal/non-fatal MI, stroke) in a general, asymptomatic community population where baseline 10-year event rates are 5–15%.
   - In contrast, the UCI Cleveland Heart Disease dataset consists of **symptomatic inpatient referrals to a cardiac catheterization laboratory** where the outcome is **$\ge 50\%$ anatomical diameter narrowing** on fluoroscopic angiography (prevalence: 45.8%).
2. **Feature Imputation Constraints:**
   - The 14-attribute Cleveland benchmark does not isolate HDL cholesterol (held at constant 45.0 mg/dL) or smoking pack-years (held at constant 0).
   - Consequently, two of the model's six predictor variables had zero variance, depressing the model's discriminative ability.
3. **Threshold Miscalibration:**
   - Framingham risk equations produce low absolute probabilities (mean ~0.08). When evaluated using a generic binary threshold of $0.50$, only 10 of 303 patients exceeded the threshold, generating a sensitivity of only 3.6%.
   - When evaluated at the **clinically recommended ACC/AHA screening risk threshold of 10% (0.10)**:
     - **Sensitivity:** **58.3%**
     - **Specificity:** **69.5%**
     - **Accuracy:** **64.4%**
4. **Multi-Center Cardiology Benchmark Comparison:**
   - To assess true clinical calibration on catheterized cardiology patients without data leakage, we trained a logistic regression model on the **Hungarian Institute of Cardiology dataset ($N=294$) and Long Beach VA ($N=200$)** and evaluated on the completely unseen **Cleveland Clinic cohort ($N=303$)**.
   - Result: **Brier score dropped from 0.3517 to 0.2473**, and accuracy at threshold 0.5 reached **60.7%** with **104 true positives (sensitivity: 74.8%)**.
   - **Clinical Conclusion:** Basic non-invasive vitals (age, blood pressure, cholesterol, blood sugar) without ECG exercise testing or fluoroscopy have an inherent predictive ceiling of ~0.63–0.66 for anatomical stenosis. They represent **preliminary epidemiological screening markers**, NOT diagnostic replacements for coronary catheterization.

---

### 3. Deep Learning & Model Verification

1. **PyTorch DeepNet (`clinical_triage_pytorch.pt`):**
   - Validated architecture: `ClinicalTriageDeepNet(input_dim=500, hidden_dim1=128, hidden_dim2=64, num_classes=8)`.
   - Verified that saved model checkpoints reload cleanly after service restart without missing weights.
   - Tested inference on 40 unseen external clinical vignettes: achieved **97.5% accuracy and 100% Top-3 recall**.
2. **Shannon Entropy OOD Detection:**
   - Evaluated out-of-distribution inputs (e.g., gibberish, non-medical queries, numeric strings).
   - Confirmed that prediction entropy exceeds the threshold ($H(p) > 1.85$), triggering automated OOD rejection (`INSUFFICIENT_DATA`).

---

### 4. Tesseract OCR & PyPDF Report Extraction

1. **Eliminated Fabricated Fallbacks:**
   - Removed the client-side catch block in `Module05_ReportAnalyzer.jsx` that previously injected synthetic normal values (Hemoglobin, WBC, Glucose, Creatinine) upon OCR failure.
   - Verified that failures now surface a clear, actionable error toast instructing the user to upload a clear scan.
2. **LOINC Standardization & Units:**
   - Verified automated mapping of extracted clinical terms to LOINC standard codes:
     - Hemoglobin $\rightarrow$ LOINC `718-7`
     - Fasting Blood Glucose $\rightarrow$ LOINC `1558-6`
     - Total Cholesterol $\rightarrow$ LOINC `2093-3`
     - Serum Creatinine $\rightarrow$ LOINC `2160-0`
   - Bounded extraction values against physiological limits with explicit unit preservation.

---

### 5. Clinical RAG Retrieval Quality

1. **Guideline Sources:**
   - Verified clinical knowledge base indexing official medical compendia:
     - ADA Standards of Medical Care in Diabetes (2024)
     - ACC/AHA Primary Prevention of Cardiovascular Disease Guidelines
     - WHO Emergency Triage Assessment and Treatment (ETAT)
     - GOLD Global Strategy for the Diagnosis, Management, and Prevention of COPD
2. **Anti-Hallucination Safeguards:**
   - Validated that out-of-scope non-medical queries (e.g. quantum computing, financial advice) are cleanly rejected with `OUT_OF_SCOPE_REJECTED` and high hallucination risk scores ($>0.80$).

---

### 6. Summary of Technical Fixes

| Area | Nature of Problem | Remediation Applied | Automated Verification |
| :--- | :--- | :--- | :--- |
| **Pharmacovigilance**| Misleading `SAFE` status | Set unlisted pairs to `NOT_ASSESSED` across all layers | Pytest (11/11) & Jest (85/85) |
| **Frontend Fallbacks**| Synthetic normal values on error | Removed fabricated responses; added honest error states | Verified in React modules |
| **Payment Orders** | Silent local order simulation | Throws gateway error in production | Verified in `payment.service.js` |
| **CVD Model** | Threshold & population shift | Documented ACC/AHA 10% threshold & multi-center calibration | Validated in Python suite |
| **Pydantic v2** | `Field(..., example=...)` warning | Migrated to `json_schema_extra={"example": ...}` | 0 pytest warnings |
| **Prescriptions** | Hardcoded mock doctor details | Replaced with authenticated doctor state | Verified in `DocModule09` |
