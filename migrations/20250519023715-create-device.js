"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("devices", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      deviceId: {
        type: Sequelize.STRING,
      },
      samId: {
        type: Sequelize.STRING,
      },
      deviceIP: {
        type: Sequelize.STRING,
      },
      deviceUsername: {
        type: Sequelize.STRING,
      },
      deviceRootFolder: {
        type: Sequelize.STRING,
      },
      cameraIP: {
        type: Sequelize.STRING,
      },
      cameraUsername: {
        type: Sequelize.STRING,
      },
      cameraPassword: {
        type: Sequelize.STRING,
      },
      cameraRootFolder: {
        type: Sequelize.STRING,
      },
      cameraType: {
        type: Sequelize.STRING,
      },
      location: {
        type: Sequelize.STRING,
      },
      utc: {
        type: Sequelize.BOOLEAN,
      },
      timezone: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("devices");
  },
};
