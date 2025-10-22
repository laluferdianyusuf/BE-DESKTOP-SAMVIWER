"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("devices", "deviceUsername");
    await queryInterface.removeColumn("devices", "cameraUsername");
    await queryInterface.removeColumn("devices", "cameraPassword");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("devices", "deviceUsername", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("devices", "cameraUsername", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("devices", "cameraPassword", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
