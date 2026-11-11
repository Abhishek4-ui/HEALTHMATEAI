const request = require('supertest');
const app = require('../../src/app');
const placesService = require('../../src/services/places.service');
const registryService = require('../../src/services/registry.service');

describe('Phase 4: Real Healthcare Data Integration & Discovery API Suite', () => {
  it('GET /api/v1/doctor/discovery returns India-wide doctors with pagination and filters', async () => {
    const res = await request(app).get('/api/v1/doctor/discovery?specialization=Cardiology');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('doctors');
    expect(res.body.data).toHaveProperty('total');
  });

  it('GET /api/v1/hospitals returns filterable hospitals across India', async () => {
    const res = await request(app).get('/api/v1/hospitals?city=New+Delhi');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('hospitals');
  });

  it('GET /api/v1/hospitals/nearby validates coordinate requirements', async () => {
    const res = await request(app).get('/api/v1/hospitals/nearby');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('COORDINATES_REQUIRED');
  });

  it('GET /api/v1/doctor/discovery/nearby validates coordinate requirements', async () => {
    const res = await request(app).get('/api/v1/doctor/discovery/nearby');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('COORDINATES_REQUIRED');
  });

  it('GET /api/v1/doctor/:id/availability rejects invalid date format', async () => {
    const res = await request(app).get('/api/v1/doctor/6af41b252ec0cf18f46f7cf3/availability?date=invalid-date');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('AVAILABILITY_ERROR');
  });

  it('PlacesService calculates accurate Haversine geographic distances', () => {
    // Distance between New Delhi (28.6139, 77.2090) and Gurugram (28.4595, 77.0266) is ~24 km
    const dist = placesService.calculateDistance(28.6139, 77.2090, 28.4595, 77.0266);
    expect(dist).toBeGreaterThan(20);
    expect(dist).toBeLessThan(30);
  });

  it('RegistryService deduplicates facilities by source ID and normalized name', async () => {
    const existing = [
      { sourceIdentifier: 'OGD-DEL-AIIMS-001', name: 'All India Institute of Medical Sciences', address: { city: 'New Delhi' } }
    ];
    const mockDiscovered = [
      { id: 'gp_test1', googlePlaceId: 'OGD-DEL-AIIMS-001', name: 'All India Institute of Medical Sciences', address: { city: 'New Delhi' } },
      { id: 'gp_test2', googlePlaceId: 'ChIJ_new_hospital_123', name: 'New Independent Clinic', address: { city: 'Vellore' } }
    ];
    const unique = await registryService.deduplicateDiscoveredFacilities(mockDiscovered, existing);
    expect(unique.some(f => f.googlePlaceId === 'OGD-DEL-AIIMS-001')).toBe(false);
    expect(unique.length).toBe(1);
    expect(unique[0].googlePlaceId).toBe('ChIJ_new_hospital_123');
  });

  it('GET /api/v1/reports/:token/signed-url returns 403 on expired or unauthorized token', async () => {
    const res = await request(app).get('/api/v1/reports/rep_nonexistent123/signed-url');
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('ACCESS_DENIED');
  });
});
