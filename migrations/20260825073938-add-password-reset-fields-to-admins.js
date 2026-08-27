"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("admins", "reset_otp", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn("admins", "reset_otp_expires_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("admins", "reset_otp_verified", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });


    
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      "admins",
      "reset_otp_verified",
    );

    await queryInterface.removeColumn(
      "admins",
      "reset_otp_expires_at",
    );

    await queryInterface.removeColumn(
      "admins",
      "reset_otp",
    );
  },
};