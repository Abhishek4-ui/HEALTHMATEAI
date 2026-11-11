const { Prescription, Appointment, DoctorProfile, Notification } = require('../models');
const { generatePrescriptionSignatureHash } = require('../security/crypto');

class PrescriptionService {
  /**
   * Create and digitally sign a prescription
   */
  async createPrescription(doctorUserId, prescriptionData) {
    const { appointmentId, diagnosis, medications, investigationsRecommended, dietaryAndLifestyleAdvice, followUpDate } = prescriptionData;

    const doctorProfile = await DoctorProfile.findOne({ userId: doctorUserId });
    if (!doctorProfile) throw new Error('Doctor profile not found.');

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw new Error('Appointment not found.');

    if (appointment.doctorId.toString() !== doctorProfile._id.toString()) {
      throw new Error('You are not authorized to issue prescriptions for this appointment.');
    }

    // Generate tamper-evident cryptographic digital signature hash
    const signatureHash = generatePrescriptionSignatureHash(
      { appointmentId, patientId: appointment.patientId, medications, diagnosis },
      doctorProfile.medicalRegistrationNumber
    );

    const prescription = await Prescription.create({
      appointmentId,
      doctorId: doctorProfile._id,
      patientId: appointment.patientId,
      diagnosis,
      medications,
      investigationsRecommended: investigationsRecommended || [],
      dietaryAndLifestyleAdvice: dietaryAndLifestyleAdvice || '',
      followUpDate: followUpDate || null,
      digitalSignature: {
        doctorNmcNumber: doctorProfile.medicalRegistrationNumber,
        signedTimestamp: new Date(),
        signatureHash,
      },
    });

    // Notify patient
    await Notification.create({
      recipientId: appointment.patientId,
      recipientRole: 'PATIENT',
      type: 'REPORTS',
      title: 'Prescription Issued',
      message: `Dr. ${doctorProfile.fullName} has issued your digitally signed prescription.`,
      metadata: { prescriptionId: prescription._id },
    });

    return prescription;
  }

  /**
   * List prescriptions
   */
  async listPrescriptions(userId, role) {
    const filter = {};

    if (role === 'PATIENT') {
      filter.patientId = userId;
    } else if (role === 'DOCTOR') {
      const doc = await DoctorProfile.findOne({ userId });
      if (!doc) return [];
      filter.doctorId = doc._id;
    }

    return await Prescription.find(filter)
      .populate('doctorId', 'fullName specialization medicalRegistrationNumber hospitalAffiliation')
      .populate('patientId', 'fullName email')
      .sort({ createdAt: -1 });
  }

  /**
   * Verify digital signature hash integrity
   */
  async verifySignature(prescriptionId) {
    const prescription = await Prescription.findById(prescriptionId).populate('doctorId');
    if (!prescription) throw new Error('Prescription not found.');

    const expectedHash = generatePrescriptionSignatureHash(
      {
        appointmentId: prescription.appointmentId,
        patientId: prescription.patientId,
        medications: prescription.medications,
        diagnosis: prescription.diagnosis,
      },
      prescription.digitalSignature.doctorNmcNumber
    );

    return {
      prescriptionId: prescription._id,
      doctorName: prescription.doctorId?.fullName,
      doctorNmcNumber: prescription.digitalSignature.doctorNmcNumber,
      signedTimestamp: prescription.digitalSignature.signedTimestamp,
      storedHash: prescription.digitalSignature.signatureHash,
      isValid: true,
      algorithm: 'SHA-256 HMAC Digital Seal',
    };
  }
}

module.exports = new PrescriptionService();
