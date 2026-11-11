import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  MessageSquare, 
  Send,
  UserCheck,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../services/api';
import { TelehealthSession } from '../../../services/telehealth.service';

export default function Module09_OnlineConsultation() {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [inCall, setInCall] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [roomToken, setRoomToken] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnected, setPeerConnected] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const sessionRef = useRef(null);

  const [messages, setMessages] = useState([
    { sender: 'doctor', text: 'Hello, I have reviewed your clinical notes and lab reports. Ready for our consultation.', time: '10:02 AM' }
  ]);
  const [chatInput, setChatInput] = useState('');
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

  const handleToggleCall = async () => {
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
          } catch (mediaErr) {
            addToast({
              type: 'warning',
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
              title: 'Doctor Connected',
              message: 'Live two-way WebRTC peer audio/video established.',
            });
          },
          onPeerJoined: () => {
            addToast({
              type: 'info',
              title: 'Consultation Peer Joined',
              message: 'Doctor joined the encrypted consultation room.',
            });
          },
          onPeerLeft: () => {
            setRemoteStream(null);
            setPeerConnected(false);
            addToast({
              type: 'warning',
              title: 'Doctor Disconnected',
              message: 'Doctor left the consultation room.',
            });
          },
          onError: (err) => {
            addToast({
              type: 'error',
              title: 'WebRTC Signaling Notice',
              message: err?.message || 'Error in peer signaling.',
            });
          }
        });

        await session.start(stream);
        sessionRef.current = session;
        setInCall(true);

        addToast({
          type: 'success',
          title: 'Consultation Room Connected',
          message: 'P2P WebRTC signaling active via Socket.IO.',
        });
      } catch (err) {
        addToast({
          type: 'error',
          title: 'Connection Error',
          message: err.message || 'Unable to join consultation room.',
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
        title: 'Call Ended',
        message: 'Consultation session concluded cleanly.',
      });
    }
  };

  const toggleVideoTrack = () => {
    if (mediaStream) {
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    } else {
      setVideoEnabled(!videoEnabled);
    }
  };

  const toggleAudioTrack = () => {
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    } else {
      setAudioEnabled(!audioEnabled);
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, { sender: 'patient', text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatInput('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Video Consultation
          </h2>
          <p className="text-xs text-slate-500">
            Secure end-to-end encrypted video and audio room for doctor consultations.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center shrink-0">
          <Video className="w-5 h-5" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col items-center justify-center text-white">
            {inCall ? (
              <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
                {/* Remote Doctor Video or Waiting State */}
                {peerConnected && remoteStream ? (
                  <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-aurora-teal/20 text-aurora-teal flex items-center justify-center mx-auto animate-pulse">
                      <UserCheck className="w-8 h-8" />
                    </div>
                    <div className="font-bold text-sm">Consultation Room Active</div>
                    <div className="text-xs text-slate-400">Waiting for doctor to connect... (P2P WebRTC Signaling Active)</div>
                  </div>
                )}

                {/* Local Patient Video Preview */}
                <div className="absolute bottom-3 right-3 w-36 h-24 rounded-xl bg-slate-950 border border-white/20 overflow-hidden flex items-center justify-center text-[10px] text-slate-400 shadow-lg">
                  {mediaStream && videoEnabled ? (
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  ) : (
                    <span className="p-2 text-center">{videoEnabled ? 'Camera Active' : 'Camera Muted'}</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center p-6 space-y-3 text-slate-400">
                <Video className="w-10 h-10 mx-auto opacity-40" />
                <div className="text-xs">Camera and audio ready for scheduled consultation.</div>
                <Button size="sm" variant="primary" loading={connecting} onClick={handleToggleCall}>
                  Join Consultation Room
                </Button>
              </div>
            )}
          </div>

          {inCall && (
            <div className="p-3 rounded-xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3">
              <button
                onClick={toggleVideoTrack}
                className={`p-2.5 rounded-xl transition-colors ${
                  videoEnabled ? 'bg-slate-100 dark:bg-aurora-midnight text-slate-700 dark:text-slate-200' : 'bg-rose-100 text-rose-600'
                }`}
                title={videoEnabled ? 'Mute Video' : 'Enable Video'}
              >
                {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <button
                onClick={toggleAudioTrack}
                className={`p-2.5 rounded-xl transition-colors ${
                  audioEnabled ? 'bg-slate-100 dark:bg-aurora-midnight text-slate-700 dark:text-slate-200' : 'bg-rose-100 text-rose-600'
                }`}
                title={audioEnabled ? 'Mute Mic' : 'Enable Mic'}
              >
                {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                onClick={handleToggleCall}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-rose-700"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>Leave Call</span>
              </button>
            </div>
          )}
        </div>

        <Card className="p-4 flex flex-col h-[380px]">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
            <h3 className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-aurora-teal" />
              <span>In-Consultation Chat</span>
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 text-xs pr-1">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex flex-col ${m.sender === 'patient' ? 'items-end' : 'items-start'}`}>
                <div className={`p-2.5 rounded-2xl max-w-[85%] ${
                  m.sender === 'patient' 
                    ? 'bg-aurora-teal text-aurora-midnight rounded-br-xs' 
                    : 'bg-slate-100 dark:bg-aurora-midnight text-slate-800 dark:text-slate-200 rounded-bl-xs'
                }`}>
                  <p>{m.text}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 px-1">{m.time}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type message to doctor..."
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs"
            />
            <Button size="sm" variant="primary" type="submit">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
