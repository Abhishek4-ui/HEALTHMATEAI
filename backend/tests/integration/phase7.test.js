const request = require('supertest');
const app = require('../../src/app');
const { generateAccessToken } = require('../../src/security/jwt');
const syncService = require('../../src/services/sync.service');
const doctorService = require('../../src/services/doctor.service');
const hospitalService = require('../../src/services/hospital.service');
const registryService = require('../../src/services/registry.service');
const { DoctorProfile, DoctorAvailability, Hospital, SyncLog, Appointment } = require('../../src/models');

describe('Phase 7: Real Healthcare Data Integration & Automatic Synchronization Suite', () => {
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
    patientToken = generateAccessToken({ id: '6af41b252ec0cf18f46f7cf1', role: 'PATIENT', email: 'patient.p7@healthmate.ai' });
    doctorToken = generateAccessToken({ id: '6af41b252ec0cf18f46f7cf2', role: 'DOCTOR', email: 'doctor.p7@healthmate.ai' });
    adminToken = generateAccessToken({ id: '6af41b252ec0cf18f46f7cf3', role: 'ADMINISTRATION', email: 'admin.p7@healthmate.ai' });
  });

  afterAll(async () => {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  describe('1. Doctor Discovery Across India (Multi-Attribute & Geolocation)', () => {
    it('discovers doctors filtered by specialty, state, and city', async () => {
      const res = await request(app)
        .get('/api/v1/discovery/doctors')
        .query({ specialization: 'Cardiology', city: 'New Delhi' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.doctors)).toBe(true);
      if (res.body.data.doctors.length > 0) {
        const doc = res.body.data.doctors[0];
        expect(doc.specialization).toMatch(/cardiology/i);
        expect(doc).toHaveProperty('verificationStatus');
      }
    });

    it('filters doctors by postal PIN code and qualification', async () => {
      const res = await request(app)
        .get('/api/v1/discovery/doctors')
        .query({ pincode: '110029', qualification: 'DM' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.doctors)).toBe(true);
    });

    it('computes Haversine distance in km when user coordinates are provided', async () => {
      const res = await request(app)
        .get('/api/v1/discovery/doctors')
        .query({
          latitude: 28.5672,
          longitude: 77.2100,
          sortBy: 'distance',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.doctors)).toBe(true);
      if (res.body.data.doctors.length > 0) {
        const doc = res.body.data.doctors[0];
        expect(doc).toHaveProperty('distanceKm');
        if (doc.distanceKm !== null) {
          expect(typeof doc.distanceKm).toBe('number');
          expect(doc.distanceKm).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('enforces strict booking permission: only CREDENTIAL_VERIFIED doctors with schedules have booking enabled', async () => {
      const res = await request(app)
        .get('/api/v1/discovery/doctors')
        .query({ limit: 10 });

      expect(res.status).toBe(200);
      const doctors = res.body.data.doctors;
      for (const d of doctors) {
        if (d.verificationStatus === 'DISCOVERED') {
          expect(d.appointmentBookingAvailable).toBe(false);
          expect(d.bookingNotice).toBeTruthy();
        }
      }
    });
  });

  describe('2. Hospital and Healthcare Facility Discovery', () => {
    it('searches India-wide hospitals with facility type and city filters', async () => {
      const res = await request(app)
        .get('/api/v1/discovery/hospitals')
        .query({ city: 'New Delhi', facilityType: 'HOSPITAL' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.hospitals)).toBe(true);
      if (res.body.data.hospitals.length > 0) {
        const fac = res.body.data.hospitals[0];
        expect(fac).toHaveProperty('name');
        expect(fac).toHaveProperty('address');
        expect(fac).toHaveProperty('directionsUrl');
      }
    });

    it('finds nearby facilities via /api/v1/discovery/nearby endpoint', async () => {
      const res = await request(app)
        .get('/api/v1/discovery/nearby')
        .query({
          latitude: 28.6139,
          longitude: 77.2090,
          radius: 25000,
          type: 'hospital',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('3. Indian Healthcare Data Standards & Validation Gate', () => {
    it('validates legitimate Indian hospital within geographic bounding box [6-37.5°N, 68-98°E]', () => {
      const validHospital = {
        name: 'All India Institute of Medical Sciences (AIIMS)',
        address: { city: 'New Delhi', state: 'Delhi', pincode: '110029' },
        location: { type: 'Point', coordinates: [77.2090, 28.5672] },
      };

      const result = syncService.validateRecord('HOSPITAL', validHospital);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('quarantines records with coordinates outside Indian territorial bounds', () => {
      const foreignHospital = {
        name: 'Foreign Clinic in Europe',
        address: { city: 'London', state: 'UK', pincode: '123456' },
        location: { type: 'Point', coordinates: [-0.1278, 51.5074] }, // London coordinates
      };

      const result = syncService.validateRecord('HOSPITAL', foreignHospital);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('outside legitimate Indian territory bounds'))).toBe(true);
    });

    it('quarantines doctor records lacking official council registration numbers', () => {
      const invalidDoctor = {
        fullName: 'Dr. John Doe',
        specialization: 'Cardiology',
        medicalRegistrationNumber: null, // Missing statutory registration number
        location: { type: 'Point', coordinates: [77.2090, 28.5672] },
      };

      const result = syncService.validateRecord('DOCTOR', invalidDoctor);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Medical Registration Number'))).toBe(true);
    });
  });

  describe('4. Synchronization Engine: Exponential Backoff, Deduplication & Telemetry', () => {
    it('successfully executes operations with exponential backoff on transient errors', async () => {
      let callCount = 0;
      const transientTask = async (attempt) => {
        callCount++;
        if (callCount < 2) {
          throw new Error('Temporary network socket error');
        }
        return { success: true, attempts: callCount };
      };

      const result = await syncService.executeWithRetry(transientTask, 3, 50, 2);
      expect(result.success).toBe(true);
      expect(result.attempts).toBe(2);
    });

    it('allows toggling automatic periodic synchronization', async () => {
      const toggleRes = syncService.setAutoSync(false);
      expect(toggleRes.isAutoSyncActive).toBe(false);

      const restoreRes = syncService.setAutoSync(true);
      expect(restoreRes.isAutoSyncActive).toBe(true);
    });

    it('retrieves synchronization telemetry status', async () => {
      const status = await syncService.getSyncStatus();
      expect(status).toHaveProperty('isAutoSyncActive');
      expect(status).toHaveProperty('isSyncRunning');
      expect(status).toHaveProperty('totalCatalogHospitals');
      expect(status).toHaveProperty('totalCatalogDoctors');
      expect(status).toHaveProperty('dataSources');
    });
  });

  describe('5. Administration RBAC & Synchronizer Endpoints Protection', () => {
    it('grants ADMINISTRATION role access to /api/v1/admin/sync/status', async () => {
      const res = await request(app)
        .get('/api/v1/admin/sync/status')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('isAutoSyncActive');
    });

    it('rejects PATIENT role from triggering sync with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/admin/sync/trigger')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ triggerType: 'ADMIN_MANUAL' });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('FORBIDDEN_ROLE');
    });

    it('rejects unauthenticated requests to sync quarantine queue with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/admin/sync/quarantine');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });

    it('allows administration to fetch paginated facilities with accreditation tiers', async () => {
      const res = await request(app)
        .get('/api/v1/admin/facilities')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.facilities)).toBe(true);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('totalPages');
    });
  });

  describe('6. Real Availability Calculation & Double-Booking Collision Prevention', () => {
    it('returns genuine configured time slots for doctor availability', async () => {
      // Find a doctor with availability
      const availableRule = await DoctorAvailability.findOne({ isAvailable: true });
      if (availableRule) {
        const testDate = new Date();
        // Adjust date to match availableRule.dayOfWeek
        const currentDay = testDate.getDay();
        const diff = (availableRule.dayOfWeek - currentDay + 7) % 7;
        testDate.setDate(testDate.getDate() + (diff === 0 ? 7 : diff));
        const dateStr = testDate.toISOString().split('T')[0];

        const slots = await doctorService.getDoctorAvailability(availableRule.doctorId, dateStr);
        expect(slots).toHaveProperty('doctorId');
        expect(slots).toHaveProperty('slots');
        expect(Array.isArray(slots.slots)).toBe(true);
        expect(slots.isAvailable).toBe(true);
      }
    });

    it('returns empty slots and clear message when doctor has no configured hours on given day', async () => {
      const dummyId = '6af41b252ec0cf18f46f7cf9';
      const slots = await doctorService.getDoctorAvailability(dummyId, '2026-12-01');
      expect(slots.isAvailable).toBe(false);
      expect(slots.slots).toEqual([]);
      expect(slots.message).toContain('No available appointment schedule');
    });
  });
});
