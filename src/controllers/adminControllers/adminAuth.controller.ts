
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
 requestAdminEmailChange,
  verifyAdminEmailChangeOtp,
  resendAdminEmailChangeOtp,
    resendAdminPasswordResetOtp,
} from "../../services/adminAuth.service";

import {
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  changePasswordSchema,
    updateAdminProfileSchema,
     requestAdminEmailChangeSchema,
  verifyAdminEmailChangeOtpSchema,
   resendAdminPasswordResetOtpSchema,
} from "../../validations/adminAuth.validation";

import { HttpStatus } from "../../constants/http.constant";
import { MessageConstant } from "../../constants/message.constant";

// --------------------
// ADMIN LOGIN
// --------------------

export const adminLogin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await loginAdmin({
      email: req.body.email,
      password: req.body.password,
    });


res.cookie("adminToken", result.token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});


    res.status(HttpStatus.OK).json({
  success: true,
  message: MessageConstant.AUTH.LOGIN_SUCCESS,
  data: {
    admin: result.admin,
  },
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



// --------------------
// FORGOT PASSWORD
// --------------------


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





export const resendAdminPasswordResetOtpController =
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const { error, value } =
        resendAdminPasswordResetOtpSchema.validate(
          req.body,
        );

      if (error) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({
            success: false,
            message:
              error.details[0]?.message,
          });

        return;
      }

      const result =
        await resendAdminPasswordResetOtp(
          value.email,
        );

      res.status(HttpStatus.OK).json({
        success: true,
        message:
          "A new password reset OTP has been sent successfully.",
        data: result,
      });
    } catch (error) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : MessageConstant.ERROR
                  .INTERNAL_SERVER,
        });
    }
  };



// --------------------
// VERIFY OTP
// --------------------


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



// --------------------
// RESET PASSWORD
// --------------------


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




// --------------------
// CHANGE PASSWORD 
// --------------------



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


// --------------------
// GET PROFILE
// --------------------




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





export const requestAdminEmailChangeController = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: MessageConstant.AUTH.UNAUTHORIZED,
      });
      return;
    }

    const { error, value } =
      requestAdminEmailChangeSchema.validate(req.body);

    if (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.details[0]?.message,
      });
      return;
    }

    const result = await requestAdminEmailChange(
      req.admin.id,
      value.newEmail,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: "OTP sent to new email successfully.",
      data: result,
    });
  } catch (error) {

      console.error("REQUEST EMAIL CHANGE ERROR:", error);
      
    res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : MessageConstant.ERROR.INTERNAL_SERVER,
    });
  }
};





export const verifyAdminEmailChangeOtpController = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
       message: MessageConstant.AUTH.UNAUTHORIZED,
      });
      return;
    }

    const { error, value } =
      verifyAdminEmailChangeOtpSchema.validate(req.body);

    if (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.details[0]?.message,
      });
      return;
    }

    const admin = await verifyAdminEmailChangeOtp(
      req.admin.id,
      value.otp,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Email changed successfully.",
      data: admin,
    });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : MessageConstant.ERROR.INTERNAL_SERVER,
    });
  }
};





export const resendAdminEmailChangeOtpController = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized access.",
      });

      return;
    }

    const result =
      await resendAdminEmailChangeOtp(
        req.admin.id,
      );

    res.status(HttpStatus.OK).json({
      success: true,
      message:
        "A new OTP has been sent to your new email.",
      data: result,
    });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : MessageConstant.ERROR.INTERNAL_SERVER,
    });
  }
};


// --------------------
// UPDATE PROFILE
// --------------------




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


// --------------------
// ADMIN LOGOUT
// --------------------


export const adminLogout = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  res.clearCookie("adminToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.status(HttpStatus.OK).json({
    success: true,
    message: MessageConstant.SUCCESS.LOGOUT,
  });
};