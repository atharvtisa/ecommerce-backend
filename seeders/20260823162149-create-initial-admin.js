"use strict";

require("dotenv").config();

const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface) {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || "Admin";

    if (!email || !password) {
      throw new Error(
        "ADMIN_EMAIL and ADMIN_PASSWORD must be configured in .env",
      );
    }

    const existingAdmin = await queryInterface.sequelize.query(
      "SELECT id FROM admins WHERE email = :email LIMIT 1",
      {
        replacements: { email },
        type: queryInterface.sequelize.QueryTypes.SELECT,
      },
    );

    if (existingAdmin.length > 0) {
      console.log("Admin already exists. Skipping creation.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await queryInterface.bulkInsert("admins", [
      {
        name,
        email,
        password: hashedPassword,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    console.log("Initial admin created successfully.");
  },

  async down(queryInterface) {
    const email = process.env.ADMIN_EMAIL;

    if (!email) {
      return;
    }

    await queryInterface.bulkDelete("admins", {
      email,
    });
  },
};