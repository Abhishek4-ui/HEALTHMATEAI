import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Phone, 
  ExternalLink, 
  Compass,
  ShieldCheck, 
  AlertCircle,
  Building,
  MapPin,
  Globe
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import { useToast } from '../../../context/ToastContext';
import { discoveryService } from '../../../services/discoveryService';
import { INDIAN_STATES_AND_UTS } from '../../../data/indianStatesAndDistricts';

export default function Module07_HospitalDiscovery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('');
  const [pincodeFilter, setPincodeFilter] = useState('');
  const [facilityType, setFacilityType] = useState('ALL');
  const [userCoords, setUserCoords] = useState(null);

  const [hospitalsList, setHospitalsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async (overrideParams = {}) => {
    setLoading(true);
    try {
      const response = await discoveryService.searchHospitals({
        query: searchQuery || undefined,
        city: cityFilter || undefined,
        state: stateFilter !== 'ALL' ? stateFilter : undefined,
        pincode: pincodeFilter || undefined,
        facilityType: facilityType !== 'ALL' ? facilityType : undefined,
        latitude: userCoords?.latitude,
        longitude: userCoords?.longitude,
        ...overrideParams,
      });
      setHospitalsList(response.facilities || []);
    } catch (err) {
      setHospitalsList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearched(true);
    loadHospitals();
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      addToast({ type: 'error', title: 'Location Unavailable', message: 'Location is not supported by your browser.' });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocating(false);
        setSearched(true);
        setLoading(true);
        const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setUserCoords(coords);
        try {
          const response = await discoveryService.getNearbyFacilities(
            coords.latitude,
            coords.longitude,
            30000,
            'hospital'
          );
          setHospitalsList(response.facilities || []);
          addToast({
            type: 'success',
            title: 'Nearby Facilities Located',
            message: `Found ${response.facilities?.length || 0} hospitals within 30 km.`,
          });
        } catch (err) {
          setHospitalsList([]);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setIsLocating(false);
        addToast({ type: 'warning', title: 'Location Denied', message: 'Please allow location access to locate nearby hospitals.' });
      }
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCityFilter('');
    setStateFilter('ALL');
    setPincodeFilter('');
    setFacilityType('ALL');
    setUserCoords(null);
    setSearched(false);
    loadHospitals({
      query: undefined,
      city: undefined,
      state: undefined,
      pincode: undefined,
      facilityType: undefined,
      latitude: undefined,
      longitude: undefined,
    });
  };

  const renderBadge = (fac) => {
    if (fac.statusTier === 'SOURCE_VERIFIED' || fac.sourceType === 'OPEN_GOVERNMENT_DATA_INDIA' || fac.sourceType === 'NATIONAL_HEALTH_REGISTRY') {
      return (
        <Badge variant="blue" className="flex items-center gap-1 text-[10px]">
          <Building className="w-3 h-3" />
          <span>MoHFW Verified</span>
        </Badge>
      );
    }
    if (fac.statusTier === 'CREDENTIAL_VERIFIED') {
      return (
        <Badge variant="teal" className="flex items-center gap-1 text-[10px]">
          <ShieldCheck className="w-3 h-3" />
          <span>Council Accredited</span>
        </Badge>
      );
    }
    return (
      <Badge variant="amber" className="flex items-center gap-1 text-[10px]">
        <AlertCircle className="w-3 h-3" />
        <span>Discovered Listing</span>
      </Badge>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Find Hospitals & Medical Centers
          </h2>
          <p className="text-xs text-slate-500">
            Official Ministry of Health (MoHFW) registered institutions, trauma centers, and nearby verified clinics.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-aurora-blue flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
      </div>

      <Card className="p-5 space-y-3">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Hospital name, specialty, or trauma center..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleNearMe}
              loading={isLocating}
            >
              <Compass className="w-3.5 h-3.5 text-aurora-blue" />
              <span>Near Me</span>
            </Button>

            <Button type="submit" variant="blue" size="md" loading={loading}>
              <Search className="w-3.5 h-3.5 text-white" />
              <span>Search</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Facility Type</label>
              <select
                value={facilityType}
                onChange={(e) => setFacilityType(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              >
                <option value="ALL">All Facilities</option>
                <option value="HOSPITAL">Tertiary Hospital</option>
                <option value="CLINIC">Specialty Clinic</option>
                <option value="DIAGNOSTIC_CENTER">Diagnostic Center</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">State / UT (36 All-India)</label>
              <select
                value={stateFilter}
                onChange={(e) => {
                  const newState = e.target.value;
                  setStateFilter(newState);
                  setDistrictFilter('');
                  setCityFilter('');
                }}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              >
                <option value="ALL">All India (36 States & UTs)</option>
                <optgroup label="States (28)">
                  {INDIAN_STATES_AND_UTS.filter(s => s.type === 'STATE').map(s => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Union Territories (8)">
                  {INDIAN_STATES_AND_UTS.filter(s => s.type === 'UNION_TERRITORY').map(s => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                District / City {stateFilter !== 'ALL' ? `(${stateFilter})` : ''}
              </label>
              {stateFilter !== 'ALL' && INDIAN_STATES_AND_UTS.find(s => s.name === stateFilter)?.districts?.length > 0 ? (
                <select
                  value={districtFilter}
                  onChange={(e) => {
                    setDistrictFilter(e.target.value);
                    setCityFilter(e.target.value);
                  }}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                >
                  <option value="">All Districts in {stateFilter}</option>
                  {INDIAN_STATES_AND_UTS.find(s => s.name === stateFilter).districts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  placeholder="e.g. New Delhi, Bengaluru"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                />
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">PIN Code</label>
              <input
                type="text"
                value={pincodeFilter}
                onChange={(e) => setPincodeFilter(e.target.value)}
                placeholder="e.g. 560076"
                maxLength={6}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </form>
      </Card>

      <div>
        {hospitalsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {hospitalsList.map((fac, idx) => (
              <Card key={fac._id || idx} className="p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-xs text-slate-900 dark:text-white">{fac.name}</h4>
                      <p className="text-xs text-slate-400">
                        {fac.address?.formattedAddress || `${fac.address?.city || ''}, ${fac.address?.state || 'India'}`}
                        {fac.address?.pincode ? ` - ${fac.address.pincode}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {renderBadge(fac)}
                      {fac.distanceKm !== null && fac.distanceKm !== undefined && (
                        <span className="text-[10px] font-mono font-semibold text-aurora-blue bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded">
                          📍 {fac.distanceKm} km
                        </span>
                      )}
                    </div>
                  </div>

                  {fac.verificationDisclaimer && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg">
                      {fac.verificationDisclaimer}
                    </p>
                  )}

                  {fac.departments && fac.departments.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {fac.departments.map((dept, di) => (
                        <span key={di} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-aurora-midnight text-slate-600 dark:text-slate-300">
                          {dept}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-aurora-teal" />
                    <span className="text-[11px] font-mono">
                      {fac.contact?.phone || fac.contact?.emergencyHotline || 'Helpline Available'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {fac.contact?.website && (
                      <a
                        href={fac.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs flex items-center gap-1"
                      >
                        <Globe className="w-3 h-3" />
                        <span>Web</span>
                      </a>
                    )}
                    {fac.directionsUrl ? (
                      <a
                        href={fac.directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-aurora-blue font-semibold flex items-center gap-1 hover:underline text-xs"
                      >
                        <span>Directions</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(fac.name + ' ' + (fac.address?.city || ''))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-aurora-blue font-semibold flex items-center gap-1 hover:underline text-xs"
                      >
                        <span>Directions</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Building2}
            title={searched ? 'No hospitals found' : 'Find a Hospital'}
            description={searched
              ? 'No facilities matched your search. Try another location, PIN code or keyword.'
              : 'Search by hospital name, PIN code, or click Near Me to locate healthcare centers near you.'}
            actionLabel={searched ? 'Reset Search' : undefined}
            onAction={searched ? handleResetFilters : undefined}
          />
        )}
      </div>
    </div>
  );
}