import apiClient from './api';

export const adminService = {
  getSystemMetrics: async () => {
    return apiClient.get('/admin/metrics/overview');
  },

  getDoctorVerificationQueue: async () => {
    return apiClient.get('/admin/doctors/pending-review');
  },

  verifyDoctor: async (doctorId, decision, notes) => {
    return apiClient.post(`/admin/doctors/${doctorId}/verify`, { decision, notes });
  },

  getFacilitySyncStatus: async () => {
    return apiClient.get('/admin/discovery/sync-status');
  },

  getSyncStatus: async () => {
    return apiClient.get('/admin/sync/status');
  },

  triggerSync: async (triggerType = 'ADMIN_MANUAL') => {
    return apiClient.post('/admin/sync/trigger', { triggerType });
  },

  toggleAutoSync: async (active) => {
    return apiClient.put('/admin/sync/toggle', { active });
  },

  getQuarantinedRecords: async (limit = 50) => {
    return apiClient.get('/admin/sync/quarantine', { params: { limit } });
  },

  getFacilities: async (params = {}) => {
    return apiClient.get('/admin/facilities', { params });
  },

  getIntegrations: async () => {
    return apiClient.get('/admin/integrations');
  },

  triggerFacilitySync: async (source) => {
    return apiClient.post('/admin/discovery/trigger-sync', { source });
  },

  getMLOpsModelRegistry: async () => {
    return apiClient.get('/admin/mlops/models');
  },

  getMLOpsTelemetry: async () => {
    return apiClient.get('/admin/mlops/telemetry');
  },

  getMLOpsDrift: async () => {
    return apiClient.get('/admin/mlops/drift');
  },

  queryRAGGuidelines: async (query, top_k = 2) => {
    return apiClient.post('/admin/clinical/rag-query', { query, top_k });
  },

  rollbackModel: async (modelId, targetVersion) => {
    return apiClient.post('/admin/mlops/rollback', { modelId, targetVersion });
  },

  getDatasets: async () => {
    return apiClient.get('/admin/datasets');
  },

  getAuditLogs: async (filters = {}) => {
    return apiClient.get('/admin/compliance/audit-logs', { params: filters });
  },

  getPendingPayments: async () => {
    return apiClient.get('/payments/admin/pending');
  },

  verifyUpiPayment: async (transactionId, notes) => {
    return apiClient.post('/payments/admin/verify', { transactionId, notes });
  },

  rejectUpiPayment: async (transactionId, reason) => {
    return apiClient.post('/payments/admin/reject', { transactionId, reason });
  },

  processRefund: async (transactionId, refundNotes) => {
    return apiClient.post('/payments/admin/refund-process', { transactionId, refundNotes });
  }
};

export default adminService;
