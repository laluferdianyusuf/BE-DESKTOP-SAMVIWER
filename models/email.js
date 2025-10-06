"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class email extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  email.init(
    {
      emailName: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "email",
    }
  );
  return email;
};
