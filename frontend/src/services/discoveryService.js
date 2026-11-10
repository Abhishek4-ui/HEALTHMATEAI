import apiClient from './api';

export const discoveryService = {
  getNearbyFacilities: async (lat, lng, radius = 5000, type = 'hospital') => {
    return apiClient.get('/discovery/nearby', {
      params: { lat, lng, radius, type },
    });
  },

  searchDoctors: async (filters = {}) => {
    return apiClient.get('/discovery/doctors', { params: filters });
  },

  searchHospitals: async (filters = {}) => {
    return apiClient.get('/discovery/hospitals', { params: filters });
  },

  getFacilityDetails: async (facilityId) => {
    return apiClient.get(`/discovery/facilities/${facilityId}`);
  },

  getDoctorProfile: async (doctorId) => {
    return apiClient.get(`/discovery/doctors/${doctorId}`);
  }
};

export default discoveryService;
