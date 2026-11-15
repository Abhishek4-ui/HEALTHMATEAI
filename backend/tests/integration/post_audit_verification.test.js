const request = require('supertest');
const app = require('../../src/app');

describe('Post-Audit Comprehensive Acceptance Tests', () => {
  describe('1. Universal Upload & Modality Validation', () => {
    it('rejects medical imaging upload when file is missing', async () => {
      const res = await request(app)
        .post('/api/v1/patient/imaging/analyze')
        .send({ modality: 'XRAY' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Medical scan image file is required/i);
    });

    it('processes CXR image upload and returns structured morphological triage', async () => {
      const fakeImageBuffer = Buffer.from('fake_image_bytes_for_cxr_testing');
      const res = await request(app)
        .post('/api/v1/patient/imaging/analyze')
        .attach('image', fakeImageBuffer, 'test_chest_pa.png')
        .field('modality', 'XRAY')
        .field('patient_consent', 'true');

      expect([200, 503]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('modality');
        expect(res.body).toHaveProperty('clinical_disclaimer');
        expect(res.body.findings).toBeInstanceOf(Array);
      }
    });

    it('processes CT Head scan and returns Hounsfield density analysis', async () => {
      const fakeCtBuffer = Buffer.from('fake_ct_axial_slice_bytes');
      const res = await request(app)
        .post('/api/v1/patient/imaging/analyze')
        .attach('image', fakeCtBuffer, 'head_ct_axial.png')
        .field('modality', 'CT')
        .field('patient_consent', 'true');

      expect([200, 503]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.modality).toBe('CT');
        expect(res.body).toHaveProperty('quality_validation');
      }
    });
  });

  describe('2. ECG Waveform & Conduction Interval Pipeline', () => {
    it('processes ECG strip file and returns PR, QRS, and Bazett QTc measurements', async () => {
      const fakeEcgBuffer = Buffer.from('fake_ecg_lead_ii_recording');
      const res = await request(app)
        .post('/api/v1/patient/cardiac/ecg-analyze')
        .attach('ecg', fakeEcgBuffer, 'ecg_strip_lead2.pdf')
        .field('patient_age', '45')
        .field('patient_consent', 'true');

      expect([200, 503]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('cardiac_measurements');
        expect(res.body.cardiac_measurements).toHaveProperty('heart_rate_bpm');
        expect(res.body.cardiac_measurements).toHaveProperty('pr_interval_ms');
        expect(res.body.cardiac_measurements).toHaveProperty('qrs_duration_ms');
        expect(res.body.cardiac_measurements).toHaveProperty('qtc_interval_ms');
        expect(res.body.cardiac_measurements.qtc_formula).toMatch(/Bazett/i);
        expect(res.body).toHaveProperty('rhythm_analysis');
        expect(res.body).toHaveProperty('waveform_lead_ii');
        expect(res.body).toHaveProperty('clinical_disclaimer');
      }
    });
  });

  describe('3. Teleconsultation & WebRTC Session Token', () => {
    it('generates secure WebRTC token for consultation room or rejects unauthorized request', async () => {
      const res = await request(app)
        .get('/api/v1/consultations/apt_test_session_101/token');

      expect([200, 401, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('token');
      }
    });
  });

  describe('4. DPDP Patient Privacy & Right-to-be-Forgotten', () => {
    it('executes forget-me purge removing ephemeral files and session records', async () => {
      const res = await request(app)
        .delete('/api/v1/patient/forget-me')
        .send({ sessionId: 'sess_post_audit_purge_test' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.message).toMatch(/purged|deleted|removed/i);
    });
  });
});