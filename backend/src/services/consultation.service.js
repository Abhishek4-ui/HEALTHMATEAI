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

    return {
      consultation,
      appointment,
      teleconsultationRoomId: appointment.teleconsultationRoomId,
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
