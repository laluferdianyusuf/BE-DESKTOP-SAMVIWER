const DataRepositories = require("../repositories/dataRepositories");
const DeviceRepositories = require("../repositories/deviceRepositories");
const { uploadToGCS } = require("../utils/gcs");
const fs = require("fs");
const path = require("path");
const { generateLogTable } = require("../utils/table");
const EmailRepository = require("../repositories/emailRepository");
const EmailService = require("./emailServices");
const LOCAL_SAVE_PATH = "D:/VideosRaspi";

class DataServices {
  static validateFields(fields) {
    for (const [key, value] of Object.entries(fields)) {
      if (!value) {
        return `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
      }
    }
    return null;
  }

  static async createVideo({ video, speed, samId }) {
    try {
      const error = this.validateFields({ video, speed, samId });
      if (error) {
        return {
          status: false,
          status_code: 400,
          message: error,
          data: null,
        };
      }

      let category = "";
      if (speed > 99) category = "over speed";
      else if (speed > 30 && speed <= 99) category = "average speed";
      else category = "low speed";

      const device = await DeviceRepositories.existingDevice({ samId });
      if (!device) {
        return {
          status: false,
          status_code: 404,
          message: "Device not found",
          data: null,
        };
      }

      const samFolder = path.join(LOCAL_SAVE_PATH, samId);
      if (!fs.existsSync(samFolder)) {
        fs.mkdirSync(samFolder, { recursive: true });
      }

      const fileName = `${Date.now()}_${video.originalname}`;
      const localPath = path.join(samFolder, fileName);

      fs.writeFileSync(localPath, video.buffer);

      const gcsPath = `${samId}/${fileName}`;
      const gcsUrl = await uploadToGCS(localPath, gcsPath);

      const saveData = await DataRepositories.createVideo({
        deviceId: device.id,
        samId,
        speed,
        video: gcsUrl,
        category,
        createdAt: new Date(),
      });

      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }

      return {
        status: true,
        status_code: 200,
        message: "Video uploaded successfully",
        data: { data: saveData },
      };
    } catch (error) {
      console.error("Create video error:", error);
      return {
        status: false,
        status_code: 500,
        message: "Server error: " + error.message,
        data: null,
      };
    }
  }

  static async getSpeedByCategory({ category }) {
    try {
      const getSpeed = await DataRepositories.getSpeedByCategory({
        category: category,
      });

      if (!getSpeed) {
        return {
          status: false,
          status_code: 404,
          message: `Speed with category ${category} not found`,
          data: { data: null },
        };
      }

      return {
        status: true,
        status_code: 200,
        message: "data retrieved",
        data: { data: getSpeed },
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: "Server error" + error,
        data: {
          data: null,
        },
      };
    }
  }

  static async findData({
    minSpeed,
    maxSpeed,
    category,
    samId,
    startDate,
    endDate,
  }) {
    try {
      const parsedMinSpeed = minSpeed ? Number(minSpeed) : null;
      const parsedMaxSpeed = maxSpeed ? Number(maxSpeed) : null;
      const parsedStartDate = startDate ? new Date(startDate) : null;
      const parsedEndDate = endDate ? new Date(endDate) : null;

      const findData = await DataRepositories.findData({
        minSpeed: parsedMinSpeed,
        maxSpeed: parsedMaxSpeed,
        category,
        samId,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      });

      return {
        status: true,
        status_code: 200,
        message: "Data Retrieved",
        data: { data: findData },
      };
    } catch (error) {
      console.error("SERVICE ERROR:", error);
      return {
        status: false,
        status_code: 500,
        message: "Server error: " + error.message,
        data: null,
      };
    }
  }
  static async getAllData({ samId }) {
    try {
      const getData = await DataRepositories.getAllData({ samId });

      return {
        status: true,
        status_code: 200,
        message: "Successfully",
        data: getData,
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: "Server error: " + error.message,
        data: null,
      };
    }
  }

  static async sendYesterdayReport() {
    const data = await DataRepositories.getAllDataYesterday();

    const htmlTable = generateLogTable(data);

    const recipients = await EmailRepository.getAllEmail();
    console.log(recipients);

    if (recipients.length === 0) {
      console.log("Tidak ada email penerima aktif.");
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const htmlContent = `<p>Berikut laporan log tanggal <b>${dateStr}</b>:</p>
      ${htmlTable}
      <p>Untuk melihat data lebih lengkap, klik link berikut:</p>
      <p><a href="${process.env.APP_URL}/dashboard" target="_blank">${process.env.APP_URL}/dashboard</a></p>`;

    await EmailService.sendEmail(
      recipients,
      `Daily Log Report - ${dateStr}`,
      htmlContent
    );
  }

  static async getTrafficByFilter({ samId, filterType, filterValue }) {
    console.log(samId, filterType, filterValue);
    try {
      if (!samId) {
        return {
          status: false,
          status_code: 403,
          message: "SamId Required",
          data: null,
        };
      }

      const result = await DataRepositories.findByFilter({
        samId,
        filterType,
        filterValue,
      });

      return {
        status: true,
        status_code: 200,
        message: "Successfully",
        data: result,
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

module.exports = DataServices;
