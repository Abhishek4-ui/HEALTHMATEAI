const crypto = require('crypto');
const aiGateway = require('../../src/services/aiGateway.service');
const paymentService = require('../../src/services/payment.service');

describe('Phase 5: Hybrid AI/ML Pipeline, Clinical Intelligence & Razorpay Verification Suite', () => {
  jest.setTimeout(15000);

  describe('1. Symptom Assessment & Differential Diagnosis (Calibrated Classifier)', () => {
    it('classifies cardiovascular red flags and suggests Cardiology specialty', async () => {
      const result = await aiGateway.classifySymptoms({
        symptoms: ['severe retrosternal chest pain', 'shortness of breath', 'left arm radiation'],
        durationDays: 1,
        severity: 'SEVERE',
      });

      expect(result).toHaveProperty('differential_diagnoses');
      expect(Array.isArray(result.differential_diagnoses)).toBe(true);
      expect(result.differential_diagnoses.length).toBeGreaterThan(0);
      expect(result.specialty_recommended).toBe('Cardiology');
      expect(result.triage_level).toBe('EMERGENCY');
      expect(result.emergency_red_flags).toBe(true);
    });

    it('classifies neurological headache presentation', async () => {
      const result = await aiGateway.classifySymptoms({
        symptoms: ['throbbing unilateral headache', 'photophobia', 'nausea with aura'],
        durationDays: 2,
        severity: 'MODERATE',
      });

      expect(result.specialty_recommended).toBe('Neurology');
      expect(result.triage_level).not.toBe('EMERGENCY');
      expect(result.clinical_disclaimer).toBeDefined();
    });
  });

  describe('2. Validated Health Risk Models & SHAP Explainability', () => {
    it('computes 10-year Cardiovascular Risk via Framingham/WHO equation with SHAP attribution', async () => {
      const risk = await aiGateway.assessCardioRisk({
        age: 58,
        gender: 'male',
        systolic_bp: 155,
        total_cholesterol: 230,
        hdl_cholesterol: 38,
        smoker: true,
        diabetic: false,
      });

      expect(risk).toHaveProperty('risk_score_percent');
      expect(risk.risk_score_percent).toBeGreaterThan(20); // High risk
      expect(risk.risk_category).toMatch(/HIGH|CRITICAL/);
      expect(risk).toHaveProperty('shap_feature_attributions');
      expect(Array.isArray(risk.shap_feature_attributions)).toBe(true);
      expect(risk.shap_feature_attributions.length).toBeGreaterThan(0);
      expect(risk.lifestyle_recommendations.length).toBeGreaterThan(0);
    });

    it('computes 5-year Type-2 Diabetes Risk via ADA/FINDRISC with local attribution', async () => {
      const risk = await aiGateway.assessDiabetesRisk({
        age: 52,
        bmi: 31.5,
        waist_circumference_cm: 104,
        physically_active: false,
        daily_fruit_veg: false,
        high_bp_medication: true,
        history_high_blood_glucose: true,
        family_history_diabetes: 'immediate',
      });

      expect(risk).toHaveProperty('findrisc_score');
      expect(risk.findrisc_score).toBeGreaterThan(15);
      expect(risk.risk_category).toMatch(/HIGH|VERY_HIGH/);
      expect(risk.shap_feature_attributions.length).toBeGreaterThan(0);
    });
  });

  describe('3. Medical Report OCR & LOINC Biomarker Extraction', () => {
    it('extracts and flags abnormal laboratory biomarkers against standard LOINC ranges', async () => {
      const mockReportText = `
        COMPLETE BLOOD COUNT & METABOLIC PANEL
        Hemoglobin: 9.8 g/dL (Reference: 13.5 - 17.5)
        WBC Count: 14500 /uL (Reference: 4500 - 11000)
        Platelets: 250000 /uL (Reference: 150000 - 450000)
        Fasting Blood Glucose: 165 mg/dL (Reference: 70 - 99)
        Serum Creatinine: 1.0 mg/dL (Reference: 0.7 - 1.3)
      `;

      const result = await aiGateway.extractReportOCR(mockReportText);
      expect(result).toHaveProperty('biomarkers');
      expect(result.biomarkers.length).toBeGreaterThanOrEqual(4);

      const hb = result.biomarkers.find(b => b.biomarker === 'HEMOGLOBIN');
      expect(hb).toBeDefined();
      expect(hb.flag).toBe('LOW');

      const wbc = result.biomarkers.find(b => b.biomarker === 'WHITE_BLOOD_CELLS');
      expect(wbc).toBeDefined();
      expect(wbc.flag).toBe('HIGH');

      const glucose = result.biomarkers.find(b => b.biomarker === 'FASTING_GLUCOSE');
      expect(glucose).toBeDefined();
      expect(glucose.flag).toBe('HIGH');

      const creatinine = result.biomarkers.find(b => b.biomarker === 'SERUM_CREATININE');
      expect(creatinine).toBeDefined();
      expect(creatinine.flag).toBe('NORMAL');
    });
  });

  describe('4. Pharmacovigilance & Drug-Drug Interaction Safety', () => {
    it('flags CONTRAINDICATED interaction between Aspirin and Warfarin', async () => {
      const check = await aiGateway.checkDrugInteractions(['Aspirin', 'Warfarin']);
      expect(check.contraindication_found).toBe(true);
      expect(check.interactions.length).toBeGreaterThan(0);
      const major = check.interactions.find(i => i.severity === 'CONTRAINDICATED');
      expect(major).toBeDefined();
      expect(major.effect).toMatch(/bleeding|hemorrhagic/i);
    });

    it('returns clean safety profile for compatible medications', async () => {
      const check = await aiGateway.checkDrugInteractions(['Paracetamol', 'Vitamin C']);
      expect(check.contraindication_found).toBe(false);
      expect(check.interactions.length).toBe(0);
      expect(check.safety_status).not.toBe('SAFE');
      expect(check.safety_status).toBe('NOT_ASSESSED');
    });
  });

  describe('5. Razorpay Payments & Cryptographic Signature Verification', () => {
    it('verifies valid HMAC-SHA256 signature generated with Razorpay secret', async () => {
      const testOrderId = 'order_Tync9QzgkjXRIh';
      const testPaymentId = 'pay_test_9876543210';
      const secret = process.env.RAZORPAY_KEY_SECRET;

      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(`${testOrderId}|${testPaymentId}`)
        .digest('hex');

      const verification = await paymentService.verifyPaymentSignature({
        orderId: testOrderId,
        paymentId: testPaymentId,
        signature: validSignature,
      });

      expect(verification.verified).toBe(true);
      expect(verification.status).toBe('PAID');
    });

    it('rejects tampered or fraudulent payment signatures with strict exception', async () => {
      const testOrderId = 'order_Tync9QzgkjXRIh';
      const testPaymentId = 'pay_test_9876543210';
      const forgedSignature = 'bad_forged_signature_0123456789abcdef';

      await expect(
        paymentService.verifyPaymentSignature({
          orderId: testOrderId,
          paymentId: testPaymentId,
          signature: forgedSignature,
        })
      ).rejects.toThrow(/Invalid Razorpay payment signature/);
    });
  });
});
