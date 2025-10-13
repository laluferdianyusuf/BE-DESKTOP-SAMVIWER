"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class user_device extends Model {
    static associate(models) {
      user_device.belongsTo(models.users, {
        foreignKey: "userId",
        targetKey: "userId",
        as: "user",
      });

      user_device.belongsTo(models.device, {
        foreignKey: "deviceId",
        targetKey: "deviceId",
        as: "device",
      });
    }
  }
  user_device.init(
    {
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deviceId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "user_device",
    }
  );
  return user_device;
};
