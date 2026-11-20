const io = require('socket.io-client');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const SOCKET_URL = 'http://localhost:5001';

async function testWebRTCSignalingSuite() {
  console.log('========================================================================');
  console.log('  HEALTHMATE AI — WEBRTC & SOCKET.IO SIGNALING INTEGRATION AUDIT');
  console.log('========================================================================\n');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthmate';
  await mongoose.connect(mongoUri);

  const { User, DoctorProfile, Appointment } = require('../backend/src/models');
  const { generateAccessToken } = require('../backend/src/security/jwt');

  // 1. Setup authorized Patient and Doctor accounts
  const testPatient = await User.create({
    fullName: 'Telehealth Patient Test',
    email: `telehealth.patient.${Date.now()}@test.ai`,
    passwordHash: 'dummy_hash',
    role: 'PATIENT',
  });

  const testDoctorUser = await User.create({
    fullName: 'Dr. Telehealth Cardiologist',
    email: `telehealth.doctor.${Date.now()}@test.ai`,
    passwordHash: 'dummy_hash',
    role: 'DOCTOR',
  });

  const testDoctorProfile = await DoctorProfile.create({
    userId: testDoctorUser._id,
    fullName: testDoctorUser.fullName,
    email: testDoctorUser.email,
    specialization: 'Cardiology',
    medicalRegistrationNumber: `TEL-${Date.now()}`,
    stateMedicalCouncil: 'Delhi Medical Council',
    experienceYears: 10,
    address: { city: 'New Delhi', state: 'Delhi', pincode: '110001' },
    verificationStatus: 'CREDENTIAL_VERIFIED',
    consultationFee: 700,
  });

  // Unauthorized Third-Party Hacker Account
  const testIntruder = await User.create({
    fullName: 'Intruder User',
    email: `intruder.${Date.now()}@test.ai`,
    passwordHash: 'dummy_hash',
    role: 'PATIENT',
  });

  // Create confirmed appointment between Patient and Doctor
  const appointment = await Appointment.create({
    patientId: testPatient._id,
    doctorId: testDoctorProfile._id,
    scheduledDate: new Date('2026-12-05'),
    timeSlot: '11:00 AM',
    consultationType: 'VIDEO',
    status: 'CONFIRMED',
    chiefComplaint: 'Teleconsultation signaling verification',
  });

  const patientToken = generateAccessToken({ id: testPatient._id.toString(), role: 'PATIENT', email: testPatient.email });
  const doctorToken = generateAccessToken({ id: testDoctorUser._id.toString(), role: 'DOCTOR', email: testDoctorUser.email });
  const intruderToken = generateAccessToken({ id: testIntruder._id.toString(), role: 'PATIENT', email: testIntruder.email });

  try {
    // TEST 1: Unauthorized Room Intrusion Attempt
    process.stdout.write('[*] Step 1: Testing unauthorized socket room access gating... ');
    const intruderSocket = io(SOCKET_URL, {
      auth: { token: intruderToken },
      transports: ['websocket'],
    });

    let intrusionBlocked = false;
    await new Promise((resolve) => {
      intruderSocket.on('connect', () => {
        intruderSocket.emit('join-consultation-room', { appointmentId: appointment._id.toString() });
      });
      intruderSocket.on('error', (err) => {
        if (err.message && err.message.includes('Unauthorized room membership')) {
          intrusionBlocked = true;
          intruderSocket.disconnect();
          resolve();
        }
      });
      setTimeout(() => {
        intruderSocket.disconnect();
        resolve();
      }, 3000);
    });

    if (!intrusionBlocked) throw new Error('Intruder was not blocked from joining consultation room!');
    console.log('PASS [Unauthorized user blocked with 403 / "Unauthorized room membership"]');

    // TEST 2: Authorized Patient & Doctor Socket Connections
    process.stdout.write('[*] Step 2: Testing authenticated Patient & Doctor room joins... ');
    const doctorSocket = io(SOCKET_URL, { auth: { token: doctorToken }, transports: ['websocket'] });
    let patientSocket = null;

    let doctorReceivedPeerJoined = false;
    await new Promise((resolve) => {
      doctorSocket.on('connect', () => {
        doctorSocket.emit('join-consultation-room', { appointmentId: appointment._id.toString() });

        // Once doctor is joined, connect patient and join
        setTimeout(() => {
          patientSocket = io(SOCKET_URL, { auth: { token: patientToken }, transports: ['websocket'] });
          patientSocket.on('connect', () => {
            patientSocket.emit('join-consultation-room', { appointmentId: appointment._id.toString() });
          });
        }, 800);
      });

      doctorSocket.on('peer-joined', (data) => {
        if (data.userId === testPatient._id.toString()) {
          doctorReceivedPeerJoined = true;
          resolve();
        }
      });

      setTimeout(resolve, 5000);
    });

    if (!doctorReceivedPeerJoined) throw new Error('Doctor failed to receive peer-joined event from Patient!');
    console.log('PASS [Authenticated room established, peer-joined broadcast received]');

    // TEST 3: WebRTC Offer & Answer Relay
    process.stdout.write('[*] Step 3: Testing WebRTC Offer and Answer SDP exchange... ');
    const mockOfferSdp = { type: 'offer', sdp: 'v=0\r\no=HealthMatePatient 2026 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n' };
    const mockAnswerSdp = { type: 'answer', sdp: 'v=0\r\no=HealthMateDoctor 2026 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n' };

    let doctorGotOffer = false;
    let patientGotAnswer = false;

    await new Promise((resolve) => {
      doctorSocket.on('signal', ({ signalData }) => {
        if (signalData.type === 'offer') {
          doctorGotOffer = true;
          // Send answer back
          doctorSocket.emit('signal', {
            appointmentId: appointment._id.toString(),
            signalData: mockAnswerSdp,
          });
        }
      });

      patientSocket.on('signal', ({ signalData }) => {
        if (signalData.type === 'answer') {
          patientGotAnswer = true;
          resolve();
        }
      });

      // Patient sends initial offer
      patientSocket.emit('signal', {
        appointmentId: appointment._id.toString(),
        signalData: mockOfferSdp,
      });

      setTimeout(resolve, 4000);
    });

    if (!doctorGotOffer || !patientGotAnswer) throw new Error('WebRTC SDP offer/answer relay failed!');
    console.log('PASS [SDP Offer delivered to Doctor, SDP Answer delivered to Patient]');

    // TEST 4: ICE Candidate Exchange & Cleanup
    process.stdout.write('[*] Step 4: Testing ICE Candidate relay and room termination... ');
    const mockCandidate = {
      type: 'candidate',
      candidate: {
        candidate: 'candidate:1 1 UDP 2130706431 192.168.1.100 54321 typ host',
        sdpMid: '0',
        sdpMLineIndex: 0,
      },
    };

    let doctorGotCandidate = false;
    await new Promise((resolve) => {
      doctorSocket.on('signal', ({ signalData }) => {
        if (signalData.type === 'candidate') {
          doctorGotCandidate = true;
          resolve();
        }
      });

      patientSocket.emit('signal', {
        appointmentId: appointment._id.toString(),
        signalData: mockCandidate,
      });

      setTimeout(resolve, 3000);
    });

    patientSocket.disconnect();
    doctorSocket.disconnect();

    if (!doctorGotCandidate) throw new Error('ICE candidate relay failed!');
    console.log('PASS [ICE candidate delivered, sockets cleanly disconnected]');

    // Cleanup DB records
    await Appointment.deleteOne({ _id: appointment._id });
    await DoctorProfile.deleteOne({ _id: testDoctorProfile._id });
    await User.deleteMany({ _id: { $in: [testPatient._id, testDoctorUser._id, testIntruder._id] } });

    console.log('\n========================================================================');
    console.log('  WEBRTC & SOCKET.IO AUDIT: ALL 4 CHECKS PASSED');
    console.log('========================================================================\n');
  } finally {
    await mongoose.disconnect();
  }
}

testWebRTCSignalingSuite().catch(err => {
  console.error('\nSIGNALING TEST FAILURE:', err);
  process.exit(1);
});
