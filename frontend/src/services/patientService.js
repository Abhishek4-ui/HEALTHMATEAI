import apiClient from './api';

export const patientService = {
  getVitals: async () => {
    return apiClient.get('/patient/vitals');
  },

  logVitals: async (vitalData) => {
    return apiClient.post('/patient/vitals', vitalData);
  },

  getPrescriptions: async () => {
    return apiClient.get('/patient/prescriptions');
  },

  getAppointments: async () => {
    return apiClient.get('/patient/appointments');
  },

  bookAppointment: async (bookingData) => {
    return apiClient.post('/appointments/book', bookingData);
  },

  purgeSession: async (sessionId) => {
    return apiClient.delete(`/patient/session/${sessionId}`);
  },

  exportPatientConsentData: async () => {
    return apiClient.get('/patient/data-export');
  }
};

export default patientService;
