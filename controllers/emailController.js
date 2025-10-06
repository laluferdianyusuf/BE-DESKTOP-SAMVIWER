const EmailService = require("../services/emailServices");

class EmailController {
  static async createEmail(req, res) {
    const { emailName } = req.body;
    const { status, status_code, message, data } =
      await EmailService.createEmail({ emailName });
    res.status(status_code).send({
      status: status,
      status_code: status_code,
      message: message,
      data: data,
    });
  }

  static async getEmails(req, res) {
    const { sort, order } = req.query;
    const { status, status_code, message, data } = await EmailService.getEmails(
      { sort, order }
    );
    res.status(status_code).send({
      status: status,
      status_code: status_code,
      message: message,
      data: data,
    });
  }

  static async getEmailByEmail(req, res) {
    const { emailName } = req.params;
    const { status, status_code, message, data } =
      await EmailService.getEmailByEmail({ emailName });
    res.status(status_code).send({
      status: status,
      status_code: status_code,
      message: message,
      data: data,
    });
  }
}

module.exports = EmailController;
