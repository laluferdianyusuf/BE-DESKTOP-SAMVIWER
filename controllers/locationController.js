const LocationService = require("../services/locationServices");

class LocationController {
  static async createLocation(req, res) {
    const { loc } = req.body;

    const { status, status_code, message, data } =
      await LocationService.createLocation({
        loc,
      });

    res.status(status_code).send({
      status,
      status_code,
      message,
      data,
    });
  }

  static async getALlLocation(req, res) {
    const { status, status_code, message, data } =
      await LocationService.getAllLocation();

    res.status(status_code).send({
      status,
      status_code,
      message,
      data,
    });
  }

  static async updateLocation(req, res) {
    const { id } = req.params;
    const { loc } = req.body;
    const { status, status_code, message, data } =
      await LocationService.updateLocation({ id, loc });

    res.status(status_code).send({
      status,
      status_code,
      message,
      data,
    });
  }

  static async deleteLocation(req, res) {
    const { id } = req.params;
    const { status, status_code, message, data } =
      await LocationService.deleteLocation({ id });

    res.status(status_code).send({
      status,
      status_code,
      message,
      data,
    });
  }
}

module.exports = LocationController;
