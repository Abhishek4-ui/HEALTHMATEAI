import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  AlertCircle,
  Bot,
  Stethoscope,
  Calendar,
  Clock,
  Download,
  Trash2,
  Globe,
  Volume2,
  VolumeX,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FileText,
  ArrowLeft,
  RefreshCw,
  Star,
  MapPin,
  IndianRupee,
  ShieldAlert,
  Check,
  Search,
  ExternalLink,
  Lock,
  HeartHandshake
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../services/api';
import aiService from '../../../services/aiService';
import discoveryService from '../../../services/discoveryService';
import patientService from '../../../services/patientService';
import { TelehealthSession } from '../../../services/telehealth.service';
import { INDIAN_STATES_AND_UTS } from '../../../data/indianStatesAndDistricts';

export default function Module09_OnlineConsultation() {
  const { addToast } = useToast();

  // Top-Level Active Navigation View
  // 'HUB' | 'AI_DOCTOR' | 'REAL_DOCTOR' | 'HISTORY'
  const [activeView, setActiveView] = useState('HUB');

  // =========================================================================
  // SECTION 1: AI DOCTOR CONSULTATION STATE
  // =========================================================================
  const [aiSessionId, setAiSessionId] = useState(null);
  const [aiLanguage, setAiLanguage] = useState('en'); // 'en' | 'hi'
  const [patientContextConsented, setPatientContextConsented] = useState(true);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [speakingMsgIndex, setSpeakingMsgIndex] = useState(null);
  const speechRecognitionRef = useRef(null);
  const chatScrollRef = useRef(null);

  // =========================================================================
  // SECTION 2: REAL DOCTOR CONSULTATION & DISCOVERY STATE
  // =========================================================================
  // 'DISCOVER' | 'SLOTS' | 'SUMMARY_APPROVAL' | 'PAYMENT' | 'VIDEO_ROOM'
  const [realDocStep, setRealDocStep] = useState('DISCOVER');
  
  // Search Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [doctorsList, setDoctorsList] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Selected Doctor & Slot
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState(null);

  // Pre-Consultation Summary
  const [draftSummary, setDraftSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [shareSummaryWithDoctor, setShareSummaryWithDoctor] = useState(true);

  // =========================================================================
  // SECTION 3: WEBRTC REAL DOCTOR VIDEO CALL STATE
  // =========================================================================
  const [inCall, setInCall] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [peerConnectionState, setPeerConnectionState] = useState('DISCONNECTED'); // 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [mediaStream, setMediaStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callDurationSec, setCallDurationSec] = useState(0);
  const [activeVideoAppointment, setActiveVideoAppointment] = useState(null);
  const [stunTurnStatus, setStunTurnStatus] = useState({ stun: 'STUN_ACTIVE', turn: 'TURN_UNCONFIGURED_P2P' });

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const sessionRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // =========================================================================
  // SECTION 4: CONSULTATION HISTORY STATE
  // =========================================================================
  const [historyTab, setHistoryTab] = useState('AI_DOCTOR'); // 'AI_DOCTOR' | 'REAL_DOCTOR'
  const [aiHistories, setAiHistories] = useState([]);
  const [realHistories, setRealHistories] = useState([]);
  const [loadingHistories, setLoadingHistories] = useState(false);
  const [viewingHistoryDetail, setViewingHistoryDetail] = useState(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [aiMessages, aiLoading]);

  // Clean media and speech on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.stop();
        sessionRef.current = null;
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [mediaStream]);

  // Attach remote stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Timer for active video call
  useEffect(() => {
    if (inCall && peerConnectionState === 'CONNECTED') {
      timerIntervalRef.current = setInterval(() => {
        setCallDurationSec(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [inCall, peerConnectionState]);

  // =========================================================================
  // AI DOCTOR METHODS
  // =========================================================================
  const handleStartAISession = async () => {
    setAiLoading(true);
    try {
      const res = await aiService.startAIDoctorSession({
        language: aiLanguage,
        patientContextConsented,
        title: 'AI Health Assessment Session',
      });
      const data = res.data || res;
      setAiSessionId(data._id);
      setAiMessages(data.aiMessages || []);
      setActiveView('AI_DOCTOR');
      addToast({
        type: 'success',
        title: 'AI Doctor Ready',
        message: 'Your private AI health consultation room is active.',
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to start AI session',
        message: err.message || 'Could not initialize AI consultation.',
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendAIMessage = async (e) => {
    if (e) e.preventDefault();
    if (!aiInput.trim()) return;

    const userText = aiInput.trim();
    setAiInput('');

    // Optimistic UI update
    const tempUserMsg = {
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
    };
    setAiMessages(prev => [...prev, tempUserMsg]);
    setAiLoading(true);

    try {
      let currentSessionId = aiSessionId;
      if (!currentSessionId) {
        const initRes = await aiService.startAIDoctorSession({
          language: aiLanguage,
          patientContextConsented,
          title: userText.slice(0, 30) + '...',
        });
        const initData = initRes.data || initRes;
        currentSessionId = initData._id;
        setAiSessionId(currentSessionId);
      }

      const res = await aiService.sendAIDoctorMessage(currentSessionId, {
        query: userText,
        language: aiLanguage,
      });
      const data = res.data || res;
      if (data && data.messages) {
        setAiMessages(data.messages);
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Message delivery failed',
        message: err.message || 'AI assistant unreachable.',
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Web Speech API Voice Input
  const handleToggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast({
        type: 'warning',
        title: 'Voice Not Supported',
        message: 'Speech recognition is not supported in this browser. Please use Google Chrome or Edge.',
      });
      return;
    }

    if (isVoiceListening) {
      if (speechRecognitionRef.current) speechRecognitionRef.current.stop();
      setIsVoiceListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = aiLanguage === 'hi' ? 'hi-IN' : 'en-US';
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsVoiceListening(true);
      };

      recognition.onresult = (event) => {
        const speechText = event.results[0][0].transcript;
        setAiInput(prev => (prev ? `${prev} ${speechText}` : speechText));
        setIsVoiceListening(false);
      };

      recognition.onerror = () => {
        setIsVoiceListening(false);
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsVoiceListening(false);
    }
  };

  // SpeechSynthesis Voice Output
  const handleToggleSpeak = (text, index) => {
    if (!window.speechSynthesis) return;

    if (speakingMsgIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingMsgIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = aiLanguage === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingMsgIndex(null);
    utterance.onerror = () => setSpeakingMsgIndex(null);

    setSpeakingMsgIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  // Export AI consultation transcript as text/markdown
  const handleExportAISummary = () => {
    if (!aiMessages.length) return;
    const header = `# HealthMate AI Doctor — Consultation Summary\nDate: ${new Date().toLocaleString()}\nLanguage: ${aiLanguage.toUpperCase()}\n\n`;
    const body = aiMessages
      .map(m => `### ${m.role === 'user' ? 'Patient' : 'HealthMate AI Doctor'} (${new Date(m.timestamp).toLocaleTimeString()})\n${m.content}\n`)
      .join('\n');
    const disclaimer = `\n---\n**MANDATORY MEDICAL DISCLAIMER:**\nThis AI consultation is for informational triage guidance only. It is NOT a definitive clinical diagnosis. In case of emergency in India, dial 112 immediately.`;

    const blob = new Blob([header + body + disclaimer], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI_Consultation_Summary_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleEndAISession = async () => {
    if (!aiSessionId) return;
    try {
      await aiService.endAIDoctorSession(aiSessionId);
      addToast({
        type: 'success',
        title: 'Consultation Concluded',
        message: 'Clinical summary synthesized and archived in Consultation History.',
      });
      loadHistories();
      setActiveView('HISTORY');
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error ending session',
        message: err.message,
      });
    }
  };

  // =========================================================================
  // REAL DOCTOR METHODS
  // =========================================================================
  const handleSearchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const filters = {};
      if (searchQuery.trim()) filters.search = searchQuery.trim();
      if (selectedSpecialty) filters.specialization = selectedSpecialty;
      if (selectedState) filters.state = selectedState;
      if (selectedDistrict) filters.city = selectedDistrict;

      const res = await discoveryService.searchDoctors(filters);
      setDoctorsList(res.doctors || []);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Doctor Discovery Failed',
        message: err.message || 'Could not retrieve doctor directory.',
      });
    } finally {
      setLoadingDoctors(false);
    }
  };

  useEffect(() => {
    if (activeView === 'REAL_DOCTOR' && realDocStep === 'DISCOVER') {
      handleSearchDoctors();
    }
  }, [activeView, realDocStep, selectedSpecialty, selectedState, selectedDistrict]);

  const handleSelectDoctorForBooking = async (doctor) => {
    setSelectedDoctor(doctor);
    setRealDocStep('SLOTS');
    fetchAvailableSlots(doctor._id, appointmentDate);
  };

  const fetchAvailableSlots = async (doctorId, dateStr) => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const res = await discoveryService.getDoctorAvailability(doctorId, dateStr);
      const data = res.data || res;
      setAvailableSlots(data.slots || []);
    } catch (err) {
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setAppointmentDate(newDate);
    if (selectedDoctor) {
      fetchAvailableSlots(selectedDoctor._id, newDate);
    }
  };

  const handleProceedToPreSummary = async () => {
    if (!selectedSlot) {
      addToast({
        type: 'warning',
        title: 'Slot Required',
        message: 'Please choose an available appointment time slot.',
      });
      return;
    }
    setRealDocStep('SUMMARY_APPROVAL');
  };

  const handleConfirmAndPay = async () => {
    if (!chiefComplaint.trim()) {
      addToast({
        type: 'warning',
        title: 'Chief Complaint Required',
        message: 'Please briefly describe your primary health concern for the doctor.',
      });
      return;
    }

    setBookingLoading(true);
    try {
      // 1. Create Appointment atomically in backend
      const apptRes = await patientService.bookAppointment({
        doctorId: selectedDoctor._id,
        scheduledDate: appointmentDate,
        timeSlot: selectedSlot,
        consultationType: 'VIDEO',
        chiefComplaint: chiefComplaint.trim(),
      });
      const apptData = apptRes.data || apptRes;
      setBookedAppointment(apptData);

      // 2. Trigger Razorpay Test Mode checkout
      const fee = selectedDoctor.consultationFee !== undefined ? selectedDoctor.consultationFee : 500;
      if (fee === 0) {
        addToast({
          type: 'success',
          title: 'Consultation Confirmed',
          message: 'Appointment reserved successfully! You can now join the video room.',
        });
        setActiveVideoAppointment(apptData);
        setRealDocStep('VIDEO_ROOM');
        return;
      }

      // Initiate Razorpay Order
      const orderRes = await patientService.createPaymentOrder({
        appointmentId: apptData._id,
        amount: fee,
        currency: 'INR',
      });
      const orderData = orderRes.data || orderRes;

      // Ensure Razorpay SDK loaded
      const scriptLoaded = await new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Razorpay payment gateway SDK could not be loaded.');
      }

      const options = {
        key: orderData.keyId || 'rzp_test_Tyml08EyeVHKJY',
        amount: Math.round(fee * 100),
        currency: 'INR',
        name: 'HealthMate AI Doctor Consultation',
        description: `Video Consultation with Dr. ${selectedDoctor.fullName}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            await patientService.verifyPaymentSignature({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              appointmentId: apptData._id,
            });

            addToast({
              type: 'success',
              title: 'Payment & Booking Confirmed',
              message: `Payment verified. Video room ready for Dr. ${selectedDoctor.fullName}!`,
            });

            // Save patient approval for AI pre-consultation summary if checked
            if (shareSummaryWithDoctor && draftSummary) {
              await aiService.approvePreConsultationSummary(apptData._id, draftSummary).catch(() => {});
            }

            setActiveVideoAppointment(apptData);
            setRealDocStep('VIDEO_ROOM');
          } catch (sigErr) {
            addToast({
              type: 'error',
              title: 'Signature Verification Failed',
              message: sigErr.message || 'Payment signature could not be verified.',
            });
          }
        },
        prefill: {
          name: 'HealthMate Patient',
          email: 'patient@healthmate.ai',
          contact: '9999999999',
        },
        theme: {
          color: '#3B82F6',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Booking Error',
        message: err.message || 'Could not complete appointment booking.',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  // =========================================================================
  // WEBRTC VIDEO CALL METHODS
  // =========================================================================
  const handleStartVideoCall = async () => {
    if (!activeVideoAppointment) return;
    setConnecting(true);
    setPeerConnectionState('CONNECTING');

    try {
      // 1. Get Camera/Mic stream
      let stream = null;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setMediaStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }

      // 2. Fetch server WebRTC token & STUN/TURN config
      const tokenRes = await aiService.getConsultationVideoToken(activeVideoAppointment._id);
      const tokenData = tokenRes.data || tokenRes;
      setStunTurnStatus({
        stun: 'STUN_ACTIVE (Google Public Stun)',
        turn: tokenData.turnConfigured ? (tokenData.turnStatus || 'TURN_RELAY_CONFIGURED') : 'BLOCKED_P2P_FALLBACK',
        turnMessage: tokenData.turnMessage || 'Symmetric firewall traversal requires Coturn/Twilio TURN credentials.',
      });

      // 3. Initialize Telehealth WebRTC Session
      const session = new TelehealthSession({
        appointmentId: activeVideoAppointment._id,
        token: localStorage.getItem('token'),
        iceServers: tokenData.iceServers || (tokenData.stunServers ? tokenData.stunServers.map(s => ({ urls: s })) : undefined),
        onRemoteStream: (remStream) => {
          setRemoteStream(remStream);
          setPeerConnectionState('CONNECTED');
          addToast({
            type: 'success',
            title: 'Doctor Connected',
            message: 'Encrypted two-way WebRTC peer connection established.',
          });
        },
        onPeerJoined: () => {
          addToast({
            type: 'info',
            title: 'Doctor Joined Room',
            message: 'Waiting for peer audio/video handshake...',
          });
        },
        onPeerLeft: () => {
          setPeerConnectionState('DISCONNECTED');
          setRemoteStream(null);
          addToast({
            type: 'warning',
            title: 'Doctor Disconnected',
            message: 'The doctor has exited the consultation room.',
          });
        },
        onConnectionStateChange: (state) => {
          if (state === 'connected') setPeerConnectionState('CONNECTED');
          else if (state === 'connecting') setPeerConnectionState('CONNECTING');
          else if (state === 'failed' || state === 'disconnected' || state === 'closed') {
            setPeerConnectionState('DISCONNECTED');
          }
        },
        onError: (err) => {
          addToast({
            type: 'error',
            title: 'WebRTC Signaling Error',
            message: err.message || 'Signaling failure occurred.',
          });
        },
      });

      await session.start(stream);
      sessionRef.current = session;
      setInCall(true);
    } catch (err) {
      setPeerConnectionState('DISCONNECTED');
      addToast({
        type: 'error',
        title: 'Could not connect call',
        message: err.message || 'Media permission or signaling error.',
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleEndVideoCall = () => {
    if (sessionRef.current) {
      sessionRef.current.stop();
      sessionRef.current = null;
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
      setMediaStream(null);
    }
    setRemoteStream(null);
    setInCall(false);
    setPeerConnectionState('DISCONNECTED');
    setCallDurationSec(0);
    addToast({
      type: 'info',
      title: 'Consultation Ended',
      message: 'Video session completed and media streams released.',
    });
  };

  const toggleVideo = () => {
    if (mediaStream) {
      const track = mediaStream.getVideoTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setVideoEnabled(track.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (mediaStream) {
      const track = mediaStream.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setAudioEnabled(track.enabled);
      }
    }
  };

  // Format call duration MM:SS
  const formatDuration = (totalSec) => {
    const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // =========================================================================
  // CONSULTATION HISTORY METHODS
  // =========================================================================
  const loadHistories = async () => {
    setLoadingHistories(true);
    try {
      const [aiRes, realRes] = await Promise.all([
        aiService.listConsultations({ category: 'AI_DOCTOR', limit: 20 }),
        aiService.listConsultations({ category: 'REAL_DOCTOR', limit: 20 }),
      ]);
      const aiData = aiRes.data || aiRes;
      const realData = realRes.data || realRes;
      setAiHistories(aiData.consultations || []);
      setRealHistories(realData.consultations || []);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to load histories',
        message: err.message,
      });
    } finally {
      setLoadingHistories(false);
    }
  };

  useEffect(() => {
    if (activeView === 'HISTORY') {
      loadHistories();
    }
  }, [activeView]);

  const handleDeleteAIConsultation = async (id) => {
    try {
      await aiService.deleteAIDoctorSession(id);
      addToast({
        type: 'success',
        title: 'Record Deleted',
        message: 'AI consultation permanently deleted from your account.',
      });
      loadHistories();
    } catch (e) {
      addToast({ type: 'error', title: 'Delete Failed', message: e.message });
    }
  };

  // Available districts for selected state
  const availableDistricts = useMemo(() => {
    if (!selectedState) return [];
    const stateObj = INDIAN_STATES_AND_UTS.find(s => s.name === selectedState);
    return stateObj ? stateObj.districts : [];
  }, [selectedState]);

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* TOP HEADER & NAVIGATION BAR */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Patient Consultation Center
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-white/10 text-slate-300">
                End-to-End Encrypted
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Clinical Healthcare Consultations
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Connect with our clinical AI Assistant for 24/7 symptom clarification and report explanations, or book a live WebRTC teleconsultation with a verified doctor.
            </p>
          </div>

          {/* Navigation Mode Buttons */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-700/60 backdrop-blur-md">
            <button
              onClick={() => setActiveView('HUB')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeView === 'HUB'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hub Overview
            </button>
            <button
              onClick={() => setActiveView('AI_DOCTOR')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeView === 'AI_DOCTOR'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              AI Doctor
            </button>
            <button
              onClick={() => setActiveView('REAL_DOCTOR')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeView === 'REAL_DOCTOR'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Real Doctor
            </button>
            <button
              onClick={() => setActiveView('HISTORY')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeView === 'HISTORY'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Histories
            </button>
          </div>
        </div>

        {/* Emergency Notice Pill */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-rose-300">
            <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>Emergency red flags (crushing chest pain, severe breathlessness, sudden numbness):</span>
            <span className="font-bold underline">Dial 112 / 102 immediately</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Role: PATIENT ONLY</span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* VIEW 1: HUB OVERVIEW (DUAL PORTAL CARDS) */}
      {/* ===================================================================== */}
      {activeView === 'HUB' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card A: AI Doctor Consultation */}
            <div className="bg-slate-900/90 border border-blue-500/30 rounded-3xl p-6 shadow-xl hover:border-blue-400/60 transition flex flex-col justify-between relative group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shadow-inner">
                    <Bot className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    24/7 AI Healthcare
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition">
                    AI Doctor Consultation
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Talk to an AI-powered healthcare assistant for health information, symptom discussion and medical report explanations.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Multilingual support: English and Hindi (हिन्दी)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Live voice input & speech synthesizer playback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Explicit patient context integration (vitals & lab records)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>RAG clinical guidelines citations with 112 emergency advice</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={handleStartAISession}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition"
                >
                  <Bot className="w-4 h-4" />
                  Enter AI Doctor Consultation
                </button>
              </div>
            </div>

            {/* Card B: Real Doctor Consultation */}
            <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-6 shadow-xl hover:border-indigo-400/60 transition flex flex-col justify-between relative group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-inner">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    Live Teleconsultation
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition">
                    Real Doctor Consultation
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Discover verified healthcare professionals and book an actual consultation.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>36 Indian States & UTs discovery directory</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Transparent credentials (NMC/State Medical Council records)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Real-time slot reservation (zero double-booking guarantee)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Razorpay test checkout & 2-way WebRTC video room</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => {
                    setActiveView('REAL_DOCTOR');
                    setRealDocStep('DISCOVER');
                  }}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition"
                >
                  <Stethoscope className="w-4 h-4" />
                  Find Doctors & Book Consultation
                </button>
              </div>
            </div>
          </div>

          {/* Quick Consultation History Teaser Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Need Past Records & Transcripts?</h4>
                <p className="text-xs text-slate-400">View and export separated AI Doctor transcripts or real doctor consultation appointments.</p>
              </div>
            </div>
            <button
              onClick={() => setActiveView('HISTORY')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition whitespace-nowrap"
            >
              Open Consultation History
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: AI DOCTOR CONSULTATION INTERFACE */}
      {/* ===================================================================== */}
      {activeView === 'AI_DOCTOR' && (
        <div className="space-y-4">
          {/* Top AI Controls & Governance Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  HealthMate AI Doctor
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[11px] text-slate-400">Active Consultation Session</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Language Selector */}
              <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-400">Language:</span>
                <select
                  value={aiLanguage}
                  onChange={(e) => setAiLanguage(e.target.value)}
                  className="bg-transparent text-white font-semibold outline-none cursor-pointer"
                >
                  <option value="en" className="bg-slate-800 text-white">English</option>
                  <option value="hi" className="bg-slate-800 text-white">हिन्दी (Hindi)</option>
                </select>
              </div>

              {/* Patient Context Consent Toggle */}
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60 hover:bg-slate-800 transition">
                <input
                  type="checkbox"
                  checked={patientContextConsented}
                  onChange={(e) => setPatientContextConsented(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Include My Health Profile Context</span>
              </label>

              {/* Action Buttons */}
              <button
                onClick={handleExportAISummary}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition"
                title="Download Consultation Transcript"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>

              <button
                onClick={handleEndAISession}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 transition"
              >
                End & Summarize
              </button>
            </div>
          </div>

          {/* AI Clinical Disclaimer Banner */}
          <div className="p-3 bg-amber-500/10 border-l-4 border-amber-500 rounded-r-xl text-xs text-amber-200 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="leading-relaxed">
              <span className="font-bold">Informational Triage Assist:</span> HealthMate AI Doctor is an educational assistant, not a licensed medical doctor. It cannot provide definitive medical diagnoses, prescribe medications, or replace human clinical consultation.
            </div>
          </div>

          {/* Chat Transcript Area */}
          <div 
            ref={chatScrollRef}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 h-[480px] overflow-y-auto space-y-4"
          >
            {aiMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Bot className="w-12 h-12 text-slate-600 mb-3" />
                <h4 className="text-sm font-bold text-slate-200">Start Your AI Consultation</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Describe what you are experiencing, ask about medical terms, or paste your recent test report values.
                </p>
              </div>
            )}

            {aiMessages.map((msg, idx) => {
              const isAssistant = msg.role === 'assistant';
              const struct = msg.structuredResponse;

              return (
                <div 
                  key={idx}
                  className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-2`}>
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      isAssistant 
                        ? 'bg-slate-800 text-slate-100 border border-slate-700/80' 
                        : 'bg-blue-600 text-white rounded-tr-none'
                    }`}>
                      <p className="whitespace-pre-line">{msg.content}</p>

                      {/* Structured Clinical Breakdown for Assistant Replies */}
                      {isAssistant && struct && (
                        <div className="mt-3 pt-3 border-t border-slate-700/60 space-y-2 text-[11px]">
                          {struct.is_emergency && (
                            <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-200 font-bold flex items-center gap-2">
                              <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                              <span>{struct.emergency_guidance || 'Seek immediate emergency medical care (Dial 112)'}</span>
                            </div>
                          )}

                          {struct.warning_signs && struct.warning_signs.length > 0 && (
                            <div className="text-rose-300">
                              <span className="font-bold">Warning Signs: </span>
                              {struct.warning_signs.join(', ')}
                            </div>
                          )}

                          {struct.possible_explanations && struct.possible_explanations.length > 0 && (
                            <div className="text-slate-300">
                              <span className="font-bold text-slate-400">Possibilities (Not Diagnoses): </span>
                              {struct.possible_explanations.join('; ')}
                            </div>
                          )}

                          {struct.recommended_next_steps && struct.recommended_next_steps.length > 0 && (
                            <div className="text-slate-300">
                              <span className="font-bold text-slate-400">Recommended Steps: </span>
                              {struct.recommended_next_steps.join('; ')}
                            </div>
                          )}

                          {struct.guideline_citations && struct.guideline_citations.length > 0 && (
                            <div className="text-slate-400 font-mono text-[10px]">
                              <span>Guideline Grounding: </span>
                              {struct.guideline_citations[0]}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Speech / Timestamp Controls */}
                    <div className={`flex items-center gap-2 text-[10px] text-slate-500 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                      <span>{new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isAssistant && (
                        <button
                          onClick={() => handleToggleSpeak(msg.content, idx)}
                          className="text-slate-400 hover:text-blue-400 transition"
                          title="Read aloud"
                        >
                          {speakingMsgIndex === idx ? (
                            <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {aiLoading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 text-xs text-slate-400 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce delay-200" />
                  </div>
                  <span>AI Doctor is formulating clinical explanation...</span>
                </div>
              </div>
            )}
          </div>

          {/* Message Input Box */}
          <form 
            onSubmit={handleSendAIMessage}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 flex items-center gap-2 shadow-lg"
          >
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              className={`p-2.5 rounded-xl border transition ${
                isVoiceListening 
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title={isVoiceListening ? 'Listening... click to stop' : 'Speak into microphone'}
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder={
                aiLanguage === 'hi' 
                  ? 'अपने लक्षण बताएं या स्वास्थ्य संबंधी प्रश्न पूछें...' 
                  : 'Describe your symptoms, questions, or medical report findings...'
              }
              className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
            />

            <button
              type="submit"
              disabled={aiLoading || !aiInput.trim()}
              className={`p-2.5 rounded-xl text-white font-semibold text-xs flex items-center gap-1.5 transition ${
                aiLoading || !aiInput.trim()
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/25'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 3: REAL DOCTOR CONSULTATION & LIVE VIDEO ROOM */}
      {/* ===================================================================== */}
      {activeView === 'REAL_DOCTOR' && (
        <div className="space-y-6">
          {/* Real Doctor Navigation Stepper */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              {realDocStep !== 'DISCOVER' && (
                <button
                  onClick={() => {
                    if (realDocStep === 'SLOTS') setRealDocStep('DISCOVER');
                    else if (realDocStep === 'SUMMARY_APPROVAL') setRealDocStep('SLOTS');
                    else if (realDocStep === 'VIDEO_ROOM' && !inCall) setRealDocStep('DISCOVER');
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                  title="Go Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-indigo-400" />
                {realDocStep === 'DISCOVER' && 'Find & Book Verified Practitioners'}
                {realDocStep === 'SLOTS' && `Select Appointment Slot with Dr. ${selectedDoctor?.fullName}`}
                {realDocStep === 'SUMMARY_APPROVAL' && 'AI Pre-Consultation Summary & Review'}
                {realDocStep === 'VIDEO_ROOM' && 'Encrypted Live Video Consultation Room'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono ${
                realDocStep === 'DISCOVER' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                1. Discovery
              </span>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono ${
                realDocStep === 'SLOTS' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                2. Slots
              </span>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono ${
                realDocStep === 'SUMMARY_APPROVAL' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                3. Summary & Pay
              </span>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono ${
                realDocStep === 'VIDEO_ROOM' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                4. Video
              </span>
            </div>
          </div>

          {/* SUB-STEP 1: DOCTOR DISCOVERY ACROSS INDIA */}
          {realDocStep === 'DISCOVER' && (
            <div className="space-y-4">
              {/* Search & Location Filter Bar */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Name or Hospital Search */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Doctor or Hospital Name</label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. Dr. Rajesh Sharma"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Specialty */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Medical Specialty</label>
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="">All Specialties</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="General Medicine">General Medicine</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Psychiatry">Psychiatry</option>
                    </select>
                  </div>

                  {/* State (36 Indian States & UTs) */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Indian State / UT</label>
                    <select
                      value={selectedState}
                      onChange={(e) => {
                        setSelectedState(e.target.value);
                        setSelectedDistrict('');
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="">All States & UTs</option>
                      {INDIAN_STATES_AND_UTS.map((s) => (
                        <option key={s.name} value={s.name}>{s.name} ({s.type})</option>
                      ))}
                    </select>
                  </div>

                  {/* District / City */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">District / City</label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      disabled={!selectedState}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-50"
                    >
                      <option value="">{selectedState ? 'All Districts' : 'Select State first'}</option>
                      {availableDistricts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSearchDoctors}
                    disabled={loadingDoctors}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition"
                  >
                    <Search className="w-3.5 h-3.5" />
                    {loadingDoctors ? 'Searching...' : 'Apply Filters'}
                  </button>
                </div>
              </div>

              {/* Doctors Directory Grid */}
              {loadingDoctors ? (
                <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span>Querying verified practitioner registries...</span>
                </div>
              ) : doctorsList.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
                  <Stethoscope className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold text-slate-300">No matching doctors found in this region.</p>
                  <p className="mt-1">Try clearing state/district filters to see all available teleconsultation specialists.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {doctorsList.map((doc) => {
                    const isBookable = doc.appointmentBookingAvailable === true;
                    const statusColor = 
                      doc.verificationStatus === 'APPOINTMENT_ENABLED' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' :
                      doc.verificationStatus === 'CREDENTIAL_VERIFIED' ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' :
                      doc.verificationStatus === 'SOURCE_VERIFIED' ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' :
                      'bg-slate-700/40 text-slate-300 border-slate-600';

                    return (
                      <div 
                        key={doc._id}
                        className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-500/40 transition shadow-sm"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-sm text-white">{doc.fullName}</h3>
                              <p className="text-xs text-indigo-400 font-medium">{doc.specialization}</p>
                            </div>

                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${statusColor}`}>
                              {doc.verificationStatus || 'DISCOVERED'}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-xs text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                              <span>{doc.address?.city || 'Location verified'}, {doc.address?.state || 'India'}</span>
                            </div>

                            {doc.medicalRegistrationNumber && (
                              <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                <span>Reg: {doc.medicalRegistrationNumber}</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                              <span className="text-slate-400">Consultation Fee:</span>
                              <span className="font-bold text-white flex items-center">
                                <IndianRupee className="w-3 h-3" />
                                {doc.consultationFee !== undefined ? doc.consultationFee : 500}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4">
                          {isBookable ? (
                            <button
                              onClick={() => handleSelectDoctorForBooking(doc)}
                              className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 transition"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              View Availability & Book
                            </button>
                          ) : (
                            <div className="p-2 bg-slate-800/80 rounded-xl text-[11px] text-slate-400 text-center">
                              {doc.bookingNotice || 'Direct online booking currently restricted.'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SUB-STEP 2: APPOINTMENT DATE & REAL SLOT SELECTION */}
          {realDocStep === 'SLOTS' && selectedDoctor && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedDoctor.fullName}</h3>
                  <p className="text-xs text-indigo-400">{selectedDoctor.specialization} • Reg: {selectedDoctor.medicalRegistrationNumber || 'Official SMC'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Consultation Fee</p>
                  <p className="text-xl font-bold text-white flex items-center justify-end">
                    <IndianRupee className="w-4 h-4" />
                    {selectedDoctor.consultationFee !== undefined ? selectedDoctor.consultationFee : 500}
                  </p>
                </div>
              </div>

              {/* Date Picker */}
              <div className="max-w-xs space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Choose Consultation Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={appointmentDate}
                  onChange={handleDateChange}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white outline-none cursor-pointer"
                />
              </div>

              {/* Real Available Slots */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Available Consultation Slots ({appointmentDate})
                </h4>

                {loadingSlots ? (
                  <div className="py-6 text-xs text-slate-400 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    <span>Checking doctor's real schedule against reserved slots...</span>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-4 bg-slate-800/60 rounded-xl text-xs text-amber-300 border border-amber-500/20">
                    No available slots on this day. Please choose another date.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-3 rounded-xl text-xs font-mono font-semibold transition border ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <button
                  onClick={() => setRealDocStep('DISCOVER')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceedToPreSummary}
                  disabled={!selectedSlot}
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition ${
                    !selectedSlot
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/25'
                  }`}
                >
                  Continue to Summary & Payment
                </button>
              </div>
            </div>
          )}

          {/* SUB-STEP 3: AI PRE-CONSULTATION SUMMARY & RAZORPAY PAYMENT */}
          {realDocStep === 'SUMMARY_APPROVAL' && selectedDoctor && selectedSlot && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white">Pre-Consultation Review & Confirmation</h3>
                <p className="text-xs text-slate-400">
                  Review appointment details and optionally synthesize an AI pre-consultation draft to share with Dr. {selectedDoctor.fullName}.
                </p>
              </div>

              {/* Chief Complaint Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Primary Chief Complaint / Reason for Consultation <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="e.g. Experiencing persistent dizziness and elevated blood pressure for the past 3 days."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-indigo-500"
                />
              </div>

              {/* Optional AI Pre-Consultation Summary Sharing Toggle */}
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white">AI-Assisted Pre-Consultation Brief</span>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareSummaryWithDoctor}
                      onChange={(e) => setShareSummaryWithDoctor(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Share with Doctor upon review</span>
                  </label>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  With your explicit consent, HealthMate AI organizes your chief complaint, recent vitals, and verified lab values into a structured clinical brief for the doctor. Nothing is shared without your approval.
                </p>
              </div>

              {/* Appointment Summary Box */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Practitioner:</span>
                  <span className="text-white font-semibold">Dr. {selectedDoctor.fullName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Scheduled Date & Time:</span>
                  <span className="text-white font-mono">{appointmentDate} at {selectedSlot}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Consultation Type:</span>
                  <span className="text-white">Encrypted 2-Way WebRTC Video</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                  <span className="font-semibold text-white">Consultation Fee:</span>
                  <span className="text-base font-bold text-emerald-400 flex items-center">
                    <IndianRupee className="w-3.5 h-3.5" />
                    {selectedDoctor.consultationFee !== undefined ? selectedDoctor.consultationFee : 500}
                  </span>
                </div>
              </div>

              {/* Payment Action */}
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setRealDocStep('SLOTS')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Back to Slots
                </button>

                <button
                  onClick={handleConfirmAndPay}
                  disabled={bookingLoading}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition disabled:opacity-50"
                >
                  {bookingLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Reserving Slot & Initializing Gateway...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay ₹{selectedDoctor.consultationFee !== undefined ? selectedDoctor.consultationFee : 500} via Razorpay (Test Mode)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* SUB-STEP 4: LIVE WEBRTC VIDEO CONSULTATION ROOM */}
          {realDocStep === 'VIDEO_ROOM' && (
            <div className="space-y-4">
              {/* Room Header & Connection Status */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      Teleconsultation Session
                      <span className="text-xs text-slate-400 font-mono">
                        (Dr. {selectedDoctor?.fullName || 'Specialist'})
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Room ID: {activeVideoAppointment?.teleconsultationRoomId || activeVideoAppointment?._id || 'healthmate_room'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  {/* Peer Connection State Badge */}
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-slate-400">Peer State:</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      peerConnectionState === 'CONNECTED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : peerConnectionState === 'CONNECTING'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {peerConnectionState}
                    </span>
                  </div>

                  {inCall && (
                    <div className="px-3 py-1 rounded-xl bg-slate-800 text-white font-mono font-bold">
                      {formatDuration(callDurationSec)}
                    </div>
                  )}
                </div>
              </div>

              {/* STUN / TURN Connectivity Transparency Banner */}
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>NAT Traversal: {stunTurnStatus.stun}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>Relay Status: {stunTurnStatus.turn}</span>
                </div>
              </div>

              {/* Video Feeds Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Remote Doctor Video */}
                <div className="bg-slate-950 border border-slate-800 rounded-3xl h-[340px] relative overflow-hidden flex items-center justify-center">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {!remoteStream && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 text-slate-400 space-y-2">
                      <Stethoscope className="w-12 h-12 text-slate-600 animate-pulse" />
                      <p className="text-xs font-semibold text-slate-300">
                        {inCall ? 'Waiting for Doctor to join stream...' : 'Call not yet started.'}
                      </p>
                      <p className="text-[11px] text-slate-500 max-w-xs">
                        The doctor will appear here once WebRTC peer connection is established.
                      </p>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold">
                    Dr. {selectedDoctor?.fullName || 'Doctor'} (Remote)
                  </div>
                </div>

                {/* Local Patient Video */}
                <div className="bg-slate-950 border border-slate-800 rounded-3xl h-[340px] relative overflow-hidden flex items-center justify-center">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!mediaStream && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 text-slate-400 space-y-2">
                      <VideoOff className="w-10 h-10 text-slate-600" />
                      <p className="text-xs font-semibold text-slate-300">Local Camera Offline</p>
                      <p className="text-[11px] text-slate-500 max-w-xs">Click "Join Consultation" below to allow camera & microphone access.</p>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold">
                    You (Patient Preview)
                  </div>
                </div>
              </div>

              {/* Call Controls Bar */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-center gap-4">
                {!inCall ? (
                  <button
                    onClick={handleStartVideoCall}
                    disabled={connecting}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition"
                  >
                    <Video className="w-4 h-4" />
                    <span>{connecting ? 'Establishing WebRTC Connection...' : 'Join Consultation Call'}</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={toggleVideo}
                      className={`p-3 rounded-xl border transition ${
                        videoEnabled 
                          ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700' 
                          : 'bg-rose-500 text-white border-rose-400'
                      }`}
                      title={videoEnabled ? 'Turn camera off' : 'Turn camera on'}
                    >
                      {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={toggleAudio}
                      className={`p-3 rounded-xl border transition ${
                        audioEnabled 
                          ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700' 
                          : 'bg-rose-500 text-white border-rose-400'
                      }`}
                      title={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                    >
                      {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={handleEndVideoCall}
                      className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-500/25 flex items-center gap-2 transition"
                    >
                      <PhoneOff className="w-4 h-4" />
                      <span>Leave Room</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 4: CONSULTATION HISTORY (AI VS REAL DOCTOR) */}
      {/* ===================================================================== */}
      {activeView === 'HISTORY' && (
        <div className="space-y-4">
          {/* Sub-Tabs: AI vs Real Doctor */}
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <button
              onClick={() => setHistoryTab('AI_DOCTOR')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                historyTab === 'AI_DOCTOR'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4" />
              AI Doctor History ({aiHistories.length})
            </button>

            <button
              onClick={() => setHistoryTab('REAL_DOCTOR')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                historyTab === 'REAL_DOCTOR'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              Real Doctor Consultations ({realHistories.length})
            </button>

            <button
              onClick={loadHistories}
              className="ml-auto p-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition"
              title="Refresh histories"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* AI Doctor History Tab */}
          {historyTab === 'AI_DOCTOR' && (
            <div className="space-y-3">
              {loadingHistories ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading AI consultation sessions...</div>
              ) : aiHistories.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
                  <Bot className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold text-slate-300">No past AI Doctor consultations found.</p>
                  <p className="mt-1">Click "AI Doctor" above to start your first private session.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {aiHistories.map((hist) => (
                    <div 
                      key={hist._id}
                      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-blue-500/40 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{hist.title || 'AI Health Assessment'}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-500/10 text-blue-300">
                            {hist.language === 'hi' ? 'Hindi' : 'English'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {new Date(hist.createdAt).toLocaleString()} • {hist.aiMessages?.length || 0} message turns
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setAiSessionId(hist._id);
                            setAiMessages(hist.aiMessages || []);
                            setActiveView('AI_DOCTOR');
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition"
                        >
                          Reopen Session
                        </button>

                        <button
                          onClick={() => handleDeleteAIConsultation(hist._id)}
                          className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete record (DPDP purge)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Real Doctor History Tab */}
          {historyTab === 'REAL_DOCTOR' && (
            <div className="space-y-3">
              {loadingHistories ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading doctor appointments...</div>
              ) : realHistories.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
                  <Stethoscope className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold text-slate-300">No past doctor appointments recorded.</p>
                  <p className="mt-1">Book a consultation with a registered doctor to see your clinical history here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {realHistories.map((hist) => (
                    <div 
                      key={hist._id}
                      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-indigo-500/40 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">
                            Dr. {hist.doctorId?.fullName || 'Specialist'}
                          </h4>
                          <span className="text-xs text-indigo-400">({hist.doctorId?.specialization || 'Clinical Practice'})</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Date: {hist.appointmentId?.scheduledDate ? new Date(hist.appointmentId.scheduledDate).toDateString() : new Date(hist.createdAt).toDateString()} • Slot: {hist.appointmentId?.timeSlot || 'Scheduled'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          {hist.status || 'CONFIRMED'}
                        </span>

                        {hist.appointmentId && hist.status !== 'COMPLETED' && (
                          <button
                            onClick={() => {
                              setActiveVideoAppointment(hist.appointmentId);
                              setActiveView('REAL_DOCTOR');
                              setRealDocStep('VIDEO_ROOM');
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5"
                          >
                            <Video className="w-3.5 h-3.5" />
                            Enter Room
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
