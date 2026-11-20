const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function runDoctorGatingAudit() {
  console.log('========================================================================');
  console.log('  HEALTHMATE AI — DOCTOR CREDENTIAL VERIFICATION & BOOKING GATING AUDIT');
  console.log('========================================================================\n');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthmate';
  await mongoose.connect(mongoUri);

  const { DoctorProfile } = require('../backend/src/models');
  const appointmentService = require('../backend/src/services/appointment.service');

  try {
    // 1. Create an unverified doctor (DISCOVERED status)
    const testUserId = new mongoose.Types.ObjectId();
    const unverifiedDoc = await DoctorProfile.create({
      userId: testUserId,
      fullName: 'Dr. Unverified Test',
      email: `unverified_${Date.now()}@healthmate.test`,
      specialization: 'General Physician',
      medicalRegistrationNumber: `UNVERIFIED-${Date.now()}`,
      stateMedicalCouncil: 'Delhi Medical Council',
      experienceYears: 5,
      address: { city: 'New Delhi', state: 'Delhi', pincode: '110001' },
      verificationStatus: 'DISCOVERED',
      consultationFee: 500,
      availabilitySchedule: [{ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }],
    });

    // 2. Attempt to book an appointment with unverified doctor (Must fail)
    process.stdout.write('[*] Step 1: Attempting to book appointment with unverified doctor... ');
    let bookingBlocked = false;
    const testPatientId = new mongoose.Types.ObjectId();
    try {
      await appointmentService.createAppointment(testPatientId, {
        doctorId: unverifiedDoc._id,
        scheduledDate: '2026-11-23', // Monday
        timeSlot: '10:00 AM',
        consultationType: 'VIDEO',
        chiefComplaint: 'Mild headache',
      });
    } catch (err) {
      if (err.message.includes('Appointment booking is disabled for unverified practitioner profiles')) {
        bookingBlocked = true;
      } else {
        throw err;
      }
    }
    if (!bookingBlocked) throw new Error('Unverified doctor was booked successfully! Gating failed.');
    console.log('PASS [Gated: Appointment rejected with DISCOVERED status]');

    // 3. Update doctor to CREDENTIAL_VERIFIED
    unverifiedDoc.verificationStatus = 'CREDENTIAL_VERIFIED';
    await unverifiedDoc.save();

    // 4. Attempt to book again with now-verified doctor (Should succeed)
    process.stdout.write('[*] Step 2: Attempting to book appointment with verified doctor... ');
    const appointment = await appointmentService.createAppointment(testPatientId, {
      doctorId: unverifiedDoc._id,
      scheduledDate: '2026-11-23', // Monday
      timeSlot: '10:00 AM',
      consultationType: 'VIDEO',
      chiefComplaint: 'Follow-up consultation',
    });
    if (!appointment || !appointment._id) {
      throw new Error('Booking failed for verified doctor!');
    }
    console.log(`PASS [Booking created successfully: ${appointment._id}, Status: ${appointment.status}]`);

    // Clean up test documents
    const { Appointment } = require('../backend/src/models');
    await Appointment.deleteOne({ _id: appointment._id });
    await DoctorProfile.deleteOne({ _id: unverifiedDoc._id });

    console.log('\n========================================================================');
    console.log('  DOCTOR CREDENTIAL GATING AUDIT: ALL CHECKS PASSED');
    console.log('========================================================================\n');
  } finally {
    await mongoose.disconnect();
  }
}

runDoctorGatingAudit().catch(err => {
  console.error('\nFAIL:', err.message);
  process.exit(1);
});
