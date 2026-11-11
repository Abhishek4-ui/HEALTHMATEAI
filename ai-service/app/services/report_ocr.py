import re
from typing import Dict, Any, List

# Standard Clinical Reference Intervals (Sourced from National Library of Medicine & LOINC Laboratory Standards)
CLINICAL_REFERENCE_RANGES = {
    "hemoglobin": {"name": "Hemoglobin (Hb)", "unit": "g/dL", "low": 12.0, "high": 17.5, "panel": "Complete Blood Count"},
    "wbc": {"name": "Total Leukocyte Count (WBC)", "unit": "/mcL", "low": 4000, "high": 11000, "panel": "Complete Blood Count"},
    "platelets": {"name": "Platelet Count", "unit": "lakh/mcL", "low": 1.5, "high": 4.5, "panel": "Complete Blood Count"},
    "fasting_glucose": {"name": "Fasting Blood Glucose", "unit": "mg/dL", "low": 70, "high": 100, "panel": "Glycemic Profile"},
    "hba1c": {"name": "Glycated Hemoglobin (HbA1c)", "unit": "%", "low": 4.0, "high": 5.6, "panel": "Glycemic Profile"},
    "cholesterol": {"name": "Total Serum Cholesterol", "unit": "mg/dL", "low": 125, "high": 200, "panel": "Lipid Profile"},
    "triglycerides": {"name": "Serum Triglycerides", "unit": "mg/dL", "low": 50, "high": 150, "panel": "Lipid Profile"},
    "creatinine": {"name": "Serum Creatinine", "unit": "mg/dL", "low": 0.6, "high": 1.2, "panel": "Renal Function"},
    "urea": {"name": "Blood Urea Nitrogen (BUN)", "unit": "mg/dL", "low": 7, "high": 20, "panel": "Renal Function"},
    "tsh": {"name": "Thyroid Stimulating Hormone (TSH)", "unit": "uIU/mL", "low": 0.4, "high": 4.5, "panel": "Thyroid Profile"},
    "alt_sgpt": {"name": "Alanine Aminotransferase (ALT/SGPT)", "unit": "U/L", "low": 7, "high": 56, "panel": "Liver Function"},
    "ast_sgot": {"name": "Aspartate Aminotransferase (AST/SGOT)", "unit": "U/L", "low": 10, "high": 40, "panel": "Liver Function"},
}

class ReportOCRExtractor:
    def parse_report_text(self, raw_text: str, filename: str = "Diagnostic Report") -> Dict[str, Any]:
        """
        Parses OCR extracted or raw clinical diagnostic text, extracts biomarkers,
        and matches against clinical reference intervals.
        """
        text_lower = raw_text.lower()
        extracted_biomarkers = []
        abnormal_count = 0

        # Pattern search heuristics for clinical laboratory parameters
        patterns = {
            "hemoglobin": r"(?:hemoglobin|hb)\s*(?:level|count)?\s*[:=-]?\s*([0-9]+\.?[0-9]*)",
            "wbc": r"(?:wbc count|total leukocyte count|wbc|tlc)\s*[:=-]?\s*([0-9]+,?([0-9]+)?)",
            "platelets": r"(?:platelet count|platelets)\s*[:=-]?\s*([0-9]+\.?[0-9]*)",
            "fasting_glucose": r"(?:fasting blood sugar|blood sugar fasting|fasting blood glucose|blood glucose fasting|fasting glucose|fbs)\s*[:=-]?\s*([0-9]+\.?[0-9]*)",
            "hba1c": r"(?:hba1c|glycated hemoglobin)\s*[:=-]?\s*([0-9]+\.?[0-9]*)",
            "cholesterol": r"(?:total cholesterol|cholesterol total|cholesterol)\s*[:=-]?\s*([0-9]+\.?[0-9]*)",
            "triglycerides": r"(?:triglycerides|tg)\s*[:=-]?\s*([0-9]+\.?[0-9]*)",
            "creatinine": r"(?:serum creatinine|s\.?\s*creatinine|creatinine)\s*[:=-]?\s*([0-9]+\.?[0-9]*)",
            "urea": r"(?:blood urea nitrogen|blood urea|urea|bun)\s*[:=-]?\s*([0-9]+\.?[0-9]*)",
            "tsh": r"(?:tsh|thyroid stimulating hormone)\s*[:=-]?\s*([0-9]+\.?[0-9]*)",
            "alt_sgpt": r"(?:sgpt|alt)\s*[:=-]?\s*([0-9]+\.?[0-9]*)",
            "ast_sgot": r"(?:sgot|ast)\s*[:=-]?\s*([0-9]+\.?[0-9]*)",
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
                        "panel": ref["panel"],
                        "observed": str(val),
                        "unit": ref["unit"],
                        "reference": f"{ref['low']} - {ref['high']}",
                        "flag": flag,
                    })
                except ValueError:
                    pass

        # Clinical Summary Synthesis
        if not extracted_biomarkers:
            summary = "No standard laboratory blood biomarkers were detected in this document. Please ensure you upload a laboratory pathology report."
        elif abnormal_count > 0:
            summary = f"Detected {abnormal_count} parameter(s) outside standard reference intervals. Please review with your treating physician."
        else:
            summary = "All extracted parameters are within standard clinical laboratory reference intervals."

        return {
            "report_name": filename,
            "biomarkers_extracted_count": len(extracted_biomarkers),
            "biomarkers": extracted_biomarkers,
            "abnormal_findings_count": abnormal_count,
            "clinical_summary": summary,
            "disclaimer": "Automated OCR biomarker extraction for research and informational awareness. Values should be verified against original physical laboratory report."
        }

report_ocr_extractor = ReportOCRExtractor()
