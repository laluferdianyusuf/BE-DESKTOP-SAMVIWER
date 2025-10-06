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
  const { id } = req.params;
  const { status, status_code, message, data } =
    await ScheduleService.stopSchedule(id);

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

module.exports = {
  createSchedule,
  stopSchedule,
  getAllSchedules,
};
