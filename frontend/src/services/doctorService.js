import apiClient from './api';

export const doctorService = {
  getProfile: async () => {
    return apiClient.get('/doctor/profile');
  },

  updateProfile: async (profileData) => {
    return apiClient.put('/doctor/profile', profileData);
  },

  getVerificationStatus: async () => {
    return apiClient.get('/doctor/verification-status');
  },

  getSchedule: async () => {
    return apiClient.get('/doctor/schedule');
  },

  updateAvailability: async (availabilitySlots) => {
    return apiClient.post('/doctor/availability', { slots: availabilitySlots });
  },

  getAppointments: async () => {
    return apiClient.get('/doctor/appointments');
  },

  issuePrescription: async (prescriptionPayload) => {
    return apiClient.post('/doctor/prescriptions/generate', prescriptionPayload);
  },

  getEarningsLedger: async () => {
    return apiClient.get('/doctor/finance/ledger');
  }
};

export default doctorService;
