const UserDeviceService = require("../services/userDeviceServices");

const UserDeviceController = {
  async assignDeviceToUser(req, res) {
    const { userId, deviceId } = req.body;

    const { status, status_code, message, data } =
      await UserDeviceService.assignDeviceToUser({
        userId,
        deviceId,
      });

    res.status(status_code).send({
      status,
      status_code,
      message,
      data,
    });
  },

  async getDevicesByUser(req, res) {
    const { userId } = req.params;
    const { status, status_code, message, data } =
      await UserDeviceService.getDevicesByUser(userId);

    res.status(status_code).send({
      status,
      status_code,
      message,
      data,
    });
  },

  async removeDeviceFromUser(req, res) {
    const { userId, deviceId } = req.body;

    const { status, status_code, message, data } =
      await UserDeviceService.removeDeviceFromUser(userId, deviceId);

    res.status(status_code).send({
      status,
      status_code,
      message,
      data,
    });
  },

  async getUsersByDevice(req, res) {
    const { deviceId } = req.params;

    const { status, status_code, message, data } =
      await UserDeviceService.getUsersByDevice(deviceId);

    res.status(status_code).send({
      status,
      status_code,
      message,
      data,
    });
  },
};

module.exports = UserDeviceController;
