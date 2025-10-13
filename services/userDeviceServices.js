const DeviceRepositories = require("../repositories/deviceRepositories");
const UserDeviceRepository = require("../repositories/userDeviceRepository");
const UserRepositories = require("../repositories/userRepositories");

const UserDeviceService = {
  async assignDeviceToUser({ userId, deviceId }) {
    try {
      const device = await DeviceRepositories.existingDeviceId({ deviceId });
      const user = await UserRepositories.findOneUserId({ userId });

      if (!user || !device) {
        return {
          status: false,
          status_code: 404,
          message: `User with ID ${userId} or Device with ID ${deviceId} not found`,
          data: null,
        };
      }

      if (Array.isArray(deviceId)) {
        const result = [];

        for (const id of deviceId) {
          const relation = await UserDeviceRepository.assignDeviceToUser({
            userId,
            deviceId: id,
          });

          result.push(relation);
        }
        return {
          status: true,
          status_code: 201,
          message: `Device successfully assigned to user`,
          data: result,
        };
      } else {
        const relation = await UserDeviceRepository.assignDeviceToUser({
          userId,
          deviceId,
        });
        return {
          status: true,
          status_code: 201,
          message: `Device assigned successfully`,
          data: relation,
        };
      }
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: `Failed to assign device to user: ${error.message}`,
        data: null,
      };
    }
  },

  async getDevicesByUser(userId) {
    try {
      const user = await UserRepositories.findOneUserId({ userId });

      if (!user) {
        return {
          status: false,
          status_code: 404,
          message: `User with ID ${userId} not found`,
          data: null,
        };
      }

      const devices = await UserDeviceRepository.getDevicesByUser(userId);

      return {
        status: true,
        status_code: 200,
        message: `Devices fetched successfully for user ID ${userId}`,
        data: devices,
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: `Failed to fetch devices: ${error.message}`,
        data: null,
      };
    }
  },

  async removeDeviceFromUser({ userId, deviceId }) {
    try {
      const deletedCount = await UserDeviceRepository.removeDeviceFromUser({
        userId,
        deviceId,
      });

      if (deletedCount === 0) {
        return {
          status: false,
          status_code: 404,
          message: `No relations found for User ${userId} with provided device(s)`,
          data: null,
        };
      }

      return {
        status: true,
        status_code: 200,
        message: `Successfully removed ${deletedCount} device(s) from user ${userId}`,
        data: {
          userId,
          deviceId,
          deletedCount,
        },
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: `Failed to remove device(s) from user: ${error.message}`,
        data: null,
      };
    }
  },
  async getUsersByDevice(deviceId) {
    try {
      const device = await DeviceRepositories.existingDeviceId({ deviceId });

      if (!device) {
        return {
          status: false,
          status_code: 404,
          message: `Device with ID ${deviceId} not found`,
          data: null,
        };
      }

      const users = await UserDeviceRepository.getUsersByDevice(deviceId);

      return {
        status: true,
        status_code: 200,
        message: `Users fetched successfully for device ID ${deviceId}`,
        data: users,
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: `Failed to fetch users by device: ${error.message}`,
        data: null,
      };
    }
  },
};

module.exports = UserDeviceService;
