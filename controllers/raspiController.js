const RaspiServices = require("../services/raspiServices");

class RaspiController {
  static async connect(req, res) {
    const { samId } = req.params;

    const { status, status_code, message, data } =
      await RaspiServices.connectToRaspi({ samId });
    res.status(status_code).send({
      status: status,
      status_code: status_code,
      message: message,
      data: data,
    });
  }

  static async collect(req, res) {
    const { samId } = req.params;
    const { status, status_code, message, data } =
      await RaspiServices.collectData({ samId });
    res.status(status_code).send({
      status: status,
      status_code: status_code,
      message: message,
      data: data,
    });
  }

  static async configure(req, res) {
    const { samId } = req.params;
    const config = req.body;

    const { status, status_code, message, data } =
      await RaspiServices.configureRaspi({ samId, config });
    res.status(status_code).send({
      status: status,
      status_code: status_code,
      message: message,
      data: data,
    });
  }

  static async getConfig(req, res) {
    const { samId } = req.params;

    const { status, status_code, message, data } =
      await RaspiServices.getConfig({ samId });
    res.status(status_code).send({
      status: status,
      status_code: status_code,
      message: message,
      data: data,
    });
  }

  static async getAllFileJson(req, res) {
    const { samId } = req.params;

    const { status, status_code, message, data } =
      await RaspiServices.getAllFileJson({ samId });
    res.status(status_code).send({
      status: status,
      status_code: status_code,
      message: message,
      data: data,
    });
  }

  static async getFileJson(req, res) {
    const { samId } = req.params;
    const { filename } = req.query;

    const { status, status_code, message, data } =
      await RaspiServices.getFileJson({ samId, filename });
    res.status(status_code).send({
      status: status,
      status_code: status_code,
      message: message,
      data: data,
    });
  }
}

module.exports = RaspiController;
