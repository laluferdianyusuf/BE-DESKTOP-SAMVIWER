const { location } = require("../models");

class LocationRepository {
  static async createLocation({ loc }) {
    return await location.create({ location: loc });
  }

  static async getAllLocation() {
    return await location.findAll({
      order: [["location", "ASC"]],
    });
  }

  static async getById({ id }) {
    return await location.findOne({
      where: {
        id: id,
      },
    });
  }

  static async getByLocation({ loc }) {
    return await location.findOne({
      where: {
        location: loc,
      },
    });
  }

  static async updateLocation({ id, loc }) {
    await location.update({ location: loc }, { where: { id } });

    return await location.findOne({ where: { id } });
  }

  static async deleteLocation({ id }) {
    const deleted = await location.destroy({
      where: { id },
    });

    return deleted > 0;
  }
}

module.exports = LocationRepository;
