const request = require('supertest');
const crypto = require('crypto');
const app = require('../../src/app');
const { generateAccessToken } = require('../../src/security/jwt');
const { 
  User, 
  DoctorProfile, 
  DoctorAvailability, 
  Appointment, 
  Consultation, 
  PatientProfile 
} = require('../../src/models');

describe('Enterprise AI Doctor & Real Doctor Consultation Suite', () => {
  jest.setTimeout(65000);
  let patientA, patientB, doctorUser, doctorProfile;
  let tokenA, tokenB, doctorToken;
  let activeAppointment;

  beforeAll(async () => {
    const { connectDB } = require('../../src/config/db');
    try {
      await connectDB();
    } catch (e) {
      console.warn('DB connect error in test:', e.message);
    }

    // 1. Create Patient A
    patientA = await User.create({
      fullName: 'Ananya Sharma',
      email: `patient.a.${Date.now()}@healthmate.ai`,
      passwordHash: 'hashed_password_123',
      role: 'PATIENT',
      isEmailVerified: true,
      phone: '9876543210',
    });
    tokenA = generateAccessToken(patientA);

    await PatientProfile.create({
      userId: patientA._id,
      gender: 'Female',
      dateOfBirth: new Date('1994-05-15'),
      chronicConditions: ['Mild Asthma'],
      knownAllergies: ['Penicillin'],
    });

    // 2. Create Patient B (for Isolation Testing)
    patientB = await User.create({
      fullName: 'Vikram Verma',
      email: `patient.b.${Date.now()}@healthmate.ai`,
      passwordHash: 'hashed_password_456',
      role: 'PATIENT',
      isEmailVerified: true,
      phone: '9876543211',
    });
    tokenB = generateAccessToken(patientB);

    // 3. Create Doctor User & Profile
    doctorUser = await User.create({
      fullName: 'Dr. Sameer Kulkarni',
      email: `doc.${Date.now()}@healthmate.ai`,
      passwordHash: 'hashed_password_doc',
      role: 'DOCTOR',
      isEmailVerified: true,
      phone: '9876543212',
    });
    doctorToken = generateAccessToken(doctorUser);

    doctorProfile = await DoctorProfile.create({
      userId: doctorUser._id,
      fullName: doctorUser.fullName,
      medicalRegistrationNumber: `MCI-${Date.now()}`,
      stateMedicalCouncil: 'Maharashtra Medical Council',
      specialization: 'Cardiology',
      experienceYears: 14,
      consultationFee: 750,
      verificationStatus: 'CREDENTIAL_VERIFIED',
      sourceType: 'STATE_MEDICAL_COUNCIL',
      isClaimed: true,
      address: {
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      },
      location: {
        type: 'Point',
        coordinates: [72.8777, 19.0760],
      },
    });

    // Configure Availability Schedule for Wednesday (day 3) and Friday (day 5)
    await DoctorAvailability.create({
      doctorId: doctorProfile._id,
      dayOfWeek: 3,
      startTime: '09:00',
      endTime: '12:00',
      slotDurationMinutes: 30,
      isAvailable: true,
    });
  });

  afterAll(async () => {
    if (patientA) await User.deleteOne({ _id: patientA._id });
    if (patientB) await User.deleteOne({ _id: patientB._id });
    if (doctorUser) await User.deleteOne({ _id: doctorUser._id });
    if (doctorProfile) await DoctorProfile.deleteOne({ _id: doctorProfile._id });
    await PatientProfile.deleteMany({ userId: { $in: [patientA?._id, patientB?._id] } });
    await Consultation.deleteMany({ patientId: { $in: [patientA?._id, patientB?._id] } });
    await Appointment.deleteMany({ patientId: { $in: [patientA?._id, patientB?._id] } });
    await DoctorAvailability.deleteMany({ doctorId: doctorProfile?._id });
  });

  // =========================================================================
  // 1. AI DOCTOR CONSULTATION TESTS
  // =========================================================================
  describe('1. AI Doctor Consultation Workflow', () => {
    let aiSessionId;

    it('rejects unauthenticated requests to AI Doctor consultation', async () => {
      const res = await request(app)
        .post('/api/v1/consultations/ai/start')
        .send({ language: 'en' });
      expect(res.status).toBe(401);
    });

    it('initializes a new AI Doctor session with patient context consent', async () => {
      const res = await request(app)
        .post('/api/v1/consultations/ai/start')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          language: 'en',
          patientContextConsented: true,
          title: 'Cardiovascular Symptom Triage',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.consultationCategory).toBe('AI_DOCTOR');
      expect(res.body.data.patientContextConsented).toBe(true);
      expect(res.body.data.aiMessages.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.aiMessages[0].role).toBe('assistant');

      aiSessionId = res.body.data._id;
    });

    it('processes user message in English with structured clinical breakdown', async () => {
      const res = await request(app)
        .post(`/api/v1/consultations/ai/${aiSessionId}/message`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          query: 'I have had a dry cough and mild sore throat for 2 days.',
          language: 'en',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('response');
      expect(res.body.data.response).toHaveProperty('answer');
      expect(res.body.data.response).toHaveProperty('disclaimer');
      expect(res.body.data.response.is_emergency).toBe(false);
      expect(res.body.data.messages.length).toBe(3); // Initial + user + assistant
    });

    it('immediately flags emergency red flags and provides 112 guidance', async () => {
      const res = await request(app)
        .post(`/api/v1/consultations/ai/${aiSessionId}/message`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          query: 'I am experiencing crushing central chest pain radiating to my left arm with severe breathlessness.',
          language: 'en',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.response.is_emergency).toBe(true);
      expect(res.body.data.response.warning_signs.length).toBeGreaterThan(0);
      expect(res.body.data.response.emergency_guidance).toContain('112');
    });

    it('concludes AI Doctor session and generates clinical summary', async () => {
      const res = await request(app)
        .post(`/api/v1/consultations/ai/${aiSessionId}/end`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('COMPLETED');
      expect(res.body.data).toHaveProperty('aiSummary');
    });
  });

  // =========================================================================
  // 2. DOCTOR DISCOVERY & AVAILABILITY TESTS
  // =========================================================================
  describe('2. Real Doctor Discovery & Availability', () => {
    it('discovers doctors with verified credentials and state filters', async () => {
      const res = await request(app)
        .get('/api/v1/discovery/doctors?state=Maharashtra&specialization=Cardiology');

      expect(res.status).toBe(200);
      const doctors = res.body.doctors || res.body.data?.doctors || [];
      expect(doctors.length).toBeGreaterThan(0);
      const doc = doctors.find(d => d._id === doctorProfile._id.toString());
      expect(doc).toBeDefined();
      expect(doc.verificationStatus).toBe('CREDENTIAL_VERIFIED');
      expect(doc.medicalRegistrationNumber).toBe(doctorProfile.medicalRegistrationNumber);
    });

    it('calculates real unbooked slots from DoctorAvailability', async () => {
      // Find upcoming Wednesday
      const targetDate = new Date();
      while (targetDate.getDay() !== 3) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      const dateStr = targetDate.toISOString().split('T')[0];

      const res = await request(app)
        .get(`/api/v1/doctor/${doctorProfile._id}/availability?date=${dateStr}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isAvailable).toBe(true);
      expect(res.body.data.slots).toContain('09:00');
      expect(res.body.data.slots).toContain('09:30');
    });

    it('honestly returns no availability when schedule is unconfigured', async () => {
      // Sunday (day 0) has no schedule configured
      const targetDate = new Date();
      while (targetDate.getDay() !== 0) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      const dateStr = targetDate.toISOString().split('T')[0];

      const res = await request(app)
        .get(`/api/v1/doctor/${doctorProfile._id}/availability?date=${dateStr}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isAvailable).toBe(false);
      expect(res.body.data.slots.length).toBe(0);
    });
  });

  // =========================================================================
  // 3. APPOINTMENT BOOKING & DOUBLE BOOKING PREVENTION
  // =========================================================================
  describe('3. Real Appointment Booking & Collision Guard', () => {
    let bookingDateStr;

    beforeAll(() => {
      const targetDate = new Date();
      while (targetDate.getDay() !== 3) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      bookingDateStr = targetDate.toISOString().split('T')[0];
    });

    it('successfully reserves an available slot atomically', async () => {
      const res = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          doctorId: doctorProfile._id,
          scheduledDate: bookingDateStr,
          timeSlot: '09:00',
          consultationType: 'VIDEO',
          chiefComplaint: 'Post-viral fatigue and mild tachycardia during exertion.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PENDING_PAYMENT');
      expect(res.body.data.paymentAmount).toBe(750);
      expect(res.body.data.teleconsultationRoomId).toBeDefined();

      activeAppointment = res.body.data;
    });

    it('strictly prevents double booking of the identical time slot', async () => {
      // Patient B attempts to reserve the identical doctor, date, and slot
      const res = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          doctorId: doctorProfile._id,
          scheduledDate: bookingDateStr,
          timeSlot: '09:00',
          consultationType: 'VIDEO',
          chiefComplaint: 'Second patient attempting collision.',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already been reserved/i);
    });
  });

  // =========================================================================
  // 4. RAZORPAY TEST MODE SERVER-SIDE PAYMENT & SIGNATURE VERIFICATION
  // =========================================================================
  describe('4. Razorpay Test Mode Payment Verification', () => {
    it('creates a validated server-side Razorpay order', async () => {
      const res = await request(app)
        .post('/api/v1/payments/create-order')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          appointmentId: activeAppointment._id,
          amount: 750,
          currency: 'INR',
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('orderId');
      expect(res.body.data.amount).toBe(750); // INR currency
    });

    it('rejects forged or invalid payment signature', async () => {
      const res = await request(app)
        .post('/api/v1/payments/verify-signature')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          orderId: 'order_test_fake_123',
          paymentId: 'pay_test_fake_456',
          signature: 'forged_invalid_hmac_hex',
          appointmentId: activeAppointment._id,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('confirms appointment status upon authentic HMAC SHA-256 signature', async () => {
      const mockOrderId = `order_${Date.now()}`;
      const mockPaymentId = `pay_${Date.now()}`;
      const secret = process.env.RAZORPAY_KEY_SECRET || 'secret';
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${mockOrderId}|${mockPaymentId}`)
        .digest('hex');

      const res = await request(app)
        .post('/api/v1/payments/verify-signature')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          orderId: mockOrderId,
          paymentId: mockPaymentId,
          signature: expectedSignature,
          appointmentId: activeAppointment._id,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify Appointment updated to CONFIRMED and PAID
      const updatedAppt = await Appointment.findById(activeAppointment._id);
      expect(updatedAppt.status).toBe('CONFIRMED');
      expect(updatedAppt.paymentStatus).toBe('PAID');
    });
  });

  // =========================================================================
  // 5. WEBRTC VIDEO TOKEN & ROOM AUTHORIZATION
  // =========================================================================
  describe('5. WebRTC Video Room Token & Authorization', () => {
    it('generates WebRTC session room token for assigned patient with active TURN relay', async () => {
      const res = await request(app)
        .get(`/api/v1/consultations/${activeAppointment._id}/token`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('roomId');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('stunServers');
      expect(res.body.data).toHaveProperty('iceServers');
      expect(res.body.data.identity).toBe(`patient_${patientA._id}`);
      expect(res.body.data.turnConfigured).toBe(true);
      expect(res.body.data.turnStatus).toBe('ACTIVE_TWILIO_NTS');
      expect(res.body.data.iceServers.some(s => (s.urls || s.url || '').includes('turn:'))).toBe(true);
    });
  });

  // =========================================================================
  // 6. AI PRE-CONSULTATION SUMMARY FOR DOCTOR
  // =========================================================================
  describe('6. AI-Assisted Pre-Consultation Summary', () => {
    let draftSummary;

    it('drafts pre-consultation summary incorporating patient vitals and chief complaint', async () => {
      const res = await request(app)
        .get(`/api/v1/consultations/pre-summary/${activeAppointment._id}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('chiefComplaint');
      expect(res.body.data).toHaveProperty('aiDraftSummary');
      expect(res.body.data.isPatientApproved).toBe(false);

      draftSummary = res.body.data;
    });

    it('records explicit patient sign-off and approval before sharing with doctor', async () => {
      const res = await request(app)
        .post(`/api/v1/consultations/pre-summary/${activeAppointment._id}/approve`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          approvedSummary: draftSummary,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.approved).toBe(true);
      expect(res.body.data.approvedAt).toBeDefined();
    });
  });

  // =========================================================================
  // 7. PATIENT DATA ISOLATION & DPDP SECURITY
  // =========================================================================
  describe('7. Patient Data Isolation & Privacy', () => {
    it('prevents Patient B from accessing Patient A consultation records', async () => {
      // Patient A queries their own consultation history
      const resA = await request(app)
        .get('/api/v1/consultations/history')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(resA.status).toBe(200);
      expect(resA.body.data.consultations.length).toBeGreaterThan(0);
      const consultationAId = resA.body.data.consultations[0]._id;

      // Patient B attempts to access Patient A's consultation details
      const resB = await request(app)
        .get(`/api/v1/consultations/detail/${consultationAId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(resB.status).toBe(404); // Isolated / unauthorized returns not found
    });

    it('prevents Patient B from deleting Patient A AI consultation session', async () => {
      const resA = await request(app)
        .get('/api/v1/consultations/history?category=AI_DOCTOR')
        .set('Authorization', `Bearer ${tokenA}`);

      if (resA.body.data.consultations.length > 0) {
        const aiSessionId = resA.body.data.consultations[0]._id;

        const resB = await request(app)
          .delete(`/api/v1/consultations/ai/${aiSessionId}`)
          .set('Authorization', `Bearer ${tokenB}`);

        expect(resB.status).toBe(400);
        expect(resB.body.message).toMatch(/not found or unauthorized/i);
      }
    });

    it('allows Patient A to purge their own AI consultation session under DPDP', async () => {
      const resA = await request(app)
        .get('/api/v1/consultations/history?category=AI_DOCTOR')
        .set('Authorization', `Bearer ${tokenA}`);

      if (resA.body.data.consultations.length > 0) {
        const aiSessionId = resA.body.data.consultations[0]._id;

        const delRes = await request(app)
          .delete(`/api/v1/consultations/ai/${aiSessionId}`)
          .set('Authorization', `Bearer ${tokenA}`);

        expect(delRes.status).toBe(200);
        expect(delRes.body.success).toBe(true);
      }
    });
  });
});
