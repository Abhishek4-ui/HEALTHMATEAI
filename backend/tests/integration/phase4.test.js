const request = require('supertest');
const app = require('../../src/app');

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
});
