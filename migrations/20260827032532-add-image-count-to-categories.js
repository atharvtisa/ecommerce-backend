"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add the new column
    await queryInterface.addColumn(
      "categories",
      "image_count",
      {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
    );

    // IMPORTANT:
    // Fill image_count for categories that already exist
    await queryInterface.sequelize.query(`
      UPDATE categories
      SET image_count = JSON_LENGTH(images)
      WHERE images IS NOT NULL
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      "categories",
      "image_count",
    );
  },
};