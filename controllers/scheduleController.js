const ScheduleService = require("../services/scheduleServices");

const createSchedule = async (req, res) => {
  const { samIds, startTime, type } = req.body;
  const { status, status_code, message, data } =
    await ScheduleService.startSchedule({
      samIds,
      startTime,
      type,
    });

  res.status(status_code).send({
    status,
    status_code,
    message,
    data,
  });
};

const stopSchedule = async (req, res) => {
  const { samIds } = req.body;
  const { status, status_code, message, data } =
    await ScheduleService.stopSchedule({ samIds });

  res.status(status_code).send({
    status,
    status_code,
    message,
    data,
  });
};

const getAllSchedules = async (req, res) => {
  const { status, status_code, message, data } =
    await ScheduleService.listSchedules();

  res.status(status_code).send({
    status,
    status_code,
    message,
    data,
  });
};

const listActiveSchedules = async (req, res) => {
  const { status, status_code, message, data } =
    await ScheduleService.listActiveSchedules();

  res.status(status_code).send({
    status,
    status_code,
    message,
    data,
  });
};

const loadSchedules = async (req, res) => {
  const { status, status_code, message, data } =
    await ScheduleService.loadSchedules();

  res.status(status_code).send({
    status,
    status_code,
    message,
    data,
  });
};

module.exports = {
  createSchedule,
  stopSchedule,
  getAllSchedules,
  loadSchedules,
  listActiveSchedules,
};
