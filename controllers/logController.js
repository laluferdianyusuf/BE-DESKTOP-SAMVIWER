const LogServices = require("../services/logServices");

class LogsController {
  static async getAllLogs(req, res) {
    const { status, status_code, message, data } =
      await LogServices.getALlLogs();

    res.status(status_code).send({
      status,
      status_code,
      message,
      data,
    });
  }
}

module.exports = LogsController;
