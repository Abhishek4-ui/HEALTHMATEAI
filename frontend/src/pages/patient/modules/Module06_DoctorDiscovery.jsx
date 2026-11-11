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
  Building,
  Phone,
  GraduationCap,
  Award
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
  const [pincodeFilter, setPincodeFilter] = useState('');
  const [qualificationFilter, setQualificationFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('default');
  const [userCoords, setUserCoords] = useState(null);

  const [isLocating, setIsLocating] = useState(false);
  const [doctorsList, setDoctorsList] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();

  useEffect(() => {
    loadDoctors();
  }, [sortBy]);

  const loadDoctors = async (overrideFilters = {}) => {
    setLoading(true);
    try {
      const response = await discoveryService.searchDoctors({
        search: searchQuery || undefined,
        specialization: specialty !== 'ALL' ? specialty : undefined,
        state: stateFilter !== 'ALL' ? stateFilter : undefined,
        city: cityFilter || undefined,
        pincode: pincodeFilter || undefined,
        qualification: qualificationFilter || undefined,
        verificationStatus: verificationFilter !== 'ALL' ? verificationFilter : undefined,
        latitude: userCoords?.latitude,
        longitude: userCoords?.longitude,
        sortBy: sortBy !== 'default' ? sortBy : undefined,
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
        const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setUserCoords(coords);
        try {
          const response = await discoveryService.getNearbyFacilities(
            coords.latitude,
            coords.longitude,
            30000,
            'doctor'
          );
          setDoctorsList(response.doctors || []);
          addToast({
            type: 'success',
            title: 'Nearby Doctors Located',
            message: `Found ${response.doctors?.length || 0} providers within 30 km.`,
          });
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

  const handleResetFilters = () => {
    setSearchQuery('');
    setSpecialty('ALL');
    setStateFilter('ALL');
    setCityFilter('');
    setPincodeFilter('');
    setQualificationFilter('');
    setVerificationFilter('ALL');
    setSortBy('default');
    setUserCoords(null);
    setSearched(false);
    loadDoctors({
      search: undefined,
      specialization: undefined,
      state: undefined,
      city: undefined,
      pincode: undefined,
      qualification: undefined,
      verificationStatus: undefined,
      latitude: undefined,
      longitude: undefined,
      sortBy: undefined,
    });
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
    if (doc.verificationStatus === 'SOURCE_VERIFIED' || doc.sourceType === 'OPEN_GOVERNMENT_DATA_INDIA' || doc.sourceType === 'NATIONAL_HEALTH_REGISTRY') {
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
        <span>Discovered Listing</span>
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

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Specialization</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              >
                <option value="ALL">All Specialties</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Oncology">Oncology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Endocrinology">Endocrinology</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Qualification</label>
              <input
                type="text"
                value={qualificationFilter}
                onChange={(e) => setQualificationFilter(e.target.value)}
                placeholder="MBBS, MD, MS"
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">State</label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              >
                <option value="ALL">All States</option>
                <option value="Delhi">Delhi</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Gujarat">Gujarat</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">City</label>
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="City name"
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">PIN Code</label>
              <input
                type="text"
                value={pincodeFilter}
                onChange={(e) => setPincodeFilter(e.target.value)}
                placeholder="e.g. 110029"
                maxLength={6}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              >
                <option value="default">Council Rank</option>
                <option value="distance">Distance (Nearest)</option>
                <option value="experience">Experience</option>
                <option value="rating">Rating</option>
                <option value="fee">Consultation Fee</option>
              </select>
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
                ? doc.qualifications.map(q => q.degree || q).join(', ')
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
                          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3 h-3 text-slate-400" />
                              {degrees}
                            </span>
                            {doc.experienceYears && (
                              <span>• {doc.experienceYears} yrs exp</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {renderBadge(doc)}
                        {doc.distanceKm !== null && doc.distanceKm !== undefined && (
                          <span className="text-[10px] font-mono font-semibold text-aurora-teal bg-teal-50 dark:bg-teal-950/50 px-1.5 py-0.5 rounded">
                            📍 {doc.distanceKm} km
                          </span>
                        )}
                      </div>
                    </div>

                    {doc.medicalRegistrationNumber && (
                      <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                        <Award className="w-3 h-3 text-aurora-teal" />
                        <span>Reg:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{doc.medicalRegistrationNumber}</span>
                        <span>({doc.stateMedicalCouncil || 'Medical Council of India'})</span>
                      </div>
                    )}

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-aurora-midnight text-[11px] space-y-1">
                      <div className="text-slate-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {doc.address?.street ? `${doc.address.street}, ` : ''}
                          {doc.address?.city || 'India'}
                          {doc.address?.pincode ? ` - ${doc.address.pincode}` : ''}
                        </span>
                      </div>

                      {doc.contact?.phone && (
                        <div className="text-slate-500 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{doc.contact.phone}</span>
                        </div>
                      )}

                      {doc.bookingNotice && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                          {doc.bookingNotice}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-slate-400 text-[11px]">Fee: </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {doc.consultationFee ? `₹${doc.consultationFee}` : 'Standard'}
                        </span>
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
              ? 'No doctors matched your criteria. Try adjusting your specialty, city or PIN code filters.' 
              : 'Search by specialty, PIN code, or click Near Me to locate doctors nearby.'}
            actionLabel={searched ? 'Reset Filters' : undefined}
            onAction={searched ? handleResetFilters : undefined}
          />
        )}
      </div>
    </div>
  );
}