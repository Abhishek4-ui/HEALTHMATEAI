const request = require('supertest');
const app = require('../../src/app');

describe('Medical Imaging AI & Cardiac ECG Analysis API Integration', () => {

  test('1. POST /api/v1/patient/imaging/analyze succeeds with CXR image and returns structured findings', async () => {
    const fakeImageBuffer = Buffer.from('FAKE_CHEST_XRAY_IMAGE_BYTES_12345');
    
    const res = await request(app)
      .post('/api/v1/patient/imaging/analyze')
      .attach('image', fakeImageBuffer, 'chest_xray_test.jpg')
      .field('modality', 'XRAY')
      .field('patient_consent', 'true');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.modality).toBe('XRAY');
    expect(Array.isArray(res.body.findings)).toBe(true);
    expect(res.body.findings.length).toBeGreaterThan(0);
    expect(res.body.clinical_disclaimer).toBeDefined();
    expect(res.body.clinical_disclaimer).toContain('CLINICAL SAFETY MANDATE');
    expect(res.body.doctor_review_status).toBe('PENDING_CLINICIAN_REVIEW');
  });

  test('2. POST /api/v1/patient/imaging/analyze fails with 400 when image is missing', async () => {
    const res = await request(app)
      .post('/api/v1/patient/imaging/analyze')
      .field('modality', 'XRAY');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('BAD_REQUEST');
  });

  test('3. POST /api/v1/patient/imaging/analyze with CT scan returns HU density evaluation', async () => {
    const fakeCtBuffer = Buffer.from('DICOM_CT_SCAN_SLICE_001');

    const res = await request(app)
      .post('/api/v1/patient/imaging/analyze')
      .attach('image', fakeCtBuffer, 'head_ct.dcm')
      .field('modality', 'CT')
      .field('patient_consent', 'true');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.modality).toBe('CT');
    expect(res.body.findings.length).toBeGreaterThan(0);
    expect(res.body.quality_validation).toBeDefined();
  });

  test('4. POST /api/v1/patient/cardiac/ecg-analyze processes ECG trace and returns Bazett QTc interval', async () => {
    const fakeEcgBuffer = Buffer.from('ECG_RECORD_LEAD_II_TRACE_DATA');

    const res = await request(app)
      .post('/api/v1/patient/cardiac/ecg-analyze')
      .attach('ecg', fakeEcgBuffer, 'ecg_trace_patient.pdf')
      .field('patient_age', '55')
      .field('patient_consent', 'true');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.cardiac_measurements).toBeDefined();
    expect(res.body.cardiac_measurements.heart_rate_bpm).toBeGreaterThan(0);
    expect(res.body.cardiac_measurements.pr_interval_ms).toBeGreaterThan(0);
    expect(res.body.cardiac_measurements.qrs_duration_ms).toBeGreaterThan(0);
    expect(res.body.cardiac_measurements.qtc_interval_ms).toBeGreaterThan(0);
    expect(res.body.rhythm_analysis).toBeDefined();
    expect(Array.isArray(res.body.waveform_lead_ii)).toBe(true);
    expect(res.body.waveform_lead_ii.length).toBe(250);
    expect(res.body.clinical_disclaimer).toContain('CLINICAL SAFETY MANDATE');
  });

  test('5. POST /api/v1/patient/cardiac/ecg-analyze fails with 400 when ecg file is missing', async () => {
    const res = await request(app)
      .post('/api/v1/patient/cardiac/ecg-analyze')
      .field('patient_age', '55');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('BAD_REQUEST');
  });

});
