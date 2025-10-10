const LocationService = require("../services/locationServices");

class LocationController {
  static async createLocation(req, res) {
    const { samId, loc } = req.body;

    const { status, status_code, message, data } =
      await LocationService.createLocation({
        samId,
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
    const { samId } = req.params;
    const { loc } = req.body;
    const { status, status_code, message, data } =
      await LocationService.updateLocation({ samId, loc });

    res.status(status_code).send({
      status,
      status_code,
      message,
      data,
    });
  }

  static async deleteLocation(req, res) {
    const { samId } = req.params;
    const { status, status_code, message, data } =
      await LocationService.deleteLocation({ samId });

    res.status(status_code).send({
      status,
      status_code,
      message,
      data,
    });
  }
}

module.exports = LocationController;
