import React, { useState } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  MessageSquare, 
  Send,
  UserCheck
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../context/ToastContext';

export default function Module09_OnlineConsultation() {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [inCall, setInCall] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'doctor', text: 'Hello, I have reviewed your notes.', time: '10:02 AM' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const { addToast } = useToast();

  const handleToggleCall = () => {
    if (!inCall) {
      setInCall(true);
      addToast({
        type: 'info',
        title: 'Call Started',
        message: 'Connected to consultation room.',
      });
    } else {
      setInCall(false);
      addToast({
        type: 'info',
        title: 'Call Ended',
        message: 'Consultation session concluded.',
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
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Video Consultation
          </h2>
          <p className="text-xs text-slate-500">
            Secure video and audio room for doctor consultations.
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
              <div className="text-center p-6 space-y-2">
                <div className="w-14 h-14 rounded-full bg-aurora-teal/20 text-aurora-teal flex items-center justify-center mx-auto">
                  <UserCheck className="w-7 h-7" />
                </div>
                <div className="font-bold text-sm">Dr. Ramesh Kumar</div>
                <div className="text-xs text-slate-400">Consultation in progress</div>
              </div>
            ) : (
              <div className="text-center p-6 space-y-3 text-slate-400">
                <Video className="w-10 h-10 mx-auto opacity-40" />
                <div className="text-xs">Camera and audio ready for scheduled consultation.</div>
                <Button size="sm" variant="primary" onClick={handleToggleCall}>
                  Join Room
                </Button>
              </div>
            )}

            {inCall && (
              <div className="absolute bottom-3 right-3 w-24 h-16 rounded-xl bg-slate-900 border border-white/20 flex items-center justify-center text-[10px] text-slate-400">
                {videoEnabled ? 'You' : 'Muted'}
              </div>
            )}
          </div>

          {inCall && (
            <div className="p-3 rounded-xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3">
              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`p-2.5 rounded-xl ${
                  videoEnabled ? 'bg-slate-100 dark:bg-aurora-midnight text-slate-700 dark:text-slate-200' : 'bg-rose-100 text-rose-600'
                }`}
                title={videoEnabled ? 'Mute Video' : 'Enable Video'}
              >
                {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-2.5 rounded-xl ${
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
                <span>Leave</span>
              </button>
            </div>
          )}
        </div>

        <Card className="p-4 flex flex-col h-[380px]">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
            <h3 className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-aurora-teal" />
              <span>Chat</span>
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 text-xs">
            {messages.map((m, idx) => (
              <div key={idx} className={`p-2.5 rounded-xl ${
                m.sender === 'doctor'
                  ? 'bg-slate-100 dark:bg-aurora-midnight text-slate-800 dark:text-slate-200 mr-4'
                  : 'bg-aurora-teal text-aurora-midnight font-medium ml-4'
              }`}>
                <div className="text-[10px] opacity-60 mb-0.5">
                  {m.sender === 'doctor' ? 'Doctor' : 'You'} • {m.time}
                </div>
                <p>{m.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type message..."
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
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
