const LogRepository = require("../repositories/logRepository");

class LogsServices {
  static async createLog({ activity }) {
    try {
      if (!activity) {
        return {
          status: false,
          status_code: 403,
          message: "Activity is required",
          data: null,
        };
      }
      const create = await LogRepository.createLog({ activity });

      return {
        status: true,
        status_code: 201,
        message: "Log created",
        data: create,
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: "Error" + error,
        data: null,
      };
    }
  }

  static async getALlLogs() {
    try {
      const getLogs = await LogRepository.getAllLogs();

      if (!getLogs) {
        return {
          status: false,
          status_code: 404,
          message: "No logs found",
          data: null,
        };
      }
      return {
        status: true,
        status_code: 200,
        message: "Log retrieved",
        data: getLogs,
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: "Error" + error,
        data: null,
      };
    }
  }
}

module.exports = LogsServices;
