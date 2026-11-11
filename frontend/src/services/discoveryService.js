import apiClient from './api';

export const discoveryService = {
  getNearbyFacilities: async (lat, lng, radius = 15000, type = 'hospital') => {
    const res = await apiClient.get('/discovery/nearby', {
      params: { lat, lng, radius, type },
    });
    const payload = res.data || res;
    if (Array.isArray(payload)) {
      return type === 'doctor' ? { doctors: payload } : { facilities: payload };
    }
    return payload;
  },

  searchDoctors: async (filters = {}) => {
    const res = await apiClient.get('/discovery/doctors', { params: filters });
    const payload = res.data || res;
    if (payload.doctors) return payload;
    if (Array.isArray(payload)) return { doctors: payload };
    return { doctors: [] };
  },

  searchHospitals: async (filters = {}) => {
    const res = await apiClient.get('/discovery/hospitals', { params: filters });
    const payload = res.data || res;
    if (payload.hospitals) return { facilities: payload.hospitals, ...payload };
    if (Array.isArray(payload)) return { facilities: payload };
    return { facilities: [] };
  },

  getDoctorAvailability: async (doctorId, date) => {
    const res = await apiClient.get(`/doctor/${doctorId}/availability`, { params: { date } });
    return res.data || res;
  },

  getFacilityDetails: async (facilityId) => {
    const res = await apiClient.get(`/hospitals/${facilityId}`);
    return res.data || res;
  },
};

export default discoveryService;
