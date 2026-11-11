import pytest
from app.services.health_risk_models import health_risk_models
from app.services.symptom_classifier import symptom_classifier
from app.services.clinical_rag import clinical_rag_grounder
from app.services.report_ocr import report_ocr_extractor
from app.services.clinical_copilot import clinical_copilot
from app.services.mlops_registry import mlops_registry

class TestPhase8MLOpsAndHybridAI:

    def test_mlops_registry_catalog(self):
        models = mlops_registry.get_models()
        assert len(models) >= 5
        model_ids = [m["id"] for m in models]
        assert "mdl_cvd_framingham_v2" in model_ids
        assert "mdl_diabetes_ada_v2" in model_ids
        assert "mdl_symp_nlp_v2" in model_ids
        assert "mdl_ocr_loinc_v1" in model_ids
        assert "mdl_clinical_rag_v1" in model_ids

    def test_cardiovascular_shapley_efficiency_axiom(self):
        """
        Verify the Shapley Value Efficiency Axiom:
        f(x) = phi_0 + sum(phi_i)
        """
        test_cases = [
            {"age": 65, "systolic_bp": 165, "total_cholesterol": 240, "hdl_cholesterol": 35, "is_smoker": True, "has_diabetes": True},
            {"age": 35, "systolic_bp": 110, "total_cholesterol": 160, "hdl_cholesterol": 60, "is_smoker": False, "has_diabetes": False},
            {"age": 52, "systolic_bp": 138, "total_cholesterol": 210, "hdl_cholesterol": 45, "is_smoker": False, "has_diabetes": True},
        ]

        for tc in test_cases:
            res = health_risk_models.calculate_cardiovascular_risk(tc)
            phi_0 = res["base_expected_value_percent"]
            sum_phi = sum(item["shap_value"] for item in res["shap_feature_importance"])
            expected_output = round(phi_0 + sum_phi, 2)

            assert res["shapley_sum_check"]["satisfies_efficiency_property"] is True
            assert abs(res["shapley_sum_check"]["calculated_model_output"] - expected_output) < 1e-4
            assert res["ten_year_risk_percent"] > 0

    def test_diabetes_shapley_efficiency_axiom(self):
        """
        Verify the Shapley Value Efficiency Axiom for Diabetes Risk Engine
        """
        tc = {"age": 55, "bmi": 31.5, "family_history": True, "physical_activity": False, "fasting_glucose": 135}
        res = health_risk_models.calculate_diabetes_risk(tc)

        phi_0 = res["base_expected_value_percent"]
        sum_phi = sum(item["shap_value"] for item in res["shap_feature_importance"])
        expected_output = round(phi_0 + sum_phi, 2)

        assert res["shapley_sum_check"]["satisfies_efficiency_property"] is True
        assert abs(res["shapley_sum_check"]["calculated_model_output"] - expected_output) < 1e-4

    def test_clinical_rag_grounding_and_citations(self):
        """
        Test RAG retrieval from peer-reviewed clinical guidelines
        """
        query = "What are the diagnostic blood glucose thresholds for Type 2 Diabetes according to ADA?"
        res = clinical_rag_grounder.retrieve_guidelines(query, top_k=2)

        assert res["is_grounded"] is True
        assert len(res["citations"]) > 0
        assert any("ADA" in c for c in res["citations"])
        assert res["hallucination_safeguard"] == "GROUNDED_EVIDENCE_FOUND"
        assert res["top_relevance_score"] > 0.12

    def test_clinical_rag_hallucination_safeguard_on_out_of_scope(self):
        """
        Test that queries unrelated to clinical guidelines trigger safeguard
        """
        query = "How do I fix a carburetor in a 1995 Honda motorcycle?"
        res = clinical_rag_grounder.retrieve_guidelines(query, top_k=2)

        assert res["is_grounded"] is False
        assert res["hallucination_safeguard"] == "OUT_OF_SCOPE_NO_GROUNDING_FOUND"
        assert len(res["citations"]) == 0

    def test_report_ocr_loinc_standardization(self):
        """
        Test that extracted laboratory biomarkers contain valid LOINC codes
        """
        sample_report = """
        METROPOLIS PATHOLOGY REPORT
        Hemoglobin: 10.2 g/dL
        Fasting Blood Glucose: 145 mg/dL
        Serum Creatinine: 1.8 mg/dL
        Total Cholesterol: 245 mg/dL
        Total Leukocyte Count (WBC): 8500 /mcL
        """
        res = report_ocr_extractor.parse_report_text(sample_report)

        assert res["success"] is True
        assert res["biomarkers_extracted_count"] == 5

        loinc_map = {b["parameter_key"]: b["loinc_code"] for b in res["biomarkers"]}
        assert loinc_map["hemoglobin"] == "718-7"
        assert loinc_map["fasting_glucose"] == "1558-6"
        assert loinc_map["creatinine"] == "2160-0"
        assert loinc_map["cholesterol"] == "2093-3"
        assert loinc_map["wbc"] == "6690-2"

        # Verify abnormal flags
        flags = {b["parameter_key"]: b["flag"] for b in res["biomarkers"]}
        assert flags["hemoglobin"] == "LOW"
        assert flags["fasting_glucose"] == "HIGH"
        assert flags["creatinine"] == "HIGH"
        assert flags["cholesterol"] == "HIGH"
        assert flags["wbc"] == "NORMAL"

    def test_pharmacovigilance_drug_interaction_severity(self):
        """
        Test critical, high, and safe drug interactions
        """
        # Critical
        crit_res = clinical_copilot.check_drug_interactions(["Aspirin 75mg", "Warfarin 5mg"])
        assert crit_res["has_critical_interaction"] is True
        assert crit_res["safety_status"] == "CONTRAINDICATED"

        # Sildenafil + Nitroglycerin
        sild_res = clinical_copilot.check_drug_interactions(["Sildenafil 50mg", "Nitroglycerin 0.4mg"])
        assert sild_res["has_critical_interaction"] is True
        assert sild_res["safety_status"] == "CONTRAINDICATED"

        # Unassessed regimen (must NEVER be labeled SAFE)
        safe_res = clinical_copilot.check_drug_interactions(["Paracetamol 500mg", "Amoxicillin 500mg"])
        assert safe_res["has_critical_interaction"] is False
        assert safe_res["safety_status"] == "NOT_ASSESSED"
        assert safe_res["safety_status"] != "SAFE"
        assert safe_res["pharmacovigilance_status"] == "NOT_ASSESSED"

    def test_symptom_classifier_shannon_entropy_ood(self):
        """
        Test that out-of-domain queries exhibit high Shannon entropy
        """
        ood_query = "The stock market experienced heavy volatility in quarterly earnings reports"
        res = symptom_classifier.analyze_symptoms(ood_query)

        assert res["uncertainty_metrics"]["shannon_entropy"] >= 1.95
        assert res["uncertainty_metrics"]["epistemic_uncertainty"] == "HIGH_UNCERTAINTY"
        assert res["uncertainty_metrics"]["is_out_of_domain"] is True

    def test_mlops_drift_detector(self):
        """
        Test that drift detector monitors clinical parameters
        """
        drift = mlops_registry.detect_data_drift()
        assert "features_monitored_count" in drift
        assert drift["features_monitored_count"] == 6
        assert "feature_drift_analysis" in drift
        assert len(drift["feature_drift_analysis"]) == 6
