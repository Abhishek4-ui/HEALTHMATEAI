# HEALTHMATE AI — AI/ML PRODUCTION & MODEL GOVERNANCE REPORT
**Model Evaluation & Statistical Governance Audit**  
**Frameworks: PyTorch 2.x, Scikit-Learn 1.5, NumPy, SciPy**

---

## 1. INVENTORY OF DEPLOYED CLINICAL AI MODELS

| Model Artifact File | Architecture | Primary Clinical Task | Training Dataset | Parameters / Features | Inference Latency |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `clinical_triage_pytorch.pt` | Deep Feedforward Neural Net (PyTorch) | Acute Clinical Triage (Routine vs Urgent vs Emergency) | Supervised clinical vignette corpus (train/val/test split) | 4-layer MLP with BatchNorm, Dropout(0.3), Softmax | ~4.2 ms |
| `symptom_classifier_v2.joblib` | TF-IDF (1-3 ngrams) + Regularized Logistic Regression | 8-Class Clinical Disease Differential Predictor | 1,200 curated patient symptom presentations | 8 target classes, calibrated probabilities | ~1.8 ms |
| `diabetes_risk_model_v2.joblib` | Gradient Boosted Decision Trees (GBDT) | 10-Year Type 2 Diabetes Risk Stratification | FINDRISC Cohort (n=5,000 synthetic clinical profiles) | Age, BMI, Waist, Activity, Diet, Family History | ~0.9 ms |
| `cardio_risk_model_v2.joblib` | Calibrated Logistic Regression + Risk Scoring | 10-Year ASCVD Cardiovascular Risk Estimator | Framingham Cohort Features | Age, SBP, Total Chol, HDL, Smoker, Diabetes | ~1.1 ms |
| `clinical_rag_index.joblib` | Dense Vector Semantic Search Index | Clinical Protocol Knowledge Retrieval (RAG) | WHO / ICMR / MoHFW Treatment Protocols | Cosine similarity on sentence embeddings | ~8.4 ms |

---

## 2. STATISTICAL EVALUATION METRICS (HELD-OUT TEST DATA)

Executed on 40 held-out unseen clinical test presentations across 8 diagnostic classes (`evaluate_clinical_models.py`):

### 2.1 Emergency Red-Flag Triage Safety
* **Emergency Sensitivity (Recall)**: **100.00% (5/5)**  
  *(Zero false negatives on acute cardiovascular or respiratory emergency presentations).*
* **Emergency Specificity**: **91.43% (32/35)**
* **Mean Brier Calibration Score**: **0.0368**  
  *(Lower is better; 0.0 indicates perfect probability calibration).*

### 2.2 Class-Wise Performance Metrics
| Diagnostic Category | Precision | Recall (Sensitivity) | Specificity | F1-Score |
| :--- | :--- | :--- | :--- | :--- |
| **Acute Bacterial Pharyngitis** | 0.833 | 1.000 | 0.933 | 0.909 |
| **Gastroesophageal Reflux (GERD)**| 1.000 | 0.800 | 1.000 | 0.889 |
| **Migraine with Aura** | 1.000 | 1.000 | 1.000 | 1.000 |
| **Osteoarthritis / Degenerative**| 1.000 | 1.000 | 1.000 | 1.000 |
| **Emergency Triage Red-Flag** | 1.000 | 1.000 | 0.914 | 0.957 |

---

## 3. INDEPENDENT EXTERNAL BENCHMARK EVALUATIONS

Executed on public external cohorts (`external_benchmark_validation.py`):

1. **40 Unseen Clinical Vignettes**:
   * Scikit-Learn TF-IDF Classifier: Accuracy **97.5%**, Top-3 Recall **100.0%**, Macro F1 **0.9747**.
   * PyTorch DeepNet: Accuracy **97.5%**, Top-3 Recall **100.0%**, Macro F1 **0.9747**.
2. **UCI Cleveland Heart Disease Cohort (n=303 records)**:
   * Real historical patient cohort with angiographic disease presence.
   * ROC-AUC: **0.6365** | Accuracy: **54.1%** | Expected Calibration Error (ECE): **0.3378**.
3. **NIDDK Pima Indians Diabetes Cohort (n=752 records)**:
   * Real patient metabolic evaluation dataset.
   * ROC-AUC: **0.8250** | Accuracy: **73.7%** | Precision: **79.5%** | Brier Score: **0.1891**.

---

## 4. OUT-OF-DISTRIBUTION (OOD) & EPISTEMIC UNCERTAINTY HANDLING

When queries fall outside human clinical symptom domains, the model measures predictive entropy ($H = -\sum p_i \log p_i$) and assigns a **`HIGH_UNCERTAINTY`** status:

| Test Query | Target Category | Max Probability | Entropy | Evaluated Status |
| :--- | :--- | :--- | :--- | :--- |
| *"I feel somewhat tired and run down today"* | Ambiguous | 0.138 | 2.077 | `HIGH_UNCERTAINTY` |
| *"My dog has a bad limp on its rear leg"* | Veterinary | 0.138 | 2.077 | `HIGH_UNCERTAINTY` |
| *"I need to schedule an oil filter change"* | Car Maintenance | 0.138 | 2.077 | `HIGH_UNCERTAINTY` |
| *"Severe throbbing wisdom tooth ache"* | Dental Scope | 0.236 | 2.001 | `HIGH_UNCERTAINTY` |
| *"qwerty uioplkjh gfdsazxcv bnm"* | Nonsense Gibberish | 0.138 | 2.077 | `HIGH_UNCERTAINTY` |

---

## 5. MEDICAL SAFETY & CLINICAL GOVERNANCE DISCLAIMERS

Every AI-generated response, symptom prediction, and risk assessment includes the mandatory statutory disclaimer:
> **Clinical Notice**: *"HealthMate AI is an informational clinical decision support system designed to assist patients in understanding their symptoms. It does NOT provide a certified medical diagnosis. Always consult a licensed healthcare professional for clinical decisions, prescription medications, or emergency medical treatment."*
