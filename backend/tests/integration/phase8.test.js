const request = require('supertest');
const app = require('../../src/app');
const { generateAccessToken } = require('../../src/security/jwt');
const aiGateway = require('../../src/services/aiGateway.service');

describe('Phase 8: Advanced Hybrid AI/ML, Clinical Grounding & MLOps Suite', () => {
  jest.setTimeout(25000);

  let patientToken;
  let doctorToken;
  let adminToken;

  beforeAll(async () => {
    const { connectDB } = require('../../src/config/db');
    try {
      await connectDB();
    } catch (e) {
      // Offline fallback handling
    }
    patientToken = generateAccessToken({ id: '6af41b252ec0cf18f46f7cf1', role: 'PATIENT', email: 'patient.p8@healthmate.ai' });
    doctorToken = generateAccessToken({ id: '6af41b252ec0cf18f46f7cf2', role: 'DOCTOR', email: 'doctor.p8@healthmate.ai' });
    adminToken = generateAccessToken({ id: '6af41b252ec0cf18f46f7cf3', role: 'ADMINISTRATION', email: 'admin.p8@healthmate.ai' });
  });

  afterAll(async () => {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  describe('1. MLOps Model Registry, Versioning & Provenance', () => {
    it('retrieves registered clinical AI models via administration portal', async () => {
      const res = await request(app)
        .get('/api/v1/admin/mlops/models')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);

      const modelIds = res.body.data.map(m => m.id);
      expect(modelIds).toContain('mdl_cvd_framingham_v2');
      expect(modelIds).toContain('mdl_diabetes_ada_v2');
      expect(modelIds).toContain('mdl_symp_nlp_v2');
      expect(modelIds).toContain('mdl_ocr_loinc_v1');
    });

    it('returns valid dataset provenance and licensing metadata for every model', async () => {
      const res = await request(app)
        .get('/api/v1/admin/mlops/models')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      for (const m of res.body.data) {
        expect(m).toHaveProperty('version');
        expect(m).toHaveProperty('framework');
        expect(m).toHaveProperty('dataset_name');
        expect(m).toHaveProperty('dataset_license');
        expect(m).toHaveProperty('explainability');
      }
    });
  });

  describe('2. MLOps Telemetry, Latency Tracking & Covariate Drift Monitoring', () => {
    it('retrieves real-time inference latency percentiles', async () => {
      const res = await request(app)
        .get('/api/v1/admin/mlops/telemetry')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('latency_metrics_ms');
      expect(res.body.data.latency_metrics_ms).toHaveProperty('average');
      expect(res.body.data.latency_metrics_ms).toHaveProperty('p95');
    });

    it('monitors input feature covariate drift across key clinical parameters', async () => {
      const res = await request(app)
        .get('/api/v1/admin/mlops/drift')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('overall_drift_detected');
      expect(res.body.data).toHaveProperty('feature_drift_analysis');
      expect(res.body.data.features_monitored_count).toBe(6);
    });
  });

  describe('3. Clinical RAG Knowledge Grounding & Hallucination Guardrail', () => {
    it('retrieves evidence-grounded guideline citations for hypertension management', async () => {
      const res = await request(app)
        .post('/api/v1/admin/clinical/rag-query')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ query: 'What are the lifestyle modifications and sodium restrictions recommended by AHA for hypertension?' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.is_grounded).toBe(true);
      expect(res.body.data.citations.length).toBeGreaterThan(0);
      expect(res.body.data.hallucination_safeguard).toBe('GROUNDED_EVIDENCE_FOUND');
    });

    it('triggers out-of-scope safeguard on non-clinical queries without hallucinating', async () => {
      const res = await request(app)
        .post('/api/v1/admin/clinical/rag-query')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ query: 'Explain how to compile a C++ shared library with cmake' });

      expect(res.status).toBe(200);
      expect(res.body.data.is_grounded).toBe(false);
      expect(res.body.data.hallucination_safeguard).toBe('OUT_OF_SCOPE_NO_GROUNDING_FOUND');
      expect(res.body.data.citations).toHaveLength(0);
    });
  });

  describe('4. Mathematical SHAP Feature Attribution & Statistical Risk Models', () => {
    it('validates exact Shapley efficiency summation in cardiovascular risk model', async () => {
      const result = await aiGateway.assessCardioRisk({
        age: 60,
        systolic_bp: 155,
        total_cholesterol: 230,
        hdl_cholesterol: 38,
        smoker: true,
        diabetic: true,
      });

      expect(result).toHaveProperty('ten_year_risk_percent');
      expect(result.risk_tier).toBe('CRITICAL');
      expect(result).toHaveProperty('shapley_sum_check');
      expect(result.shapley_sum_check.satisfies_efficiency_property).toBe(true);
      expect(Array.isArray(result.shap_feature_importance)).toBe(true);

      // Verify that every feature has a valid SHAP value
      for (const f of result.shap_feature_importance) {
        expect(f).toHaveProperty('feature');
        expect(f).toHaveProperty('shap_value');
        expect(typeof f.shap_value).toBe('number');
      }
    });

    it('validates diabetes risk model with Asian Indian BMI cutoffs and SHAP breakdown', async () => {
      const result = await aiGateway.assessDiabetesRisk({
        age: 48,
        bmi: 28.5,
        family_history: true,
        physically_active: false,
        fasting_glucose: 118,
      });

      expect(result).toHaveProperty('five_year_risk_percent');
      expect(result.risk_tier).toBe('HIGH');
      expect(result.shapley_sum_check.satisfies_efficiency_property).toBe(true);
    });
  });

  describe('5. Pharmacovigilance Drug Interactions & Doctor Approval Workflow', () => {
    it('detects contraindicated drug combination (Aspirin + Warfarin)', async () => {
      const result = await aiGateway.checkDrugInteractions(['Aspirin 75mg', 'Warfarin 5mg']);
      expect(result.has_critical_interaction).toBe(true);
      expect(result.safety_status).toBe('CONTRAINDICATED');
      expect(result.interactions.length).toBeGreaterThanOrEqual(1);
    });

    it('sets unlisted drug combination to NOT_ASSESSED and never claims SAFE', async () => {
      const result = await aiGateway.checkDrugInteractions(['Paracetamol 500mg', 'Cetirizine 10mg']);
      expect(result.has_critical_interaction).toBe(false);
      expect(result.safety_status).toBe('NOT_ASSESSED');
      expect(result.safety_status).not.toBe('SAFE');
      expect(result.requires_doctor_authorization).toBe(true);
    });

    it('enforces Doctor Approval Workflow on SOAP note synthesis', async () => {
      const result = await aiGateway.summarizeSoap(
        'Patient reports 3 days of productive cough, mild fever 100 F, lungs clear.',
        { age: 42, gender: 'Male' }
      );

      expect(result).toHaveProperty('soap_summary');
      expect(result.approval_status).toBe('DRAFT_REQUIRES_DOCTOR_AUTHORIZATION');
      expect(result.is_finalized).toBe(false);
      expect(result.doctor_signoff_required).toBe(true);
    });
  });

  describe('6. Document Intelligence & LOINC Standard Mapping', () => {
    it('extracts standardized biomarkers and maps LOINC codes', async () => {
      const sampleText = `
        DIAGNOSTIC PATHOLOGY REPORT
        Hemoglobin: 11.5 g/dL
        Fasting Blood Glucose: 132 mg/dL
        Serum Creatinine: 1.6 mg/dL
        Total Cholesterol: 220 mg/dL
      `;

      const result = await aiGateway.extractReportOCR(sampleText);
      expect(result.success).toBe(true);
      expect(result.biomarkers_extracted_count).toBe(4);

      const loincMap = {};
      result.biomarkers.forEach(b => { loincMap[b.parameter_key] = b.loinc_code; });
      expect(loincMap['hemoglobin']).toBe('718-7');
      expect(loincMap['fasting_glucose']).toBe('1558-6');
      expect(loincMap['creatinine']).toBe('2160-0');
      expect(loincMap['cholesterol']).toBe('2093-3');
    });
  });

  describe('7. Administrative RBAC Security on Phase 8 Endpoints', () => {
    it('rejects PATIENT role from accessing MLOps drift telemetry with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/admin/mlops/drift')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('FORBIDDEN_ROLE');
    });

    it('rejects unauthenticated requests to MLOps model registry with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/admin/mlops/models');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });
  });
});
