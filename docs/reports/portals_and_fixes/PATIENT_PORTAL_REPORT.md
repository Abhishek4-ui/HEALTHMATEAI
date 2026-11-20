# HEALTHMATE AI — PATIENT PORTAL REPORT
**Patient Journey, Intelligent Triage, Geolocation Discovery & Privacy Controls**
**Date:** November 11, 2026 | **Classification:** Consumer Health & Patient Informatics

---

## 1. Overview & Patient Modules (21 Modules)
The Patient Portal empowers individuals and caregivers to manage comprehensive healthcare needs across 21 production modules:

1. **Overview Dashboard (`Module01_Dashboard.jsx`):** Health score, upcoming appointments, active medications, and vital signs summary.
2. **AI Copilot (`Module02_AIAssistant.jsx`):** Multi-lingual conversational health assistant powered by hybrid LLM gateway (OpenRouter / Claude-3.5 + Gemini fallback).
3. **Symptom Checker (`Module03_SymptomChecker.jsx`):** Calibrated NLP classification into 8 clinical specialties with urgency triage.
4. **Health Risk Assessment (`Module04_HealthRiskAssessment.jsx`):** Framingham 10-year CVD risk and ADA 5-year diabetes stratification with SHAP explainability.
5. **Report Analyzer (`Module05_ReportAnalyzer.jsx`):** OCR extraction of CBC, metabolic, renal, and lipid panels mapped to standard LOINC codes.
6. **Medical Imaging AI (`Module20_MedicalImagingCenter.jsx`):** Multi-modal screening (X-Ray, CT, MRI, Ultrasound, Pathology) with interactive canvas controls and radiologist referral.
7. **ECG & Cardiac AI (`Module21_ECGCardiacCenter.jsx`):** 12-lead & Lead II rhythm strip analysis, Bazett QTc interval calculation, and interactive SVG waveform rendering.
8. **Find Doctors (`Module06_DoctorDiscovery.jsx`):** Discovery covering all 36 Indian States and Union Territories with specialty and geolocation filters.
9. **Find Hospitals (`Module07_HospitalDiscovery.jsx`):** State and district directory of healthcare facilities with bed availability and emergency support.
10. **Appointments (`Module08_AppointmentManagement.jsx`):** Booking, rescheduling, and doctor appointment tracking.
11. **Online Consultation (`Module09_OnlineConsultation.jsx`):** Telemedicine video consultation and real-time chat.
12. **Prescriptions (`Module10_Prescriptions.jsx`):** Digital prescriptions with QR verification and dosage instructions.
13. **Medicines & Reminders (`Module11_MedicinesReminders.jsx`):** Pill reminders, refill alerts, and compliance tracking.
14. **Health Monitoring (`Module12_HealthMonitoring.jsx`):** Blood pressure, heart rate, blood glucose, and SpO2 tracking.
15. **Nutrition & Fitness (`Module13_NutritionFitness.jsx`):** Meal logging, calorie balance, and hydration tracking.
16. **Sleep & Wellness (`Module14_SleepMentalWellness.jsx`):** Sleep cycle analysis and mood journaling.
17. **Lab Tests (`Module15_LabTests.jsx`):** Diagnostic test booking and home sample collection tracking.
18. **Emergency SOS (`Module16_EmergencySOS.jsx`):** One-tap emergency dispatch routing to National Emergency Number 112 with SMS dispatch to proxy caregivers.
19. **Family Healthcare (`Module17_FamilyHealthcare.jsx`):** Multi-profile management for dependents and senior family members.
20. **Notifications (`Module18_Notifications.jsx`):** Appointment reminders, prescription refills, and health alerts.
21. **Privacy & Settings (`Module19_PrivacySettings.jsx`):** Consent audit log, data export, and DPDP Act 2023 "Right to be Forgotten" session wipe.

---

## 2. Privacy & Data Integrity
All patient diagnostic inputs are guarded by explicit consent checkboxes and can be permanently purged on demand.
