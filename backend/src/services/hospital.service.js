const { Hospital } = require('../models');

class HospitalService {
  /**
   * Search hospitals across India
   */
  async searchHospitals({ query, city, state, facilityType, page = 1, limit = 10 }) {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return { hospitals: [], total: 0, page: parseInt(page, 10), totalPages: 0 };
    }

    const filter = {};

    if (query) {
      filter.$or = [
        { name: new RegExp(query, 'i') },
        { 'address.formattedAddress': new RegExp(query, 'i') },
        { departments: new RegExp(query, 'i') },
      ];
    }

    if (city) filter['address.city'] = new RegExp(city, 'i');
    if (state) filter['address.state'] = new RegExp(state, 'i');
    if (facilityType) filter.facilityType = facilityType;

    const total = await Hospital.countDocuments(filter);
    const hospitals = await Hospital.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .sort({ rating: -1, createdAt: -1 });

    return {
      hospitals,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find nearby hospitals using GeoJSON 2dsphere index
   */
  async findNearbyHospitals({ longitude, latitude, maxDistanceMeters = 25000 }) {
    return await Hospital.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistanceMeters, 10),
        },
      },
    }).limit(15);
  }

  /**
   * Get hospital details by ID
   */
  async getHospitalById(id) {
    const hospital = await Hospital.findById(id);
    if (!hospital) throw new Error('Hospital or facility record not found.');
    return hospital;
  }
}

module.exports = new HospitalService();
