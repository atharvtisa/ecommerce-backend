import {
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

import { sequelize } from "../config/database";

class Setting extends Model<
  InferAttributes<
    Setting,
    { omit: "createdAt" | "updatedAt" }
  >,
  InferCreationAttributes<
    Setting,
    { omit: "createdAt" | "updatedAt" }
  >
> {
  declare id: CreationOptional<number>;

  declare storeName: string;
  declare storeEmail: string;
  declare storePhone: string;
  declare storeAddress: string;
  declare currency: string;

  declare storeLogo: string | null;
  declare favicon: string | null;

  declare facebookUrl: string | null;
  declare instagramUrl: string | null;
  declare whatsappNumber: string | null;

  declare storeDescription: string | null;

  declare footerText: string | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Setting.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    storeName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      defaultValue: "",
      field: "store_name",
    },

    storeEmail: {
      type: DataTypes.STRING(150),
      allowNull: false,
      defaultValue: "",
      field: "store_email",
    },

    storePhone: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "",
      field: "store_phone",
    },

    storeAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
      field: "store_address",
    },

    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "INR",
    },

    storeLogo: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "store_logo",
    },

    favicon: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    facebookUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: "facebook_url",
    },

    instagramUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: "instagram_url",
    },

    whatsappNumber: {
      type: DataTypes.STRING(30),
      allowNull: true,
      field: "whatsapp_number",
    },

    storeDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "store_description",
    },

    footerText: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "footer_text",
    },
  },
  {
    sequelize,
    tableName: "settings",
    timestamps: true,
    underscored: true,
  },
);

export default Setting;