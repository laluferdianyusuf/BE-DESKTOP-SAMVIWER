"use strict";

const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const { JWT, CREDENTIAL } = require("../lib/const");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("admin12345", JWT.SALT_ROUND);

    await queryInterface.bulkInsert("Users", [
      {
        userId: uuidv4(),
        username: "adminSAM2",
        password: hashedPassword,
        credential: CREDENTIAL.SUPERADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Users", null, {});
  },
};
