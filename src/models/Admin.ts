import {
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../config/database";

class Admin extends Model<
  InferAttributes<Admin, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<Admin, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare password: string;
  declare isActive: CreationOptional<boolean>;

  declare resetOtp: string | null;
declare resetOtpExpiresAt: Date | null;
declare resetOtpVerified: CreationOptional<boolean>;
declare profileImage: string | null;

declare emailChangeOtp: string | null;
declare emailChangeOtpExpiresAt: Date | null;
declare pendingEmail: string | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;


  
}

Admin.init(
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

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    profileImage: {
  type: DataTypes.STRING(255),
  allowNull: true,
  field: "profile_image",
},

emailChangeOtp: {
  type: DataTypes.STRING(255),
  allowNull: true,
  field: "email_change_otp",
},

emailChangeOtpExpiresAt: {
  type: DataTypes.DATE,
  allowNull: true,
  field: "email_change_otp_expires_at",
},

pendingEmail: {
  type: DataTypes.STRING(150),
  allowNull: true,
  field: "pending_email",
},

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
    },

resetOtp: {
  type: DataTypes.STRING(255),
  allowNull: true,
  field: "reset_otp",
},

resetOtpExpiresAt: {
  type: DataTypes.DATE,
  allowNull: true,
  field: "reset_otp_expires_at",
},

resetOtpVerified: {
  type: DataTypes.BOOLEAN,
  allowNull: false,
  defaultValue: false,
  field: "reset_otp_verified",
},

  },
  {
    sequelize,
    tableName: "admins",
    timestamps: true,
    underscored: true,
  },
);

export default Admin;