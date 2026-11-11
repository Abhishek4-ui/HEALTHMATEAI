const { io } = require('socket.io-client');
require('dotenv').config({ path: 'backend/.env' });
const { generateAccessToken } = require('../src/security/jwt');

async function testWebRTCSignaling() {
  console.log('=== TESTING TWO-CLIENT WEBRTC SOCKET.IO SIGNALING ===');

  const patientToken = generateAccessToken({
    _id: '6af42f8e480ae95d2dc31268',
    id: '6af42f8e480ae95d2dc31268',
    email: 'audit.patient@healthmate.ai',
    role: 'PATIENT',
    fullName: 'Audit Patient'
  });

  const doctorToken = generateAccessToken({
    _id: '6af42f9e480ae95d2dc31275',
    id: '6af42f9e480ae95d2dc31275',
    email: 'audit.doctor@healthmate.ai',
    role: 'DOCTOR',
    fullName: 'Dr. Audit Sharma'
  });

  const testRoomId = 'apt_webrtc_live_test_101';
  const serverUrl = 'http://localhost:5001';

  let patientSocket;
  let doctorSocket;

  return new Promise((resolve, reject) => {
    let offerReceived = false;
    let answerReceived = false;
    let candidateReceived = false;
    let peerLeftReceived = false;

    // Connect Patient
    patientSocket = io(serverUrl, {
      auth: { token: patientToken },
      transports: ['websocket']
    });

    // Connect Doctor
    doctorSocket = io(serverUrl, {
      auth: { token: doctorToken },
      transports: ['websocket']
    });

    patientSocket.on('connect', () => {
      console.log('1. Patient client connected to Socket.IO signaling server:', patientSocket.id);
      patientSocket.emit('join-consultation-room', { appointmentId: testRoomId });
    });

    doctorSocket.on('connect', () => {
      console.log('2. Doctor client connected to Socket.IO signaling server:', doctorSocket.id);
      // Doctor joins shortly after
      setTimeout(() => {
        doctorSocket.emit('join-consultation-room', { appointmentId: testRoomId });
      }, 500);
    });

    patientSocket.on('peer-joined', (data) => {
      console.log('3. Patient received peer-joined event:', data);
      // Patient initiates SDP Offer
      const sdpOffer = {
        type: 'offer',
        sdp: 'v=0\r\no=patient 12345 2 IN IP4 127.0.0.1\r\ns=HealthMate WebRTC Telehealth Offer'
      };
      patientSocket.emit('signal', {
        appointmentId: testRoomId,
        signalData: sdpOffer
      });
      console.log('4. Patient dispatched SDP Offer to room.');
    });

    doctorSocket.on('signal', ({ senderId, signalData }) => {
      if (signalData.type === 'offer') {
        offerReceived = true;
        console.log('5. Doctor received SDP Offer from sender:', senderId);
        // Doctor responds with SDP Answer
        const sdpAnswer = {
          type: 'answer',
          sdp: 'v=0\r\no=doctor 67890 2 IN IP4 127.0.0.1\r\ns=HealthMate WebRTC Telehealth Answer'
        };
        doctorSocket.emit('signal', {
          appointmentId: testRoomId,
          signalData: sdpAnswer
        });
        console.log('6. Doctor dispatched SDP Answer to room.');
      }
    });

    patientSocket.on('signal', ({ senderId, signalData }) => {
      if (signalData.type === 'answer') {
        answerReceived = true;
        console.log('7. Patient received SDP Answer from sender:', senderId);
        // Patient sends ICE candidate
        patientSocket.emit('signal', {
          appointmentId: testRoomId,
          signalData: {
            type: 'candidate',
            candidate: {
              candidate: 'candidate:1 1 UDP 2130706431 192.168.1.100 50000 typ host',
              sdpMid: 'video',
              sdpMLineIndex: 0
            }
          }
        });
        console.log('8. Patient dispatched ICE Candidate.');
      }
    });

    doctorSocket.on('signal', ({ senderId, signalData }) => {
      if (signalData.type === 'candidate') {
        candidateReceived = true;
        console.log('9. Doctor received ICE Candidate from sender:', senderId);

        // Test Disconnection cleanup
        console.log('10. Patient leaving consultation room...');
        patientSocket.emit('leave-consultation-room', { appointmentId: testRoomId });
      }
    });

    doctorSocket.on('peer-left', (data) => {
      peerLeftReceived = true;
      console.log('11. Doctor received peer-left event:', data);

      // Conclude test
      patientSocket.disconnect();
      doctorSocket.disconnect();

      const allPassed = offerReceived && answerReceived && candidateReceived && peerLeftReceived;
      console.log('\n=== WEBRTC SIGNALING TEST SUMMARY ===');
      console.log('SDP Offer Relay:     ', offerReceived ? 'PASS' : 'FAIL');
      console.log('SDP Answer Relay:    ', answerReceived ? 'PASS' : 'FAIL');
      console.log('ICE Candidate Relay: ', candidateReceived ? 'PASS' : 'FAIL');
      console.log('Peer-Left Event:     ', peerLeftReceived ? 'PASS' : 'FAIL');
      console.log('OVERALL SIGNALING:   ', allPassed ? 'PASS' : 'FAIL');

      if (allPassed) resolve(true);
      else reject(new Error('One or more signaling steps failed.'));
    });

    setTimeout(() => {
      if (patientSocket) patientSocket.disconnect();
      if (doctorSocket) doctorSocket.disconnect();
      reject(new Error('WebRTC signaling test timed out after 10s.'));
    }, 10000);
  });
}

testWebRTCSignaling().then(() => {
  console.log('WebRTC Signaling Test Passed Successfully.');
  process.exit(0);
}).catch(err => {
  console.error('WebRTC Signaling Test Error:', err.message);
  process.exit(1);
});
