import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Monitor, 
  Wifi, 
  User, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../services/api';
import { TelehealthSession } from '../../../services/telehealth.service';

export default function DocModule07_VideoConsultation() {
  const [inCall, setInCall] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const [mediaStream, setMediaStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnected, setPeerConnected] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const sessionRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.stop();
        sessionRef.current = null;
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleCall = async () => {
    if (!inCall) {
      setConnecting(true);
      try {
        let stream = null;
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true
            });
            setMediaStream(stream);
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          } catch (mErr) {
            addToast({
              type: 'info',
              title: 'Media Device Notice',
              message: 'Camera/mic stream not detected or permission denied.',
            });
          }
        }

        const session = new TelehealthSession({
          appointmentId: 'apt_active_session',
          token: localStorage.getItem('token'),
          onRemoteStream: (remStream) => {
            setRemoteStream(remStream);
            setPeerConnected(true);
            addToast({
              type: 'success',
              title: 'Patient Connected',
              message: 'Live two-way WebRTC peer stream connected.',
            });
          },
          onPeerJoined: () => {
            addToast({
              type: 'info',
              title: 'Patient Joined Room',
              message: 'Patient entered the consultation room.',
            });
          },
          onPeerLeft: () => {
            setRemoteStream(null);
            setPeerConnected(false);
            addToast({
              type: 'warning',
              title: 'Patient Disconnected',
              message: 'Patient left the consultation room.',
            });
          },
          onError: (err) => {
            addToast({
              type: 'error',
              title: 'Signaling Error',
              message: err?.message || 'WebRTC signaling notice.',
            });
          }
        });

        await session.start(stream);
        sessionRef.current = session;
        setInCall(true);

        addToast({
          type: 'success',
          title: 'Consultation Active',
          message: 'Secure doctor teleconsultation room initialized with Socket.IO signaling.',
        });
      } catch (err) {
        addToast({
          type: 'error',
          title: 'Connection Error',
          message: err.message || 'Unable to start consultation room.',
        });
      } finally {
        setConnecting(false);
      }
    } else {
      if (sessionRef.current) {
        sessionRef.current.stop();
        sessionRef.current = null;
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      }
      setRemoteStream(null);
      setPeerConnected(false);
      setInCall(false);
      addToast({
        type: 'info',
        title: 'Consultation Concluded',
        message: 'Doctor consultation room closed cleanly.',
      });
    }
  };

  const toggleVideo = () => {
    if (mediaStream) {
      const vTrack = mediaStream.getVideoTracks()[0];
      if (vTrack) {
        vTrack.enabled = !vTrack.enabled;
        setVideoOn(vTrack.enabled);
      }
    } else {
      setVideoOn(!videoOn);
    }
  };

  const toggleAudio = () => {
    if (mediaStream) {
      const aTrack = mediaStream.getAudioTracks()[0];
      if (aTrack) {
        aTrack.enabled = !aTrack.enabled;
        setAudioOn(aTrack.enabled);
      }
    } else {
      setAudioOn(!audioOn);
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
            Secure WebRTC video consultation room with patient.
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
          <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
            {/* Patient Remote Video or Waiting State */}
            {peerConnected && remoteStream ? (
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-aurora-blue/20 text-aurora-blue flex items-center justify-center mx-auto animate-pulse">
                  <User className="w-8 h-8" />
                </div>
                <div className="font-bold text-base">Doctor Room Online</div>
                <div className="text-xs text-slate-400">Waiting for patient to connect... (P2P WebRTC Signaling Active)</div>
              </div>
            )}

            {/* Doctor local video pip */}
            <div className="absolute bottom-4 right-4 w-36 h-24 rounded-2xl bg-slate-950 border border-white/20 overflow-hidden flex items-center justify-center text-[10px] text-slate-400 shadow-xl">
              {mediaStream && videoOn ? (
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <span className="p-2 text-center">{videoOn ? 'Doctor Camera' : 'Camera Off'}</span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center p-6 space-y-3 text-slate-400">
            <Video className="w-12 h-12 mx-auto opacity-50" />
            <div className="text-xs font-medium">Ready for scheduled consultation.</div>
            <Button size="sm" variant="blue" loading={connecting} onClick={toggleCall}>
              Start Consultation
            </Button>
          </div>
        )}
      </div>

      {/* Controls */}
      {inCall && (
        <div className="p-4 rounded-2xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3">
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-2xl transition-all ${
              videoOn ? 'bg-slate-100 dark:bg-aurora-midnight text-slate-700 dark:text-slate-200' : 'bg-rose-100 text-rose-600'
            }`}
            title={videoOn ? 'Mute Video' : 'Enable Video'}
          >
            {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleAudio}
            className={`p-3 rounded-2xl transition-all ${
              audioOn ? 'bg-slate-100 dark:bg-aurora-midnight text-slate-700 dark:text-slate-200' : 'bg-rose-100 text-rose-600'
            }`}
            title={audioOn ? 'Mute Mic' : 'Enable Mic'}
          >
            {audioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleCall}
            className="px-5 py-2.5 rounded-2xl bg-rose-600 text-white font-bold text-xs flex items-center gap-2 hover:bg-rose-700 shadow-lg shadow-rose-600/30"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Call</span>
          </button>
        </div>
      )}
    </div>
  );
}
