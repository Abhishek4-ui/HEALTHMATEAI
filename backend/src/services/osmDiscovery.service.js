const { getRedisClient, getRedisStatus } = require('../config/redis');
const { INDIAN_STATES_AND_UTS } = require('../constants/indianStatesAndDistricts');
const logger = require('../utils/logger');

// Indian State Approximate Centroids for instant zero-network fallback
const STATE_CENTROIDS = {
  'Andhra Pradesh': { lat: 15.9129, lon: 79.7400 },
  'Arunachal Pradesh': { lat: 28.2180, lon: 94.7278 },
  'Assam': { lat: 26.2006, lon: 92.9376 },
  'Bihar': { lat: 25.0961, lon: 85.3131 },
  'Chhattisgarh': { lat: 21.2787, lon: 81.8661 },
  'Goa': { lat: 15.2993, lon: 74.1240 },
  'Gujarat': { lat: 22.2587, lon: 71.1924 },
  'Haryana': { lat: 29.0588, lon: 76.0856 },
  'Himachal Pradesh': { lat: 31.1048, lon: 77.1734 },
  'Jharkhand': { lat: 23.6102, lon: 85.2799 },
  'Karnataka': { lat: 15.3173, lon: 75.7139 },
  'Kerala': { lat: 10.8505, lon: 76.2711 },
  'Madhya Pradesh': { lat: 22.9734, lon: 78.6569 },
  'Maharashtra': { lat: 19.7515, lon: 75.7139 },
  'Manipur': { lat: 24.6637, lon: 93.9063 },
  'Meghalaya': { lat: 25.4670, lon: 91.3662 },
  'Mizoram': { lat: 23.1645, lon: 92.9376 },
  'Nagaland': { lat: 26.1584, lon: 94.5624 },
  'Odisha': { lat: 20.9517, lon: 85.0985 },
  'Punjab': { lat: 31.1471, lon: 75.3412 },
  'Rajasthan': { lat: 27.0238, lon: 74.2179 },
  'Sikkim': { lat: 27.5330, lon: 88.5122 },
  'Tamil Nadu': { lat: 11.1271, lon: 78.6569 },
  'Telangana': { lat: 18.1124, lon: 79.0193 },
  'Tripura': { lat: 23.9408, lon: 91.9882 },
  'Uttar Pradesh': { lat: 26.8467, lon: 80.9462 },
  'Uttarakhand': { lat: 30.0668, lon: 79.0193 },
  'West Bengal': { lat: 22.9868, lon: 87.8550 },
  'Andaman and Nicobar Islands': { lat: 11.7401, lon: 92.6586 },
  'Chandigarh': { lat: 30.7333, lon: 76.7794 },
  'Dadra and Nagar Haveli and Daman and Diu': { lat: 20.4283, lon: 72.8397 },
  'Delhi': { lat: 28.6139, lon: 77.2090 },
  'Jammu and Kashmir': { lat: 33.7782, lon: 76.5762 },
  'Ladakh': { lat: 34.1526, lon: 77.5771 },
  'Lakshadweep': { lat: 10.5667, lon: 72.6417 },
  'Puducherry': { lat: 11.9416, lon: 79.8083 },
};

class OSMDiscoveryService {
  constructor() {
    this.nominatimEndpoint = 'https://nominatim.openstreetmap.org';
    this.userAgent = 'HealthMateAI-Platform/1.0 (healthcare-discovery@healthmate.ai)';
  }

  /**
   * Geocode Indian address, state, district, or PIN code via OpenStreetMap Nominatim
   */
  async geocodeQuery(query) {
    if (!query || !query.trim()) return null;
    const cleanQuery = query.trim();

    // 1. Check offline centroid cache first for exact state matches
    const stateMatch = Object.keys(STATE_CENTROIDS).find(
      s => s.toLowerCase() === cleanQuery.toLowerCase()
    );
    if (stateMatch) {
      const c = STATE_CENTROIDS[stateMatch];
      return {
        latitude: c.lat,
        longitude: c.lon,
        formattedAddress: `${stateMatch}, India`,
        source: 'OFFLINE_STATE_REGISTRY',
      };
    }

    // 2. Check Redis cache
    const cacheKey = `osm_geo:${cleanQuery.toLowerCase()}`;
    if (getRedisStatus() === 'connected') {
      try {
        const cached = await getRedisClient().get(cacheKey);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }

    // 3. Query OpenStreetMap Nominatim
    try {
      const url = `${this.nominatimEndpoint}/search?q=${encodeURIComponent(cleanQuery + ', India')}&format=json&countrycodes=in&limit=1`;
      const res = await fetch(url, {
        headers: { 'User-Agent': this.userAgent },
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const first = data[0];
          const coords = {
            latitude: parseFloat(first.lat),
            longitude: parseFloat(first.lon),
            formattedAddress: first.display_name,
            source: 'OPENSTREETMAP_NOMINATIM',
          };

          if (getRedisStatus() === 'connected') {
            try {
              await getRedisClient().setex(cacheKey, 86400, JSON.stringify(coords));
            } catch (e) {}
          }
          return coords;
        }
      }
    } catch (err) {
      logger.warn('OSM Nominatim geocoding error', { error: err.message, query: cleanQuery });
    }

    return null;
  }

  /**
   * Reverse-geocode coordinates into address using OpenStreetMap Nominatim
   */
  async reverseGeocode(latitude, longitude) {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lon)) return null;

    const cacheKey = `osm_rev:${lat.toFixed(3)}:${lon.toFixed(3)}`;
    if (getRedisStatus() === 'connected') {
      try {
        const cached = await getRedisClient().get(cacheKey);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }

    try {
      const url = `${this.nominatimEndpoint}/reverse?lat=${lat}&lon=${lon}&format=json`;
      const res = await fetch(url, {
        headers: { 'User-Agent': this.userAgent },
      });

      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const result = {
          formattedAddress: data.display_name || 'India',
          city: addr.city || addr.town || addr.district || addr.county || 'City',
          state: addr.state || 'India',
          pincode: addr.postcode || null,
          source: 'OPENSTREETMAP_NOMINATIM',
        };

        if (getRedisStatus() === 'connected') {
          try {
            await getRedisClient().setex(cacheKey, 86400, JSON.stringify(result));
          } catch (e) {}
        }
        return result;
      }
    } catch (err) {
      logger.warn('OSM Reverse geocoding error', { error: err.message, lat, lon });
    }

    return null;
  }
}

module.exports = new OSMDiscoveryService();
