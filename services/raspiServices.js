const RaspiRepositories = require("../repositories/raspiRepositories");
const DeviceRepositories = require("../repositories/deviceRepositories");
const DataRepositories = require("../repositories/dataRepositories");
const CameraRepositories = require("../repositories/cameraRepositories");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { pipeline } = require("stream/promises");
const { uploadToGCS } = require("../utils/gcs");

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

      const isConnected =
        raspiStatus?.status === "connected" && cameraStatus?.connected === true;

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
      const samFolder = path.join(LOCAL_SAVE_PATH, samId);
      if (!fs.existsSync(samFolder)) {
        fs.mkdirSync(samFolder, { recursive: true });
      }

      for (const item of result) {
        let categories = item.speed > speedLimit ? "over speed" : "normal";

        const existing = await DataRepositories.findOneVideo({
          videoUrl: item.videoUrl,
        });

        if (existing) {
          console.log(`Skip: ${item.videoUrl} sudah ada`);
          continue;
        }

        const fileName = `${Date.now()}_${path.basename(item.videoUrl)}`;
        const localPath = path.join(samFolder, fileName);

        const res = await axios({
          method: "get",
          url: item.videoUrl,
          responseType: "stream",
        });
        await pipeline(res.data, fs.createWriteStream(localPath));

        const gcsPath = `${samId}/${fileName}`;
        const gcsUrl = await uploadToGCS(localPath, gcsPath);

        const saveData = await DataRepositories.createVideo({
          deviceId: device.deviceId,
          samId: samId,
          speed: item.speed,
          video: gcsUrl,
          localVideo: `${LOCAL_SAVE_PATH}/videos/${samId}/${fileName}`,
          category: categories,
          createdAt: item.timestamp,
        });

        dataCollected.push(saveData);
      }

      return {
        status: true,
        status_code: 200,
        message: "Data collected and uploaded to cloud storage",
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
      const result = await RaspiRepositories.configureDevice({
        ip: device.deviceIP,
        config,
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
}

module.exports = RaspiServices;
