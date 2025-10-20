const { Op, fn, col } = require("sequelize");
const { data, device } = require("../models");

class DataRepositories {
  static async getSpeedByCategory({ category }) {
    const getCategory = await data.findAll({
      where: { category: category },
      include: [
        {
          model: device,
          as: "device",
          attributes: [
            "deviceIP",
            "deviceUsername",
            "cameraIP",
            "cameraUsername",
            "cameraType",
            "location",
          ],
        },
      ],
    });
    return getCategory;
  }

  static async createVideo({
    deviceId,
    samId,
    speed,
    video,
    localVideo,
    category,
    createdAt,
  }) {
    const createVideo = await data.create({
      video: video,
      localVideo: localVideo,
      samId: samId,
      deviceId: deviceId,
      speed: speed,
      category: category,
      createdAt: createdAt,
    });
    return createVideo;
  }

  static async findOneVideo({ videoUrl }) {
    const findVideo = await data.findOne({ where: { video: videoUrl } });
    return findVideo;
  }

  static async findByFilter({ samId, filterType, filterValue }) {
    const whereCondition = {};

    if (samId) {
      whereCondition.samId = samId;
    }

    if (filterType && filterValue) {
      let startDate, endDate;

      if (filterType === "day") {
        startDate = new Date(`${filterValue}T00:00:00`);
        endDate = new Date(`${filterValue}T23:59:59`);
      } else if (filterType === "month") {
        const [year, month] = filterValue.split("-");
        startDate = new Date(Number(year), Number(month) - 1, 1, 0, 0, 0);
        endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);
      } else if (filterType === "year") {
        const year = Number(filterValue);
        startDate = new Date(year, 0, 1, 0, 0, 0);
        endDate = new Date(year, 11, 31, 23, 59, 59);
      }

      whereCondition.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    }

    return data.findAll({
      where: whereCondition,
      order: [["createdAt", "ASC"]],
      attributes: ["id", "samId", "speed", "createdAt"],
    });
  }

  static async findData({
    samId,
    minSpeed,
    maxSpeed,
    startDate,
    endDate,
    category,
  }) {
    const where = {};

    if (samId) {
      where.samId = samId;
    }

    if (minSpeed !== undefined && maxSpeed !== undefined) {
      where.speed = { [Op.gte]: minSpeed, [Op.lte]: maxSpeed };
    } else if (minSpeed !== undefined) {
      where.speed = { [Op.gte]: minSpeed };
    } else if (maxSpeed !== undefined) {
      where.speed = { [Op.lte]: maxSpeed };
    }

    if (startDate && endDate) {
      where.createdAt = { [Op.gte]: startDate, [Op.lte]: endDate };
    } else if (startDate) {
      where.createdAt = { [Op.gte]: startDate };
    } else if (endDate) {
      where.createdAt = { [Op.lte]: endDate };
    }

    if (category && category !== "all") {
      where.category = category;
    }

    return await data.findAll({ where });
  }

  static async getAllData({ samId }) {
    return await data.findAll({ where: { samId: samId } });
  }

  static async getAllDataByTime({ startDate, endDate }) {
    return await data.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      order: [["createdAt", "ASC"]],
    });
  }

  static async getAllDataYesterday() {
    const now = new Date();

    const yesterdayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1,
      0,
      0,
      0,
      0
    );
    const yesterdayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1,
      23,
      59,
      59,
      999
    );

    return await data.findAll({
      where: {
        createdAt: {
          [Op.between]: [yesterdayStart, yesterdayEnd],
        },
      },
      order: [["createdAt", "ASC"]],
    });
  }
}
module.exports = DataRepositories;
