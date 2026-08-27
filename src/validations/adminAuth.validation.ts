import Joi from "joi";

export const adminLoginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required(),

  password: Joi.string()
    .min(6)
    .max(100)
    .required(),
});


export const updateAdminProfileSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  

  removeProfileImage: Joi.boolean()
    .truthy("true")
    .falsy("false")
    .default(false),
});


export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});


export const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required(),
});


export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),

  newPassword: Joi.string()
    .min(8)
    .max(128)
    .required(),

  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Passwords do not match.",
    }),
});




export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      "any.required": "Current password is required.",
      "string.empty": "Current password is required.",
    }),

  newPassword: Joi.string()
    .min(8)
    .max(128)
    .required()
    .messages({
      "string.min":
        "Password must be at least 8 characters long.",
      "string.max":
        "Password must not exceed 128 characters.",
      "any.required": "New password is required.",
      "string.empty": "New password is required.",
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Passwords do not match.",
      "any.required": "Confirm password is required.",
      "string.empty": "Confirm password is required.",
    }),
});



export const requestAdminEmailChangeSchema = Joi.object({
  newEmail: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      "string.empty": "New email is required.",
      "string.email": "Please enter a valid email address.",
      "any.required": "New email is required.",
    }),
});


// =====================================================
// VERIFY EMAIL CHANGE OTP
// =====================================================

export const verifyAdminEmailChangeOtpSchema = Joi.object({
  otp: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      "string.empty": "OTP is required.",
      "string.pattern.base": "OTP must be exactly 6 digits.",
      "any.required": "OTP is required.",
    }),
});


export const resendAdminPasswordResetOtpSchema =
  Joi.object({
    email: Joi.string()
      .trim()
      .lowercase()
      .email()
      .required()
      .messages({
        "string.empty":
          "Email is required.",
        "string.email":
          "Please enter a valid email address.",
        "any.required":
          "Email is required.",
      }),
  });