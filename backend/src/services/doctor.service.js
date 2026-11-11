const { DoctorProfile, DoctorVerification, DoctorAvailability, Appointment, User, AuditLog } = require('../models');
const placesService = require('./places.service');
const logger = require('../utils/logger');

// Haversine distance in kilometers
function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null || isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    return null;
  }
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

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
  async listDoctors({
    city,
    state,
    pincode,
    specialization,
    qualification,
    verificationStatus,
    sourceType,
    search,
    latitude,
    longitude,
    sortBy,
    sortOrder = 'desc',
    page = 1,
    limit = 10,
  }) {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return { doctors: [], total: 0, page: parseInt(page, 10), totalPages: 0 };
    }

    const query = {};

    if (city) query['address.city'] = new RegExp(city, 'i');
    if (state) query['address.state'] = new RegExp(state, 'i');
    if (pincode) query['address.pincode'] = pincode.trim();
    if (specialization) query.specialization = new RegExp(specialization, 'i');
    if (verificationStatus && verificationStatus !== 'ALL') {
      query.verificationStatus = verificationStatus;
    }
    if (sourceType) query.sourceType = sourceType;
    if (qualification) {
      query.$or = [
        { 'qualifications.degree': new RegExp(qualification, 'i') },
        { qualifications: new RegExp(qualification, 'i') },
      ];
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { fullName: searchRegex },
        { specialization: searchRegex },
        { 'address.city': searchRegex },
        { 'address.state': searchRegex },
        { 'address.pincode': searchRegex },
        { medicalRegistrationNumber: searchRegex },
        { 'qualifications.degree': searchRegex },
      ];
    }

    const total = await DoctorProfile.countDocuments(query);
    const order = sortOrder === 'asc' ? 1 : -1;
    let sortObj = { verificationStatus: 1, 'rating.average': -1, experienceYears: -1 };

    if (sortBy === 'experience') sortObj = { experienceYears: order };
    if (sortBy === 'rating') sortObj = { 'rating.average': order };
    if (sortBy === 'fee') sortObj = { consultationFee: order };

    const doctors = await DoctorProfile.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .sort(sortObj);

    // Check which doctors have active schedules configured
    const candidateIds = doctors
      .filter(d => d.verificationStatus === 'CREDENTIAL_VERIFIED' || d.isClaimed)
      .map(d => d._id);

    const activeAvailabilities = await DoctorAvailability.distinct('doctorId', {
      doctorId: { $in: candidateIds },
      isAvailable: true,
    });
    const availableSet = new Set(activeAvailabilities.map(id => id.toString()));

    const userLat = latitude ? parseFloat(latitude) : null;
    const userLng = longitude ? parseFloat(longitude) : null;

    let formatted = doctors.map(doc => {
      const docLat = doc.location?.coordinates?.[1] || null;
      const docLng = doc.location?.coordinates?.[0] || null;
      const distanceKm = calculateHaversineDistanceKm(userLat, userLng, docLat, docLng);

      const isVerified = doc.verificationStatus === 'CREDENTIAL_VERIFIED' || doc.isClaimed;
      const hasSchedule = availableSet.has(doc._id.toString());
      const appointmentBookingAvailable = Boolean(isVerified && hasSchedule);

      let bookingNotice = null;
      if (!appointmentBookingAvailable) {
        if (doc.verificationStatus === 'DISCOVERED') {
          bookingNotice = 'Discovered public listing. Online instant appointment booking requires direct clinic coordination or practitioner claiming profile.';
        } else if (doc.verificationStatus === 'SOURCE_VERIFIED') {
          bookingNotice = 'Official registry record verified. Direct appointment scheduling requires doctor clinical credential validation.';
        } else if (!hasSchedule) {
          bookingNotice = 'Doctor is credential-verified, but has not configured active consultation time slots for this period.';
        }
      }

      return {
        ...doc.toObject(),
        distanceKm,
        directionsUrl: doc.directionsUrl || (docLat && docLng ? `https://www.google.com/maps/dir/?api=1&destination=${docLat},${docLng}` : null),
        appointmentBookingAvailable,
        bookingNotice,
      };
    });

    if (sortBy === 'distance' && userLat !== null && userLng !== null) {
      formatted.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return order === 1 ? a.distanceKm - b.distanceKm : b.distanceKm - a.distanceKm;
      });
    }

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
    const mongoose = require('mongoose');
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    let registeredDoctors = [];
    if (mongoose.connection.readyState === 1) {
      registeredDoctors = await DoctorProfile.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat],
            },
            $maxDistance: parseInt(maxDistanceMeters, 10),
          },
        },
      }).limit(20);
    }

    const verifiedIds = registeredDoctors
      .filter(d => d.verificationStatus === 'CREDENTIAL_VERIFIED' || d.isClaimed)
      .map(d => d._id);

    const activeAvailabilities = await DoctorAvailability.distinct('doctorId', {
      doctorId: { $in: verifiedIds },
      isAvailable: true,
    });
    const availableSet = new Set(activeAvailabilities.map(id => id.toString()));

    const formattedRegistered = registeredDoctors.map(doc => {
      const docLat = doc.location?.coordinates?.[1];
      const docLng = doc.location?.coordinates?.[0];
      const distanceKm = calculateHaversineDistanceKm(lat, lng, docLat, docLng);
      const isVerified = doc.verificationStatus === 'CREDENTIAL_VERIFIED' || doc.isClaimed;
      const hasSchedule = availableSet.has(doc._id.toString());
      const appointmentBookingAvailable = Boolean(isVerified && hasSchedule);

      let bookingNotice = null;
      if (!appointmentBookingAvailable) {
        if (doc.verificationStatus === 'DISCOVERED') {
          bookingNotice = 'Discovered public listing. Direct clinic coordination required.';
        } else if (doc.verificationStatus === 'SOURCE_VERIFIED') {
          bookingNotice = 'Registry verified provider. Practitioner credential authorization required for direct booking.';
        } else if (!hasSchedule) {
          bookingNotice = 'Doctor is credential-verified, but has no active consultation hours configured.';
        }
      }

      return {
        ...doc.toObject(),
        distanceKm,
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${docLat},${docLng}`,
        appointmentBookingAvailable,
        bookingNotice,
      };
    });

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
        discoveredDoctors = placesResult.places.map(p => {
          const pLat = p.location?.coordinates?.[1];
          const pLng = p.location?.coordinates?.[0];
          const distanceKm = calculateHaversineDistanceKm(lat, lng, pLat, pLng);

          return {
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
            distanceKm,
            directionsUrl: p.directionsUrl,
            appointmentBookingAvailable: false,
            bookingNotice: 'Discovered public listing. Online instant appointment booking requires direct clinic coordination or practitioner claiming profile.',
          };
        });
      }
    }

    // Merge: Credential verified first, then source verified, then discovered; sorted by distanceKm
    const combined = [...formattedRegistered, ...discoveredDoctors];
    combined.sort((a, b) => {
      // Prioritize verified over discovered, but within same tier sort by distance
      const tierRank = { CREDENTIAL_VERIFIED: 1, SOURCE_VERIFIED: 2, DISCOVERED: 3 };
      const rankA = tierRank[a.verificationStatus] || 4;
      const rankB = tierRank[b.verificationStatus] || 4;
      if (rankA !== rankB) return rankA - rankB;
      return (a.distanceKm || 999) - (b.distanceKm || 999);
    });

    return combined;
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

    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return {
        doctorId,
        date: dateString,
        isAvailable: false,
        message: 'No available appointment schedule configured for this day.',
        slots: [],
      };
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
