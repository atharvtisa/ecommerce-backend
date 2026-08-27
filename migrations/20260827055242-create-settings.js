"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("settings", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      store_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
        defaultValue: "",
      },

      store_email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        defaultValue: "",
      },

      store_phone: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: "",
      },

      store_address: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: "",
      },

      currency: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: "INR",
      },

      store_logo: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      favicon: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      facebook_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },

      instagram_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },

      whatsapp_number: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },

      store_description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      footer_text: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("settings");
  },
};