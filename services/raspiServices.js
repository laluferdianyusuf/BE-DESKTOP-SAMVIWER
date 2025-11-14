const RaspiRepositories = require("../repositories/raspiRepositories");
const DeviceRepositories = require("../repositories/deviceRepositories");
const DataRepositories = require("../repositories/dataRepositories");
const CameraRepositories = require("../repositories/cameraRepositories");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { pipeline } = require("stream/promises");
const { uploadToGCS } = require("../utils/gcs");
const LogsServices = require("./logServices");

const LOCAL_SAVE_PATH = "D:/VideosRaspi";

class RaspiServices {
  static async connectToRaspi({ samId }) {
    const device = await DeviceRepositories.existingDevice({ samId });

    if (!device) {
      return {
        status: false,
        status_code: 404,
        message: "Device not found",
        data: null,
      };
    }

    try {
      const raspiStatus = await RaspiRepositories.checkConnection({
        ip: device.deviceIP,
      });

      const cameraStatus = await CameraRepositories.checkConnection({
        ip: device.cameraIP,
      });

      const isConnected = raspiStatus?.status === "connected";

      await LogsServices.createLog({
        activity: `Device ${
          isConnected ? "Connection successful" : "Connection failed"
        }`,
      });
      return {
        status: isConnected,
        status_code: 200,
        message: isConnected ? "Connection successful" : "Connection failed",
        data: {
          raspi: raspiStatus,
          camera: cameraStatus,
        },
      };
    } catch (error) {
      await LogsServices.createLog({
        activity: `Device error ${error.message}`,
      });
      return {
        status: false,
        status_code: 500,
        message: error.message,
        data: null,
      };
    }
  }
  static async collectData({ samId }) {
    const device = await DeviceRepositories.existingDevice({ samId });
    if (!device) {
      return {
        status: false,
        status_code: 404,
        message: "Device not found",
        data: null,
      };
    }

    const connection = await this.connectToRaspi({ samId });
    if (!connection.status) {
      return {
        status: false,
        status_code: 503,
        message: "Device not connected. Please connect first.",
        data: null,
      };
    }

    try {
      const configResult = await RaspiRepositories.getConfig({
        ip: device.deviceIP,
      });
      const speedLimit = Number(configResult?.speed_limit);

      const result = await RaspiRepositories.collectData({
        ip: device.deviceIP,
      });

      const dataCollected = [];
      const samFolder = path.join(
        LOCAL_SAVE_PATH,
        device.deviceRootFolder,
        samId
      );
      console.log("Saving video to:", samFolder);

      if (!fs.existsSync(samFolder))
        fs.mkdirSync(samFolder, { recursive: true });

      for (const item of result) {
        const categories = item.speed >= speedLimit ? "over speed" : "normal";

        const existing = await DataRepositories.findOneVideo({
          videoUrl: item.videoUrl || "",
        });
        if (existing) {
          console.log(`Skip duplicate: ${item.videoUrl}`);
          continue;
        }

        let gcsUrl = "tidak ada url";
        let localPath = "tidak ada file";

        if (item.videoUrl && /^https?:\/\//.test(item.videoUrl)) {
          try {
            const fileName = `${Date.now()}_${path.basename(item.videoUrl)}`;
            const fullLocalPath = path.join(samFolder, fileName);

            const res = await axios({
              method: "get",
              url: item.videoUrl,
              responseType: "stream",
            });
            await pipeline(res.data, fs.createWriteStream(fullLocalPath));
            localPath = `/videos/${samId}/${fileName}`;

            const gcsPath = `${samId}/${fileName}`;
            gcsUrl = await uploadToGCS(fullLocalPath, gcsPath);
          } catch (error) {
            console.error(
              `Download/upload failed for ${item.videoUrl}:`,
              error.message
            );
            gcsUrl = "tidak ada url";
            localPath = "tidak ada file";
          }
        }

        const saveData = await DataRepositories.createVideo({
          deviceId: device.deviceId,
          samId,
          speed: item.speed,
          video: gcsUrl,
          localVideo: localPath,
          category: categories,
          createdAt: item.timestamp,
        });

        dataCollected.push(saveData);
      }

      await LogsServices.createLog({
        activity: `Collected ${dataCollected.length} logs and videos from device ${samId}`,
      });

      return {
        status: true,
        status_code: 200,
        message: "All logs saved to database, video or not",
        data: dataCollected,
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: error.message,
        data: null,
      };
    }
  }

  static async configureRaspi({ samId, config }) {
    const device = await DeviceRepositories.existingDevice({ samId });

    if (!device) {
      return {
        status: false,
        status_code: 404,
        message: "Device not found",
        data: null,
      };
    }

    const connection = await this.connectToRaspi({ samId });
    if (!connection.status) {
      return {
        status: false,
        status_code: 503,
        message: "Device not connected. Please connect first.",
        data: null,
      };
    }

    try {
      const configResult = await RaspiRepositories.getConfig({
        ip: device.deviceIP,
      });
      const speedLimit = Number(configResult?.speed_limit);
      const result = await RaspiRepositories.configureDevice({
        ip: device.deviceIP,
        config: {
          speed_limit: config.speed_limit,
          record: config.record || configResult?.record,
        },
      });
      await LogsServices.createLog({
        activity: `Configure speed threshold ${samId} from ${speedLimit} to ${config}`,
      });
      return {
        status: true,
        status_code: 200,
        message: "Configuration updated",
        data: result,
      };
    } catch (error) {
      console.log(error);

      return {
        status: false,
        status_code: 500,
        message: error.message,
        data: null,
      };
    }
  }

  static async getConfig({ samId }) {
    const device = await DeviceRepositories.existingDevice({ samId });

    if (!device) {
      return {
        status: false,
        status_code: 404,
        message: "Device not found",
        data: null,
      };
    }

    const connection = await this.connectToRaspi({ samId });
    if (!connection.status) {
      return {
        status: false,
        status_code: 503,
        message: "Device not connected. Please connect first.",
        data: null,
      };
    }
    try {
      const getConfig = await RaspiRepositories.getConfig({
        ip: device.deviceIP,
      });

      return {
        status: true,
        status_code: 200,
        message: "Config retrieved successfully",
        data: getConfig,
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: error.message,
        data: null,
      };
    }
  }

  static async getAllFileJson({ samId }) {
    const device = await DeviceRepositories.existingDevice({ samId });

    if (!device) {
      return {
        status: false,
        status_code: 404,
        message: "Device not found",
        data: null,
      };
    }

    const connection = await this.connectToRaspi({ samId });
    if (!connection.status) {
      return {
        status: false,
        status_code: 503,
        message: "Device not connected. Please connect first.",
        data: null,
      };
    }
    try {
      const getConfig = await RaspiRepositories.getJsonFile({
        ip: device.deviceIP,
      });

      return {
        status: true,
        status_code: 200,
        message: "Json retrieved successfully",
        data: getConfig,
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: error.message,
        data: null,
      };
    }
  }

  static async getFileJson({ samId, filename }) {
    const device = await DeviceRepositories.existingDevice({ samId });

    if (!device) {
      return {
        status: false,
        status_code: 404,
        message: "Device not found",
        data: null,
      };
    }

    const connection = await this.connectToRaspi({ samId });
    if (!connection.status) {
      return {
        status: false,
        status_code: 503,
        message: "Device not connected. Please connect first.",
        data: null,
      };
    }
    try {
      const configResult = await RaspiRepositories.getConfig({
        ip: device.deviceIP,
      });
      const speedLimit = Number(configResult?.speed_limit);

      const result = await RaspiRepositories.getJsonFilename({
        ip: device.deviceIP,
        filename,
      });
      const dataResult = (Array.isArray(result.data) && result.data) || [];

      const dataCollected = [];
      const samFolder = path.join(
        LOCAL_SAVE_PATH,
        device.deviceRootFolder,
        samId
      );
      if (!fs.existsSync(samFolder))
        fs.mkdirSync(samFolder, { recursive: true });

      for (const item of dataResult) {
        const categories = item.speed >= speedLimit ? "over speed" : "normal";

        const existing = await DataRepositories.findOneVideo({
          videoUrl: item.videoUrl || "",
        });
        if (existing) {
          console.log(`Skip duplicate: ${item.videoUrl}`);
          continue;
        }

        let gcsUrl = "tidak ada url";
        let localPath = "tidak ada file";

        if (item.videoUrl && /^https?:\/\//.test(item.videoUrl)) {
          try {
            const fileName = `${Date.now()}_${path.basename(item.videoUrl)}`;
            const fullLocalPath = path.join(samFolder, fileName);

            const res = await axios({
              method: "get",
              url: item.videoUrl,
              responseType: "stream",
            });
            await pipeline(res.data, fs.createWriteStream(fullLocalPath));
            localPath = `/videos/${samId}/${fileName}`;

            const gcsPath = `${samId}/${fileName}`;
            gcsUrl = await uploadToGCS(fullLocalPath, gcsPath);
          } catch (error) {
            gcsUrl = "tidak ada url";
            localPath = "tidak ada file";
          }
        }

        const saveData = await DataRepositories.createVideo({
          deviceId: device.deviceId,
          samId,
          speed: item.speed,
          video: gcsUrl,
          localVideo: localPath,
          category: categories,
          createdAt: item.timestamp,
        });

        dataCollected.push(saveData);
      }

      await LogsServices.createLog({
        activity: `Collected ${dataCollected.length} logs and videos from device ${samId} using manual insert`,
      });

      return {
        status: true,
        status_code: 200,
        message: "All logs saved to database, video or not",
        data: dataCollected,
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: error.message,
        data: null,
      };
    }
  }
}

module.exports = RaspiServices;
