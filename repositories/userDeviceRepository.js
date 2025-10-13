const { users, device, user_device } = require("../models");

const UserDeviceRepository = {
  async assignDeviceToUser({ userId, deviceId }) {
    return await user_device.create({ userId, deviceId });
  },

  async getDevicesByUser(userId) {
    return await users.findByPk(userId, {
      include: [
        {
          model: device,
          through: { attributes: [] },
        },
      ],
    });
  },

  async removeDeviceFromUser({ userId, deviceId }) {
    return await user_devices.destroy({
      where: { userId, deviceId },
    });
  },

  async getUsersByDevice(deviceId) {
    return await device.findByPk(deviceId, {
      include: [
        {
          model: users,
          through: { attributes: [] },
        },
      ],
    });
  },
};

module.exports = UserDeviceRepository;
