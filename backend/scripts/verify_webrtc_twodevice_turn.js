const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB } = require('../src/config/db');
const { User, DoctorProfile, Appointment } = require('../src/models');
const { generateAccessToken } = require('../src/security/jwt');
const consultationService = require('../src/services/consultation.service');
const { chromium } = require('../../frontend/node_modules/playwright');

async function runE2EWebRTCTest() {
  console.log('================================================================');
  console.log('HEALTHMATE AI — REAL TWO-DEVICE WebRTC & TWILIO TURN VERIFICATION');
  console.log('================================================================\n');

  await connectDB();

  // 1. Setup Patient and Doctor Users
  console.log('[1/5] Setting up isolated Patient and Doctor test records...');
  const timestamp = Date.now();

  const patientUser = await User.create({
    fullName: `Patient Alpha ${timestamp}`,
    email: `patient.${timestamp}@healthmate.ai`,
    passwordHash: 'dummy_hash',
    role: 'PATIENT',
    isEmailVerified: true,
  });
  const patientToken = generateAccessToken(patientUser);

  const doctorUser = await User.create({
    fullName: `Dr. Beta ${timestamp}`,
    email: `doctor.${timestamp}@healthmate.ai`,
    passwordHash: 'dummy_hash',
    role: 'DOCTOR',
    isEmailVerified: true,
  });
  const doctorToken = generateAccessToken(doctorUser);

  const doctorProfile = await DoctorProfile.create({
    userId: doctorUser._id,
    fullName: doctorUser.fullName,
    medicalRegistrationNumber: `MMC-${timestamp}`,
    stateMedicalCouncil: 'Maharashtra Medical Council',
    specialization: 'Cardiology',
    experienceYears: 12,
    consultationFee: 750,
    verificationStatus: 'APPOINTMENT_ENABLED',
    sourceType: 'STATE_MEDICAL_COUNCIL',
    isClaimed: true,
    address: { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
    location: { type: 'Point', coordinates: [72.8777, 19.0760] },
  });

  const appointment = await Appointment.create({
    patientId: patientUser._id,
    doctorId: doctorProfile._id,
    scheduledDate: new Date(),
    timeSlot: '11:00 AM',
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    consultationType: 'VIDEO',
    chiefComplaint: 'Post-op cardiac teleconsultation follow-up',
    teleconsultationRoomId: `room_${timestamp}`,
  });

  console.log(`- Patient ID: ${patientUser._id}`);
  console.log(`- Doctor ID: ${doctorUser._id}`);
  console.log(`- Appointment ID: ${appointment._id}`);

  // 2. Fetch Twilio ICE Servers via Backend Service
  console.log('\n[2/5] Requesting Twilio Network Traversal ICE configuration...');
  const tokenData = await consultationService.generateVideoToken(appointment._id.toString(), patientUser._id.toString(), 'PATIENT');
  console.log(`- Room ID: ${tokenData.roomId}`);
  console.log(`- TURN Configured: ${tokenData.turnConfigured}`);
  console.log(`- TURN Status: ${tokenData.turnStatus}`);
  console.log(`- Total ICE Servers: ${tokenData.iceServers.length}`);
  const hasTurn = tokenData.iceServers.some(s => (s.urls || s.url || '').includes('turn:'));
  console.log(`- Includes Twilio TURN Relays: ${hasTurn}`);

  // 3. Launch Two Separate Browser Contexts (Simulating 2 Devices)
  console.log('\n[3/5] Launching Two Isolated Playwright Browser Instances (Patient & Doctor)...');
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--use-fake-device-for-media-stream',
      '--use-fake-ui-for-media-stream',
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  // Device 1: Patient
  const patientContext = await browser.newContext();
  await patientContext.grantPermissions(['camera', 'microphone'], { origin: 'http://localhost:5001' });
  const patientPage = await patientContext.newPage();
  await patientPage.goto('http://localhost:5001/health');

  // Device 2: Doctor
  const doctorContext = await browser.newContext();
  await doctorContext.grantPermissions(['camera', 'microphone'], { origin: 'http://localhost:5001' });
  const doctorPage = await doctorContext.newPage();
  await doctorPage.goto('http://localhost:5001/health');

  const socketUrl = 'http://localhost:5001';

  const clientWebRTCScript = `
    window.startClient = function({ socketUrl, token, appointmentId, role, iceServers, forceRelayOnly }) {
      return new Promise((resolve, reject) => {
        const events = [];
        let pc = null;
        let localStream = null;

        const socket = io(socketUrl, {
          auth: { token },
          transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
          events.push({ time: Date.now(), type: 'SOCKET_CONNECTED', role });
          socket.emit('join-consultation-room', { appointmentId });
        });

        socket.on('error', (err) => {
          events.push({ time: Date.now(), type: 'SOCKET_ERROR', role, error: err.message });
        });

        navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(stream => {
          localStream = stream;
          events.push({ time: Date.now(), type: 'MEDIA_STREAM_ACQUIRED', tracks: stream.getTracks().length });

          pc = new RTCPeerConnection({ iceServers });

          localStream.getTracks().forEach(t => pc.addTrack(t, localStream));

          pc.ontrack = (event) => {
            events.push({ time: Date.now(), type: 'REMOTE_TRACK_RECEIVED', role, trackKind: event.track.kind });
          };

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              const candStr = event.candidate.candidate;
              const isRelay = candStr.includes('typ relay');
              const isHost = candStr.includes('typ host');
              const isSrflx = candStr.includes('typ srflx');

              if (forceRelayOnly && !isRelay) {
                return;
              }

              events.push({ time: Date.now(), type: 'ICE_CANDIDATE', role, isRelay, isHost, isSrflx });
              socket.emit('signal', {
                appointmentId,
                signalData: { type: 'candidate', candidate: event.candidate }
              });
            }
          };

          pc.onconnectionstatechange = () => {
            events.push({ time: Date.now(), type: 'CONNECTION_STATE', role, state: pc.connectionState });
          };

          socket.on('peer-joined', async () => {
            events.push({ time: Date.now(), type: 'PEER_JOINED', role });
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('signal', {
              appointmentId,
              signalData: { type: 'offer', sdp: offer }
            });
          });

          socket.on('signal', async ({ signalData }) => {
            if (signalData.type === 'offer') {
              events.push({ time: Date.now(), type: 'OFFER_RECEIVED', role });
              await pc.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              socket.emit('signal', {
                appointmentId,
                signalData: { type: 'answer', sdp: answer }
              });
            } else if (signalData.type === 'answer') {
              events.push({ time: Date.now(), type: 'ANSWER_RECEIVED', role });
              await pc.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
            } else if (signalData.type === 'candidate') {
              if (signalData.candidate) {
                await pc.addIceCandidate(new RTCIceCandidate(signalData.candidate));
              }
            }
          });

          window.__client = { socket, pc, events };
          resolve({ initialized: true });
        }).catch(reject);
      });
    };
  `;

  // Inject Socket.IO client script dynamically
  const injectScript = async (page) => {
    await page.addScriptTag({ url: 'http://localhost:5001/socket.io/socket.io.js' });
    await page.evaluate(clientWebRTCScript);
  };

  await injectScript(patientPage);
  await injectScript(doctorPage);

  // 4. Test Scenario A: Standard Two-Device Call with Twilio ICE
  console.log('\n[4/5] Executing Test Scenario A: Standard Two-Device WebRTC Connection...');
  
  await doctorPage.evaluate(({ socketUrl, token, appointmentId, iceServers }) => {
    return window.startClient({
      socketUrl,
      token,
      appointmentId,
      role: 'DOCTOR',
      iceServers,
      forceRelayOnly: false
    });
  }, { socketUrl, token: doctorToken, appointmentId: appointment._id.toString(), iceServers: tokenData.iceServers });

  await patientPage.evaluate(({ socketUrl, token, appointmentId, iceServers }) => {
    return window.startClient({
      socketUrl,
      token,
      appointmentId,
      role: 'PATIENT',
      iceServers,
      forceRelayOnly: false
    });
  }, { socketUrl, token: patientToken, appointmentId: appointment._id.toString(), iceServers: tokenData.iceServers });

  let patientConnectedA = false;
  let doctorConnectedA = false;

  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    const pState = await patientPage.evaluate(() => window.__client?.pc?.connectionState);
    const dState = await doctorPage.evaluate(() => window.__client?.pc?.connectionState);

    if (pState === 'connected' && dState === 'connected') {
      patientConnectedA = true;
      doctorConnectedA = true;
      break;
    }
  }

  const patientEventsA = await patientPage.evaluate(() => window.__client?.events || []);
  const doctorEventsA = await doctorPage.evaluate(() => window.__client?.events || []);

  console.log(`- Scenario A Patient PeerConnection: ${patientConnectedA ? 'CONNECTED (PASS)' : 'FAILED'}`);
  console.log(`- Scenario A Doctor PeerConnection: ${doctorConnectedA ? 'CONNECTED (PASS)' : 'FAILED'}`);
  console.log(`- Scenario A Remote Tracks: Patient=${patientEventsA.some(e => e.type === 'REMOTE_TRACK_RECEIVED')}, Doctor=${doctorEventsA.some(e => e.type === 'REMOTE_TRACK_RECEIVED')}`);

  // 5. Test Scenario B: Forced TURN Relay Traversal (Direct P2P host/srflx candidates blocked)
  console.log('\n[5/5] Executing Test Scenario B: Forced TURN Relay Traversal (Symmetric Firewall Emulation)...');
  
  // Close previous connections
  await patientPage.evaluate(() => { window.__client?.pc?.close(); window.__client?.socket?.disconnect(); });
  await doctorPage.evaluate(() => { window.__client?.pc?.close(); window.__client?.socket?.disconnect(); });
  await new Promise(r => setTimeout(r, 1000));

  // Only pass Twilio TURN servers into ICE config for Scenario B
  const turnOnlyServers = tokenData.iceServers.filter(s => (s.urls || s.url || '').includes('turn:'));
  console.log(`- Configured TURN-Only Servers: ${turnOnlyServers.length} Twilio relays`);

  await doctorPage.evaluate(({ socketUrl, token, appointmentId, iceServers }) => {
    return window.startClient({
      socketUrl,
      token,
      appointmentId,
      role: 'DOCTOR',
      iceServers,
      forceRelayOnly: true
    });
  }, { socketUrl, token: doctorToken, appointmentId: appointment._id.toString(), iceServers: turnOnlyServers });

  await patientPage.evaluate(({ socketUrl, token, appointmentId, iceServers }) => {
    return window.startClient({
      socketUrl,
      token,
      appointmentId,
      role: 'PATIENT',
      iceServers,
      forceRelayOnly: true
    });
  }, { socketUrl, token: patientToken, appointmentId: appointment._id.toString(), iceServers: turnOnlyServers });

  let patientConnectedB = false;
  let doctorConnectedB = false;

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 500));
    const pState = await patientPage.evaluate(() => window.__client?.pc?.connectionState);
    const dState = await doctorPage.evaluate(() => window.__client?.pc?.connectionState);

    if (pState === 'connected' && dState === 'connected') {
      patientConnectedB = true;
      doctorConnectedB = true;
      break;
    }
  }

  const patientEventsB = await patientPage.evaluate(() => window.__client?.events || []);
  const doctorEventsB = await doctorPage.evaluate(() => window.__client?.events || []);
  const turnCandidatesExchanged = patientEventsB.some(e => e.isRelay) || doctorEventsB.some(e => e.isRelay);

  console.log(`- Scenario B Patient PeerConnection (Relay-Only): ${patientConnectedB ? 'CONNECTED (PASS)' : 'FAILED'}`);
  console.log(`- Scenario B Doctor PeerConnection (Relay-Only): ${doctorConnectedB ? 'CONNECTED (PASS)' : 'FAILED'}`);
  console.log(`- Scenario B Relay Candidates Exchanged: ${turnCandidatesExchanged ? 'YES (Twilio Relay Confirmed)' : 'NO'}`);
  console.log(`- Scenario B Remote Tracks: Patient=${patientEventsB.some(e => e.type === 'REMOTE_TRACK_RECEIVED')}, Doctor=${doctorEventsB.some(e => e.type === 'REMOTE_TRACK_RECEIVED')}`);

  // Cleanup browser
  await browser.close();

  // Cleanup DB test records
  await User.deleteMany({ _id: { $in: [patientUser._id, doctorUser._id] } });
  await DoctorProfile.deleteOne({ _id: doctorProfile._id });
  await Appointment.deleteOne({ _id: appointment._id });
  await mongoose.disconnect();

  console.log('\n[6/6] Real Call Verification Finished.');
  return {
    scenarioA_standard: { patientConnected: patientConnectedA, doctorConnected: doctorConnectedA, hasTurn },
    scenarioB_turn_relay_forced: { patientConnected: patientConnectedB, doctorConnected: doctorConnectedB, turnCandidatesExchanged },
  };
}

runE2EWebRTCTest()
  .then(res => {
    console.log('\nFinal Test Summary:', JSON.stringify(res, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('Test Execution Error:', err);
    process.exit(1);
  });
