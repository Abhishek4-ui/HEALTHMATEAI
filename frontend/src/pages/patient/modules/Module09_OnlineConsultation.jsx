import React, { useState } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  MessageSquare, 
  Paperclip, 
  FileText, 
  ShieldCheck, 
  Wifi, 
  Lock,
  Send,
  UserCheck
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useToast } from '../../../context/ToastContext';

export default function Module09_OnlineConsultation() {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [inCall, setInCall] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState([
    { sender: 'doctor', text: 'Hello, I am reviewing your chief complaint. The encrypted consultation stream is active.', time: '10:02 AM' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const { addToast } = useToast();

  const handleToggleCall = () => {
    if (!inCall) {
      setInCall(true);
      addToast({
        type: 'info',
        title: 'WebRTC Signaling Initiated',
        message: 'Connected to Twilio STUN/TURN traversal relay. Peer-to-peer encryption established.',
      });
    } else {
      setInCall(false);
      addToast({
        type: 'info',
        title: 'Consultation Ended',
        message: 'WebRTC stream terminated. Temporary media buffers wiped.',
      });
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
      {/* Header */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Telehealth Consultation Workspace
            </h2>
            <Badge variant="teal">DTLS-SRTP WebRTC</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            End-to-end encrypted video and audio consultation room between verified doctor and patient.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
            <Wifi className="w-3.5 h-3.5" />
            <span>STUN/TURN Standby</span>
          </span>
        </div>
      </div>

      {/* Video & Chat Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Screen */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-video rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col items-center justify-center text-white shadow-2xl">
            {inCall ? (
              <div className="text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-aurora-teal/20 text-aurora-teal flex items-center justify-center mx-auto animate-pulse">
                  <UserCheck className="w-8 h-8" />
                </div>
                <div className="font-bold text-base">Dr. Ramesh Kumar (Cardiologist)</div>
                <div className="text-xs text-slate-400">Consultation in Progress • Audio/Video Connected</div>
              </div>
            ) : (
              <div className="text-center p-6 space-y-3 text-slate-400">
                <Video className="w-12 h-12 mx-auto opacity-50" />
                <div className="text-xs font-medium">Camera and microphone ready for scheduled appointment.</div>
                <Button size="sm" variant="primary" onClick={handleToggleCall}>
                  Join Consultation Room
                </Button>
              </div>
            )}

            {/* Self Video Thumbnail */}
            {inCall && (
              <div className="absolute bottom-4 right-4 w-28 h-20 sm:w-36 sm:h-24 rounded-2xl bg-slate-900 border border-white/20 overflow-hidden flex items-center justify-center text-[10px] text-slate-400">
                {videoEnabled ? 'Patient Cam (Active)' : 'Camera Muted'}
              </div>
            )}
          </div>

          {/* Media Control Toolbar */}
          {inCall && (
            <div className="p-4 rounded-2xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3">
              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`p-3 rounded-2xl transition-all ${
                  videoEnabled ? 'bg-slate-100 dark:bg-aurora-midnight text-slate-700 dark:text-slate-200' : 'bg-rose-100 text-rose-600'
                }`}
                title={videoEnabled ? 'Mute Video' : 'Enable Video'}
              >
                {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-3 rounded-2xl transition-all ${
                  audioEnabled ? 'bg-slate-100 dark:bg-aurora-midnight text-slate-700 dark:text-slate-200' : 'bg-rose-100 text-rose-600'
                }`}
                title={audioEnabled ? 'Mute Microphone' : 'Enable Microphone'}
              >
                {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={handleToggleCall}
                className="px-5 py-3 rounded-2xl bg-rose-600 text-white font-bold text-xs flex items-center gap-2 hover:bg-rose-700 shadow-md shadow-rose-600/20"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Leave Room</span>
              </button>
            </div>
          )}
        </div>

        {/* Live Consultation Chat / Document Sharing */}
        <Card className="p-4 sm:p-6 flex flex-col h-[440px]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-aurora-teal" />
              <span>In-Consultation Chat</span>
            </h3>
            <span className="text-[10px] text-slate-400">P2P Encrypted</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            {messages.map((m, idx) => (
              <div key={idx} className={`p-3 rounded-2xl ${
                m.sender === 'doctor'
                  ? 'bg-slate-100 dark:bg-aurora-midnight text-slate-800 dark:text-slate-200 mr-4'
                  : 'bg-aurora-teal text-aurora-midnight font-medium ml-4'
              }`}>
                <div className="text-[10px] font-bold opacity-60 mb-0.5">
                  {m.sender === 'doctor' ? 'Dr. Ramesh Kumar' : 'You'} • {m.time}
                </div>
                <p>{m.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Send message to doctor..."
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-aurora-teal"
            />
            <Button size="sm" variant="primary" type="submit">
              <Send className="w-3.5 h-3.5 text-aurora-midnight" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
