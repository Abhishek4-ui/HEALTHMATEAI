import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Phone, 
  ExternalLink, 
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
      });
      setHospitalsList(response.facilities || []);
    } catch (err) {
      setHospitalsList([]);
    } finally {
      setLoading(false);
    }
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
        try {
          const response = await discoveryService.getNearbyFacilities(
            pos.coords.latitude,
            pos.coords.longitude,
            15000,
            'hospital'
          );
          setHospitalsList(response.facilities || []);
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Find Hospitals
          </h2>
          <p className="text-xs text-slate-500">
            Search accredited hospitals and medical centers near you.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-aurora-blue flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
      </div>

      <Card className="p-5">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hospital name or area..."
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
        </form>
      </Card>

      <div>
        {hospitalsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {hospitalsList.map((fac, idx) => (
              <Card key={idx} className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white">{fac.name}</h4>
                    <p className="text-xs text-slate-400">{fac.address?.formattedAddress || 'India'}</p>
                  </div>
                  <Badge variant="blue">Verified</Badge>
                </div>

                {fac.departments && (
                  <div className="flex flex-wrap gap-1">
                    {fac.departments.map((dept, di) => (
                      <span key={di} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-aurora-midnight text-slate-600 dark:text-slate-300">
                        {dept}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-aurora-teal" />
                    <span>{fac.contact?.phone || 'Helpline Available'}</span>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(fac.name + ' ' + (fac.address?.city || ''))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-aurora-blue font-semibold flex items-center gap-1 hover:underline text-xs"
                  >
                    <span>Directions</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Building2}
            title={searched ? 'No hospitals found' : 'Find a Hospital'}
            description={searched
              ? 'No facilities matched your search. Try another location or keyword.'
              : 'Search by hospital name or click Near Me to locate healthcare centers near you.'}
            actionLabel={searched ? 'Reset Search' : undefined}
            onAction={searched ? () => { setSearchQuery(''); setSearched(false); } : undefined}
          />
        )}
      </div>
    </div>
  );
}
