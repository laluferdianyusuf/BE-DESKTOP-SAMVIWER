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

  static async createVideo({ deviceId, samId, speed, video, category }) {
    const createVideo = await data.create({
      video: video,
      samId: samId,
      deviceId: deviceId,
      speed: speed,
      category: category,
    });
    return createVideo;
  }
}
module.exports = DataRepositories;
