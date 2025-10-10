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

  static async updateLocation({ samId, loc }) {
    await location.update({ location: loc }, { where: { samId } });

    return await location.findOne({ where: { samId } });
  }

  static async deleteLocation({ samId }) {
    const deleted = await location.destroy({
      where: { samId },
    });

    return deleted > 0;
  }
}

module.exports = LocationRepository;
