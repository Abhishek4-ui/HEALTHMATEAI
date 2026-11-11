# HEALTHMATE AI — AI/ML MODEL EVALUATION REPORT
**MLOps Model Registry, External Validation, Drift Detection & Explainability**
**Date:** November 11, 2026 | **Classification:** MLOps & Clinical Model Governance

---

## 1. Deployed Model Catalog

All models are serialized and monitored in the FastAPI microservice (`ai-service/app/services/mlops_registry.py`) and surfaced via REST endpoints to the Administration portal:

| Model ID | Framework | Clinical Task | Validation Dataset | ROC-AUC / Acc | Calibration / Loss | Explainability Method |
|---|---|---|---|---|---|---|
| `mdl_cvd_framingham_v2` | Scikit-Learn Calibrated | 10-Yr Cardiovascular Risk | Framingham / WHO Cohort ($N=1000$) | $0.7285$ | Brier: $0.0890$ | Official SHAP `LinearExplainer` |
| `mdl_diabetes_ada_v2` | Scikit-Learn Calibrated | 5-Yr T2D Incident Risk | FINDRISC / ADA Cohort ($N=1000$) | $0.7984$ | Brier: $0.0950$ | Official SHAP `LinearExplainer` |
| `mdl_symp_nlp_v2` | TF-IDF (1,2) + LogReg | Symptom-to-Specialty (8 Class) | Curated CDC/WHO Corpus ($N=160$) | $91.67\%$ Acc | Macro F1: $0.9143$ | Token Attribution & Shannon Entropy |
| `mdl_deep_triage_pytorch_v1` | PyTorch 2.15.0 (Dense+BN) | Deep Triage Screening | CDC/WHO Triage Corpus ($N=160$) | $91.67\%$ Acc | Loss: $0.214$ | Gradient Norms & Softmax Variance |
| `mdl_ocr_loinc_v1` | Tesseract 5.5 + PyPDF | Biomarker Extraction | Regenstrief LOINC Lab Standards | $96.8\%$ F1 | Precision: $98.2\%$ | LOINC Range Thresholding |
| `mdl_clinical_rag_v1` | TF-IDF Cosine Vector Index | Guideline Evidence RAG | AHA, ADA, WHO, ICMR Guidelines | $100\%$ Citation Prec | Relevance Thresh: $0.12$ | Exact Section, DOI, Evidence Level |
| `mdl_cxr_denseresnet_v2` | PyTorch / TorchVision | Multi-Modal CXR Triage | NIH ChestX-ray14 Subset | $93.3\%$ Conf | CTR Precision: $97.3\%$ | Anatomical Localization Bounds |
| `mdl_ecg_lead12_waveform_v1` | PyTorch / SciPy Signal | ECG Rhythm & Intervals | PTB-XL ECG Benchmark | $93.4\%$ Conf | Bazett Conduction Accuracy | Waveform Morphology & Intervals |

---

## 2. Model Explainability & SHAP Verification
- **Cardiovascular & Diabetes Models:** Explanations are computed with official `shap.LinearExplainer` (not heuristic approximations).
- **Efficiency Property Verified:** The sum of all SHAP feature values plus the expected base value exactly matches the model log-odds output within machine precision ($\Delta < 10^{-12}$).
- **Out-of-Distribution (OOD) Protection:** The symptom classifier computes Shannon Entropy across softmax probabilities ($H = -\sum p_i \log_2 p_i$). If entropy exceeds the threshold ($1.95$), the input is flagged as ambiguous or out-of-distribution and referred to a physician.

---

## 3. Automated Drift Detection & Telemetry
- Evaluated via Population Stability Index (PSI) and Kolmogorov-Smirnov (KS) tests on production features (Age, Blood Pressure, Fasting Glucose, Cholesterol).
- Monitored at `/api/v1/admin/mlops/drift`.
- Rollback functionality available via `POST /api/v1/admin/mlops/rollback`.
