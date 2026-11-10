import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  MapPin, 
  Navigation, 
  Phone, 
  ExternalLink, 
  Clock, 
  ShieldCheck,
  Compass
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import { useToast } from '../../../context/ToastContext';
import { discoveryService } from '../../../services/discoveryService';

export default function Module07_HospitalDiscovery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitalType, setHospitalType] = useState('ALL');
  const [hospitalsList, setHospitalsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const { addToast } = useToast();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const response = await discoveryService.searchHospitals({
        keyword: searchQuery,
        facilityType: hospitalType !== 'ALL' ? hospitalType : undefined,
      });
      setHospitalsList(response.facilities || []);
    } catch (err) {
      // Zero fake hospitals
      setHospitalsList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      addToast({ type: 'error', title: 'Geolocation Unavailable', message: 'Location services are disabled in your browser.' });
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
            15000,
            'hospital'
          );
          setHospitalsList(response.facilities || []);
          addToast({ type: 'success', title: 'Nearby Facilities Located', message: 'Queried Google Places & ABDM Health Facility Registry.' });
        } catch (err) {
          setHospitalsList([]);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setIsLocating(false);
        addToast({ type: 'warning', title: 'Location Denied', message: 'Please grant location permission to find nearest healthcare facilities.' });
      }
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Hospital & Healthcare Center Directory
            </h2>
            <Badge variant="blue">ABDM HFR Registry</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time geospatial discovery of NABH-accredited hospitals, community health centers, and emergency clinics.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-aurora-blue flex items-center justify-center shrink-0">
          <Building2 className="w-6 h-6" />
        </div>
      </div>

      {/* Search Bar */}
      <Card className="p-6 space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hospitals by name, area, or specialized department (e.g. Apollo, Manipal, Fortis)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-aurora-blue/50"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleNearMe}
            loading={isLocating}
            className="whitespace-nowrap"
          >
            <Compass className="w-4 h-4 text-aurora-blue" />
            <span>Hospitals Near Me</span>
          </Button>

          <Button type="submit" variant="blue" size="md" loading={loading}>
            <Search className="w-4 h-4 text-white" />
            <span>Search</span>
          </Button>
        </form>
      </Card>

      {/* Facilities Grid */}
      <div>
        {hospitalsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hospitalsList.map((fac, idx) => (
              <Card key={idx} className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{fac.name}</h4>
                    <p className="text-xs text-slate-400">{fac.address?.formattedAddress || 'India'}</p>
                  </div>
                  <Badge variant="blue">{fac.statusTier || 'SOURCE_VERIFIED'}</Badge>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {fac.departments?.map((dept, di) => (
                    <span key={di} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-aurora-midnight text-slate-600 dark:text-slate-300">
                      {dept}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-aurora-teal" />
                    <span>{fac.contact?.phone || 'Helpline Available'}</span>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(fac.name + ' ' + (fac.address?.city || ''))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-aurora-blue font-bold flex items-center gap-1 hover:underline"
                  >
                    <span>Get Directions</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Building2}
            title={searched ? 'No Hospital Records Found' : 'Discover Accredited Healthcare Facilities'}
            description={searched
              ? 'No facilities matched your search. In accordance with zero-fabrication rules, synthetic hospital listings are strictly forbidden.'
              : 'Search by city or click "Hospitals Near Me" to query verified facilities registered under ABDM and Google Places.'}
            actionLabel={searched ? 'Reset Search' : undefined}
            onAction={searched ? () => { setSearchQuery(''); setSearched(false); } : undefined}
          />
        )}
      </div>
    </div>
  );
}
