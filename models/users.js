"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      users.belongsToMany(models.device, {
        through: "user_devices",
        foreignKey: "userId",
        otherKey: "deviceId",
      });
    }
  }
  users.init(
    {
      userId: DataTypes.STRING,
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      credential: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "users",
    }
  );
  return users;
};
