import re
import time
from typing import Dict, Any, List
from app.services.mlops_registry import mlops_registry

# Standard Clinical Reference Intervals & Official LOINC Codes
# (Sourced from Regenstrief Institute LOINC Standards & US National Library of Medicine)
CLINICAL_REFERENCE_RANGES = {
    "hemoglobin": {
        "name": "Hemoglobin (Hb)",
        "loinc": "718-7",
        "unit": "g/dL",
        "low": 12.0,
        "high": 17.5,
        "panel": "Complete Blood Count",
        "reference_authority": "CLSI / WHO Laboratory Reference Intervals"
    },
    "wbc": {
        "name": "Total Leukocyte Count (WBC)",
        "loinc": "6690-2",
        "unit": "/mcL",
        "low": 4000,
        "high": 11000,
        "panel": "Complete Blood Count",
        "reference_authority": "CLSI / WHO Laboratory Reference Intervals"
    },
    "platelets": {
        "name": "Platelet Count",
        "loinc": "777-3",
        "unit": "lakh/mcL",
        "low": 1.5,
        "high": 4.5,
        "panel": "Complete Blood Count",
        "reference_authority": "CLSI / WHO Laboratory Reference Intervals"
    },
    "fasting_glucose": {
        "name": "Fasting Blood Glucose",
        "loinc": "1558-6",
        "unit": "mg/dL",
        "low": 70,
        "high": 100,
        "panel": "Glycemic Profile",
        "reference_authority": "American Diabetes Association (ADA 2024)"
    },
    "hba1c": {
        "name": "Glycated Hemoglobin (HbA1c)",
        "loinc": "4548-4",
        "unit": "%",
        "low": 4.0,
        "high": 5.6,
        "panel": "Glycemic Profile",
        "reference_authority": "NGSP / ADA Clinical Practice Guidelines"
    },
    "cholesterol": {
        "name": "Total Serum Cholesterol",
        "loinc": "2093-3",
        "unit": "mg/dL",
        "low": 125,
        "high": 200,
        "panel": "Lipid Profile",
        "reference_authority": "AHA / NCEP Adult Treatment Panel III"
    },
    "triglycerides": {
        "name": "Serum Triglycerides",
        "loinc": "2571-8",
        "unit": "mg/dL",
        "low": 50,
        "high": 150,
        "panel": "Lipid Profile",
        "reference_authority": "AHA / NCEP Adult Treatment Panel III"
    },
    "creatinine": {
        "name": "Serum Creatinine",
        "loinc": "2160-0",
        "unit": "mg/dL",
        "low": 0.6,
        "high": 1.2,
        "panel": "Renal Function",
        "reference_authority": "NKF-KDOQI Clinical Practice Guidelines"
    },
    "urea": {
        "name": "Blood Urea Nitrogen (BUN)",
        "loinc": "3094-0",
        "unit": "mg/dL",
        "low": 7,
        "high": 20,
        "panel": "Renal Function",
        "reference_authority": "NKF-KDOQI Clinical Practice Guidelines"
    },
    "tsh": {
        "name": "Thyroid Stimulating Hormone (TSH)",
        "loinc": "11580-8",
        "unit": "uIU/mL",
        "low": 0.4,
        "high": 4.5,
        "panel": "Thyroid Profile",
        "reference_authority": "American Thyroid Association (ATA)"
    },
    "alt_sgpt": {
        "name": "Alanine Aminotransferase (ALT/SGPT)",
        "loinc": "1742-6",
        "unit": "U/L",
        "low": 7,
        "high": 56,
        "panel": "Liver Function",
        "reference_authority": "ACG Clinical Guideline: Abnormal Liver Chemistries"
    },
    "ast_sgot": {
        "name": "Aspartate Aminotransferase (AST/SGOT)",
        "loinc": "1920-8",
        "unit": "U/L",
        "low": 10,
        "high": 40,
        "panel": "Liver Function",
        "reference_authority": "ACG Clinical Guideline: Abnormal Liver Chemistries"
    },
}

class ReportOCRExtractor:
    def parse_report_text(self, raw_text: str, filename: str = "Diagnostic Report") -> Dict[str, Any]:
        """
        Parses OCR extracted clinical diagnostic text, extracts standardized biomarkers,
        maps LOINC codes, and matches against clinical reference intervals.
        """
        start_time = time.time()
        text_lower = raw_text.lower()
        extracted_biomarkers = []
        abnormal_count = 0

        # Pattern search heuristics for clinical laboratory parameters
        patterns = {
            "hemoglobin": r"(?:hemoglobin|hb)(?:\s*\([a-z0-9\s/]+\))?\s*(?:level|count)?\s*[:=-]?\s*([0-9]+\.?[0-9]*)",
            "wbc": r"(?:wbc count|total leukocyte count|wbc|tlc)(?:\s*\([a-z0-9\s/]+\))?\s*[:=-]?\s*([0-9]+(?:,[0-9]+)?)",
            "platelets": r"(?:platelet count|platelets)(?:\s*\([a-z0-9\s/]+\))?\s*[:=-]?\s*([0-9]+\.?[0-9]*)",
            "fasting_glucose": r"(?:fasting blood sugar|blood sugar fasting|fasting blood glucose|blood glucose fasting|fasting glucose|fbs)(?:\s*\([a-z0-9\s/]+\))?\s*[:=-]?\s*([0-9]+\.?[0-9]*)",
            "hba1c": r"(?:hba1c|glycated hemoglobin)(?:\s*\([a-z0-9\s/]+\))?\s*[:=-]?\s*([0-9]+\.?[0-9]*)",
            "cholesterol": r"(?:total cholesterol|cholesterol total|cholesterol)(?:\s*\([a-z0-9\s/]+\))?\s*[:=-]?\s*([0-9]+\.?[0-9]*)",
            "triglycerides": r"(?:triglycerides|tg)(?:\s*\([a-z0-9\s/]+\))?\s*[:=-]?\s*([0-9]+\.?[0-9]*)",
            "creatinine": r"(?:serum creatinine|s\.?\s*creatinine|creatinine)(?:\s*\([a-z0-9\s/]+\))?\s*[:=-]?\s*([0-9]+\.?[0-9]*)",
            "urea": r"(?:blood urea nitrogen|blood urea|urea|bun)(?:\s*\([a-z0-9\s/]+\))?\s*[:=-]?\s*([0-9]+\.?[0-9]*)",
            "tsh": r"(?:tsh|thyroid stimulating hormone)(?:\s*\([a-z0-9\s/]+\))?\s*[:=-]?\s*([0-9]+\.?[0-9]*)",
            "alt_sgpt": r"(?:sgpt|alt)(?:\s*\([a-z0-9\s/]+\))?\s*[:=-]?\s*([0-9]+\.?[0-9]*)",
            "ast_sgot": r"(?:sgot|ast)(?:\s*\([a-z0-9\s/]+\))?\s*[:=-]?\s*([0-9]+\.?[0-9]*)",
        }

        for key, pattern in patterns.items():
            match = re.search(pattern, text_lower)
            if match:
                raw_val = match.group(1).replace(",", "")
                try:
                    val = float(raw_val)
                    ref = CLINICAL_REFERENCE_RANGES[key]

                    # Flag determination
                    if val < ref["low"]:
                        flag = "LOW"
                        abnormal_count += 1
                    elif val > ref["high"]:
                        flag = "HIGH"
                        abnormal_count += 1
                    else:
                        flag = "NORMAL"

                    extracted_biomarkers.append({
                        "parameter_key": key,
                        "name": ref["name"],
                        "loinc_code": ref["loinc"],
                        "panel": ref["panel"],
                        "observed": str(val),
                        "unit": ref["unit"],
                        "reference_interval": f"{ref['low']} - {ref['high']}",
                        "flag": flag,
                        "authority": ref["reference_authority"]
                    })
                except ValueError:
                    pass

        duration_ms = (time.time() - start_time) * 1000
        mlops_registry.record_inference("mdl_ocr_loinc_v1", duration_ms)

        # Clinical Summary Synthesis
        if not extracted_biomarkers:
            return {
                "success": False,
                "model_id": "mdl_ocr_loinc_v1",
                "extraction_status": "EXTRACTION_FAILED_UNREADABLE",
                "report_name": filename,
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
            "biomarkers_extracted_count": len(extracted_biomarkers),
            "biomarkers": extracted_biomarkers,
            "abnormal_findings_count": abnormal_count,
            "clinical_summary": summary,
            "disclaimer": "Automated OCR biomarker extraction for research and informational awareness. Values should be verified against original physical laboratory report."
        }

report_ocr_extractor = ReportOCRExtractor()
