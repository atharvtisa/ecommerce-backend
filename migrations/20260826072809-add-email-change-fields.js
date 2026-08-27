"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "admins",
      "email_change_otp",
      {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
    );

    await queryInterface.addColumn(
      "admins",
      "email_change_otp_expires_at",
      {
        type: Sequelize.DATE,
        allowNull: true,
      },
    );

    await queryInterface.addColumn(
      "admins",
      "pending_email",
      {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      "admins",
      "pending_email",
    );

    await queryInterface.removeColumn(
      "admins",
      "email_change_otp_expires_at",
    );

    await queryInterface.removeColumn(
      "admins",
      "email_change_otp",
    );
  },
};