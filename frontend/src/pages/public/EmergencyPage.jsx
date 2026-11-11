import React, { useState } from 'react';
import { 
  PhoneCall, 
  MapPin, 
  Ambulance, 
  ShieldAlert, 
  Building2, 
  Navigation, 
  HeartPulse, 
  AlertTriangle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { discoveryService } from '../../services/discoveryService';
import { useToast } from '../../context/ToastContext';

export default function EmergencyPage() {
  const [locating, setLocating] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(null);
  const [nearbyCenters, setNearbyCenters] = useState([]);
  const [loadingCenters, setLoadingCenters] = useState(false);
  const { addToast } = useToast();

  const handleAcquireLocation = () => {
    if (!navigator.geolocation) {
      addToast({ type: 'error', title: 'Location Unavailable', message: 'Browser does not support GPS location.' });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocating(false);
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentCoords(coords);
        addToast({
          type: 'success',
          title: 'Location Acquired',
          message: `Latitude: ${coords.lat.toFixed(4)}, Longitude: ${coords.lng.toFixed(4)}`,
        });

        // Search nearest hospitals
        setLoadingCenters(true);
        try {
          const res = await discoveryService.getNearbyFacilities(coords.lat, coords.lng, 25000, 'hospital');
          const list = res.facilities || res.data || [];
          setNearbyCenters(list.slice(0, 4));
        } catch (err) {
          console.warn('Facility lookup error:', err);
        } finally {
          setLoadingCenters(false);
        }
      },
      (err) => {
        setLocating(false);
        addToast({ type: 'warning', title: 'GPS Permission Denied', message: 'Please allow location access to locate nearby trauma centers.' });
      }
    );
  };

  const emergencyNumbers = [
    { label: 'National Emergency Helpline', number: '112', desc: 'Police, Fire, Ambulance (All India 24x7)', primary: true },
    { label: 'Ambulance Service', number: '102', desc: 'Emergency Patient Transport & Basic Life Support', primary: false },
    { label: 'Emergency Trauma / Medical Care', number: '108', desc: 'Critical Care Mobile Ambulance (ALS/BLS)', primary: false },
    { label: 'National Poison Information', number: '1800-116-117', desc: 'AIIMS New Delhi Toxicology Hotline', primary: false },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      {/* Top Urgent Alert Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span>24/7 National Emergency Care</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Emergency Response & Trauma Care
          </h1>
          <p className="text-sm text-red-100 max-w-2xl leading-relaxed">
            If you or someone near you is experiencing severe chest pain, breathing difficulty, sudden paralysis, or major trauma, call national emergency services immediately.
          </p>
        </div>

        <a 
          href="tel:112"
          className="flex-shrink-0 px-6 py-4 bg-white text-red-600 hover:bg-red-50 font-extrabold text-base rounded-2xl shadow-lg flex items-center gap-3 transition transform hover:scale-105"
        >
          <PhoneCall className="w-5 h-5 text-red-600 animate-bounce" />
          <span>Call 112 (National Helpline)</span>
        </a>
      </div>

      {/* Emergency Helplines Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-teal-600" />
          Emergency Hotline Directory (India)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {emergencyNumbers.map((num, i) => (
            <div 
              key={i} 
              className={`p-5 rounded-2xl border transition ${
                num.primary 
                  ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900 shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{num.label}</span>
                {num.primary && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">PRIORITY</span>}
              </div>
              <a 
                href={`tel:${num.number}`}
                className="text-2xl font-extrabold font-mono text-red-600 dark:text-red-400 hover:underline block"
              >
                {num.number}
              </a>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{num.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* GPS Hospital Locator Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-600" />
              Nearest Emergency Hospital & Trauma Centers
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Acquire current GPS location to locate accredited emergency rooms and trauma units.
            </p>
          </div>

          <button
            onClick={handleAcquireLocation}
            disabled={locating}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow flex items-center gap-2 transition disabled:opacity-50"
          >
            {locating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Locating GPS...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                <span>Find Nearest Emergency Units</span>
              </>
            )}
          </button>
        </div>

        {currentCoords && (
          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 rounded-xl text-xs text-teal-800 dark:text-teal-200 flex items-center justify-between">
            <span>Resolved GPS: Lat {currentCoords.lat.toFixed(4)}, Lng {currentCoords.lng.toFixed(4)}</span>
            <span className="font-semibold text-teal-700 dark:text-teal-300">Radius: 25 km</span>
          </div>
        )}

        {/* Nearby Facilities List */}
        {nearbyCenters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nearbyCenters.map((fac, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{fac.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    24/7 OPEN
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400">{fac.address || `${fac.city}, ${fac.state}`}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-mono text-slate-500">Distance: {fac.distanceKm ? `${fac.distanceKm} km` : 'Near you'}</span>
                  {fac.phone && (
                    <a href={`tel:${fac.phone}`} className="font-semibold text-teal-600 hover:underline flex items-center gap-1">
                      <PhoneCall className="w-3 h-3" /> Call Hospital
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-400">
            <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p>Click "Find Nearest Emergency Units" above to scan nearby trauma facilities.</p>
          </div>
        )}
      </div>

      {/* Acute Red Flag Protocol */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-amber-400 flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-rose-500" />
          Critical Signs Requiring Immediate Emergency Intervention
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <p className="font-semibold text-white">Chest Pressure</p>
            <p className="text-slate-400">Crushing central chest pain radiating to left arm, neck, or jaw accompanied by sweating.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <p className="font-semibold text-white">FAST Stroke Warning</p>
            <p className="text-slate-400">Face drooping, arm weakness, or slurred speech. Requires emergency CT within 3 hours.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <p className="font-semibold text-white">Severe Dyspnea</p>
            <p className="text-slate-400">Acute shortness of breath, inability to speak full sentences, or blue lips/fingertips.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <p className="font-semibold text-white">Major Trauma & Bleeding</p>
            <p className="text-slate-400">Uncontrolled arterial bleeding, severe head injury, or loss of consciousness.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
