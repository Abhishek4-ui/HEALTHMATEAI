const { Hospital } = require('../models');
const placesService = require('./places.service');
const registryService = require('./registry.service');
const logger = require('../utils/logger');

class HospitalService {
  /**
   * Search hospitals across India with multi-attribute filtering
   */
  async searchHospitals({ query, city, state, facilityType, statusTier, sourceType, page = 1, limit = 10 }) {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return { hospitals: [], total: 0, page: parseInt(page, 10), totalPages: 0 };
    }

    const filter = {};

    if (query) {
      filter.$or = [
        { name: new RegExp(query, 'i') },
        { 'address.formattedAddress': new RegExp(query, 'i') },
        { 'address.city': new RegExp(query, 'i') },
        { departments: new RegExp(query, 'i') },
        { sourceIdentifier: new RegExp(query, 'i') },
      ];
    }

    if (city) filter['address.city'] = new RegExp(city, 'i');
    if (state) filter['address.state'] = new RegExp(state, 'i');
    if (facilityType && facilityType !== 'ALL') filter.facilityType = facilityType;
    if (statusTier && statusTier !== 'ALL') filter.statusTier = statusTier;
    if (sourceType) filter.sourceType = sourceType;

    const total = await Hospital.countDocuments(filter);
    const hospitals = await Hospital.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .sort({ statusTier: 1, rating: -1, createdAt: -1 });

    const formatted = hospitals.map(h => {
      const lat = h.location?.coordinates?.[1] || 28.6139;
      const lng = h.location?.coordinates?.[0] || 77.2090;
      return {
        ...h.toObject(),
        directionsUrl: h.directionsUrl || `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      };
    });

    return {
      hospitals: formatted,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find nearby hospitals using GeoJSON 2dsphere index combined with live Google Places (New) discovery
   */
  async findNearbyHospitals({ longitude, latitude, maxDistanceMeters = 25000, includeGooglePlaces = true }) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // 1. Query MongoDB 2dsphere for verified & registered facilities
    const registeredHospitals = await Hospital.find({
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

    const formattedRegistered = registeredHospitals.map(h => ({
      ...h.toObject(),
      directionsUrl: h.directionsUrl || `https://www.google.com/maps/dir/?api=1&destination=${h.location.coordinates[1]},${h.location.coordinates[0]}`,
      isDiscoveredOnly: false,
    }));

    // 2. Fetch live Google Places if configured
    let discoveredFacilities = [];
    if (includeGooglePlaces && placesService.isConfigured()) {
      const placesRes = await placesService.searchNearbyHealthcare({
        latitude: lat,
        longitude: lng,
        radiusMeters: Math.min(parseInt(maxDistanceMeters, 10), 30000),
        includedTypes: ['hospital'],
      });

      if (placesRes.success && placesRes.places) {
        // Run quality validation & deduplication against registered MongoDB records
        const uniqueDiscovered = await registryService.deduplicateDiscoveredFacilities(placesRes.places);
        discoveredFacilities = uniqueDiscovered.map(dp => ({
          _id: dp.id,
          name: dp.name,
          facilityType: dp.facilityType,
          statusTier: 'DISCOVERED',
          sourceType: 'GOOGLE_PLACES',
          departments: ['Emergency', 'General Medical Care'],
          contact: dp.contact,
          address: dp.address,
          location: dp.location,
          rating: dp.rating?.average || 4.0,
          directionsUrl: dp.directionsUrl,
          isDiscoveredOnly: true,
          verificationDisclaimer: 'Listing discovered via Google Places public directory. Accreditation not verified by statutory medical council.',
        }));
      }
    }

    // Merge: SOURCE_VERIFIED / CREDENTIAL_VERIFIED first, then Google Places DISCOVERED
    return [...formattedRegistered, ...discoveredFacilities];
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
