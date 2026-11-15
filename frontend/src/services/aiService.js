import apiClient from './api';

export const aiService = {
  sendHealthQuery: async (query, language = 'en', sessionHistory = []) => {
    return apiClient.post('/patient/copilot/message', {
      query,
      language,
      history: sessionHistory,
    });
  },

  checkSymptoms: async (symptomPayload) => {
    return apiClient.post('/patient/symptom-check', symptomPayload);
  },

  assessHealthRisk: async (riskParameters) => {
    return apiClient.post('/patient/risk-assessment', riskParameters);
  },

  assessCardioRisk: async (riskParameters) => {
    return apiClient.post('/patient/risk-assessment/cardio', riskParameters);
  },

  assessDiabetesRisk: async (riskParameters) => {
    return apiClient.post('/patient/risk-assessment/diabetes', riskParameters);
  },

  extractLabReportOCR: async (formData) => {
    return apiClient.post('/patient/reports/ocr-extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getClinicalSoapSummary: async (consultationContext) => {
    return apiClient.post('/doctor/copilot/summarize', consultationContext);
  },

  checkDrugInteractions: async (medicationsList) => {
    return apiClient.post('/patient/prescriptions/check-interactions', {
      medications: medicationsList,
    }).catch(() => {
      return apiClient.post('/doctor/prescriptions/check-interactions', {
        medications: medicationsList,
      });
    });
  },

  analyzeImagingScan: async (formData) => {
    return apiClient.post('/patient/imaging/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  analyzeECG: async (formData) => {
    return apiClient.post('/patient/cardiac/ecg-analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Enterprise AI Doctor & Consultation Center Services
  startAIDoctorSession: async (options = {}) => {
    return apiClient.post('/consultations/ai/start', options);
  },

  sendAIDoctorMessage: async (sessionId, payload) => {
    return apiClient.post(`/consultations/ai/${sessionId}/message`, payload);
  },

  endAIDoctorSession: async (sessionId) => {
    return apiClient.post(`/consultations/ai/${sessionId}/end`);
  },

  deleteAIDoctorSession: async (sessionId) => {
    return apiClient.delete(`/consultations/ai/${sessionId}`);
  },

  listConsultations: async (params = {}) => {
    return apiClient.get('/consultations/history', { params });
  },

  getConsultationDetail: async (id) => {
    return apiClient.get(`/consultations/detail/${id}`);
  },

  getPreConsultationSummary: async (appointmentId) => {
    return apiClient.get(`/consultations/pre-summary/${appointmentId}`);
  },

  approvePreConsultationSummary: async (appointmentId, approvedSummary) => {
    return apiClient.post(`/consultations/pre-summary/${appointmentId}/approve`, { approvedSummary });
  },

  getConsultationVideoToken: async (appointmentId) => {
    return apiClient.get(`/consultations/${appointmentId}/token`);
  }
};

export default aiService;
