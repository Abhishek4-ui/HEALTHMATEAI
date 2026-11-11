const doctorService = require('../services/doctor.service');
const { successResponse, errorResponse } = require('../utils/response');

class DoctorController {
  async getProfile(req, res, next) {
    try {
      const data = await doctorService.getProfile(req.user.id);
      return successResponse(res, data, 'Doctor profile retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 404, 'DOCTOR_NOT_FOUND');
    }
  }

  async updateProfile(req, res, next) {
    try {
      const updated = await doctorService.updateProfile(req.user.id, req.body);
      return successResponse(res, updated, 'Doctor profile updated.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'UPDATE_FAILED');
    }
  }

  async submitVerification(req, res, next) {
    try {
      const verification = await doctorService.submitVerificationDocs(req.user.id, req.body);
      return successResponse(res, verification, 'Verification documents submitted for review.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'SUBMISSION_FAILED');
    }
  }

  async updateAvailability(req, res, next) {
    try {
      const availability = await doctorService.updateAvailability(req.user.id, req.body);
      return successResponse(res, availability, 'Availability schedule updated.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'AVAILABILITY_UPDATE_FAILED');
    }
  }

  async listDoctors(req, res, next) {
    try {
      const result = await doctorService.listDoctors(req.query);
      return successResponse(res, result, 'Doctors discovered.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'DISCOVERY_ERROR');
    }
  }

  async findNearby(req, res, next) {
    try {
      const { longitude, latitude, maxDistance } = req.query;
      if (!longitude || !latitude) {
        return errorResponse(res, 'Coordinates longitude and latitude are required.', 400, 'COORDINATES_REQUIRED');
      }
      const doctors = await doctorService.findNearbyDoctors({
        longitude,
        latitude,
        maxDistanceMeters: maxDistance,
      });
      return successResponse(res, doctors, 'Nearby doctors retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'GEOLOCATION_ERROR');
    }
  }
}

module.exports = new DoctorController();
