const { DoctorProfile, DoctorVerification, DoctorAvailability, Appointment, User, AuditLog } = require('../models');
const placesService = require('./places.service');
const logger = require('../utils/logger');

class DoctorService {
  /**
   * Get doctor profile by userId
   */
  async getProfile(userId) {
    const profile = await DoctorProfile.findOne({ userId });
    if (!profile) throw new Error('Doctor profile not found.');

    const user = await User.findById(userId).select('-passwordHash');
    const availability = await DoctorAvailability.find({ doctorId: profile._id });
    const verification = await DoctorVerification.findOne({ doctorId: profile._id }).sort({ createdAt: -1 });

    return {
      user: user ? {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
      } : null,
      profile,
      availability,
      verification,
    };
  }

  /**
   * Update doctor profile
   */
  async updateProfile(userId, updateData) {
    if (updateData.fullName) {
      await User.findByIdAndUpdate(userId, { fullName: updateData.fullName });
    }

    const profile = await DoctorProfile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true }
    );

    return profile;
  }

  /**
   * Submit credentials for administrative verification
   */
  async submitVerificationDocs(userId, { documents }) {
    const profile = await DoctorProfile.findOne({ userId });
    if (!profile) throw new Error('Doctor profile not found.');

    const verification = await DoctorVerification.create({
      doctorId: profile._id,
      userId,
      medicalRegistrationNumber: profile.medicalRegistrationNumber,
      stateMedicalCouncil: profile.stateMedicalCouncil,
      status: 'PENDING_ADMIN_REVIEW',
      submittedDocuments: documents,
    });

    profile.verificationStatus = 'DISCOVERED';
    await profile.save();

    return verification;
  }

  /**
   * Update doctor availability schedule
   */
  async updateAvailability(userId, { schedule, consultationFee }) {
    const profile = await DoctorProfile.findOne({ userId });
    if (!profile) throw new Error('Doctor profile not found.');

    if (consultationFee !== undefined) {
      profile.consultationFee = consultationFee;
      await profile.save();
    }

    await DoctorAvailability.deleteMany({ doctorId: profile._id });

    const newRules = schedule.map(rule => ({
      doctorId: profile._id,
      ...rule,
    }));

    const created = await DoctorAvailability.insertMany(newRules);
    return created;
  }

  /**
   * List doctors for India-wide discovery with multi-criteria filtering
   */
  async listDoctors({ city, state, specialization, qualification, verificationStatus, sourceType, search, page = 1, limit = 10 }) {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return { doctors: [], total: 0, page: parseInt(page, 10), totalPages: 0 };
    }

    const query = {};

    if (city) query['address.city'] = new RegExp(city, 'i');
    if (state) query['address.state'] = new RegExp(state, 'i');
    if (specialization) query.specialization = new RegExp(specialization, 'i');
    if (verificationStatus && verificationStatus !== 'ALL') {
      query.verificationStatus = verificationStatus;
    }
    if (sourceType) query.sourceType = sourceType;
    if (qualification) {
      query['qualifications.degree'] = new RegExp(qualification, 'i');
    }

    if (search) {
      query.$or = [
        { fullName: new RegExp(search, 'i') },
        { specialization: new RegExp(search, 'i') },
        { 'address.city': new RegExp(search, 'i') },
        { medicalRegistrationNumber: new RegExp(search, 'i') },
      ];
    }

    const total = await DoctorProfile.countDocuments(query);
    const doctors = await DoctorProfile.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .sort({ verificationStatus: 1, 'rating.average': -1, experienceYears: -1 });

    const formatted = doctors.map(doc => {
      const lat = doc.location?.coordinates?.[1] || 28.6139;
      const lng = doc.location?.coordinates?.[0] || 77.2090;
      return {
        ...doc.toObject(),
        directionsUrl: doc.directionsUrl || `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
        appointmentBookingAvailable: Boolean(doc.verificationStatus === 'CREDENTIAL_VERIFIED' || doc.isClaimed),
      };
    });

    return {
      doctors: formatted,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find nearby doctors using actual coordinates (MongoDB 2dsphere + Google Places enrichment)
   */
  async findNearbyDoctors({ longitude, latitude, maxDistanceMeters = 50000, includeDiscovered = true }) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // 1. Fetch registered & official doctors from MongoDB via 2dsphere index
    const registeredDoctors = await DoctorProfile.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: parseInt(maxDistanceMeters, 10),
        },
      },
    }).limit(15);

    const formattedRegistered = registeredDoctors.map(doc => ({
      ...doc.toObject(),
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${doc.location.coordinates[1]},${doc.location.coordinates[0]}`,
      appointmentBookingAvailable: Boolean(doc.verificationStatus === 'CREDENTIAL_VERIFIED' || doc.isClaimed),
    }));

    // 2. If requested and Places API is available, enrich with Google Places discovered clinics/doctors
    let discoveredDoctors = [];
    if (includeDiscovered && placesService.isConfigured()) {
      const placesResult = await placesService.searchNearbyHealthcare({
        latitude: lat,
        longitude: lng,
        radiusMeters: Math.min(parseInt(maxDistanceMeters, 10), 20000),
        includedTypes: ['doctor'],
      });

      if (placesResult.success && placesResult.places) {
        discoveredDoctors = placesResult.places.map(p => ({
          _id: p.id,
          fullName: p.name,
          specialization: 'General Practice / Specialty Clinic',
          experienceYears: null, // Zero fabrication rule
          medicalRegistrationNumber: null, // Zero fabrication rule
          verificationStatus: 'DISCOVERED',
          sourceType: 'GOOGLE_PLACES',
          rating: p.rating,
          address: p.address,
          location: p.location,
          directionsUrl: p.directionsUrl,
          appointmentBookingAvailable: false,
          bookingNotice: 'Discovered public listing. Online instant appointment booking requires direct clinic coordination or practitioner claiming profile.',
        }));
      }
    }

    // Merge: Credential verified first, then source verified, then discovered
    return [...formattedRegistered, ...discoveredDoctors];
  }

  /**
   * Real appointment slot calculator
   * Returns ONLY genuine configured slots from DoctorAvailability minus booked appointments
   */
  async getDoctorAvailability(doctorId, dateString) {
    const targetDate = new Date(dateString);
    if (isNaN(targetDate.getTime())) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD.');
    }

    const dayOfWeek = targetDate.getDay(); // 0-6

    // Find configured schedule for this specific day of the week
    const availabilityRule = await DoctorAvailability.findOne({
      doctorId,
      dayOfWeek,
      isAvailable: true,
    });

    if (!availabilityRule) {
      return {
        doctorId,
        date: dateString,
        isAvailable: false,
        message: 'No available appointment schedule configured for this day.',
        slots: [],
      };
    }

    // Generate real time slots based on startTime, endTime, and slotDurationMinutes
    const [startH, startM] = availabilityRule.startTime.split(':').map(Number);
    const [endH, endM] = availabilityRule.endTime.split(':').map(Number);
    const durationMin = availabilityRule.slotDurationMinutes || 20;

    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    const allGeneratedSlots = [];
    while (currentMinutes + durationMin <= endMinutes) {
      const h = Math.floor(currentMinutes / 60).toString().padStart(2, '0');
      const m = (currentMinutes % 60).toString().padStart(2, '0');
      allGeneratedSlots.push(`${h}:${m}`);
      currentMinutes += durationMin;
    }

    // Query booked appointments for this doctor on this specific day to exclude collisions
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const bookedAppointments = await Appointment.find({
      doctorId,
      scheduledDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['REQUESTED', 'CONFIRMED'] },
    }).select('timeSlot');

    const bookedSlotsSet = new Set(bookedAppointments.map(a => a.timeSlot));

    const availableSlots = allGeneratedSlots.filter(slot => !bookedSlotsSet.has(slot));

    return {
      doctorId,
      date: dateString,
      isAvailable: availableSlots.length > 0,
      totalSlots: allGeneratedSlots.length,
      availableSlotsCount: availableSlots.length,
      slots: availableSlots,
    };
  }
}

module.exports = new DoctorService();
