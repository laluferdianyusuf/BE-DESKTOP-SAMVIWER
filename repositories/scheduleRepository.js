const { Op } = require("sequelize");
const { schedule } = require("../models");

class ScheduleRepository {
  static async createSchedule({ samIds, startTime, type }) {
    return await schedule.create({
      samIds,
      startTime,
      type,
      isActive: true,
    });
  }

  static async getActiveSchedules(isActive = true) {
    return await schedule.findAll({
      where: {
        isActive,
      },
    });
  }

  static async getAllSchedules() {
    return await schedule.findAll();
  }

  static async findScheduleBySamIds(samIds) {
    return await schedule.findAll({
      where: {
        isActive: true,
        [Op.or]: samIds.map((samId) => ({
          samIds: { [Op.like]: `%${samId}%` },
        })),
      },
    });
  }

  static async updateSchedule(id, payload) {
    await schedule.update(payload, { where: { id } });
    return await schedule.findByPk(id);
  }

  static async stopSchedule({ id }) {
    await schedule.update({ isActive: false }, { where: { id: id } });
    return await schedule.findByPk(id);
  }
}

module.exports = ScheduleRepository;
