import io
import re
import time
import logging
from typing import Dict, Any, List, Optional
from PIL import Image, ImageOps
import pytesseract
from pypdf import PdfReader
from app.services.mlops_registry import mlops_registry

logger = logging.getLogger("healthmate.report_ocr")

# Standard Clinical Reference Intervals & Official LOINC Codes
# (Sourced from Regenstrief Institute LOINC Standards & US National Library of Medicine)
CLINICAL_REFERENCE_RANGES = {
    "hemoglobin": {
        "name": "Hemoglobin (Hb)",
        "loinc": "718-7",
        "standard_unit": "g/dL",
        "low": 12.0,
        "high": 17.5,
        "panel": "Complete Blood Count",
        "reference_authority": "CLSI / WHO Laboratory Reference Intervals"
    },
    "wbc": {
        "name": "Total Leukocyte Count (WBC)",
        "loinc": "6690-2",
        "standard_unit": "/mcL",
        "low": 4000,
        "high": 11000,
        "panel": "Complete Blood Count",
        "reference_authority": "CLSI / WHO Laboratory Reference Intervals"
    },
    "platelets": {
        "name": "Platelet Count",
        "loinc": "777-3",
        "standard_unit": "lakh/mcL",
        "low": 1.5,
        "high": 4.5,
        "panel": "Complete Blood Count",
        "reference_authority": "CLSI / WHO Laboratory Reference Intervals"
    },
    "fasting_glucose": {
        "name": "Fasting Blood Glucose",
        "loinc": "1558-6",
        "standard_unit": "mg/dL",
        "low": 70,
        "high": 100,
        "panel": "Glycemic Profile",
        "reference_authority": "American Diabetes Association (ADA 2024)"
    },
    "hba1c": {
        "name": "Glycated Hemoglobin (HbA1c)",
        "loinc": "4548-4",
        "standard_unit": "%",
        "low": 4.0,
        "high": 5.6,
        "panel": "Glycemic Profile",
        "reference_authority": "NGSP / ADA Clinical Practice Guidelines"
    },
    "cholesterol": {
        "name": "Total Serum Cholesterol",
        "loinc": "2093-3",
        "standard_unit": "mg/dL",
        "low": 125,
        "high": 200,
        "panel": "Lipid Profile",
        "reference_authority": "AHA / ACC Multisociety Blood Cholesterol Guidelines"
    },
    "triglycerides": {
        "name": "Triglycerides",
        "loinc": "2571-8",
        "standard_unit": "mg/dL",
        "low": 50,
        "high": 150,
        "panel": "Lipid Profile",
        "reference_authority": "NCEP Adult Treatment Panel III"
    },
    "creatinine": {
        "name": "Serum Creatinine",
        "loinc": "2160-0",
        "standard_unit": "mg/dL",
        "low": 0.7,
        "high": 1.3,
        "panel": "Renal Function Panel",
        "reference_authority": "KDIGO Clinical Practice Guideline for Acute Kidney Injury"
    },
    "urea": {
        "name": "Blood Urea Nitrogen (BUN)",
        "loinc": "3094-0",
        "standard_unit": "mg/dL",
        "low": 7,
        "high": 20,
        "panel": "Renal Function Panel",
        "reference_authority": "CLSI Laboratory Reference Intervals"
    },
    "tsh": {
        "name": "Thyroid Stimulating Hormone (TSH)",
        "loinc": "3016-3",
        "standard_unit": "mIU/L",
        "low": 0.4,
        "high": 4.0,
        "panel": "Endocrine Panel",
        "reference_authority": "American Thyroid Association (ATA) Guidelines"
    },
    "alt_sgpt": {
        "name": "Alanine Aminotransferase (ALT/SGPT)",
        "loinc": "1742-6",
        "standard_unit": "U/L",
        "low": 7,
        "high": 56,
        "panel": "Liver Function Panel",
        "reference_authority": "ACG Clinical Guideline: Abnormal Liver Chemistries"
    },
    "ast_sgot": {
        "name": "Aspartate Aminotransferase (AST/SGOT)",
        "loinc": "1920-8",
        "standard_unit": "U/L",
        "low": 10,
        "high": 40,
        "panel": "Liver Function Panel",
        "reference_authority": "ACG Clinical Guideline: Abnormal Liver Chemistries"
    },
}

class ReportOCRExtractor:
    def __init__(self):
        self.tesseract_cmd = "tesseract"

    def preprocess_image(self, pil_image: Image.Image) -> (Image.Image, List[str]):
        """
        Applies computer vision preprocessing:
        1. Grayscale conversion
        2. Auto-contrast enhancement
        3. OSD-based rotation/orientation correction
        """
        applied_transforms = []
        
        # 1. Grayscale
        if pil_image.mode != "L":
            gray = pil_image.convert("L")
            applied_transforms.append("Grayscale_Conversion")
        else:
            gray = pil_image

        # 2. Contrast Enhancement
        enhanced = ImageOps.autocontrast(gray, cutoff=2)
        applied_transforms.append("AutoContrast_Cutoff_2pct")

        # 3. Orientation correction
        try:
            osd = pytesseract.image_to_osd(enhanced)
            angle_match = re.search(r"Rotate:\s*(\d+)", osd)
            if angle_match:
                angle = int(angle_match.group(1))
                if angle in (90, 180, 270):
                    enhanced = enhanced.rotate(360 - angle, expand=True)
                    applied_transforms.append(f"Rotation_Correction_{angle}deg")
        except Exception:
            pass

        return enhanced, applied_transforms

    def extract_from_bytes(
        self,
        content_bytes: bytes,
        content_type: str = "text/plain",
        filename: str = "Medical_Report"
    ) -> (str, float, str, List[str]):
        """
        Extracts raw clinical text from raw bytes based on content format.
        Returns: (extracted_text, ocr_confidence, engine_name, transforms_applied)
        """
        lower_name = filename.lower()
        lower_type = (content_type or "").lower()

        # A. Digital PDF
        if lower_name.endswith(".pdf") or "pdf" in lower_type:
            try:
                reader = PdfReader(io.BytesIO(content_bytes))
                pdf_text = []
                for page in reader.pages:
                    txt = page.extract_text()
                    if txt:
                        pdf_text.append(txt)
                combined = "\n".join(pdf_text)
                if len(combined.strip()) > 20:
                    return combined, 0.98, "PyPDF_v7.0.1_Text_Extractor", ["PDF_Stream_Decoded"]
            except Exception as e:
                logger.warning(f"PyPDF extraction failed, attempting raster fallback: {e}")

        # B. Raster Images (PNG, JPG, JPEG, WEBP, TIFF)
        is_image = any(lower_name.endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff"]) or "image" in lower_type
        if is_image or content_bytes[:4] in (b"\x89PNG", b"\xff\xd8\xff\xe0", b"\xff\xd8\xff\xe1", b"RIFF"):
            try:
                pil_img = Image.open(io.BytesIO(content_bytes))
                processed_img, transforms = self.preprocess_image(pil_img)
                
                # Run OCR with Tesseract
                data = pytesseract.image_to_data(processed_img, output_type=pytesseract.Output.DICT)
                confidences = [int(c) for c in data["conf"] if str(c).lstrip("-").isdigit() and int(c) > 0]
                mean_conf = round(sum(confidences) / max(len(confidences), 1) / 100.0, 3) if confidences else 0.50
                
                ocr_text = pytesseract.image_to_string(processed_img)
                return ocr_text, mean_conf, "Tesseract_OCR_v5.5.4", transforms
            except Exception as e:
                logger.error(f"Tesseract OCR image extraction error: {e}")
                return "", 0.0, "Tesseract_OCR_v5.5.4_Failed", ["Image_Corrupt_or_Unreadable"]

        # C. Direct text stream
        try:
            decoded = content_bytes.decode("utf-8", errors="ignore")
            if any(c.isalnum() for c in decoded):
                return decoded, 0.99, "UTF8_Text_Stream", ["Direct_Decoding"]
        except Exception:
            pass

        return "", 0.0, "Unknown_Binary_Stream", ["Unreadable_Binary"]

    def parse_report_text(
        self,
        raw_text: str,
        filename: str = "Diagnostic Report",
        ocr_confidence: float = 0.95,
        engine_name: str = "Clinical_Text_Matcher",
        transforms: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Parses OCR clinical diagnostic text, extracts standardized biomarkers,
        maps official LOINC codes, normalizes units, and compares to clinical reference intervals.
        """
        start_time = time.time()
        text_lower = raw_text.lower()
        extracted_biomarkers = []
        abnormal_count = 0

        # Pattern search heuristics for clinical laboratory parameters with unit capture
        patterns = {
            "hemoglobin": r"(?:hemoglobin|hb)(?:\s*\([a-z0-9\s/]+\))?\s*(?:level|count)?\s*[:=-]?\s*([0-9]+\.?[0-9]*)\s*([a-z/%]+)?",
            "wbc": r"(?:wbc count|total leukocyte count|wbc|tlc)(?:\s*\([a-z0-9\s/]+\))?\s*[:=-]?\s*([0-9]+(?:,[0-9]+)?)\s*([a-z/%/]+)?",
            "platelets": r"(?:platelet count|platelets)(?:\s*\([a-z0-9\s/]+\))?\s*[:=-]?\s*([0-9]+\.?[0-9]*)\s*([a-z/%]+)?",
            "fasting_glucose": r"(?:fasting blood sugar|blood sugar fasting|fasting blood glucose|blood glucose fasting|fasting glucose|fbs)(?:\s*\([a-z0-9\s/]+\))?\s*[:=-]?\s*([0-9]+\.?[0-9]*)\s*([a-z/%]+)?",
            "hba1c": r"(?:hba1c|glycated hemoglobin)(?:\s*\([a-z0-9\s/]+\))?\s*[:=-]?\s*([0-9]+\.?[0-9]*)\s*(%|[a-z/%]+)?",
            "cholesterol": r"(?:total cholesterol|cholesterol total|cholesterol)(?:\s*\([a-z0-9\s/]+\))?\s*[:=-]?\s*([0-9]+\.?[0-9]*)\s*([a-z/%]+)?",
            "triglycerides": r"(?:triglycerides|tg)(?:\s*\([a-z0-9\s/]+\))?\s*[:=-]?\s*([0-9]+\.?[0-9]*)\s*([a-z/%]+)?",
            "creatinine": r"(?:serum creatinine|s\.?\s*creatinine|creatinine)(?:\s*\([a-z0-9\s/]+\))?\s*[:=-]?\s*([0-9]+\.?[0-9]*)\s*([a-z/%]+)?",
            "urea": r"(?:blood urea nitrogen|blood urea|urea|bun)(?:\s*\([a-z0-9\s/]+\))?\s*[:=-]?\s*([0-9]+\.?[0-9]*)\s*([a-z/%]+)?",
            "tsh": r"(?:tsh|thyroid stimulating hormone)(?:\s*\([a-z0-9\s/]+\))?\s*[:=-]?\s*([0-9]+\.?[0-9]*)\s*([a-z/%]+)?",
            "alt_sgpt": r"(?:sgpt|alt)(?:\s*\([a-z0-9\s/]+\))?\s*[:=-]?\s*([0-9]+\.?[0-9]*)\s*([a-z/%]+)?",
            "ast_sgot": r"(?:sgot|ast)(?:\s*\([a-z0-9\s/]+\))?\s*[:=-]?\s*([0-9]+\.?[0-9]*)\s*([a-z/%]+)?",
        }

        for key, pattern in patterns.items():
            match = re.search(pattern, text_lower)
            if match:
                raw_val = match.group(1).replace(",", "")
                unit_captured = match.group(2).strip() if (match.lastindex and match.lastindex >= 2 and match.group(2)) else ""
                try:
                    val = float(raw_val)
                    ref = CLINICAL_REFERENCE_RANGES[key]

                    # Unit normalization
                    normalized_val = val
                    if key == "fasting_glucose" and "mmol" in unit_captured:
                        normalized_val = round(val * 18.0182, 1)  # mmol/L -> mg/dL
                    elif key == "hemoglobin" and "g/l" in unit_captured and val > 40:
                        normalized_val = round(val / 10.0, 1)    # g/L -> g/dL

                    # Flag determination
                    if normalized_val < ref["low"]:
                        flag = "LOW"
                        abnormal_count += 1
                    elif normalized_val > ref["high"]:
                        flag = "HIGH"
                        abnormal_count += 1
                    else:
                        flag = "NORMAL"

                    extracted_biomarkers.append({
                        "parameter_key": key,
                        "name": ref["name"],
                        "loinc_code": ref["loinc"],
                        "panel": ref["panel"],
                        "observed": str(normalized_val),
                        "unit": ref["standard_unit"],
                        "reference_interval": f"{ref['low']} - {ref['high']}",
                        "flag": flag,
                        "authority": ref["reference_authority"]
                    })
                except ValueError:
                    pass

        duration_ms = (time.time() - start_time) * 1000
        mlops_registry.record_inference("mdl_ocr_loinc_v1", duration_ms)

        if not extracted_biomarkers:
            return {
                "success": False,
                "model_id": "mdl_ocr_loinc_v1",
                "extraction_status": "EXTRACTION_FAILED_UNREADABLE",
                "report_name": filename,
                "ocr_engine": engine_name,
                "ocr_confidence": ocr_confidence,
                "preprocessing_applied": transforms or [],
                "biomarkers_extracted_count": 0,
                "biomarkers": [],
                "abnormal_findings_count": 0,
                "clinical_summary": "Optical character recognition could not detect standard clinical laboratory biomarkers in this document. Please ensure you upload an authentic, legible pathology report with standard units.",
                "disclaimer": "Automated OCR extraction for research and informational awareness only. Missing values are never fabricated."
            }

        if abnormal_count > 0:
            summary = f"Detected {abnormal_count} parameter(s) outside standard reference intervals. Please review with your treating physician."
        else:
            summary = "All extracted parameters are within standard clinical laboratory reference intervals."

        return {
            "success": True,
            "model_id": "mdl_ocr_loinc_v1",
            "extraction_status": "SUCCESS",
            "report_name": filename,
            "ocr_engine": engine_name,
            "ocr_confidence": ocr_confidence,
            "preprocessing_applied": transforms or [],
            "biomarkers_extracted_count": len(extracted_biomarkers),
            "biomarkers": extracted_biomarkers,
            "abnormal_findings_count": abnormal_count,
            "clinical_summary": summary,
            "disclaimer": "Automated OCR biomarker extraction for research and informational awareness. Values should be verified against original physical laboratory report."
        }

report_ocr_extractor = ReportOCRExtractor()
