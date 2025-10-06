const { Logger } = require("sequelize/lib/utils/logger");
const DeviceRepositories = require("../repositories/deviceRepositories");
const { v4: uuidv4 } = require("uuid");

class DeviceServices {
  static async addDevice({
    samId,
    deviceIP,
    deviceUsername,
    deviceRootFolder,
    cameraIP,
    cameraUsername,
    cameraPassword,
    cameraRootFolder,
    cameraType,
    location,
  }) {
    try {
      if (
        !samId ||
        !deviceIP ||
        !deviceUsername ||
        !deviceRootFolder ||
        !cameraIP ||
        !cameraUsername ||
        !cameraPassword ||
        !cameraRootFolder ||
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

      console.log(deviceIP);

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
        deviceUsername,
        deviceRootFolder,
        cameraIP,
        cameraUsername,
        cameraPassword,
        cameraRootFolder,
        cameraType,
        location,
      });
      return {
        status: true,
        status_code: 201,
        message: "device successfully added",
        data: { device: addDevice },
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
  static async updateDevice({
    deviceId,
    samId,
    deviceIP,
    deviceUsername,
    deviceRootFolder,
    cameraIP,
    cameraUsername,
    cameraPassword,
    cameraRootFolder,
    cameraType,
    location,
  }) {
    try {
      const getDevice = await DeviceRepositories.existingDeviceId({
        deviceId: deviceId,
      });
      if (!getDevice) {
        return {
          status: false,
          status_code: 401,
          message: "Can't find device",
          data: { device: null },
        };
      }
      const updateDevice = await DeviceRepositories.updateDevice({
        deviceId,
        samId,
        deviceIP,
        deviceUsername,
        deviceRootFolder,
        cameraIP,
        cameraUsername,
        cameraPassword,
        cameraRootFolder,
        cameraType,
        location,
      });
      return {
        status: true,
        status_code: 200,
        message: "Device updated successfully",
        data: { device: updateDevice },
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
}
module.exports = DeviceServices;
