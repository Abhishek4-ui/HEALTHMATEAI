import React, { useState } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Monitor, 
  Wifi, 
  User, 
  ShieldCheck 
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useToast } from '../../../context/ToastContext';

export default function DocModule07_VideoConsultation() {
  const [inCall, setInCall] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const { addToast } = useToast();

  const toggleCall = () => {
    if (!inCall) {
      setInCall(true);
      addToast({
        type: 'info',
        title: 'Doctor Telehealth Room Active',
        message: 'Secure WebRTC peer media stream connected.',
      });
    } else {
      setInCall(false);
      addToast({
        type: 'info',
        title: 'Consultation Concluded',
        message: 'Peer connection closed.',
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Video Consultation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Secure video consultation with patient.
          </p>
        </div>

        <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
          <Wifi className="w-3.5 h-3.5" />
          <span>Connected</span>
        </span>
      </div>

      {/* Main Video Viewport */}
      <div className="relative aspect-video rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col items-center justify-center text-white shadow-2xl">
        {inCall ? (
          <div className="text-center p-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-aurora-blue/20 text-aurora-blue flex items-center justify-center mx-auto animate-pulse">
              <User className="w-8 h-8" />
            </div>
            <div className="font-bold text-base">Connected with Patient</div>
            <div className="text-xs text-slate-400">Audio and video active</div>
          </div>
        ) : (
          <div className="text-center p-6 space-y-3 text-slate-400">
            <Video className="w-12 h-12 mx-auto opacity-50" />
            <div className="text-xs font-medium">Ready for consultation.</div>
            <Button size="sm" variant="blue" onClick={toggleCall}>
              Start Call
            </Button>
          </div>
        )}

        {inCall && (
          <div className="absolute bottom-4 right-4 w-32 h-20 rounded-2xl bg-slate-900 border border-white/20 overflow-hidden flex items-center justify-center text-[10px] text-slate-400">
            {videoOn ? 'Camera on' : 'Camera off'}
          </div>
        )}
      </div>

      {/* Controls */}
      {inCall && (
        <div className="p-4 rounded-2xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3">
          <button
            onClick={() => setVideoOn(!videoOn)}
            className={`p-3 rounded-2xl transition-all ${
              videoOn ? 'bg-slate-100 dark:bg-aurora-midnight text-slate-700 dark:text-slate-200' : 'bg-rose-100 text-rose-600'
            }`}
          >
            {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setAudioOn(!audioOn)}
            className={`p-3 rounded-2xl transition-all ${
              audioOn ? 'bg-slate-100 dark:bg-aurora-midnight text-slate-700 dark:text-slate-200' : 'bg-rose-100 text-rose-600'
            }`}
          >
            {audioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => addToast({ type: 'info', title: 'Screen Share', message: 'Screen sharing request initiated.' })}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-aurora-midnight text-slate-700 dark:text-slate-200"
            title="Share Screen"
          >
            <Monitor className="w-5 h-5" />
          </button>

          <button
            onClick={toggleCall}
            className="px-5 py-3 rounded-2xl bg-rose-600 text-white font-bold text-xs flex items-center gap-2 hover:bg-rose-700"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Call</span>
          </button>
        </div>
      )}
    </div>
  );
}
