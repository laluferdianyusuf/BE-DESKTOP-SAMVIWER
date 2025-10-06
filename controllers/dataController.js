const dataServices = require("../services/dataServices");

const createVideo = async (req, res) => {
  const { samId } = req.params;
  const { speed } = req.body;
  const video = req.file;
  const { status, status_code, message, data } = await dataServices.createVideo(
    {
      samId: samId,
      video: video,
      speed: speed,
    }
  );

  res.status(status_code).send({
    status: status,
    status_code: status_code,
    message: message,
    data: data,
  });
};

const getSpeedByCategory = async (req, res) => {
  const { category } = req.query;
  const { status, status_code, message, data } =
    await dataServices.getSpeedByCategory({
      category: category,
    });

  res.status(status_code).send({
    status: status,
    status_code: status_code,
    message: message,
    data: data,
  });
};

const filterData = async (req, res) => {
  const { samId } = req.params;
  const { minSpeed, maxSpeed, startDate, endDate, category } = req.query;
  const { status, status_code, message, data } = await dataServices.findData({
    samId,
    minSpeed,
    maxSpeed,
    startDate,
    endDate,
    category,
  });

  res.status(status_code).send({
    status: status,
    status_code: status_code,
    message: message,
    data: data,
  });
};
const getAllData = async (req, res) => {
  const { samId } = req.params;
  const { status, status_code, message, data } = await dataServices.getAllData({
    samId,
  });

  res.status(status_code).send({
    status: status,
    status_code: status_code,
    message: message,
    data: data,
  });
};

module.exports = { createVideo, getSpeedByCategory, filterData, getAllData };
