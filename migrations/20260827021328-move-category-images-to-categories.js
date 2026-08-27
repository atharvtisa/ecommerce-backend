"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add images column to categories
    await queryInterface.addColumn(
      "categories",
      "images",
      {
        type: Sequelize.JSON,
        allowNull: true,
      },
    );

    // 2. Read existing category images
    const existingImages =
      await queryInterface.sequelize.query(
        `
        SELECT category_id, image
        FROM category_images
        ORDER BY id ASC
        `,
        {
          type: Sequelize.QueryTypes.SELECT,
        },
      );

    // 3. Group images by category
    const groupedImages = {};

    for (const row of existingImages) {
      const categoryId = row.category_id;

      if (!groupedImages[categoryId]) {
        groupedImages[categoryId] = [];
      }

      groupedImages[categoryId].push(
        row.image,
      );
    }

    // 4. Move images into categories table
    for (const [categoryId, images] of Object.entries(
      groupedImages,
    )) {
      await queryInterface.bulkUpdate(
        "categories",
        {
          images: JSON.stringify(images),
        },
        {
          id: Number(categoryId),
        },
      );
    }

    // 5. Categories without images should have []
    await queryInterface.sequelize.query(`
      UPDATE categories
      SET images = JSON_ARRAY()
      WHERE images IS NULL
    `);

    // 6. Make images required
    await queryInterface.changeColumn(
      "categories",
      "images",
      {
        type: Sequelize.JSON,
        allowNull: false,
      },
    );

    // 7. Old image table is no longer needed
    await queryInterface.dropTable(
      "category_images",
    );
  },

  async down(queryInterface, Sequelize) {
    // Re-create old table
    await queryInterface.createTable(
      "category_images",
      {
        id: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },

        category_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: "categories",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },

        image: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },

        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },

        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
    );

    const categories =
      await queryInterface.sequelize.query(
        `
        SELECT id, images
        FROM categories
        `,
        {
          type: Sequelize.QueryTypes.SELECT,
        },
      );

    const rows = [];

    for (const category of categories) {
      let images = category.images;

      if (typeof images === "string") {
        images = JSON.parse(images);
      }

      if (Array.isArray(images)) {
        for (const image of images) {
          rows.push({
            category_id: category.id,
            image,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }
    }

    if (rows.length > 0) {
      await queryInterface.bulkInsert(
        "category_images",
        rows,
      );
    }

    await queryInterface.removeColumn(
      "categories",
      "images",
    );
  },
};