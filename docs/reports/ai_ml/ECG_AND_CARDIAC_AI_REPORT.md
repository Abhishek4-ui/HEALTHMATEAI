# HEALTHMATE AI — ECG & CARDIAC AI REPORT
**12-Lead Electrocardiography & Rhythm Intelligence Pipeline**
**Date:** November 11, 2026 | **Classification:** Cardiac Electrophysiology & Signal Processing

---

## 1. Conduction Intervals & Mathematical Formulation
The cardiac analysis engine (`ai-service/app/services/cardiac_ecg.py`) measures key electrophysiological intervals from uploaded ECG traces (PDF/image):
- **Heart Rate (HR):** Derived from R-R interval ($HR = 60,000 / RR_{ms}$).
- **PR Interval:** Conduction time from SA node through AV node to His-Purkinje network (normal: $120\text{--}200\text{ ms}$).
- **QRS Duration:** Ventricular depolarization duration (normal: $80\text{--}120\text{ ms}$).
- **QT Interval:** Total duration of ventricular depolarization and repolarization.
- **Corrected QT (QTc) via Bazett's Formula:**
  $$QTc = \frac{QT}{\sqrt{RR_{sec}}}$$
  Normal values: $< 440\text{ ms}$ (Adult Male), $< 460\text{ ms}$ (Adult Female). Prolongation $> 480\text{ ms}$ flags potential Torsades de Pointes / ventricular arrhythmia risk.

---

## 2. Interactive Lead II Waveform Visualization
Implemented in `Module21_ECGCardiacCenter.jsx`:
- **Standard Millivolt Grid:**
  - Minor square: $10\text{ px} \approx 0.04\text{ s}$ ($40\text{ ms}$).
  - Major square: $50\text{ px} \approx 0.20\text{ s}$ ($200\text{ ms}$).
  - Calibration: $25\text{ mm/s}$ horizontal speed, $10\text{ mm/mV}$ vertical amplitude.
- **Synthesized 250-point P-QRS-T Trace:** Smooth vector rendering with hover inspection for time (ms) and millivolt amplitude.
- **Rhythm Classification:** Evaluates Normal Sinus Rhythm, Sinus Bradycardia, Sinus Tachycardia, and ST-segment elevation indicators.
- **Emergency Escalation:** Clear clinical directive instructing patients to dial 112/102 for acute symptoms.
