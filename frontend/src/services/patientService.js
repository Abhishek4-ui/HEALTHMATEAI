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

  getAppointments: async (params) => {
    return apiClient.get('/appointments', { params });
  },

  bookAppointment: async (bookingData) => {
    return apiClient.post('/appointments/book', bookingData);
  },

  cancelAppointment: async (appointmentId, reason) => {
    return apiClient.put(`/appointments/${appointmentId}/cancel`, { reason });
  },

  purgeSession: async (sessionId) => {
    return apiClient.delete(`/patient/session/${sessionId}`);
  },

  exportPatientConsentData: async () => {
    return apiClient.get('/patient/data-export');
  },

  createPaymentOrder: async (orderData) => {
    return apiClient.post('/payments/order', orderData);
  },

  verifyPaymentSignature: async (paymentData) => {
    return apiClient.post('/payments/verify-signature', paymentData);
  },

  getPaymentConfig: async () => {
    return apiClient.get('/payments/config');
  },

  initiateManualUpi: async (payload) => {
    return apiClient.post('/payments/upi/initiate', payload);
  },

  submitUpiUtr: async (payload) => {
    return apiClient.post('/payments/upi/submit-utr', payload);
  },

  getMyTransactions: async () => {
    return apiClient.get('/payments/my-transactions');
  },

  requestRefund: async (payload) => {
    return apiClient.post('/payments/refund-request', payload);
  }
};

export default patientService;
