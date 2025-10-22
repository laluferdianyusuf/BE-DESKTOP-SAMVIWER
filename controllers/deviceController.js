const DeviceServices = require("../services/deviceServices");

const addDevice = async (req, res) => {
  const {
    samId,
    deviceIP,
    deviceRootFolder,
    cameraIP,
    cameraRootFolder,
    cameraType,
    location,
    utc,
    timezone,
  } = req.body;
  const { status, status_code, message, data } = await DeviceServices.addDevice(
    {
      samId,
      deviceIP,
      deviceRootFolder,
      cameraIP,
      cameraRootFolder,
      cameraType,
      location,
      utc,
      timezone,
    }
  );
  res.status(status_code).send({
    status,
    status_code,
    message,
    data,
  });
};
const updateDevice = async (req, res) => {
  const { deviceId } = req.params;
  const {
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
  } = req.body;

  const { status, status_code, message, data } =
    await DeviceServices.updateDevice({
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

  res.status(status_code).send({
    status,
    status_code,
    message,
    data,
  });
};
const deletedDevice = async (req, res) => {
  const { samId } = req.params;

  const { status, status_code, message, data } =
    await DeviceServices.deleteDevice({ samId: samId });

  res.status(status_code).send({
    status,
    status_code,
    message,
    data,
  });
};
const getAllDevice = async (req, res) => {
  const { status, status_code, message, data } =
    await DeviceServices.getAllDevice();
  res.status(status_code).send({
    status,
    status_code,
    message,
    data,
  });
};

module.exports = {
  addDevice,
  updateDevice,
  deletedDevice,
  getAllDevice,
};
