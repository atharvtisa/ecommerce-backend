import {
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../config/database";

class Category extends Model<
  InferAttributes<Category, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<Category, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare slug: string;
  declare description: string | null;
  
declare status:
  CreationOptional<"active" | "inactive">;
  declare images: CreationOptional<string[]>;
  declare imageCount: CreationOptional<number>;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

  status: {
  type: DataTypes.ENUM(
    "active",
    "inactive",
  ),
  allowNull: false,
  defaultValue: "active",
},
    images: {
  type: DataTypes.JSON,
  allowNull: false,
  defaultValue: [],
},
imageCount: {
  type: DataTypes.INTEGER.UNSIGNED,
  allowNull: false,
  defaultValue: 0,
  field: "image_count",
},
  },
  {
    sequelize,
    tableName: "categories",
    timestamps: true,
    underscored: true,
  },
);

export default Category;