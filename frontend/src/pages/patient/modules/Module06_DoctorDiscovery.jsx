import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Stethoscope, 
  Calendar, 
  Navigation
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
  const [isLocating, setIsLocating] = useState(false);
  const [doctorsList, setDoctorsList] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const response = await discoveryService.searchDoctors({
        keyword: searchQuery,
        specialization: specialty !== 'ALL' ? specialty : undefined,
        state: stateFilter !== 'ALL' ? stateFilter : undefined,
        city: cityFilter || undefined,
      });
      setDoctorsList(response.doctors || []);
    } catch (err) {
      setDoctorsList([]);
    } finally {
      setLoading(false);
    }
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
            10000,
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Find Doctors
          </h2>
          <p className="text-xs text-slate-500">
            Search verified medical doctors and clinics near you or across India.
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
                placeholder="Doctor name, hospital, or condition..."
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Specialization</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              >
                <option value="ALL">All Specializations</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Neurology">Neurology</option>
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
                <option value="Karnataka">Karnataka</option>
                <option value="Delhi">Delhi NCR</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">City</label>
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="e.g. Bengaluru"
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
            {doctorsList.map((doc, idx) => (
              <Card key={idx} className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center font-bold text-xs">
                      Dr
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-slate-900 dark:text-white">{doc.fullName}</h4>
                      <p className="text-xs text-aurora-teal font-medium">{doc.specialization}</p>
                      <p className="text-[11px] text-slate-400">{doc.qualifications} • {doc.experienceYears} yrs exp</p>
                    </div>
                  </div>
                  <Badge variant="teal">Verified</Badge>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-aurora-midnight text-[11px]">
                  <div className="text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doc.hospitalAffiliation || 'Clinic'} • {doc.address?.city || 'India'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs">
                    <span className="text-slate-400">Fee: </span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{doc.consultationFee || 500}</span>
                  </div>
                  <Link to={`/patient/appointments?doctorId=${doc.id || idx}`}>
                    <Button size="sm" variant="primary">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Appointment</span>
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Stethoscope}
            title={searched ? 'No doctors found' : 'Find a Doctor'}
            description={searched 
              ? 'No doctors found matching your criteria. Try adjusting your filters or location.' 
              : 'Search by specialty, name, or click Near Me to locate doctors nearby.'}
            actionLabel={searched ? 'Clear Filters' : undefined}
            onAction={searched ? () => { setSearchQuery(''); setSpecialty('ALL'); setStateFilter('ALL'); setCityFilter(''); setSearched(false); } : undefined}
          />
        )}
      </div>
    </div>
  );
}
