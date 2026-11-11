const hospitalService = require('../services/hospital.service');
const { successResponse, errorResponse } = require('../utils/response');

class HospitalController {
  async searchHospitals(req, res, next) {
    try {
      const result = await hospitalService.searchHospitals(req.query);
      return successResponse(res, result, 'Hospitals discovered.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'DISCOVERY_ERROR');
    }
  }

  async findNearby(req, res, next) {
    try {
      const latitude = req.query.latitude || req.query.lat;
      const longitude = req.query.longitude || req.query.lng;
      const maxDistance = req.query.maxDistance || req.query.radius;

      if (!longitude || !latitude) {
        return errorResponse(res, 'Coordinates longitude and latitude are required.', 400, 'COORDINATES_REQUIRED');
      }
      const hospitals = await hospitalService.findNearbyHospitals({
        longitude,
        latitude,
        maxDistanceMeters: maxDistance,
      });
      return successResponse(res, hospitals, 'Nearby hospitals retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'GEOLOCATION_ERROR');
    }
  }

  async getById(req, res, next) {
    try {
      const hospital = await hospitalService.getHospitalById(req.params.id);
      return successResponse(res, hospital, 'Hospital details retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 404, 'NOT_FOUND');
    }
  }
}

module.exports = new HospitalController();
