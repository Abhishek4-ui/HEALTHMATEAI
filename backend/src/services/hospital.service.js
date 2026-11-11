const { Hospital } = require('../models');
const placesService = require('./places.service');
const registryService = require('./registry.service');
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

class HospitalService {
  /**
   * Search hospitals across India with multi-attribute filtering
   */
  async searchHospitals({
    query,
    city,
    state,
    pincode,
    facilityType,
    statusTier,
    sourceType,
    departments,
    latitude,
    longitude,
    sortBy,
    sortOrder = 'desc',
    page = 1,
    limit = 10,
  }) {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return { hospitals: [], total: 0, page: parseInt(page, 10), totalPages: 0 };
    }

    const filter = {};

    if (query) {
      const qRegex = new RegExp(query, 'i');
      filter.$or = [
        { name: qRegex },
        { 'address.formattedAddress': qRegex },
        { 'address.city': qRegex },
        { 'address.state': qRegex },
        { 'address.pincode': qRegex },
        { departments: qRegex },
        { sourceIdentifier: qRegex },
      ];
    }

    if (city) filter['address.city'] = new RegExp(city, 'i');
    if (state) filter['address.state'] = new RegExp(state, 'i');
    if (pincode) filter['address.pincode'] = pincode.trim();
    if (facilityType && facilityType !== 'ALL') filter.facilityType = facilityType;
    if (statusTier && statusTier !== 'ALL') filter.statusTier = statusTier;
    if (sourceType) filter.sourceType = sourceType;
    if (departments) {
      filter.departments = new RegExp(departments, 'i');
    }

    const total = await Hospital.countDocuments(filter);
    const order = sortOrder === 'asc' ? 1 : -1;
    let sortObj = { statusTier: 1, rating: -1, createdAt: -1 };

    if (sortBy === 'rating') sortObj = { rating: order };
    if (sortBy === 'name') sortObj = { name: order };

    const hospitals = await Hospital.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .sort(sortObj);

    const userLat = latitude ? parseFloat(latitude) : null;
    const userLng = longitude ? parseFloat(longitude) : null;

    let formatted = hospitals.map(h => {
      const lat = h.location?.coordinates?.[1] || null;
      const lng = h.location?.coordinates?.[0] || null;
      const distanceKm = calculateHaversineDistanceKm(userLat, userLng, lat, lng);

      return {
        ...h.toObject(),
        distanceKm,
        directionsUrl: h.directionsUrl || (lat && lng ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` : null),
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
    const mongoose = require('mongoose');
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    let registeredHospitals = [];
    if (mongoose.connection.readyState === 1) {
      registeredHospitals = await Hospital.find({
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

    const formattedRegistered = registeredHospitals.map(h => {
      const hLat = h.location?.coordinates?.[1];
      const hLng = h.location?.coordinates?.[0];
      const distanceKm = calculateHaversineDistanceKm(lat, lng, hLat, hLng);

      return {
        ...h.toObject(),
        distanceKm,
        directionsUrl: h.directionsUrl || `https://www.google.com/maps/dir/?api=1&destination=${hLat},${hLng}`,
        isDiscoveredOnly: false,
      };
    });

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
        discoveredFacilities = uniqueDiscovered.map(dp => {
          const pLat = dp.location?.coordinates?.[1];
          const pLng = dp.location?.coordinates?.[0];
          const distanceKm = calculateHaversineDistanceKm(lat, lng, pLat, pLng);

          return {
            _id: dp.id,
            name: dp.name,
            facilityType: dp.facilityType,
            statusTier: 'DISCOVERED',
            sourceType: 'GOOGLE_PLACES',
            departments: ['Emergency', 'General Medical Care'],
            contact: dp.contact,
            address: dp.address,
            location: dp.location,
            distanceKm,
            rating: dp.rating?.average || 4.0,
            directionsUrl: dp.directionsUrl,
            isDiscoveredOnly: true,
            verificationDisclaimer: 'Listing discovered via Google Places public directory. Accreditation not verified by statutory medical council.',
          };
        });
      }
    }

    // Merge: SOURCE_VERIFIED / CREDENTIAL_VERIFIED first, then Google Places DISCOVERED, sorted by distance
    const combined = [...formattedRegistered, ...discoveredFacilities];
    combined.sort((a, b) => {
      const tierRank = { CREDENTIAL_VERIFIED: 1, SOURCE_VERIFIED: 2, DISCOVERED: 3 };
      const rankA = tierRank[a.statusTier] || 4;
      const rankB = tierRank[b.statusTier] || 4;
      if (rankA !== rankB) return rankA - rankB;
      return (a.distanceKm || 999) - (b.distanceKm || 999);
    });

    return combined;
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
