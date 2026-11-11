import { io } from 'socket.io-client';

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

export class TelehealthSession {
  constructor({ appointmentId, token, onRemoteStream, onPeerJoined, onPeerLeft, onError, onConnectionStateChange }) {
    this.appointmentId = appointmentId;
    this.token = token;
    this.onRemoteStream = onRemoteStream;
    this.onPeerJoined = onPeerJoined;
    this.onPeerLeft = onPeerLeft;
    this.onError = onError;
    this.onConnectionStateChange = onConnectionStateChange;

    this.socket = null;
    this.peerConnection = null;
    this.localStream = null;
    this.isInitiator = false;
  }

  async start(localStream) {
    this.localStream = localStream;
    const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:5001' : '/';

    this.socket = io(socketUrl, {
      auth: { token: this.token || localStorage.getItem('token') },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      this.socket.emit('join-consultation-room', { appointmentId: this.appointmentId });
    });

    this.socket.on('peer-joined', async () => {
      this.isInitiator = true;
      if (this.onPeerJoined) this.onPeerJoined();
      await this._createOffer();
    });

    this.socket.on('signal', async ({ signalData }) => {
      await this._handleSignal(signalData);
    });

    this.socket.on('peer-left', () => {
      if (this.onPeerLeft) this.onPeerLeft();
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }
    });

    this.socket.on('error', (err) => {
      if (this.onError) this.onError(err);
    });
  }

  _ensurePeerConnection() {
    if (this.peerConnection) return this.peerConnection;

    const pc = new RTCPeerConnection(RTC_CONFIG);

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream);
      });
    }

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        if (this.onRemoteStream) this.onRemoteStream(event.streams[0]);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit('signal', {
          appointmentId: this.appointmentId,
          signalData: { type: 'candidate', candidate: event.candidate }
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(pc.connectionState);
      }
    };

    this.peerConnection = pc;
    return pc;
  }

  async _createOffer() {
    try {
      const pc = this._ensurePeerConnection();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      this.socket.emit('signal', {
        appointmentId: this.appointmentId,
        signalData: { type: 'offer', sdp: offer }
      });
    } catch (err) {
      if (this.onError) this.onError(err);
    }
  }

  async _handleSignal(signalData) {
    try {
      const pc = this._ensurePeerConnection();

      if (signalData.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        this.socket.emit('signal', {
          appointmentId: this.appointmentId,
          signalData: { type: 'answer', sdp: answer }
        });
      } else if (signalData.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
      } else if (signalData.type === 'candidate') {
        await pc.addIceCandidate(new RTCIceCandidate(signalData.candidate));
      }
    } catch (err) {
      if (this.onError) this.onError(err);
    }
  }

  stop() {
    if (this.socket) {
      this.socket.emit('leave-consultation-room', { appointmentId: this.appointmentId });
      this.socket.disconnect();
      this.socket = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }
}
