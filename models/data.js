"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class data extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      data.belongsTo(models.device, {
        foreignKey: "deviceId",
        as: "device",
        targetKey: "deviceId",
      });
      data.belongsTo(models.device, {
        foreignKey: "samId",
        as: "samDevice",
        targetKey: "samId",
      });
    }
  }
  data.init(
    {
      speed: DataTypes.FLOAT,
      video: DataTypes.TEXT,
      localVideo: DataTypes.TEXT,
      deviceId: DataTypes.STRING,
      samId: DataTypes.STRING,
      category: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "data",
    }
  );
  return data;
};
