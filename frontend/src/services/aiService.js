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

  extractLabReportOCR: async (formData) => {
    return apiClient.post('/patient/reports/ocr-extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getClinicalSoapSummary: async (consultationContext) => {
    return apiClient.post('/doctor/copilot/summarize', consultationContext);
  },

  checkDrugInteractions: async (medicationsList) => {
    return apiClient.post('/doctor/prescriptions/check-interactions', {
      medications: medicationsList,
    });
  }
};

export default aiService;
