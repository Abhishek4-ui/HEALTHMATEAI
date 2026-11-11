const crypto = require('crypto');
const { Appointment, DoctorProfile, DoctorAvailability, User, Notification, AuditLog } = require('../models');

class AppointmentService {
  /**
   * Book a new teleconsultation or clinic appointment
   */
  async createAppointment(patientId, appointmentData, ipAddress = '127.0.0.1') {
    const { doctorId, scheduledDate, timeSlot, consultationType, chiefComplaint } = appointmentData;

    // 1. Verify doctor exists
    const doctor = await DoctorProfile.findById(doctorId);
    if (!doctor) {
      throw new Error('Selected practitioner not found.');
    }

    const scheduledDateObj = new Date(scheduledDate);
    const dayOfWeek = scheduledDateObj.getUTCDay();

    // 2. Check doctor availability schedule for that day of week (if configured)
    const availabilityRule = await DoctorAvailability.findOne({ doctorId, dayOfWeek });
    if (availabilityRule && !availabilityRule.isAvailable) {
      throw new Error('The practitioner is not available on this day of the week.');
    }

    // 3. Prevent slot collision
    const existingBooking = await Appointment.findOne({
      doctorId,
      scheduledDate: {
        $gte: new Date(scheduledDateObj.setUTCHours(0, 0, 0, 0)),
        $lte: new Date(scheduledDateObj.setUTCHours(23, 59, 59, 999)),
      },
      timeSlot,
      status: { $in: ['REQUESTED', 'CONFIRMED'] },
    });

    if (existingBooking) {
      throw new Error('This time slot has already been reserved. Please select another slot.');
    }

    // 4. Generate unique teleconsultation room UUID
    const roomId = 'room_' + crypto.randomBytes(8).toString('hex');

    // 5. Create Appointment
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      scheduledDate: scheduledDateObj,
      timeSlot,
      consultationType: consultationType || 'VIDEO',
      chiefComplaint,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentAmount: doctor.consultationFee || 500,
      teleconsultationRoomId: roomId,
    });

    // 6. Notify Doctor and Patient
    await Notification.create({
      recipientId: doctor.userId,
      recipientRole: 'DOCTOR',
      type: 'APPOINTMENTS',
      title: 'New Consultation Booked',
      message: `A patient has confirmed a ${consultationType || 'video'} consultation for ${scheduledDateObj.toDateString()} at ${timeSlot}.`,
      metadata: { appointmentId: appointment._id },
    });

    await Notification.create({
      recipientId: patientId,
      recipientRole: 'PATIENT',
      type: 'APPOINTMENTS',
      title: 'Appointment Confirmed',
      message: `Your appointment with Dr. ${doctor.fullName} is confirmed for ${scheduledDateObj.toDateString()} at ${timeSlot}.`,
      metadata: { appointmentId: appointment._id },
    });

    // 7. Audit Log
    await AuditLog.create({
      actorId: patientId,
      actorRole: 'PATIENT',
      action: 'BOOK_APPOINTMENT',
      targetResource: { resourceType: 'APPOINTMENT', resourceId: appointment._id.toString() },
      ipAddress,
      statusCode: 201,
    });

    return appointment;
  }

  /**
   * List appointments for patient or doctor with pagination
   */
  async listAppointments(userId, role, { status, page = 1, limit = 10 }) {
    const filter = {};

    if (role === 'PATIENT') {
      filter.patientId = userId;
    } else if (role === 'DOCTOR') {
      const doctorProfile = await DoctorProfile.findOne({ userId });
      if (!doctorProfile) return { appointments: [], total: 0, page, totalPages: 0 };
      filter.doctorId = doctorProfile._id;
    }

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    const total = await Appointment.countDocuments(filter);
    const appointments = await Appointment.find(filter)
      .populate('doctorId', 'fullName specialization medicalRegistrationNumber consultationFee rating')
      .populate('patientId', 'fullName email phone')
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .sort({ scheduledDate: -1, timeSlot: -1 });

    return {
      appointments,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Reschedule an appointment
   */
  async rescheduleAppointment(appointmentId, userId, { newDate, newTimeSlot }) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw new Error('Appointment record not found.');

    const newDateObj = new Date(newDate);

    // Verify slot collision
    const existing = await Appointment.findOne({
      _id: { $ne: appointmentId },
      doctorId: appointment.doctorId,
      scheduledDate: {
        $gte: new Date(newDateObj.setUTCHours(0, 0, 0, 0)),
        $lte: new Date(newDateObj.setUTCHours(23, 59, 59, 999)),
      },
      timeSlot: newTimeSlot,
      status: { $in: ['REQUESTED', 'CONFIRMED'] },
    });

    if (existing) {
      throw new Error('Requested new slot is already booked. Please choose an alternate slot.');
    }

    appointment.scheduledDate = newDateObj;
    appointment.timeSlot = newTimeSlot;
    appointment.status = 'RESCHEDULED';
    await appointment.save();

    return appointment;
  }

  /**
   * Cancel an appointment
   */
  async cancelAppointment(appointmentId, userId, reason) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw new Error('Appointment not found.');

    appointment.status = 'CANCELLED';
    appointment.cancellationReason = reason;
    await appointment.save();

    return appointment;
  }
}

module.exports = new AppointmentService();
