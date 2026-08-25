import {
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../config/database";

class CategoryImage extends Model<
  InferAttributes<CategoryImage, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<CategoryImage, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare categoryId: number;
  declare image: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

CategoryImage.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "category_id",
    },

    image: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "category_images",
    timestamps: true,
    underscored: true,
  },
);

export default CategoryImage;