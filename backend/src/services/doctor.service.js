const { DoctorProfile, DoctorVerification, DoctorAvailability, User, AuditLog } = require('../models');

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
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
      },
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

    // Replace schedule rules idempotently
    await DoctorAvailability.deleteMany({ doctorId: profile._id });

    const newRules = schedule.map(rule => ({
      doctorId: profile._id,
      ...rule,
    }));

    const created = await DoctorAvailability.insertMany(newRules);
    return created;
  }

  /**
   * List doctors for India-wide discovery
   */
  async listDoctors({ city, state, specialization, search, page = 1, limit = 10 }) {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return { doctors: [], total: 0, page: parseInt(page, 10), totalPages: 0 };
    }

    const query = {};

    if (city) query['address.city'] = new RegExp(city, 'i');
    if (state) query['address.state'] = new RegExp(state, 'i');
    if (specialization) query.specialization = new RegExp(specialization, 'i');
    if (search) {
      query.$or = [
        { fullName: new RegExp(search, 'i') },
        { specialization: new RegExp(search, 'i') },
        { 'address.city': new RegExp(search, 'i') },
      ];
    }

    const total = await DoctorProfile.countDocuments(query);
    const doctors = await DoctorProfile.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .sort({ 'rating.average': -1, createdAt: -1 });

    return {
      doctors,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find nearby doctors using GeoJSON 2dsphere index
   */
  async findNearbyDoctors({ longitude, latitude, maxDistanceMeters = 50000 }) {
    return await DoctorProfile.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistanceMeters, 10),
        },
      },
    }).limit(20);
  }
}

module.exports = new DoctorService();
