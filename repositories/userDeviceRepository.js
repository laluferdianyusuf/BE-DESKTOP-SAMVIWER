const { Op } = require("sequelize");
const { users, device, user_device, data } = require("../models");

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
    return await user_device.destroy({
      where: {
        userId,
        deviceId: {
          [Op.in]: deviceId,
        },
      },
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

  async accessibleDevices({ userId }) {
    const user = await users.findByPk(userId);

    let accessibleDevices;

    if (user.credential === "Superadmin") {
      accessibleDevices = await device.findAll({
        attributes: ["deviceId", "samId"],
      });
    } else {
      accessibleDevices = await device.findAll({
        include: [
          {
            model: users,
            where: { userId: userId },
            through: { attributes: [] },
            attributes: [],
          },
        ],
        attributes: ["deviceId", "samId"],
      });
    }

    const deviceIds = accessibleDevices.map((d) => d.deviceId);

    if (deviceIds.length === 0) {
      return [];
    }

    // const dataRecords = await data.findAll({
    //   where: { deviceId: { [Op.in]: deviceIds } },
    //   attributes: ["deviceId", "samId", "speed", "category", "createdAt"],
    // });

    const result = accessibleDevices.map((dev) => {
      // const relatedData = dataRecords.filter(
      //   (d) => d.deviceId === dev.deviceId
      // );
      return {
        deviceId: dev.deviceId,
        samId: dev.samId,
      };
    });

    return result;
  },
};

module.exports = UserDeviceRepository;
