const LocationRepository = require("../repositories/locationRepository");

class LocationService {
  static async createLocation({ loc }) {
    try {
      const existingLocation = await LocationRepository.getByLocation({ loc });

      if (existingLocation) {
        return {
          status: false,
          status_code: 403,
          message: "Location already exist",
          data: null,
        };
      }

      if (!loc) {
        return {
          status: false,
          status_code: 403,
          message: "All fields are required",
          data: null,
        };
      }

      const create = await LocationRepository.createLocation({
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

  static async updateLocation({ id, loc }) {
    try {
      const getLoc = await LocationRepository.getById({ id });

      if (!getLoc) {
        return {
          status: false,
          status_code: 404,
          message: "No location found",
          data: null,
        };
      }

      const update = await LocationRepository.updateLocation({
        id: id,
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

  static async deleteLocation({ id }) {
    try {
      const getLoc = await LocationRepository.getById({ id });

      if (!getLoc) {
        return {
          status: false,
          status_code: 404,
          message: "No devices found",
          data: null,
        };
      }

      const deleted = await LocationRepository.deleteLocation({ id: id });
      return {
        status: true,
        status_code: 200,
        message: "Location deleted successfully",
        data: deleted,
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
