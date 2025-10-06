"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("data", "localVideo", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "video",
      comment: "Path lokal file video (disimpan di laptop/server lokal)",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("data", "localVideo");
  },
};
