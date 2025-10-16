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

  static async getAllEmail() {
    const emails = await email.findAll({
      attributes: ["emailName"],
    });

    return emails.map((e) => e.emailName);
  }

  static async getEmailById({ id }) {
    return await email.findOne({
      where: { id },
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

  static async updateEmail({ id, emailName }) {
    await email.update(
      {
        emailName,
      },
      {
        where: {
          id,
        },
      }
    );

    return await email.findOne({ id });
  }

  static async deleteEmail({ id }) {
    const deleted = await email.destroy({
      where: { id },
    });

    return deleted > 0;
  }
}

module.exports = EmailRepository;
