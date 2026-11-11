# HEALTHMATE AI — EXTERNAL API & DATASET REQUIREMENTS
**Integration Contracts, Regulatory Gateways & Training Data Provenance**
**Date:** November 11, 2026 | **Classification:** Infrastructure & Data Governance

---

## 1. External Third-Party Integration Matrix

| Service / Provider | Current Environment | Production Authorization Requirement | Fallback / Status |
|---|---|---|---|
| **Razorpay Payments** | Test Mode (`rzp_test_...`) | Merchant KYC Verification & Live Key Activation (`rzp_live_...`) | Sandbox test cards operational; live capture blocked pending merchant activation. |
| **Twilio SMS Gateway** | Trial Mode (`ACac3dd5...`) | TRAI Indian DLT Principal Entity (PEID) & Header Registration | Fails gracefully with `PROVIDER_CONFIGURATION_REQUIRED`. Never reports fake delivery. |
| **Google SMTP Relay** | Production (`smtp.gmail.com:587`) | App Password rotated and verified via TLS socket test | Fully operational for transaction and emergency dispatch notices. |
| **AWS S3 Storage** | Encrypted Bucket (`healthmate-ai-storage-2026`) | IAM least-privilege policy with server-side AES-256 encryption | Presigned upload/download URLs operational with time-bounded TTL. |
| **MongoDB Atlas** | Dedicated Cloud Sharded Cluster | TLS 1.3 enforced, IP Access List restricted | Connected and operational. |
| **Redis Cloud** | Distributed Cache Cluster | TLS authentication with automated TTL expiry | Connected and operational. |

---

## 2. Training Datasets & Provenance Catalog

| Dataset Name | License / Terms | Intended Clinical Scope | Sample Volume | Key Variables / Inputs |
|---|---|---|---|---|
| **Framingham Heart Study** | NHLBI Public Domain | 10-Year Cardiovascular Disease Risk Stratification | $N=1,000$ | Age, SBP, Total Cholesterol, HDL, Smoking, Diabetes |
| **FINDRISC Cohort & ADA Guidelines** | Open Access / ADA Fair Use | 5-Year Incident Type 2 Diabetes Stratification | $N=1,000$ | Age, BMI, Family History, Activity, Fasting Glucose |
| **CDC / WHO Triage Corpus** | CC BY 4.0 International | Symptom-to-Specialty NLP Differential Diagnosis | $N=160$ | Clinical vignette text, chief complaints, acuity levels |
| **Regenstrief LOINC Standards** | Regenstrief LOINC Permissive | Laboratory Biomarker Standard Code Mapping | $N=12$ panels | Hemoglobin, WBC, Platelets, Creatinine, Fasting Glucose |
| **NIH ChestX-ray14 (Subset)** | CC0 Public Domain | Chest Radiography Finding Prioritization | Verified benchmark | CXR PA/AP projections, parenchymal density, CTR |
| **PTB-XL ECG Database** | PhysioNet Open Access | 12-Lead Electrocardiography Rhythm & Intervals | Verified benchmark | 1000ms Lead II signal, PR, QRS, QT intervals |
