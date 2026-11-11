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

  getAuditLogs: async (filters = {}) => {
    return apiClient.get('/admin/compliance/audit-logs', { params: filters });
  }
};

export default adminService;
