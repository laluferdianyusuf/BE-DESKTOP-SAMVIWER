const { location } = require("../models");

class LocationRepository {
  static async createLocation({ samId, loc }) {
    return await location.create({ samId: samId, location: loc });
  }

  static async getAllLocation() {
    return await location.findAll({
      order: [["samId", "ASC"]],
    });
  }

  static async getBySamId({ samId }) {
    return await location.findOne({
      where: {
        samId: samId,
      },
    });
  }

  static async updateLocation({ samId }) {
    await location.update({
      where: {
        samId: samId,
      },
    });

    return await location.findByPk(samId);
  }

  static async deleteLocation({ samId }) {
    await location.destroy({
      where: {
        samId: samId,
      },
    });

    return await location.findByPk(samId);
  }
}

module.exports = LocationRepository;
