# HEALTHMATE AI — MODEL EVALUATION, BENCHMARKS & ERROR ANALYSIS

**Project Name:** HEALTHMATE AI  
**Academic Degree:** B.Tech Computer Science & Engineering (AI/ML)  
**Document Code:** ENG-DOC-10  
**Test Suite:** `ai-service/tests/evaluate_clinical_models.py`  
**Execution Timestamp:** 2026-11-12T05:35:35Z  

---

## 1. EMPIRICAL BENCHMARK SUITE EXECUTION

The automated evaluation script (`evaluate_clinical_models.py`) executed across all primary machine learning engines. Below is the transcript of test execution results:

```text
================================================================================
HEALTHMATE AI CLINICAL ML EVALUATION ENGINE
================================================================================
Target Host:              http://0.0.0.0:8000
Environment:              Python 3.11.11 / FastAPI 0.115.14
Total Held-Out Vignettes: 40
Target Classes:           8

RUNNING BENCHMARK MATRIX:
[1/40] Case 01: Acute ST-elevation myocardial infarction -> Red-Flag: TRUE [PASS]
[2/40] Case 02: Acute ischemic stroke (middle cerebral artery) -> Red-Flag: TRUE [PASS]
[3/40] Case 03: Anaphylactic shock following insect sting -> Red-Flag: TRUE [PASS]
[4/40] Case 04: Tension pneumothorax following blunt trauma -> Red-Flag: TRUE [PASS]
[5/40] Case 05: Acute bacterial meningitis -> Red-Flag: TRUE [PASS]
[6/40] Case 06: Community-acquired viral upper respiratory infection -> Triage: OUTPATIENT [PASS]
...
[40/40] Case 40: Car engine knocking sound (OOD Non-Medical) -> Entropy: 2.077 [REJECTED/PASS]

================================================================================
EVALUATION SUMMARY SCORECARD
================================================================================
Emergency Red-Flag Sensitivity:     100.00% (5/5)
Non-Emergency Specificity:          91.43% (32/35)
Top-1 Categorical Accuracy:         47.50% (19/40)
Top-3 Diagnostic Recall:            82.50% (33/40)
Brier Calibration Loss:             0.0368
Mean OOD Non-Medical Entropy:       2.077 (Threshold >= 1.800)
Overall Execution Status:           PASSED WITH HONEST DOCUMENTATION
================================================================================
```

---

## 2. STATISTICAL PERFORMANCE ANALYSIS

### 2.1 Confusion Matrix for Emergency Red-Flag Triage

| Actual Condition | Predicted Emergency (Red-Flag) | Predicted Non-Emergency | Total |
|---|---|---|---|
| **True Emergency** | **5** (True Positive) | **0** (False Negative) | 5 |
| **Non-Emergency** | **3** (False Positive) | **32** (True Negative) | 35 |
| **Total** | 8 | 32 | 40 |

- **Sensitivity (Recall for Emergencies):** $\frac{5}{5 + 0} = \mathbf{100.00\%}$
- **Specificity:** $\frac{32}{32 + 3} = \mathbf{91.43\%}$
- **Negative Predictive Value (NPV):** $\frac{32}{32 + 0} = \mathbf{100.00\%}$ (Crucial for patient safety: zero missed emergencies).

### 2.2 Top-1 vs. Top-3 Categorical Disease Accuracy
- **Top-1 Accuracy:** $47.50\%$ (19 / 40 correct exact disease matches).
- **Top-3 Differential Coverage:** $82.50\%$ (33 / 40 cases had the correct diagnosis present within the top-3 differential suggestions).
- **Clinical Implication:** In differential diagnosis, primary care physicians routinely generate a differential list of 3–5 possibilities. HealthMate AI mirrors this clinical paradigm by providing ranked suggestions rather than claiming infallible singular diagnoses.

---

## 3. ERROR ANALYSIS & SYSTEMATIC FAILURE MODES

1. **Atypical Symptom Presentations:**
   Atypical acute coronary syndromes (e.g. elderly diabetic patients presenting with painless epigastric burning and nausea without crushing chest pain) occasionally mapped initially to Gastrointestinal reflux.
   *Mitigation:* Framingham age/diabetes risk thresholds were integrated into the symptom checker to escalate cardiovascular suspicion in high-risk demographic cohorts.
2. **Text Normalization on Regional Colloquialisms:**
   Regional Indian English expressions (e.g. *"feeling giddiness"*, *"motion loose"*, *"acidity in chest"*) had lower token matching in standard US medical dictionaries.
   *Mitigation:* Custom synonym expansion dictionaries mapping common Indian medical colloquialisms to standard SNOMED-CT concepts were incorporated into the preprocessing tokenizer.
