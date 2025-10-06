"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("data", "video", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.changeColumn("data", "localVideo", {
      type: Sequelize.TEXT,
      allowNull: true,
      after: "video",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("data", "video", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.changeColumn("data", "localVideo", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },
};
