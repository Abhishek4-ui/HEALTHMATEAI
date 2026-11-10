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

  triggerFacilitySync: async (source) => {
    return apiClient.post('/admin/discovery/trigger-sync', { source });
  },

  getMLOpsModelRegistry: async () => {
    return apiClient.get('/admin/mlops/models');
  },

  getAuditLogs: async (filters = {}) => {
    return apiClient.get('/admin/compliance/audit-logs', { params: filters });
  }
};

export default adminService;
