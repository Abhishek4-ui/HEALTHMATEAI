# HEALTHMATE AI — DATASET DOCUMENTATION & LINEAGE REGISTRY

**Project Name:** HEALTHMATE AI  
**Academic Degree:** B.Tech Computer Science & Engineering (AI/ML)  
**Document Code:** ENG-DOC-09  
**Standard:** Open Science • Valid Research Licensing • Data Hygiene  

---

## 1. DATASET ACQUISITION & LINEAGE OVERVIEW

HealthMate AI utilizes exclusively public, peer-reviewed, and open-source biomedical research datasets for training and benchmarking its predictive algorithms. In compliance with ethical research standards, no private patient data was scraped or utilized without informed consent.

---

## 2. DETAILED DATASET CARDS

### 2.1 PhysioNet PTB-XL Electrocardiography Archive
- **Source:** PhysioNet / Physikalisch-Technische Bundesanstalt (PTB), Germany
- **Citation:** Wagner et al., "PTB-XL, a large publicly available electrocardiography dataset," *Scientific Data*, 2020.
- **License:** Open Data Commons Attribution License (ODC-BY) v1.0
- **Cohort Size:** 21,837 clinical 12-lead ECG records from 18,885 patients ($10\,\text{seconds}$ duration, $500\,\text{Hz}$ sampling).
- **Target Labels:** Normal Sinus Rhythm (NORM), Myocardial Infarction (MI), ST/T Changes (STTC), Conduction Disturbance (CD), Hypertrophy (HYP).
- **Data Preprocessing:** Downsampled to $200\,\text{Hz}$; normalized zero-mean unit-variance; filtered with $0.5\text{--}45\,\text{Hz}$ bandpass FIR filter.

### 2.2 NIH ChestX-ray14 Benchmark Archive
- **Source:** National Institutes of Health (NIH) Clinical Center
- **Citation:** Wang et al., "ChestX-ray8: Hospital-scale Chest X-ray Database and Benchmarks," *IEEE CVPR*, 2017.
- **License:** CC0 Public Domain Dedication
- **Cohort Size:** 112,120 frontal-view X-ray images of 30,805 unique patients.
- **Target Labels:** 14 common thoracic pathologies including Atelectasis, Cardiomegaly, Effusion, Infiltration, Mass, Nodule, Pneumonia, and Pneumothorax.
- **Data Preprocessing:** Resized to $224 \times 224$ pixels; normalized with ImageNet mean $[0.485, 0.456, 0.406]$ and std $[0.229, 0.224, 0.225]$.

### 2.3 Framingham Heart Study Cardiovascular Cohort
- **Source:** National Heart, Lung, and Blood Institute (NHLBI) & Boston University
- **License:** Public Access via BioLINCC Repository
- **Cohort Size:** 4,240 adult clinical profiles monitored over longitudinal 10-year follow-up.
- **Features Extracted:** Age, Sex, Systolic Blood Pressure, Total Serum Cholesterol, HDL Cholesterol, Cigarette Smoking Status, Diabetes Mellitus Diagnosis, Antihypertensive Medication Use.
- **Target Definition:** First occurrence of coronary heart disease event (myocardial infarction or coronary death) within 10 years.

### 2.4 MedMNIST v2 Biomedical Classification Archive
- **Source:** Yang et al., "MedMNIST v2: A Large-Scale Lightweight Benchmark for 2D and 3D Biomedical Image Classification," *Scientific Data*, 2023.
- **License:** Creative Commons Attribution 4.0 International (CC BY 4.0)
- **Modalities Utilized:** PathMNIST (colon pathology), PneumoniaMNIST (pediatric chest radiographs), OrganMNIST (CT abdominal organs).
- **Preprocessing:** Standardized tensor pipelines with 5-fold cross-validation splits.

---

## 3. DATASET QUALITY & HYGIENE VERIFICATION

1. **Missing Value Imputation:** Missing physiological parameters in risk models were imputed using median and MICE (Multivariate Imputation by Chained Equations) without target leakage.
2. **De-Identification & Anonymization:** All biomedical images conform strictly to HIPAA Safe Harbor and DICOM Part 15 de-identification standards (patient names, medical record numbers, and birth dates stripped).
3. **Class Imbalance Mitigation:** Minority pathology classes (e.g. pneumothorax, ventricular arrhythmia) utilized Focal Loss ($\gamma = 2.0$) and stratified k-fold sampling during training.
