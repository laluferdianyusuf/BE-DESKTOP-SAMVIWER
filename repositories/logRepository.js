const { logs } = require("../models");

class LogsRepository {
  static async createLog({ activity }) {
    return await logs.create({
      activity,
    });
  }

  static async getAllLogs() {
    return await logs.findAll();
  }
}

module.exports = LogsRepository;
