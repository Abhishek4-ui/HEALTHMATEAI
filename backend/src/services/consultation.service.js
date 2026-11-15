const crypto = require('crypto');
const { 
  Consultation, 
  Appointment, 
  DoctorProfile, 
  PatientProfile, 
  PatientVital, 
  MedicationSchedule,
  User
} = require('../models');
const aiGateway = require('./aiGateway.service');
const logger = require('../utils/logger');

class ConsultationService {
  /**
   * Start a new AI Doctor Consultation session for authenticated patient
   */
  async startAIDoctorSession(patientId, { language = 'en', patientContextConsented = false, title = 'AI Doctor Consultation' } = {}) {
    const welcomeMsg = language === 'hi'
      ? 'नमस्ते! मैं हेल्थमेड एआई डॉक्टर हूँ। मैं आपके लक्षणों, रिपोर्ट और स्वास्थ्य प्रश्नों को समझने में आपकी सहायता कर सकता हूँ। ध्यान दें: मैं एक पंजीकृत चिकित्सक नहीं हूँ। आपात स्थिति में कृपया 112 डायल करें। आप आज क्या महसूस कर रहे हैं?'
      : 'Hello! I am HealthMate AI Doctor. I can help explain your symptoms, medical reports, and general health inquiries. Please note: I am an AI informational assistant, not a licensed human doctor. In an emergency, dial 112 immediately. What symptoms or questions would you like to discuss today?';

    const consultation = await Consultation.create({
      consultationCategory: 'AI_DOCTOR',
      patientId,
      doctorId: null,
      appointmentId: null,
      language: language === 'hi' ? 'hi' : 'en',
      patientContextConsented: Boolean(patientContextConsented),
      title: title || 'AI Doctor Consultation',
      startedAt: new Date(),
      status: 'IN_PROGRESS',
      isSaved: true,
      aiMessages: [{
        role: 'assistant',
        content: welcomeMsg,
        timestamp: new Date(),
        structuredResponse: {
          patient_concern: 'Initial Consultation Welcome',
          is_emergency: false,
          disclaimer: 'CLINICAL SAFETY MANDATE: Informational assist only. Not a licensed human doctor.',
        },
      }],
    });

    return consultation;
  }

  /**
   * Send a user message in an active AI Doctor Consultation session
   */
  async sendAIDoctorMessage(consultationId, patientId, { query, language }) {
    if (!query || typeof query !== 'string' || !query.trim()) {
      throw new Error('Message query text is required.');
    }

    const consultation = await Consultation.findOne({
      _id: consultationId,
      patientId,
      consultationCategory: 'AI_DOCTOR',
      isDeleted: false,
    });

    if (!consultation) {
      throw new Error('Active AI Doctor consultation session not found or unauthorized.');
    }

    const activeLanguage = language || consultation.language || 'en';

    // Retrieve consented patient medical context if patient permitted
    let patientContext = null;
    if (consultation.patientContextConsented) {
      try {
        const [patientProfile, vitals, meds] = await Promise.all([
          PatientProfile.findOne({ userId: patientId }).lean(),
          PatientVital.find({ patientId }).sort({ recordedAt: -1 }).limit(3).lean(),
          MedicationSchedule.find({ patientId, active: true }).limit(5).lean(),
        ]);

        patientContext = {
          age: patientProfile?.dateOfBirth ? (new Date().getFullYear() - new Date(patientProfile.dateOfBirth).getFullYear()) : 'Unknown',
          gender: patientProfile?.gender || 'Unknown',
          chronic_conditions: patientProfile?.chronicConditions || [],
          allergies: patientProfile?.allergies || [],
          current_medications: meds.map(m => m.medicineName),
          recent_lab_biomarkers: vitals.map(v => ({ name: v.type, value: `${v.value} ${v.unit || ''}` })),
        };
      } catch (err) {
        logger.warn('Error compiling patient context for AI doctor:', { error: err.message });
      }
    }

    // Build history from previous messages
    const history = (consultation.aiMessages || []).slice(-8).map(m => ({
      role: m.role,
      content: m.content,
    }));

    // Call AI Doctor Service via Gateway
    const aiResult = await aiGateway.consultAIDoctor({
      query: query.trim(),
      language: activeLanguage,
      history,
      patientContext,
    });

    // Record user message
    consultation.aiMessages.push({
      role: 'user',
      content: query.trim(),
      timestamp: new Date(),
    });

    // Record assistant message
    consultation.aiMessages.push({
      role: 'assistant',
      content: aiResult.answer || aiResult.response || 'Guidance received.',
      structuredResponse: aiResult,
      timestamp: new Date(),
    });

    // Update session title if default
    if (consultation.title === 'AI Doctor Consultation' && query.length > 3) {
      consultation.title = query.trim().slice(0, 40) + '...';
    }

    await consultation.save();

    return {
      consultationId: consultation._id,
      response: aiResult,
      messages: consultation.aiMessages,
    };
  }

  /**
   * End and generate a structured summary for an AI Doctor session
   */
  async endAIDoctorSession(consultationId, patientId) {
    const consultation = await Consultation.findOne({
      _id: consultationId,
      patientId,
      consultationCategory: 'AI_DOCTOR',
    });

    if (!consultation) {
      throw new Error('Consultation session not found.');
    }

    consultation.status = 'COMPLETED';
    consultation.endedAt = new Date();

    const transcript = (consultation.aiMessages || [])
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    try {
      const summaryResult = await aiGateway.summarizeSoap(transcript, {
        language: consultation.language,
      });
      consultation.aiSummary = summaryResult.soap_summary || summaryResult;
    } catch (e) {
      consultation.aiSummary = 'AI Consultation session concluded. Transcripts retained according to patient privacy preferences.';
    }

    await consultation.save();
    return consultation;
  }

  /**
   * List separate consultations for patient (AI_DOCTOR vs REAL_DOCTOR)
   */
  async listPatientConsultations(patientId, { category = 'ALL', page = 1, limit = 15 } = {}) {
    const query = { patientId, isDeleted: false };
    if (category && category !== 'ALL') {
      query.consultationCategory = category;
    }

    const total = await Consultation.countDocuments(query);
    const consultations = await Consultation.find(query)
      .populate('doctorId', 'fullName specialization medicalRegistrationNumber consultationFee rating verificationStatus')
      .populate('appointmentId', 'scheduledDate timeSlot consultationType status paymentStatus paymentAmount')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .lean();

    return {
      consultations,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single consultation detail with strict ownership check
   */
  async getConsultationById(consultationId, patientId) {
    const consultation = await Consultation.findOne({
      _id: consultationId,
      patientId,
      isDeleted: false,
    })
      .populate('doctorId', 'fullName specialization medicalRegistrationNumber consultationFee address location')
      .populate('appointmentId')
      .lean();

    if (!consultation) {
      throw new Error('Consultation record not found or access unauthorized.');
    }
    return consultation;
  }

  /**
   * Delete an AI Doctor consultation session (DPDP compliance)
   */
  async deleteAIDoctorConsultation(consultationId, patientId) {
    const consultation = await Consultation.findOne({
      _id: consultationId,
      patientId,
      consultationCategory: 'AI_DOCTOR',
    });

    if (!consultation) {
      throw new Error('Consultation not found or unauthorized.');
    }

    consultation.isDeleted = true;
    await consultation.save();
    return { success: true, message: 'AI Consultation record removed from history.' };
  }

  /**
   * Generate an optional AI pre-consultation summary for real doctor review
   */
  async generatePreConsultationSummary(appointmentId, patientId) {
    const appointment = await Appointment.findOne({ _id: appointmentId, patientId })
      .populate('doctorId', 'fullName specialization');

    if (!appointment) {
      throw new Error('Appointment not found or unauthorized.');
    }

    const [patientUser, patientProfile, vitals, meds] = await Promise.all([
      User.findById(patientId).select('fullName email phone').lean(),
      PatientProfile.findOne({ userId: patientId }).lean(),
      PatientVital.find({ patientId }).sort({ recordedAt: -1 }).limit(3).lean(),
      MedicationSchedule.find({ patientId, active: true }).limit(5).lean(),
    ]);

    const patientInfo = {
      name: patientUser?.fullName || 'Patient',
      age: patientProfile?.dateOfBirth ? (new Date().getFullYear() - new Date(patientProfile.dateOfBirth).getFullYear()) : 'Not specified',
      gender: patientProfile?.gender || 'Not specified',
      chiefComplaint: appointment.chiefComplaint,
      allergies: patientProfile?.allergies || [],
      medications: meds.map(m => m.medicineName),
      vitals: vitals.map(v => `${v.type}: ${v.value} ${v.unit || ''}`),
    };

    const promptText = `
Chief Complaint: ${appointment.chiefComplaint}
Patient Age: ${patientInfo.age}, Gender: ${patientInfo.gender}
Known Allergies: ${patientInfo.allergies.join(', ') || 'None reported'}
Current Medications: ${patientInfo.medications.join(', ') || 'None reported'}
Recent Vitals: ${patientInfo.vitals.join(', ') || 'None recorded'}
Scheduled Consultation: With Dr. ${appointment.doctorId?.fullName || 'Specialist'} on ${new Date(appointment.scheduledDate).toDateString()} at ${appointment.timeSlot}
    `.trim();

    const soapResult = await aiGateway.summarizeSoap(promptText, patientInfo);

    const draftSummary = {
      appointmentId,
      generatedAt: new Date(),
      patientInfo,
      chiefComplaint: appointment.chiefComplaint,
      symptomTimeline: 'Reported prior to consultation appointment',
      relevantHistory: patientInfo.allergies.length ? `Allergies: ${patientInfo.allergies.join(', ')}` : 'No major reported allergies',
      currentMedications: patientInfo.medications,
      recentVitals: patientInfo.vitals,
      aiDraftSummary: soapResult.soap_summary || soapResult,
      isPatientApproved: false,
      disclaimer: 'AI-GENERATED PRE-CONSULTATION DRAFT: Patient review and explicit approval required before sharing with doctor.',
    };

    return draftSummary;
  }

  /**
   * Save patient approval for sharing pre-consultation summary with doctor
   */
  async approvePreConsultationSummary(appointmentId, patientId, approvedContent) {
    const appointment = await Appointment.findOne({ _id: appointmentId, patientId });
    if (!appointment) throw new Error('Appointment not found.');

    let consultation = await Consultation.findOne({ appointmentId });
    if (!consultation) {
      consultation = await Consultation.create({
        consultationCategory: 'REAL_DOCTOR',
        appointmentId,
        patientId,
        doctorId: appointment.doctorId,
        status: 'IN_PROGRESS',
      });
    }

    consultation.patientApprovedSummary = {
      approved: true,
      approvedAt: new Date(),
      content: approvedContent,
    };

    await consultation.save();
    return consultation.patientApprovedSummary;
  }

  /**
   * Start or fetch active real doctor consultation session
   */
  async getOrCreateConsultation(appointmentId, userId, role) {
    const appointment = await Appointment.findById(appointmentId)
      .populate('doctorId')
      .populate('patientId', 'fullName email phone');

    if (!appointment) throw new Error('Appointment not found.');

    let consultation = await Consultation.findOne({ appointmentId });

    if (!consultation) {
      consultation = await Consultation.create({
        consultationCategory: 'REAL_DOCTOR',
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
   * Generate secure Twilio / WebRTC consultation room token
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

    // Build RFC 5766 / RFC 8489 Compliant ICE Server Topology
    const iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ];

    let turnConfigured = false;
    let turnStatus = 'BLOCKED_NO_CREDENTIALS';
    let turnMessage = 'TURN relay credentials unconfigured. Peer-to-peer WebRTC relies on STUN NAT traversal. Symmetric firewall traversal requires Coturn/Twilio TURN credentials.';

    // 1. Ephemeral Twilio Network Traversal Service (NTS) Token Generator
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const twilio = require('twilio');
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        const twilioIce = await client.tokens.create({ ttl: 3600 });
        if (twilioIce && Array.isArray(twilioIce.iceServers)) {
          iceServers.push(...twilioIce.iceServers);
          turnConfigured = true;
          turnStatus = 'ACTIVE_TWILIO_NTS';
          turnMessage = 'Secure ephemeral Twilio Network Traversal TURN credentials generated on server.';
        }
      } catch (twErr) {
        logger.warn('Twilio NTS token retrieval error:', twErr.message);
      }
    }

    // 2. Ephemeral Coturn HMAC-SHA1 Short-Lived Credential Generator
    if (!turnConfigured && process.env.COTURN_SHARED_SECRET && process.env.TURN_SERVER_URL) {
      const ttlSeconds = 3600; // 1 hour validity
      const expiryTimestamp = Math.floor(Date.now() / 1000) + ttlSeconds;
      const ephemeralUsername = `${expiryTimestamp}:${userId}`;
      const ephemeralCredential = crypto
        .createHmac('sha1', process.env.COTURN_SHARED_SECRET)
        .update(ephemeralUsername)
        .digest('base64');

      const turnUrl = process.env.TURN_SERVER_URL.replace(/^(turn:|turns:)?/, '');
      iceServers.push(
        {
          urls: [
            `turn:${turnUrl}?transport=udp`,
            `turn:${turnUrl}?transport=tcp`,
            `turns:${turnUrl}?transport=tcp`,
          ],
          username: ephemeralUsername,
          credential: ephemeralCredential,
        }
      );
      turnConfigured = true;
      turnStatus = 'ACTIVE_EPHEMERAL_COTURN';
      turnMessage = 'Secure short-lived HMAC-SHA1 Coturn TURN relay credentials generated on server.';
    } else if (!turnConfigured && process.env.TURN_SERVER_URL && process.env.TURN_USERNAME && process.env.TURN_CREDENTIAL) {
      // 3. Static Dedicated TURN Server Provider
      iceServers.push({
        urls: [process.env.TURN_SERVER_URL],
        username: process.env.TURN_USERNAME,
        credential: process.env.TURN_CREDENTIAL,
      });
      turnConfigured = true;
      turnStatus = 'ACTIVE_STATIC_TURN';
      turnMessage = 'Static dedicated TURN relay server configured.';
    }

    return {
      roomId,
      identity,
      token: twilioToken,
      expiresInSeconds: 3600,
      stunServers: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
      ],
      iceServers,
      turnConfigured,
      turnStatus,
      turnMessage,
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

    if (consultation.appointmentId) {
      await Appointment.findByIdAndUpdate(consultation.appointmentId, {
        status: 'COMPLETED',
      });
    }

    return consultation;
  }
}

module.exports = new ConsultationService();
