import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Phone, 
  MapPin, 
  AlertTriangle, 
  Heart, 
  ExternalLink,
  Navigation,
  Info
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useToast } from '../../../context/ToastContext';

export default function Module16_EmergencySOS() {
  const [locating, setLocating] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(null);
  const { addToast } = useToast();

  const handleAcquireLocation = () => {
    if (!navigator.geolocation) {
      addToast({ type: 'error', title: 'Location Unavailable', message: 'Browser does not support geolocation.' });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setCurrentCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        addToast({
          type: 'emergency',
          title: 'Emergency Coordinates Resolved',
          message: `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)} ready for emergency responders.`,
        });
      },
      () => {
        setLocating(false);
        addToast({ type: 'warning', title: 'Location Access Denied', message: 'Please allow GPS location permission to guide responders.' });
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Emergency Alert Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white border border-rose-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600/30 text-rose-300 text-xs font-bold border border-rose-500/50">
            <ShieldAlert className="w-4 h-4 animate-ping text-rose-400" />
            <span>National Emergency Medical Response</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight">
            Emergency SOS & First-Aid Guidance
          </h2>
          <p className="text-xs sm:text-sm text-rose-200 leading-relaxed">
            In acute life-threatening situations (severe trauma, cardiac arrest, respiratory failure), immediately dial India's National Emergency Helpline <strong>112</strong> or Ambulance <strong>108</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="tel:112"
              className="px-6 py-3.5 rounded-2xl bg-aurora-red hover:bg-rose-600 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-rose-900/40 transition-transform hover:scale-105"
            >
              <Phone className="w-4 h-4" />
              <span>Call 112 (National Emergency)</span>
            </a>

            <a
              href="tel:108"
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 flex items-center gap-2 transition-transform hover:scale-105"
            >
              <Phone className="w-4 h-4 text-aurora-teal" />
              <span>Call 108 (Ambulance)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Geolocation Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-aurora-red" />
            <span>Your Emergency Dispatch Coordinates</span>
          </h3>
          <Button size="sm" variant="outline" onClick={handleAcquireLocation} loading={locating}>
            <Navigation className="w-3.5 h-3.5 text-aurora-red" />
            <span>Pin Current Location</span>
          </Button>
        </div>

        {currentCoords ? (
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-aurora-midnight font-mono text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span>Latitude: {currentCoords.lat.toFixed(6)} | Longitude: {currentCoords.lng.toFixed(6)}</span>
            <a
              href={`https://maps.google.com/?q=${currentCoords.lat},${currentCoords.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-aurora-blue font-bold flex items-center gap-1 hover:underline"
            >
              <span>View Map</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            Click 'Pin Current Location' to allow GPS access so responders can locate you accurately.
          </p>
        )}
      </Card>

      {/* First-Aid Emergency Protocols */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Heart className="w-4 h-4 text-aurora-red" />
          <span>Immediate Clinical First-Aid Protocols</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <Card className="p-5 space-y-2">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-aurora-red" />
              <span>Adult CPR (Cardiopulmonary Resuscitation)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              1. Place heel of hand on center of chest. Interlock other hand.<br/>
              2. Push hard and fast (100–120 compressions/minute, ~2 inches deep).<br/>
              3. Continue compressions until medical personnel arrive.
            </p>
          </Card>

          <Card className="p-5 space-y-2">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-aurora-amber" />
              <span>Suspected Stroke (F.A.S.T. Protocol)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              • <strong>F</strong>ace: Ask person to smile. Does one side droop?<br/>
              • <strong>A</strong>rms: Ask person to raise both arms. Does one drift downward?<br/>
              • <strong>S</strong>peech: Is speech slurred or strange?<br/>
              • <strong>T</strong>ime: Call 112 immediately if any sign is observed.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
