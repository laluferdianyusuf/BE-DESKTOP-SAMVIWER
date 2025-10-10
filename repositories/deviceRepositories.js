const { where } = require("sequelize");
const { device } = require("../models");

class DeviceRepositories {
  static async addDevice({
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
    return await device.create({
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
    return await device.update(
      {
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
      },
      { where: { deviceId: deviceId } }
    );
  }
  static async existingDevice({ samId }) {
    return await device.findOne({ where: { samId: samId } });
  }

  static async existingDeviceId({ deviceId }) {
    return await device.findOne({
      where: { deviceId: deviceId },
    });
  }

  static async getAllDevice() {
    return await device.findAll();
  }

  static async deleteDevice({ samId }) {
    return await device.destroy({
      where: { samId: samId },
    });
  }
}
module.exports = DeviceRepositories;
