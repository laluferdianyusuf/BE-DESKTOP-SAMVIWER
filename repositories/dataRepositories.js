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

  // static async findByFilter({ samId, startDate, endDate, filterType }) {
  //   const where = {
  //     samId,
  //     createdAt: {
  //       [Op.between]: [new Date(startDate), new Date(endDate)],
  //     },
  //   };

  //   let attributes = ["id", "samId", "speed", "createdAt"];

  //   if (filterType === "month") {
  //     attributes = [
  //       [fn("DATE_TRUNC", "month", col("createdAt")), "period"],
  //       [fn("AVG", col("speed")), "avgSpeed"],
  //     ];
  //   }

  //   if (filterType === "year") {
  //     attributes = [
  //       [fn("DATE_TRUNC", "year", col("createdAt")), "period"],
  //       [fn("AVG", col("speed")), "avgSpeed"],
  //     ];
  //   }

  //   const options = {
  //     where,
  //     order: [["createdAt", "ASC"]],
  //   };

  //   if (filterType !== "day") {
  //     options.attributes = attributes;
  //     options.group = ["period"];
  //   }

  //   return await TrafficData.findAll(options);
  // }

  static async findByFilter({ samId, filterType, filterValue }) {
    const whereCondition = {};

    if (samId) {
      whereCondition.samId = samId;
    }

    if (filterType && filterValue) {
      switch (filterType) {
        case "date":
          whereCondition.createdAt = {
            [Op.between]: [
              new Date(`${filterValue}T00:00:00.000Z`),
              new Date(`${filterValue}T23:59:59.999Z`),
            ],
          };
          break;

        case "day":
          whereCondition[Op.and] = [
            data.sequelize.where(
              data.sequelize.fn("DAY", data.sequelize.col("createdAt")),
              Number(filterValue)
            ),
          ];
          break;

        case "month":
          whereCondition[Op.and] = [
            data.sequelize.where(
              data.sequelize.fn("MONTH", data.sequelize.col("createdAt")),
              Number(filterValue)
            ),
          ];
          break;

        case "year":
          whereCondition[Op.and] = [
            data.sequelize.where(
              data.sequelize.fn("YEAR", data.sequelize.col("createdAt")),
              Number(filterValue)
            ),
          ];
          break;

        default:
          throw new Error("Filter type tidak valid");
      }
    }

    return data.findAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
      attributes: ["id", "speed", "createdAt"],
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

    // Buat waktu awal & akhir kemarin
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
