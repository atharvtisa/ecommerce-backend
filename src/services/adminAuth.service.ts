import bcrypt from "bcrypt";
import path from "path";
import {Op} from "sequelize";
import fs from "fs/promises";

import { Admin } from "../models";
import { generateAdminToken } from "../utils/jwt";
import { MessageConstant } from "../constants/message.constant";

import { sendAdminPasswordResetOtp } from "./email.service";

interface AdminLoginData {
  email: string;
  password: string;
}

export const loginAdmin = async ({
  email,
  password,
}: AdminLoginData) => {
  const admin = await Admin.findOne({
    where: {
      email,
    },
  });

  if (!admin) {
    throw new Error(
      MessageConstant.AUTH.INVALID_CREDENTIALS,
    );
  }

  const passwordMatched = await bcrypt.compare(
    password,
    admin.password,
  );

  if (!passwordMatched) {
    throw new Error(
      MessageConstant.AUTH.INVALID_CREDENTIALS,
    );
  }

  if (!admin.isActive) {
    throw new Error(
      MessageConstant.AUTH.ADMIN_INACTIVE,
    );
  }

  const token = generateAdminToken({
    id: admin.id,
    email: admin.email,
    role: "admin",
  });

  return {
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: "admin",
    },
  };
};




export const forgotAdminPassword = async (email: string) => {
  const admin = await Admin.findOne({
    where: {
      email,
    },
  });

  if (!admin) {
    throw new Error("Admin not found.");
  }

  if (!admin.isActive) {
    throw new Error("Admin account is inactive.");
  }

  const otp = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();

  const hashedOtp = await bcrypt.hash(otp, 10);

  const expiresAt = new Date(
    Date.now() + 10 * 60 * 1000,
  );

  admin.resetOtp = hashedOtp;
  admin.resetOtpExpiresAt = expiresAt;
  admin.resetOtpVerified = false;

  await admin.save();

  await sendAdminPasswordResetOtp(
  admin.email,
  otp,
);

  return {
    expiresAt,
  };
};




export const verifyAdminPasswordResetOtp = async (
  email: string,
  otp: string,
) => {
  const admin = await Admin.findOne({
    where: {
      email,
    },
  });

  if (!admin) {
    throw new Error("Admin not found.");
  }

  if (!admin.resetOtp || !admin.resetOtpExpiresAt) {
    throw new Error("OTP not found. Please request a new OTP.");
  }

  if (new Date() > admin.resetOtpExpiresAt) {
    throw new Error("OTP has expired. Please request a new OTP.");
  }

  const otpMatched = await bcrypt.compare(
    otp,
    admin.resetOtp,
  );

  if (!otpMatched) {
    throw new Error("Invalid OTP.");
  }

  admin.resetOtpVerified = true;

  await admin.save();

  return true;
};




export const resetAdminPassword = async (
  email: string,
  newPassword: string,
) => {
  const admin = await Admin.findOne({
    where: {
      email,
    },
  });

  if (!admin) {
    throw new Error("Admin not found.");
  }

  if (!admin.resetOtpVerified) {
    throw new Error("OTP verification is required.");
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    10,
  );

  admin.password = hashedPassword;

  admin.resetOtp = null;
  admin.resetOtpExpiresAt = null;
  admin.resetOtpVerified = false;

  await admin.save();
};




export const changeAdminPassword = async (
  adminId: number,
  currentPassword: string,
  newPassword: string,
) => {
  const admin = await Admin.findByPk(adminId);

  if (!admin) {
    throw new Error("Admin not found.");
  }

  if (!admin.isActive) {
    throw new Error("Admin account is inactive.");
  }

  const passwordMatched = await bcrypt.compare(
    currentPassword,
    admin.password,
  );

  if (!passwordMatched) {
    throw new Error("Current password is incorrect.");
  }

  const newHashedPassword = await bcrypt.hash(
    newPassword,
    10,
  );

  admin.password = newHashedPassword;

  await admin.save();
};


export const getAdminProfile = async (
  adminId: number,
) => {
  const admin = await Admin.findByPk(adminId, {
    attributes: [
      "id",
      "name",
      "email",
      "profileImage",
      "isActive",
      "createdAt",
      "updatedAt",
    ],
  });

  if (!admin) {
    throw new Error("Admin not found.");
  }

  if (!admin.isActive) {
    throw new Error("Admin account is inactive.");
  }

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    profileImage: admin.profileImage,
    role: "admin",
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  };
};


interface UpdateAdminProfileData {
  name: string;
  email: string;
  profileImage?: string | null;
   removeProfileImage?: boolean;
}


export const updateAdminProfile = async (
  adminId: number,
  {
    name,
    email,
    profileImage,
    removeProfileImage = false,
  }: UpdateAdminProfileData,
) => {
  const admin = await Admin.findByPk(adminId);

  if (!admin) {
    throw new Error("Admin not found.");
  }

  if (!admin.isActive) {
    throw new Error("Admin account is inactive.");
  }

  const existingAdmin = await Admin.findOne({
    where: {
      email,
      id: {
        [Op.ne]: adminId,
      },
    },
  });

  if (existingAdmin) {
    throw new Error("Email already exists.");
  }

  const oldProfileImage = admin.profileImage;

  admin.name = name;
  admin.email = email;

  // Case 1: Remove existing profile image
  if (removeProfileImage) {
    admin.profileImage = null;
  }

  // Case 2: Upload a new profile image
  else if (profileImage !== undefined) {
    admin.profileImage = profileImage;
  }

  await admin.save();

  // Delete old physical image after database update
  if (
    oldProfileImage &&
    (
      removeProfileImage ||
      (
        profileImage !== undefined &&
        oldProfileImage !== profileImage
      )
    )
  ) {
    await deleteProfileImage(oldProfileImage);
  }

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    profileImage: admin.profileImage,
    role: "admin",
  };
};




const deleteProfileImage = async (
  imagePath: string | null,
): Promise<void> => {
  if (!imagePath) {
    return;
  }

  try {
    const absolutePath = path.resolve(imagePath);

    await fs.unlink(absolutePath);
  } catch (error) {
    console.warn(
      "Unable to delete old profile image:",
      error,
    );
  }
};