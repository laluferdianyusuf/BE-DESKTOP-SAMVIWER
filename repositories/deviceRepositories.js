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
    const addDevice = await device.create({
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
    return addDevice;
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
    const updateDevice = await device.update(
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
    return updateDevice;
  }
  static async existingDevice({ samId }) {
    const existingDevice = await device.findOne({ where: { samId: samId } });
    return existingDevice;
  }

  static async existingDeviceId({ deviceId }) {
    const existingDevice = await device.findOne({
      where: { deviceId: deviceId },
    });
    return existingDevice;
  }

  static async getAllDevice() {
    const getAllDevice = await device.findAll();
    return getAllDevice;
  }

  static async deleteDevice({ samId }) {
    const deletedDevice = await device.destroy({
      where: { samId: samId },
    });
    return deletedDevice;
  }
}
module.exports = DeviceRepositories;
