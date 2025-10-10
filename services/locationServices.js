const LocationRepository = require("../repositories/locationRepository");

class LocationService {
  static async createLocation({ samId, loc }) {
    try {
      if (!samId | !loc) {
        return {
          status: false,
          status_code: 403,
          message: "All fields are required",
          data: null,
        };
      }

      const create = await LocationRepository.createLocation({
        samId,
        loc,
      });

      return {
        status: true,
        status_code: 201,
        message: "Location created successfully",
        data: create,
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: "Server Error" + error,
        data: null,
      };
    }
  }

  static async getAllLocation() {
    try {
      const get = await LocationRepository.getAllLocation();

      return {
        status: true,
        status_code: 200,
        message: "Location retrieved successfully",
        data: get,
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: "Server Error" + error,
        data: null,
      };
    }
  }

  static async updateLocation({ samId, loc }) {
    try {
      const getLoc = await LocationRepository.getBySamId({ samId });

      if (!getLoc) {
        return {
          status: false,
          status_code: 404,
          message: "No devices found",
          data: null,
        };
      }

      const update = await LocationRepository.updateLocation({
        samId: samId,
        loc,
      });
      return {
        status: true,
        status_code: 200,
        message: "Location updated successfully",
        data: update,
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: "Server Error" + error,
        data: null,
      };
    }
  }

  static async deleteLocation({ samId }) {
    try {
      const getLoc = await LocationRepository.getBySamId({ samId });

      if (!getLoc) {
        return {
          status: false,
          status_code: 404,
          message: "No devices found",
          data: null,
        };
      }

      const update = await LocationRepository.deleteLocation({ samId: samId });
      return {
        status: true,
        status_code: 200,
        message: "Location deleted successfully",
        data: update,
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: "Server Error" + error,
        data: null,
      };
    }
  }
}

module.exports = LocationService;
