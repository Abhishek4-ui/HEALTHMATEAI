# HealthMate AI — AI & ML Methodology and Model Registry

> **Standard:** Complete Technical Transparency & Provenance Ledger  
> **Diagnostic Clearance:** None (Prototypes strictly labeled as Experimental / Non-Diagnostic)  
> **Evaluation Framework:** Held-out validation cohorts & synthetic baseline regression suites  

---

## 1. AI & Algorithmic Architecture Overview

HealthMate AI adopts a **calibrated, multi-modal machine intelligence architecture** combining deterministic clinical algorithms, digital signal processing (DSP), computer vision heuristics, and large language model fallback interfaces:

```mermaid
graph TD
    InputData["Patient Clinical Input"]
    InputData --> Vision["Medical Imaging (CXR / MRI)"]
    InputData --> Signal["Physiological Signals (ECG Lead II)"]
    InputData --> TextOCR["Lab Reports & Prescriptions"]
    InputData --> Symptoms["Symptom Strings (EN / HI)"]

    Vision --> AlgCXR["alg_cxr_anatomical_screen_v1 (CTR Heuristic)"]
    Vision --> AlgMRI["alg_mri_gradient_triage_v1 (Sobel / SNR Triage)"]
    Signal --> AlgECG["mdl_ecg_lead12_waveform_v2 (Pan-Tompkins DSP)"]
    TextOCR --> AlgOCR["ocr_tesseract_loinc_v1 (OpenCV + LOINC)"]
    Symptoms --> AlgTriage["triage_bayesian_v1 + Shannon Entropy Filter"]

    AlgTriage --> Fallback{"Ambiguous / Out-of-Distribution?"}
    Fallback -->|Yes (H > 1.8)| SafetyEscalate["Flag HIGH_UNCERTAINTY & Escalate"]
    Fallback -->|No| StratifiedRisk["Stratified Triage Level"]
```

---

## 2. Official AI / ML Model Registry & Model Cards

| Engine Identifier | Architecture Type | Input Format | Primary Clinical Metric | Non-Diagnostic Label |
|---|---|---|---|---|
| `alg_cxr_anatomical_screen_v1` | Deterministic Segmentation & Morphology | DICOM / PNG / JPEG (Grayscale) | Cardiothoracic Ratio (CTR) | **MANDATORY** |
| `alg_mri_gradient_triage_v1` | Sobel Gradient & Symmetry Analysis | DICOM / PNG / JPEG (T1/T2/FLAIR) | Hemispheric Symmetry & SNR | **MANDATORY** |
| `mdl_ecg_lead12_waveform_v2` | Pan-Tompkins QRS Bandpass & Peak DSP | CSV / JSON Timeseries (250–500 Hz) | Heart Rate & RR Regularity | **MANDATORY** |
| `ocr_tesseract_loinc_v1` | Adaptive Thresholding + PyTesseract | PDF / PNG / JPEG Lab Reports | Biomarker Extraction Accuracy | Informational Only |
| `triage_bayesian_v1` | Bayesian Prior + Red-Flag Rules | Free-text Symptoms + Vital Signs | Emergency Red-Flag Sensitivity | Triage Guidance Only |

---

## 3. Detailed Algorithmic Specifications

### 3.1 Chest Radiograph Screening (`alg_cxr_anatomical_screen_v1`)
- **Clinical Motivation:** Early screening for cardiomegaly (enlarged cardiac silhouette) and gross pulmonary consolidation in resource-constrained primary care settings.
- **Implementation:**
  1. Grayscale normalization and histogram equalization (CLAHE).
  2. Otsu thresholding to segment thoracic boundary and cardiac silhouette.
  3. Horizontal bounding-box measurement of maximal cardiac transverse diameter ($C$) and maximal internal thoracic diameter ($T$).
  4. Calculation of Cardiothoracic Ratio: $\text{CTR} = \frac{C}{T}$.
  5. If $\text{CTR} > 0.50$, flags possible cardiomegaly for urgent clinical radiologist review.
- **Safety Label:** *Experimental prototype — deterministic morphological estimation only; not FDA/CDSCO cleared for diagnostic interpretation.*

### 3.2 Brain MRI Quality Triage (`alg_mri_gradient_triage_v1`)
- **Clinical Motivation:** Triage brain MRI scans for motion artifacts, significant signal degradation, and macroscopic hemispheric structural asymmetry.
- **Implementation:**
  1. Slice center alignment along the mid-sagittal plane.
  2. Sobel gradient convolution ($G_x, G_y$) to compute high-frequency edge definition and image sharpness.
  3. Signal-to-Noise Ratio ($\text{SNR}$) calculation comparing intra-cranial parenchyma intensity against background air noise.
  4. Left-to-right hemispheric reflection difference to detect gross asymmetric lesions.
- **Safety Label:** *Experimental image-quality and symmetry triage heuristic; cannot rule out or confirm intracranial pathologies.*

### 3.3 ECG Lead II Rhythm DSP (`mdl_ecg_lead12_waveform_v2`)
- **Clinical Motivation:** Automated measurement of ventricular rate and rhythm regularity from single-channel rhythm strips (Lead II).
- **Implementation:**
  1. 5–15 Hz 2nd-order Butterworth bandpass filter to eliminate baseline wander and high-frequency EMG muscle noise.
  2. Derivative filter to amplify steep QRS slopes: $y[n] = \frac{1}{8} (2x[n] + x[n-1] - x[n-3] - 2x[n-4])$.
  3. Non-linear squaring transform: $y[n] = x^2[n]$.
  4. Moving-window integration with a 150ms window.
  5. Adaptive threshold peak detection to identify R-peaks and compute instantaneous R-R intervals.
- **Validation Dataset:** Tested on de-identified clinical recordings sampled at 250 Hz from the PhysioNet PTB-XL database.
- **Safety Label:** *Single-lead rhythm strip digital signal processing only; does not replace a standard 12-lead diagnostic electrocardiogram.*

### 3.4 Pathology Lab Report OCR (`ocr_tesseract_loinc_v1`)
- **Clinical Motivation:** Eliminate manual transcription errors from patient laboratory reports.
- **Implementation:**
  1. OpenCV morphology opening and adaptive Gaussian thresholding.
  2. Tesseract OCR layout analysis (`--psm 6`).
  3. Regex biomarker matching for key clinical indicators (Hemoglobin, Fasting Blood Sugar, Serum Creatinine, Platelet Count, Total Cholesterol).
  4. Normalization against LOINC international clinical laboratory reference intervals.

---

## 4. Uncertainty Quantification & Safety Guardrails

To prevent hallucinated advice, HealthMate AI incorporates an **epistemic uncertainty filter**:
$$\text{Entropy } H = - \sum_{i=1}^{K} p_i \log_2(p_i)$$

When triage entropy exceeds $H > 1.800$ (indicating an out-of-distribution or conflicting symptom profile), automated categorization is suppressed, and the system issues a `HIGH_UNCERTAINTY` directive instructing the patient to seek immediate in-person evaluation.
