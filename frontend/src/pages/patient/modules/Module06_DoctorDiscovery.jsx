import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Stethoscope, 
  Calendar, 
  Navigation,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Building
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import { useToast } from '../../../context/ToastContext';
import { discoveryService } from '../../../services/discoveryService';

export default function Module06_DoctorDiscovery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [specialty, setSpecialty] = useState('ALL');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('ALL');
  const [isLocating, setIsLocating] = useState(false);
  const [doctorsList, setDoctorsList] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();

  // Load initial doctors on mount
  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async (overrideFilters = {}) => {
    setLoading(true);
    try {
      const response = await discoveryService.searchDoctors({
        search: searchQuery || undefined,
        specialization: specialty !== 'ALL' ? specialty : undefined,
        state: stateFilter !== 'ALL' ? stateFilter : undefined,
        city: cityFilter || undefined,
        verificationStatus: verificationFilter !== 'ALL' ? verificationFilter : undefined,
        ...overrideFilters,
      });
      setDoctorsList(response.doctors || []);
    } catch (err) {
      setDoctorsList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearched(true);
    loadDoctors();
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      addToast({ type: 'error', title: 'Location Unavailable', message: 'Browser location is not supported.' });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocating(false);
        setSearched(true);
        setLoading(true);
        try {
          const response = await discoveryService.getNearbyFacilities(
            pos.coords.latitude,
            pos.coords.longitude,
            25000,
            'doctor'
          );
          setDoctorsList(response.doctors || []);
        } catch (err) {
          setDoctorsList([]);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setIsLocating(false);
        addToast({ type: 'warning', title: 'Location Denied', message: 'Please allow location access to find nearby doctors.' });
      }
    );
  };

  const renderBadge = (doc) => {
    if (doc.verificationStatus === 'CREDENTIAL_VERIFIED') {
      return (
        <Badge variant="teal" className="flex items-center gap-1 text-[10px]">
          <ShieldCheck className="w-3 h-3" />
          <span>Council Verified</span>
        </Badge>
      );
    }
    if (doc.verificationStatus === 'SOURCE_VERIFIED' || doc.sourceType === 'OPEN_GOVERNMENT_DATA_INDIA') {
      return (
        <Badge variant="blue" className="flex items-center gap-1 text-[10px]">
          <Building className="w-3 h-3" />
          <span>Govt Registry</span>
        </Badge>
      );
    }
    return (
      <Badge variant="amber" className="flex items-center gap-1 text-[10px]">
        <AlertCircle className="w-3 h-3" />
        <span>Google Places Listing</span>
      </Badge>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Find Doctors & Practitioners
          </h2>
          <p className="text-xs text-slate-500">
            India-wide verified specialists, Medical Council registered doctors, and nearby healthcare facilities.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center shrink-0">
          <Stethoscope className="w-5 h-5" />
        </div>
      </div>

      {/* Filter Box */}
      <Card className="p-5 space-y-3.5">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Doctor name, council reg no, or condition..."
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
              <Navigation className="w-3.5 h-3.5 text-aurora-teal" />
              <span>Near Me</span>
            </Button>

            <Button type="submit" variant="primary" size="md" loading={loading}>
              <Search className="w-3.5 h-3.5 text-aurora-midnight" />
              <span>Search</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Specialization</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              >
                <option value="ALL">All Specializations</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Oncology">Oncology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="General Medicine">General Medicine</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Verification Status</label>
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="CREDENTIAL_VERIFIED">Council Verified</option>
                <option value="SOURCE_VERIFIED">Govt Registry Verified</option>
                <option value="DISCOVERED">Discovered (Google Places)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">State</label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              >
                <option value="ALL">All States</option>
                <option value="Delhi">Delhi</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">City</label>
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="e.g. New Delhi"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </form>
      </Card>

      {/* Results */}
      <div>
        {doctorsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {doctorsList.map((doc, idx) => {
              const degrees = Array.isArray(doc.qualifications)
                ? doc.qualifications.map(q => q.degree).join(', ')
                : (doc.qualifications || 'Qualified Practitioner');

              return (
                <Card key={doc._id || idx} className="p-5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center font-bold text-xs shrink-0">
                          Dr
                        </div>
                        <div>
                          <h4 className="font-semibold text-xs text-slate-900 dark:text-white">{doc.fullName}</h4>
                          <p className="text-xs text-aurora-teal font-medium">{doc.specialization}</p>
                          <p className="text-[11px] text-slate-400">
                            {degrees}
                            {doc.experienceYears ? ` • ${doc.experienceYears} yrs experience` : ''}
                          </p>
                        </div>
                      </div>
                      {renderBadge(doc)}
                    </div>

                    {doc.medicalRegistrationNumber && (
                      <div className="text-[10px] text-slate-500 font-mono">
                        Reg: <span className="font-semibold text-slate-700 dark:text-slate-300">{doc.medicalRegistrationNumber}</span> ({doc.stateMedicalCouncil || 'Medical Council of India'})
                      </div>
                    )}

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-aurora-midnight text-[11px] space-y-1">
                      <div className="text-slate-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{doc.address?.street ? `${doc.address.street}, ` : ''}{doc.address?.city || 'India'}</span>
                      </div>
                      {doc.bookingNotice && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400">
                          {doc.bookingNotice}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-slate-400 text-[11px]">Fee: </span>
                        <span className="font-bold text-slate-900 dark:text-white">₹{doc.consultationFee || 500}</span>
                      </div>
                      {doc.directionsUrl && (
                        <a
                          href={doc.directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-aurora-teal font-semibold flex items-center gap-1 hover:underline text-xs"
                        >
                          <span>Directions</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {doc.appointmentBookingAvailable ? (
                      <Link to={`/patient/appointments?doctorId=${doc._id}`}>
                        <Button size="sm" variant="primary">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Book Slot</span>
                        </Button>
                      </Link>
                    ) : (
                      <a href={doc.directionsUrl || '#'} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">
                          <span>Clinic Visit</span>
                        </Button>
                      </a>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Stethoscope}
            title={searched ? 'No doctors found' : 'Find a Doctor'}
            description={searched 
              ? 'No doctors matched your criteria. Try adjusting your specialty or state filters.' 
              : 'Search by specialty, location, or click Near Me to locate doctors nearby.'}
            actionLabel={searched ? 'Clear Filters' : undefined}
            onAction={searched ? () => { setSearchQuery(''); setSpecialty('ALL'); setStateFilter('ALL'); setCityFilter(''); setVerificationFilter('ALL'); setSearched(false); loadDoctors({ search: '', specialization: undefined, state: undefined, city: undefined, verificationStatus: undefined }); } : undefined}
          />
        )}
      </div>
    </div>
  );
}
