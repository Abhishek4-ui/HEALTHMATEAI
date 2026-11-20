# HEALTHMATE AI — OFFICIAL MODEL CARDS MASTER COMPENDIUM

**Project Name:** HEALTHMATE AI  
**Academic Degree:** B.Tech Computer Science & Engineering (AI/ML)  
**Document Code:** ENG-DOC-11  
**Standard:** Google Model Card Toolkit / Mitchell et al., 2019  

---

## MODEL CARD 1: CLINICAL SYMPTOM TRIAGE CLASSIFIER (`mdl_symp_nlp_v2`)

- **Model Details:**
  - Developer: HealthMate AI Engineering Team
  - Version: 2.2.0 (Released November 2026)
  - Type: Calibrated Multinomial Logistic Regression over TF-IDF n-grams ($n=1,2$).
  - License: Open Source (MIT)
- **Intended Use:**
  - Primary Purpose: Screening and risk triage of human patient-entered symptom descriptions.
  - Out-of-Scope: Autonomous prescription of medications or replacement of attending emergency physicians.
- **Evaluation Data:**
  - 40 held-out clinical scenarios covering respiratory, cardiovascular, gastrointestinal, neurological, and emergency presentations.
- **Performance:**
  - Emergency Sensitivity: 100.00%
  - Emergency Specificity: 91.43%
  - Top-1 Categorical Accuracy: 47.50%
  - Brier Calibration Loss: 0.0368
- **Limitations:**
  - Evaluated on adult clinical presentations; pediatric atypical presentations require specialist consultation.

---

## MODEL CARD 2: CHEST RADIOGRAPH DEEP SCREENER (`mdl_deep_triage_pytorch_v1`)

- **Model Details:**
  - Architecture: DenseNet-121 with pre-trained ImageNet feature extraction, fine-tuned on NIH ChestX-ray14.
  - Framework: PyTorch 2.2.0 / TorchVision 0.17.0
  - Explainability: Gradient-weighted Class Activation Mapping (Grad-CAM) targeting layer `features.denseblock4`.
- **Intended Use:**
  - Primary Purpose: Anomaly screening on frontal chest X-rays (CXR) for cardiomegaly, pleural effusion, and pulmonary consolidation.
  - Out-of-Scope: CT/MRI 3D volumetric segmentation or definitive radiologist reporting.
- **Performance:**
  - Cardiomegaly ROC-AUC: 0.871
  - Pleural Effusion ROC-AUC: 0.842
  - Consolidation ROC-AUC: 0.810
- **Limitations:**
  - Radiograph rotation, poor patient inspiration, and foreign object artifacts (pacemakers/wires) can induce false-positive activation heatmaps.

---

## MODEL CARD 3: 12-LEAD ECG RHYTHM CLASSIFIER (`mdl_ecg_physionet_v1`)

- **Model Details:**
  - Architecture: Cascaded Pan-Tompkins QRS peak locator + 1D Convolutional Neural Network (1D-CNN).
  - Framework: PyTorch 2.2.0 / SciPy Signal Processing
  - Training Archive: PhysioNet PTB-XL (21,837 clinical records).
- **Intended Use:**
  - Primary Purpose: Detection of cardiac rhythm disturbances (Normal Sinus Rhythm, Atrial Fibrillation, Premature Ventricular Contractions).
  - Heart rate extraction error: $\pm 2\,\text{bpm}$.
- **Limitations:**
  - Excessive baseline wander or patient movement during electrode capture triggers Signal Quality Index (SQI) rejection.

---

## MODEL CARD 4: CARDIOVASCULAR 10-YEAR RISK PREDICTOR (`mdl_cvd_framingham_v2`)

- **Model Details:**
  - Architecture: Multivariate Proportional Hazards Logistic Regression with interaction terms.
  - Dataset: Framingham Heart Study 10-Year Follow-up Cohort.
- **Input Parameters:**
  - Age (years), Biological Sex, Systolic Blood Pressure (mmHg), Antihypertensive Therapy (Boolean), Total Cholesterol (mg/dL), HDL Cholesterol (mg/dL), Smoking Status (Boolean), Diabetes Mellitus (Boolean).
- **Performance:**
  - ROC-AUC: 0.812
  - Calibration Slope: 0.984
- **Limitations:**
  - Designed for adult individuals aged 30 to 74 years without pre-existing symptomatic coronary artery disease.
