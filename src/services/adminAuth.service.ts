import bcrypt from "bcrypt";
import path from "path";
import fs from "fs/promises";
import { Op } from "sequelize";

import { Admin } from "../models";
import { generateAdminToken } from "../utils/jwt";

import {
  generateOtp,
  generateOtpExpiry,
  getOtpResendWaitSeconds,
} from "../utils/otp";

import { MessageConstant } from "../constants/message.constant";

import {
  sendAdminPasswordResetOtp,
  sendAdminEmailChangeOtp,
} from "./email.service";

const BCRYPT_SALT_ROUNDS = 10;


// =====================================================
// LOGIN
// =====================================================

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


// =====================================================
// FORGOT PASSWORD
// =====================================================

export const forgotAdminPassword = async (
  email: string,
) => {
  const admin = await Admin.findOne({
    where: {
      email,
    },
  });

  if (!admin) {
    throw new Error("Admin not found.");
  }

  if (!admin.isActive) {
    throw new Error(
      "Admin account is inactive.",
    );
  }

  // CHANGED: using OTP helper
  const otp = generateOtp();

  const hashedOtp = await bcrypt.hash(
    otp,
    BCRYPT_SALT_ROUNDS,
  );

  // CHANGED: using OTP expiry helper
  const expiresAt = generateOtpExpiry();

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


// =====================================================
// VERIFY PASSWORD RESET OTP
// =====================================================

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

  if (!admin.isActive) {
    throw new Error(
      "Admin account is inactive.",
    );
  }

  if (
    !admin.resetOtp ||
    !admin.resetOtpExpiresAt
  ) {
    throw new Error(
      "OTP not found. Please request a new OTP.",
    );
  }

  if (
    new Date() >
    admin.resetOtpExpiresAt
  ) {
    admin.resetOtp = null;
    admin.resetOtpExpiresAt = null;
    admin.resetOtpVerified = false;

    await admin.save();

    throw new Error(
      "OTP has expired. Please request a new OTP.",
    );
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


// =====================================================
// RESET PASSWORD
// =====================================================

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

  if (!admin.isActive) {
    throw new Error(
      "Admin account is inactive.",
    );
  }

  if (!admin.resetOtpVerified) {
    throw new Error(
      "OTP verification is required.",
    );
  }

  // CHANGED:
  // OTP verification cannot be used after expiry.
  if (
    !admin.resetOtpExpiresAt ||
    new Date() >
      admin.resetOtpExpiresAt
  ) {
    admin.resetOtp = null;
    admin.resetOtpExpiresAt = null;
    admin.resetOtpVerified = false;

    await admin.save();

    throw new Error(
      "OTP verification has expired. Please request a new OTP.",
    );
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    BCRYPT_SALT_ROUNDS,
  );

  admin.password = hashedPassword;

  admin.resetOtp = null;
  admin.resetOtpExpiresAt = null;
  admin.resetOtpVerified = false;

  await admin.save();
};


// =====================================================
// CHANGE PASSWORD
// =====================================================

export const changeAdminPassword = async (
  adminId: number,
  currentPassword: string,
  newPassword: string,
) => {
  const admin = await Admin.findByPk(
    adminId,
  );

  if (!admin) {
    throw new Error("Admin not found.");
  }

  if (!admin.isActive) {
    throw new Error(
      "Admin account is inactive.",
    );
  }

  const passwordMatched = await bcrypt.compare(
    currentPassword,
    admin.password,
  );

  if (!passwordMatched) {
    throw new Error(
      "Current password is incorrect.",
    );
  }

  const newHashedPassword = await bcrypt.hash(
    newPassword,
    BCRYPT_SALT_ROUNDS,
  );

  admin.password = newHashedPassword;

  await admin.save();
};



export const resendAdminPasswordResetOtp = async (
  email: string,
) => {
  const normalizedEmail = email
    .trim()
    .toLowerCase();

  const admin = await Admin.findOne({
    where: {
      email: normalizedEmail,
    },
  });

  if (!admin) {
    throw new Error("Admin not found.");
  }

  if (!admin.isActive) {
    throw new Error(
      "Admin account is inactive.",
    );
  }

  // User should request forgot-password OTP first
  if (
    !admin.resetOtp ||
    !admin.resetOtpExpiresAt
  ) {
    throw new Error(
      "No password reset request found. Please request an OTP first.",
    );
  }

  // Check 60-second resend cooldown
  const waitSeconds =
    getOtpResendWaitSeconds(
      admin.resetOtpExpiresAt,
    );

  if (waitSeconds > 0) {
    throw new Error(
      `Please wait ${waitSeconds} seconds before requesting another OTP.`,
    );
  }

  // Generate NEW OTP
  const otp = generateOtp();

  const hashedOtp = await bcrypt.hash(
    otp,
    BCRYPT_SALT_ROUNDS,
  );

  // Give new OTP a fresh 10-minute expiry
  const expiresAt = generateOtpExpiry();

  // Overwrite previous OTP
  admin.resetOtp = hashedOtp;
  admin.resetOtpExpiresAt = expiresAt;

  // Important:
  // Any previous OTP verification becomes invalid
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



// =====================================================
// GET ADMIN PROFILE
// =====================================================

export const getAdminProfile = async (
  adminId: number,
) => {
  const admin = await Admin.findByPk(
    adminId,
    {
      attributes: [
        "id",
        "name",
        "email",
        "profileImage",
        "isActive",
        "createdAt",
        "updatedAt",
      ],
    },
  );

  if (!admin) {
    throw new Error("Admin not found.");
  }

  if (!admin.isActive) {
    throw new Error(
      "Admin account is inactive.",
    );
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


// =====================================================
// REQUEST EMAIL CHANGE
// =====================================================

export const requestAdminEmailChange = async (
  adminId: number,
  newEmail: string,
) => {
  const admin = await Admin.findByPk(
    adminId,
  );

  if (!admin) {
    throw new Error("Admin not found.");
  }

  if (!admin.isActive) {
    throw new Error(
      "Admin account is inactive.",
    );
  }

  const normalizedEmail = newEmail
    .trim()
    .toLowerCase();

  if (
    admin.email.toLowerCase() ===
    normalizedEmail
  ) {
    throw new Error(
      "New email must be different from current email.",
    );
  }

  const existingAdmin = await Admin.findOne({
    where: {
      email: normalizedEmail,
      id: {
        [Op.ne]: adminId,
      },
    },
  });

  if (existingAdmin) {
    throw new Error(
      "Email already exists.",
    );
  }

  // CHANGED: OTP helper
  const otp = generateOtp();

  const hashedOtp = await bcrypt.hash(
    otp,
    BCRYPT_SALT_ROUNDS,
  );

  // CHANGED: expiry helper
  const expiresAt = generateOtpExpiry();

  // New email stays pending until OTP verification.
  admin.pendingEmail = normalizedEmail;

  admin.emailChangeOtp = hashedOtp;

  admin.emailChangeOtpExpiresAt =
    expiresAt;

  await admin.save();

 



  // OTP goes only to the NEW email.
  await sendAdminEmailChangeOtp(
    normalizedEmail,
    otp,
  );

  

  return {
    pendingEmail: normalizedEmail,
    expiresAt,
  };
};


// =====================================================
// VERIFY EMAIL CHANGE OTP
// =====================================================

export const verifyAdminEmailChangeOtp = async (
  adminId: number,
  otp: string,
) => {
  const admin = await Admin.findByPk(
    adminId,
  );

  if (!admin) {
    throw new Error("Admin not found.");
  }

  if (!admin.isActive) {
    throw new Error(
      "Admin account is inactive.",
    );
  }

  if (
    !admin.pendingEmail ||
    !admin.emailChangeOtp ||
    !admin.emailChangeOtpExpiresAt
  ) {
    throw new Error(
      "No email change request found.",
    );
  }

  if (
    new Date() >
    admin.emailChangeOtpExpiresAt
  ) {
    // Clear expired email-change request.
    admin.pendingEmail = null;
    admin.emailChangeOtp = null;
    admin.emailChangeOtpExpiresAt =
      null;

    await admin.save();

    throw new Error(
      "OTP has expired. Please request a new OTP.",
    );
  }

  const otpMatched = await bcrypt.compare(
    otp,
    admin.emailChangeOtp,
  );

  if (!otpMatched) {
    throw new Error("Invalid OTP.");
  }

  // Check email availability again before update.
  const existingAdmin = await Admin.findOne({
    where: {
      email: admin.pendingEmail,
      id: {
        [Op.ne]: adminId,
      },
    },
  });

  if (existingAdmin) {
    throw new Error(
      "Email already exists.",
    );
  }

  // OTP verified.
  // Now change actual email.
  admin.email = admin.pendingEmail;

  // Clear temporary fields.
  admin.pendingEmail = null;
  admin.emailChangeOtp = null;
  admin.emailChangeOtpExpiresAt = null;

  await admin.save();

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    profileImage: admin.profileImage,
    role: "admin",
  };
};




export const resendAdminEmailChangeOtp = async (
  adminId: number,
) => {
  const admin = await Admin.findByPk(adminId);

  if (!admin) {
    throw new Error("Admin not found.");
  }

  if (!admin.isActive) {
    throw new Error(
      "Admin account is inactive.",
    );
  }

  if (!admin.pendingEmail) {
    throw new Error(
      "No pending email change request found.",
    );
  }

  if (admin.emailChangeOtpExpiresAt) {
    const waitSeconds =
      getOtpResendWaitSeconds(
        admin.emailChangeOtpExpiresAt,
      );

    if (waitSeconds > 0) {
      throw new Error(
        `Please wait ${waitSeconds} seconds before requesting another OTP.`,
      );
    }
  }
  

  const otp = generateOtp();

  const hashedOtp = await bcrypt.hash(
    otp,
    BCRYPT_SALT_ROUNDS,
  );

  const expiresAt = generateOtpExpiry();



  /*
   * Overwriting the hash makes the
   * previous OTP automatically invalid.
   */

  
  admin.emailChangeOtp = hashedOtp;
  admin.emailChangeOtpExpiresAt =
    expiresAt;

  await admin.save();


  await sendAdminEmailChangeOtp(
    admin.pendingEmail,
    otp,
  );

 ;

  return {
    pendingEmail: admin.pendingEmail,
    expiresAt,
  };
};


// =====================================================
// UPDATE PROFILE
// =====================================================

interface UpdateAdminProfileData {
  name: string;
  profileImage?: string | null;
  removeProfileImage?: boolean;
}

export const updateAdminProfile = async (
  adminId: number,
  {
    name,
    profileImage,
    removeProfileImage = false,
  }: UpdateAdminProfileData,
) => {
  const admin = await Admin.findByPk(
    adminId,
  );

  if (!admin) {
    throw new Error("Admin not found.");
  }

  if (!admin.isActive) {
    throw new Error(
      "Admin account is inactive.",
    );
  }

  const oldProfileImage =
    admin.profileImage;

  // Email is intentionally NOT updated here.
  admin.name = name;

  if (removeProfileImage) {
    admin.profileImage = null;
  } else if (
    profileImage !== undefined
  ) {
    admin.profileImage =
      profileImage;
  }

  await admin.save();

  if (
    oldProfileImage &&
    (
      removeProfileImage ||
      (
        profileImage !== undefined &&
        oldProfileImage !==
          profileImage
      )
    )
  ) {
    await deleteProfileImage(
      oldProfileImage,
    );
  }

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    profileImage: admin.profileImage,
    role: "admin",
  };
};


// =====================================================
// DELETE PROFILE IMAGE
// =====================================================

const deleteProfileImage = async (
  imagePath: string | null,
): Promise<void> => {
  if (!imagePath) {
    return;
  }

  try {
    const absolutePath =
      path.resolve(imagePath);

    await fs.unlink(absolutePath);
  } catch (error) {
    console.warn(
      "Unable to delete old profile image:",
      error,
    );
  }
};