const request = require('supertest');
const app = require('../../src/app');
const { 
  INDIAN_STATES_AND_UTS, 
  TOTAL_STATES_AND_UTS_COUNT, 
  STATES_COUNT, 
  UTS_COUNT 
} = require('../../src/constants/indianStatesAndDistricts');

describe('India-Wide Healthcare Location System (All 28 States & 8 UTs)', () => {

  test('1. Master States & UTs Catalog returns exactly 36 entities (28 States, 8 UTs)', async () => {
    const res = await request(app).get('/api/v1/discovery/states');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total).toBe(36);
    expect(res.body.data.statesCount).toBe(28);
    expect(res.body.data.utsCount).toBe(8);
    expect(res.body.data.states.length).toBe(36);
  });

  test('2. Dynamic district lookup validation for each of the 36 Indian States and UTs', async () => {
    expect(INDIAN_STATES_AND_UTS.length).toBe(36);

    for (const entity of INDIAN_STATES_AND_UTS) {
      const res = await request(app)
        .get('/api/v1/discovery/districts')
        .query({ state: entity.name });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.state).toBe(entity.name);
      expect(res.body.data.type).toBe(entity.type);
      expect(Array.isArray(res.body.data.districts)).toBe(true);
      expect(res.body.data.districts.length).toBeGreaterThanOrEqual(1);
    }
  });

  test('3. Doctor search across each of the 36 States & UTs responds with valid contract', async () => {
    for (const entity of INDIAN_STATES_AND_UTS) {
      const res = await request(app)
        .get('/api/v1/discovery/doctors')
        .query({ state: entity.name, limit: 5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data.doctors)).toBe(true);
    }
  });

  test('4. Hospital search across each of the 36 States & UTs responds with valid contract', async () => {
    for (const entity of INDIAN_STATES_AND_UTS) {
      const res = await request(app)
        .get('/api/v1/discovery/hospitals')
        .query({ state: entity.name, limit: 5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data.hospitals)).toBe(true);
    }
  });

  test('5. Rejects district lookup without state parameter with 400', async () => {
    const res = await request(app).get('/api/v1/discovery/districts');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('6. Returns 404 for nonexistent state name', async () => {
    const res = await request(app)
      .get('/api/v1/discovery/districts')
      .query({ state: 'NonExistentIndianState' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
