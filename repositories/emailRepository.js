const { email } = require("../models");

class EmailRepository {
  static async createEmail({ emailName }) {
    return await email.create({
      emailName,
    });
  }

  static async getOneEmail({ emailName }) {
    return await email.findOne({
      where: { emailName },
    });
  }
  static async getEmailByEmail({ emailName }) {
    return await email.findAll({
      where: { emailName },
    });
  }

  static async getEmails({ sort = "id", order = "ASC" }) {
    const allowedSorts = ["id", "emailName"];
    const allowedOrders = ["ASC", "DESC"];

    const sortField = allowedSorts.includes(sort) ? sort : "id";
    const sortOrder = allowedOrders.includes(order.toUpperCase())
      ? order.toUpperCase()
      : "ASC";

    return await email.findAll({
      order: [[sortField, sortOrder]],
    });
  }
}

module.exports = EmailRepository;
