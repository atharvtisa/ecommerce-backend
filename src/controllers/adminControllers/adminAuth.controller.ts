
import { Request, Response } from "express";

import {
  authenticateAdmin,
  AuthenticatedRequest,
} from "../../middlewares/auth.middleware";

import {
  loginAdmin,
  forgotAdminPassword,
  verifyAdminPasswordResetOtp,
  resetAdminPassword,
  changeAdminPassword,
   getAdminProfile,
    updateAdminProfile,

} from "../../services/adminAuth.service";

import {
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  changePasswordSchema,
    updateAdminProfileSchema,
} from "../../validations/adminAuth.validation";

import { HttpStatus } from "../../constants/http.constant";
import { MessageConstant } from "../../constants/message.constant";

export const adminLogin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await loginAdmin({
      email: req.body.email,
      password: req.body.password,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: MessageConstant.AUTH.LOGIN_SUCCESS,
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : MessageConstant.ERROR.INTERNAL_SERVER;

    res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      message,
    });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { error, value } =
      forgotPasswordSchema.validate(req.body);

    if (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message,
      });

      return;
    }

    const result = await forgotAdminPassword(value.email);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MessageConstant.AUTH.OTP_SENT,
      data: {
        expiresAt: result.expiresAt,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : MessageConstant.ERROR.INTERNAL_SERVER;

    const statusCode =
      message === "Admin not found."
        ? HttpStatus.NOT_FOUND
        : message === "Admin account is inactive."
          ? HttpStatus.FORBIDDEN
          : HttpStatus.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

export const verifyOtp = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { error, value } =
      verifyOtpSchema.validate(req.body);

    if (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message,
      });

      return;
    }

    await verifyAdminPasswordResetOtp(
      value.email,
      value.otp,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: MessageConstant.AUTH.OTP_VERIFIED,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : MessageConstant.ERROR.INTERNAL_SERVER;

    const statusCode =
      message === "Admin not found."
        ? HttpStatus.NOT_FOUND
        : HttpStatus.BAD_REQUEST;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { error, value } =
      resetPasswordSchema.validate(req.body);

    if (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message,
      });

      return;
    }

    await resetAdminPassword(
      value.email,
      value.newPassword,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: MessageConstant.SUCCESS.PASSWORD_RESET,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : MessageConstant.ERROR.INTERNAL_SERVER;

    const statusCode =
      message === "Admin not found."
        ? HttpStatus.NOT_FOUND
        : HttpStatus.BAD_REQUEST;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { error, value } =
      changePasswordSchema.validate(req.body);

    if (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message,
      });

      return;
    }

    if (!req.admin) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: MessageConstant.ERROR.UNAUTHORIZED,
      });

      return;
    }

    await changeAdminPassword(
      req.admin.id,
      value.currentPassword,
      value.newPassword,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: MessageConstant.SUCCESS.PASSWORD_CHANGED,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : MessageConstant.ERROR.INTERNAL_SERVER;

    const statusCode =
      message === "Admin not found."
        ? HttpStatus.NOT_FOUND
        : message === "Current password is incorrect."
          ? HttpStatus.BAD_REQUEST
          : message === "Admin account is inactive."
            ? HttpStatus.FORBIDDEN
            : HttpStatus.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};



export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: MessageConstant.ERROR.UNAUTHORIZED,
      });

      return;
    }

    const result = await getAdminProfile(req.admin.id);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MessageConstant.SUCCESS.FETCH,
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : MessageConstant.ERROR.INTERNAL_SERVER;

    const statusCode =
      message === "Admin not found."
        ? HttpStatus.NOT_FOUND
        : message === "Admin account is inactive."
          ? HttpStatus.FORBIDDEN
          : HttpStatus.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};




export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { error, value } =
      updateAdminProfileSchema.validate(req.body);

    if (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message,
      });

      return;
    }

    if (!req.admin) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: MessageConstant.ERROR.UNAUTHORIZED,
      });

      return;
    }

    const profileImage = req.file
      ? req.file.path
      : undefined;

    const result = await updateAdminProfile(
      req.admin.id,
      {
        name: value.name,
        email: value.email,
        profileImage,
        removeProfileImage: value.removeProfileImage,
      },
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Profile updated successfully.",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : MessageConstant.ERROR.INTERNAL_SERVER;

    const statusCode =
      message === "Admin not found."
        ? HttpStatus.NOT_FOUND
        : message === "Admin account is inactive."
          ? HttpStatus.FORBIDDEN
          : message === "Email already exists."
            ? HttpStatus.BAD_REQUEST
            : HttpStatus.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};