const crypto = require('crypto');
const { Consultation, Appointment, DoctorProfile } = require('../models');

class ConsultationService {
  /**
   * Start or fetch active consultation session
   */
  async getOrCreateConsultation(appointmentId, userId, role) {
    const appointment = await Appointment.findById(appointmentId)
      .populate('doctorId')
      .populate('patientId', 'fullName email phone');

    if (!appointment) throw new Error('Appointment not found.');

    let consultation = await Consultation.findOne({ appointmentId });

    if (!consultation) {
      consultation = await Consultation.create({
        appointmentId,
        patientId: appointment.patientId._id,
        doctorId: appointment.doctorId._id,
        startedAt: new Date(),
        status: 'IN_PROGRESS',
      });
    }

    const roomId = appointment.teleconsultationRoomId || `room_${appointmentId}`;
    const tokenInfo = await this.generateVideoToken(appointmentId, userId, role);

    return {
      consultation,
      appointment,
      teleconsultationRoomId: roomId,
      videoToken: tokenInfo.token,
    };
  }

  /**
   * Generate secure Twilio WebRTC consultation room token
   */
  async generateVideoToken(appointmentId, userId, role = 'PATIENT') {
    const roomId = `healthmate_room_${appointmentId}`;
    const identity = `${String(role).toLowerCase()}_${String(userId)}`;

    let twilioToken = null;
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const twilio = require('twilio');
        const AccessToken = twilio.jwt.AccessToken;
        const VideoGrant = AccessToken.VideoGrant;
        const videoGrant = new VideoGrant({ room: roomId });

        const token = new AccessToken(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN,
          { identity, ttl: 3600 }
        );
        token.addGrant(videoGrant);
        twilioToken = token.toJwt();
      } catch (twErr) {
        twilioToken = `webrtc_signed_${crypto.createHmac('sha256', process.env.JWT_ACCESS_SECRET || 'secret').update(`${roomId}:${identity}`).digest('hex')}`;
      }
    } else {
      twilioToken = `webrtc_token_${crypto.randomBytes(16).toString('hex')}`;
    }

    return {
      roomId,
      identity,
      token: twilioToken,
      expiresInSeconds: 3600,
    };
  }

  /**
   * Save doctor's clinical SOAP notes
   */
  async updateSoapNotes(consultationId, doctorUserId, soapNotes) {
    const doctorProfile = await DoctorProfile.findOne({ userId: doctorUserId });
    if (!doctorProfile) throw new Error('Doctor profile not found.');

    const consultation = await Consultation.findOne({
      _id: consultationId,
      doctorId: doctorProfile._id,
    });

    if (!consultation) throw new Error('Consultation record not found or not assigned to this doctor.');

    consultation.soapNotes = {
      ...consultation.soapNotes,
      ...soapNotes,
    };

    if (soapNotes.clinicalSummary) {
      consultation.clinicalSummary = soapNotes.clinicalSummary;
    }

    await consultation.save();
    return consultation;
  }

  /**
   * Complete consultation session
   */
  async completeConsultation(consultationId, doctorUserId) {
    const doctorProfile = await DoctorProfile.findOne({ userId: doctorUserId });
    if (!doctorProfile) throw new Error('Doctor profile not found.');

    const consultation = await Consultation.findOne({
      _id: consultationId,
      doctorId: doctorProfile._id,
    });

    if (!consultation) throw new Error('Consultation record not found.');

    consultation.status = 'COMPLETED';
    consultation.endedAt = new Date();
    await consultation.save();

    await Appointment.findByIdAndUpdate(consultation.appointmentId, {
      status: 'COMPLETED',
    });

    return consultation;
  }
}

module.exports = new ConsultationService();
