"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("locations", "samId");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("locations", "samId", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
