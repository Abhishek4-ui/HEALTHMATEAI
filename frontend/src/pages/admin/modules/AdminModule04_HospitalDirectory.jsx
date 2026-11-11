import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  ExternalLink,
  Sliders,
  Database,
  Radio,
  FileWarning
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import { useToast } from '../../../context/ToastContext';
import { adminService } from '../../../services/adminService';

export default function AdminModule04_HospitalDirectory() {
  const [activeTab, setActiveTab] = useState('FACILITIES'); // 'FACILITIES' | 'QUARANTINE' | 'DATA_SOURCES'
  const [facilities, setFacilities] = useState([]);
  const [totalFacilities, setTotalFacilities] = useState(0);
  const [quarantinedRecords, setQuarantinedRecords] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  
  const [search, setSearch] = useState('');
  const [statusTier, setStatusTier] = useState('ALL');
  const [facilityType, setFacilityType] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [togglingAutoSync, setTogglingAutoSync] = useState(false);

  const { addToast } = useToast();

  useEffect(() => {
    loadSyncTelemetry();
    loadFacilities();
  }, [page, statusTier, facilityType]);

  const loadSyncTelemetry = async () => {
    try {
      const res = await adminService.getSyncStatus();
      const data = res.data || res;
      setSyncStatus(data);
    } catch (err) {
      console.error('Failed to load sync status:', err);
    }
  };

  const loadFacilities = async () => {
    setLoading(true);
    try {
      const res = await adminService.getFacilities({
        page,
        limit: 10,
        search: search || undefined,
        statusTier: statusTier !== 'ALL' ? statusTier : undefined,
        facilityType: facilityType !== 'ALL' ? facilityType : undefined,
      });
      const data = res.data || res;
      setFacilities(data.facilities || []);
      setTotalFacilities(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Loading Error',
        message: 'Could not retrieve facilities list.',
      });
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  const loadQuarantine = async () => {
    setLoading(true);
    try {
      const res = await adminService.getQuarantinedRecords(50);
      const data = res.data || res;
      setQuarantinedRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load quarantine records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'QUARANTINE') {
      loadQuarantine();
    } else if (tab === 'FACILITIES') {
      loadFacilities();
    } else if (tab === 'DATA_SOURCES') {
      loadSyncTelemetry();
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadFacilities();
  };

  const handleTriggerSync = async () => {
    setSyncing(true);
    try {
      const res = await adminService.triggerSync('ADMIN_MANUAL');
      const data = res.data || res;
      addToast({
        type: 'success',
        title: 'Synchronization Complete',
        message: `Processed ${data.recordsProcessed || 0} records. Inserted: ${data.recordsInserted || 0}, Updated: ${data.recordsUpdated || 0}, Duplicates: ${data.duplicatesDetected || 0}.`,
      });
      loadSyncTelemetry();
      loadFacilities();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Sync Failed',
        message: err.response?.data?.message || err.message,
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleAutoSync = async () => {
    if (!syncStatus) return;
    setTogglingAutoSync(true);
    try {
      const newStatus = !syncStatus.isAutoSyncActive;
      await adminService.toggleAutoSync(newStatus);
      setSyncStatus(prev => ({ ...prev, isAutoSyncActive: newStatus }));
      addToast({
        type: 'success',
        title: 'Auto-Sync Updated',
        message: `Scheduled periodic synchronization ${newStatus ? 'enabled' : 'disabled'}.`,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Error',
        message: 'Failed to update auto-sync schedule.',
      });
    } finally {
      setTogglingAutoSync(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Healthcare Facilities & Registry Synchronization
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            India-wide verified hospitals, MOHFW open registry ingestion, and automatic deduplication engine.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleToggleAutoSync}
            loading={togglingAutoSync}
            className="text-xs"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Auto-Sync: {syncStatus?.isAutoSyncActive ? 'Enabled (Daily)' : 'Paused'}</span>
          </Button>

          <Button
            size="sm"
            variant="blue"
            onClick={handleTriggerSync}
            loading={syncing}
            className="text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Run Sync Now</span>
          </Button>
        </div>
      </div>

      {/* Telemetry Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Hospitals</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">
              {syncStatus?.totalCatalogHospitals || totalFacilities}
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Catalog Doctors</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">
              {syncStatus?.totalCatalogDoctors || 0}
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Quarantine Records</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">
              {syncStatus?.totalQuarantinedRecords || quarantinedRecords.length}
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Sync Status</div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{syncStatus?.isSyncRunning ? 'Syncing...' : 'Healthy'}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => handleTabChange('FACILITIES')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'FACILITIES'
              ? 'border-aurora-teal text-aurora-teal'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Healthcare Facilities ({totalFacilities})</span>
        </button>

        <button
          onClick={() => handleTabChange('QUARANTINE')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'QUARANTINE'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileWarning className="w-3.5 h-3.5" />
          <span>Quarantine & Quality Alerts</span>
        </button>

        <button
          onClick={() => handleTabChange('DATA_SOURCES')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'DATA_SOURCES'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Data Sources Freshness</span>
        </button>
      </div>

      {/* TAB 1: Facilities List */}
      {activeTab === 'FACILITIES' && (
        <div className="space-y-4">
          {/* Filters */}
          <Card className="p-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by facility name, city, department..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={statusTier}
                onChange={(e) => { setStatusTier(e.target.value); setPage(1); }}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              >
                <option value="ALL">All Accreditation Tiers</option>
                <option value="CREDENTIAL_VERIFIED">Credential Verified</option>
                <option value="SOURCE_VERIFIED">Govt Source Verified</option>
                <option value="DISCOVERED">Discovered</option>
              </select>

              <select
                value={facilityType}
                onChange={(e) => { setFacilityType(e.target.value); setPage(1); }}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              >
                <option value="ALL">All Facility Types</option>
                <option value="HOSPITAL">Hospitals</option>
                <option value="CLINIC">Clinics</option>
                <option value="DIAGNOSTIC_CENTER">Diagnostic Centers</option>
              </select>

              <Button type="submit" size="sm" variant="primary" loading={loading}>
                <span>Filter</span>
              </Button>
            </form>
          </Card>

          {/* Table */}
          <Card className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5">Facility Name</th>
                    <th className="py-2.5">Type</th>
                    <th className="py-2.5">Location</th>
                    <th className="py-2.5">Departments</th>
                    <th className="py-2.5">Source</th>
                    <th className="py-2.5 text-right">Accreditation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {facilities.map((fac, idx) => (
                    <tr key={fac._id || idx} className="hover:bg-slate-50 dark:hover:bg-aurora-midnight/50">
                      <td className="py-3">
                        <div className="font-bold text-slate-900 dark:text-white">{fac.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ID: {fac.sourceIdentifier || fac._id?.slice(-8)}
                        </div>
                      </td>
                      <td className="py-3 text-slate-500">{fac.facilityType || 'HOSPITAL'}</td>
                      <td className="py-3 text-slate-500">
                        <div>{fac.address?.city || 'India'}</div>
                        {fac.address?.pincode && (
                          <div className="text-[10px] text-slate-400">PIN: {fac.address.pincode}</div>
                        )}
                      </td>
                      <td className="py-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        {Array.isArray(fac.departments) ? fac.departments.slice(0, 2).join(', ') : (fac.departments || 'General Care')}
                      </td>
                      <td className="py-3 text-[10px] font-mono text-slate-400">
                        {fac.sourceType || 'OPEN_DATASET'}
                      </td>
                      <td className="py-3 text-right">
                        <Badge variant={fac.statusTier === 'CREDENTIAL_VERIFIED' ? 'teal' : fac.statusTier === 'SOURCE_VERIFIED' ? 'blue' : 'amber'}>
                          {fac.statusTier}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {facilities.length === 0 && !loading && (
                <EmptyState
                  icon={Building2}
                  title="No facilities found"
                  description="Try adjusting your filter terms or trigger a manual sync."
                />
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-500">
                  Page {page} of {totalPages} ({totalFacilities} total facilities)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: Quarantine & Alerts */}
      {activeTab === 'QUARANTINE' && (
        <Card className="p-5 space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <FileWarning className="w-4 h-4 text-amber-500" />
              <span>Quarantined Records Audit</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Records rejected by the boundary filter, validation gate, or missing council registration numbers to prevent catalog corruption.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5">Entity</th>
                  <th className="py-2.5">Identifier</th>
                  <th className="py-2.5">Rejection Reason</th>
                  <th className="py-2.5">Job Ref</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {quarantinedRecords.map((qr, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-aurora-midnight/50">
                    <td className="py-3 font-bold text-slate-900 dark:text-white">
                      <Badge variant="amber">{qr.entityType}</Badge>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {qr.sourceIdentifier || 'N/A'}
                    </td>
                    <td className="py-3 text-red-600 dark:text-red-400 text-xs">
                      {qr.reason}
                    </td>
                    <td className="py-3 font-mono text-[10px] text-slate-400">
                      {qr.jobId || 'BATCH_JOB'}
                    </td>
                    <td className="py-3 text-right">
                      <Badge variant="neutral">Quarantined</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {quarantinedRecords.length === 0 && !loading && (
              <div className="p-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <span>Zero quarantined anomalies in current cycle. All records passed validation bounds.</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* TAB 3: Data Sources Freshness */}
      {activeTab === 'DATA_SOURCES' && (
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-500" />
                <span>Configured National Healthcare Registries</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official registry endpoints with scheduled incremental ingestion and entity deduplication.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-aurora-midnight/50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">Open Government Data (data.gov.in)</h4>
                  <Badge variant="teal">HEALTHY</Badge>
                </div>
                <p className="text-[11px] text-slate-500">
                  National Health Portal hospital directory maintained by Ministry of Health and Family Welfare (MoHFW), Govt of India.
                </p>
                <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                  Sync: Daily • Freshness: Active
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-aurora-midnight/50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">National Medical Commission (NMC)</h4>
                  <Badge variant="teal">HEALTHY</Badge>
                </div>
                <p className="text-[11px] text-slate-500">
                  Indian Medical Register (IMR) verified practitioners & state medical council registration numbers.
                </p>
                <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                  Sync: Daily • Deduplication: Council Reg Match
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-aurora-midnight/50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">Google Places API (New)</h4>
                  <Badge variant="teal">ACTIVE</Badge>
                </div>
                <p className="text-[11px] text-slate-500">
                  Geospatial real-time facility enrichment, phone numbers, and location coordinates via Google Cloud Platform.
                </p>
                <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                  Status: DISCOVERED tier • Zero fake ratings rule enforced
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-aurora-midnight/50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">ABDM Sandbox (NHA HFR / HPR)</h4>
                  <Badge variant="amber">STAGE 1 ONBOARDING</Badge>
                </div>
                <p className="text-[11px] text-slate-500">
                  Ayushman Bharat Digital Mission Health Facility Registry (HFR) & Healthcare Professional Registry (HPR).
                </p>
                <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                  Access: Production sandbox approval in progress
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}