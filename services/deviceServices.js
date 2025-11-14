const { Logger } = require("sequelize/lib/utils/logger");
const DeviceRepositories = require("../repositories/deviceRepositories");
const { v4: uuidv4 } = require("uuid");
const { default: checkDiskSpace } = require("check-disk-space");
const os = require("os");
const DataRepositories = require("../repositories/dataRepositories");
class DeviceServices {
  static async addDevice({
    samId,
    deviceIP,
    deviceRootFolder,
    cameraIP,
    cameraType,
    location,
    utc,
    timezone,
  }) {
    try {
      if (
        !samId ||
        !deviceIP ||
        !deviceRootFolder ||
        !cameraIP ||
        !cameraType ||
        !location
      ) {
        return {
          status: false,
          status_code: 400,
          message: "Fields are required",
          data: { device: null },
        };
      }

      const existingDevice = await DeviceRepositories.existingDevice({
        samId,
      });
      if (existingDevice) {
        return {
          status: false,
          status_code: 400,
          message: "Device has been added",
          data: { device: null },
        };
      }
      const addDevice = await DeviceRepositories.addDevice({
        deviceId: uuidv4(),
        samId,
        deviceIP,
        deviceRootFolder,
        cameraIP,
        cameraType,
        location,
        utc,
        timezone,
      });
      return {
        status: true,
        status_code: 201,
        message: "device successfully added",
        data: { device: addDevice },
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: error,
        data: { device: null },
      };
    }
  }
  static async updateDevice({
    deviceId,
    samId,
    deviceIP,
    deviceRootFolder,
    cameraIP,
    cameraType,
    cameraRootFolder,
    location,
    utc,
    timezone,
  }) {
    try {
      const getDevice = await DeviceRepositories.existingDeviceId({ deviceId });
      if (!getDevice) {
        return {
          status: false,
          status_code: 404,
          message: "Can't find device",
          data: { device: null },
        };
      }

      const keepOld = (value, oldValue) => {
        if (value === undefined || value === null) return oldValue;
        if (typeof value === "string" && value.trim() === "") return oldValue;
        return value;
      };

      const newSamId = samId && samId.trim() !== "" ? samId : getDevice.samId;

      const updateData = {
        deviceId,
        samId: newSamId,
        deviceIP: keepOld(deviceIP, getDevice.deviceIP),
        deviceRootFolder: keepOld(deviceRootFolder, getDevice.deviceRootFolder),
        cameraIP: keepOld(cameraIP, getDevice.cameraIP),
        cameraRootFolder: keepOld(cameraRootFolder, getDevice.cameraRootFolder),
        cameraType: keepOld(cameraType, getDevice.cameraType),
        location: keepOld(location, getDevice.location),
        utc: keepOld(utc, getDevice.utc),
        timezone: keepOld(timezone, getDevice.timezone),
      };

      const toUpdate = {};
      Object.keys(updateData).forEach((k) => {
        if (k === "deviceId") return;
        if (updateData[k] !== getDevice[k]) toUpdate[k] = updateData[k];
      });

      const updateDevice = await DeviceRepositories.updateDevice({
        deviceId,
        ...toUpdate,
      });

      if (newSamId !== getDevice.samId) {
        await DataRepositories.updateData({
          oldSamId: getDevice.samId,
          newSamId: newSamId,
        });
      }

      return {
        status: true,
        status_code: 200,
        message: "Device updated successfully",
        data: { device: updateDevice },
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: error.message || error,
        data: { device: null },
      };
    }
  }

  static async deleteDevice({ samId }) {
    try {
      const getDevice = await DeviceRepositories.existingDevice({ samId });

      if (!getDevice) {
        return {
          status: false,
          status_code: 401,
          message: "Can't find device to delete",
          data: { device: null },
        };
      }
      const deletedDevice = await DeviceRepositories.deleteDevice({ samId });
      return {
        status: true,
        status_code: 200,
        message: "Successfully deleted device",
        data: { device: deletedDevice },
      };
    } catch (error) {
      console.log(error);
      return {
        status: false,
        status_code: 500,
        message: error,
        data: { device: null },
      };
    }
  }
  static async getAllDevice() {
    try {
      const getAllDevice = await DeviceRepositories.getAllDevice();

      if (getAllDevice) {
        return {
          status: true,
          status_code: 201,
          message: "Successfully get all device",
          data: { device: getAllDevice },
        };
      }
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: error,
        data: { device: null },
      };
    }
  }

  static async getSystemDiskSpace(drivePath = "/") {
    try {
      const diskSpace = await checkDiskSpace(drivePath);

      const total = diskSpace.size;
      const free = diskSpace.free;
      const used = total - free;
      const usedPercent = ((used / total) * 100).toFixed(2);
      const availablePercent = ((free / total) * 100).toFixed(2);

      return {
        status: true,
        status_code: 200,
        message: "Successfully retrieved disk space information",
        data: {
          path: drivePath,
          total: DeviceServices.formatBytes(total),
          used: DeviceServices.formatBytes(used),
          free: DeviceServices.formatBytes(free),
          usedPercent: `${usedPercent}%`,
          availablePercent: `${availablePercent}%`,
        },
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

  static formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
module.exports = DeviceServices;
