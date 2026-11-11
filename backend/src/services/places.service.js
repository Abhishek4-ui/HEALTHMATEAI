const { getRedisClient, getRedisStatus } = require('../config/redis');
const logger = require('../utils/logger');

class PlacesService {
  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY || '';
    this.placesNewEndpoint = 'https://places.googleapis.com/v1/places:searchNearby';
    this.geocodeEndpoint = 'https://maps.googleapis.com/maps/api/geocode/json';
  }

  isConfigured() {
    return Boolean(this.apiKey && !this.apiKey.startsWith('AIzaSy_your_'));
  }

  /**
   * Geocode an Indian address or city name into [latitude, longitude]
   */
  async geocodeAddress(address) {
    if (!this.isConfigured()) return null;

    const cacheKey = `geo:${address.trim().toLowerCase()}`;
    if (getRedisStatus() === 'connected') {
      try {
        const cached = await getRedisClient().get(cacheKey);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }

    try {
      const url = `${this.geocodeEndpoint}?address=${encodeURIComponent(address)}&region=in&key=${this.apiKey}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const loc = data.results[0].geometry.location;
        const coords = { latitude: loc.lat, longitude: loc.lng, formattedAddress: data.results[0].formatted_address };

        if (getRedisStatus() === 'connected') {
          try {
            await getRedisClient().setex(cacheKey, 86400, JSON.stringify(coords)); // 24h cache
          } catch (e) {}
        }
        return coords;
      }
    } catch (err) {
      logger.warn('Google Geocoding API call error', { error: err.message, address });
    }
    return null;
  }

  /**
   * Search nearby healthcare facilities via Google Places (New) API
   * @param {Object} params
   * @param {number} params.latitude
   * @param {number} params.longitude
   * @param {number} params.radiusMeters
   * @param {string[]} params.includedTypes - e.g. ['hospital', 'doctor']
   */
  async searchNearbyHealthcare({ latitude, longitude, radiusMeters = 5000, includedTypes = ['hospital', 'doctor'] }) {
    if (!this.isConfigured()) {
      return { success: false, reason: 'GOOGLE_PLACES_API_KEY not configured', places: [] };
    }

    const roundedLat = latitude.toFixed(3);
    const roundedLng = longitude.toFixed(3);
    const cacheKey = `places:nearby:${roundedLat}:${roundedLng}:${radiusMeters}:${includedTypes.join('_')}`;

    if (getRedisStatus() === 'connected') {
      try {
        const cached = await getRedisClient().get(cacheKey);
        if (cached) {
          return { success: true, fromCache: true, places: JSON.parse(cached) };
        }
      } catch (e) {}
    }

    try {
      const body = {
        includedTypes,
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude, longitude },
            radius: Math.min(radiusMeters, 50000.0) // max 50km
          }
        }
      };

      const res = await fetch(this.placesNewEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.internationalPhoneNumber,places.websiteUri,places.types'
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errText = await res.text();
        logger.warn('Google Places (New) API request failed', { status: res.status, errText });
        return { success: false, status: res.status, places: [] };
      }

      const data = await res.json();
      const rawPlaces = data.places || [];

      // Transform raw Google Places to HealthMate AI standardized schema with strict DISCOVERED tier
      const standardized = rawPlaces.map(p => {
        const placeLat = p.location?.latitude || latitude;
        const placeLng = p.location?.longitude || longitude;
        const isDoctor = p.types && (p.types.includes('doctor') || p.types.includes('physiotherapist'));

        return {
          id: `gp_${p.id}`,
          googlePlaceId: p.id,
          name: p.displayName?.text || 'Healthcare Facility',
          facilityType: isDoctor ? 'CLINIC' : 'HOSPITAL',
          isDoctorListing: Boolean(isDoctor),
          sourceType: 'GOOGLE_PLACES',
          statusTier: 'DISCOVERED',
          verificationBadge: {
            code: 'DISCOVERED',
            label: 'Google Places Public Listing',
            isCredentialVerified: false,
            disclaimer: 'Discovered via Google Places. Credentials and qualifications have not been verified by state medical authorities.'
          },
          address: {
            formattedAddress: p.formattedAddress || '',
            city: this.extractCity(p.formattedAddress),
            state: this.extractState(p.formattedAddress),
            pincode: this.extractPincode(p.formattedAddress),
          },
          location: {
            type: 'Point',
            coordinates: [placeLng, placeLat] // GeoJSON [lng, lat]
          },
          contact: {
            phone: p.internationalPhoneNumber || null,
            website: p.websiteUri || null,
          },
          rating: {
            average: p.rating || 0,
            totalReviews: p.userRatingCount || 0,
            source: 'Google User Reviews'
          },
          directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${placeLat},${placeLng}&destination_place_id=${p.id}`,
          appointmentBookingAvailable: false,
          bookingNotice: 'Direct clinic booking required. Online instant appointment booking is not available for unverified public listings.'
        };
      });

      if (getRedisStatus() === 'connected' && standardized.length > 0) {
        try {
          await getRedisClient().setex(cacheKey, 7200, JSON.stringify(standardized)); // 2h cache
        } catch (e) {}
      }

      return {
        success: true,
        count: standardized.length,
        places: standardized
      };
    } catch (err) {
      logger.error('Error fetching Google Places nearby healthcare', { error: err.message });
      return { success: false, error: err.message, places: [] };
    }
  }

  extractCity(address = '') {
    if (!address) return 'Delhi';
    const parts = address.split(',').map(s => s.trim());
    return parts.length >= 3 ? parts[parts.length - 3] : 'India';
  }

  extractState(address = '') {
    if (!address) return 'Delhi';
    const parts = address.split(',').map(s => s.trim());
    return parts.length >= 2 ? parts[parts.length - 2].replace(/[0-9]/g, '').trim() : 'India';
  }

  extractPincode(address = '') {
    if (!address) return null;
    const match = address.match(/\b\d{6}\b/);
    return match ? match[0] : null;
  }
}

module.exports = new PlacesService();
