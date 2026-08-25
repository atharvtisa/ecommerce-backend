export const MessageConstant = {
  SUCCESS: {
    CREATE: "Created successfully.",
    UPDATE: "Updated successfully.",
    DELETE: "Deleted successfully.",
    FETCH: "Fetched successfully.",
    LOGIN: "Logged in successfully.",
    LOGOUT: "Logout successful.",
    PASSWORD_CHANGED: "Password changed successfully",
    PASSWORD_RESET: "Password reset successfully",
    
  },

  ERROR: {
    INTERNAL_SERVER: "Internal server error.",
    NOT_FOUND: "Resource not found.",
    BAD_REQUEST: "Bad request. Please check your input.",
    UNAUTHORIZED: "Unauthorized access.",
    FORBIDDEN: "Forbidden access.",
    VALIDATION: "Validation failed. Please check the provided data.",
    ALREADY_EXISTS: "The resource already exists.",
    INVALID_CREDENTIALS: "Invalid credentials.",
  },

AUTH: {
  LOGIN_SUCCESS: "Logged in successfully.",
    OTP_VERIFIED:"OTP verified Successfully",
  OTP_SENT:"OTP sed successfully",
  INVALID_CREDENTIALS: "Invalid email or password.",
  ADMIN_NOT_FOUND: "Admin not found.",
  ADMIN_INACTIVE: "Admin account is inactive.",
  TOKEN_REQUIRED: "Authentication token is required.",
  INVALID_TOKEN: "Invalid or expired token.",

},

  CATEGORY: {
    CREATED: "Category created successfully.",
    UPDATED: "Category updated successfully.",
    DELETED: "Category deleted successfully.",
    FETCHED: "Categories fetched successfully.",
    DETAILS_FETCHED: "Category details fetched successfully.",
    NOT_FOUND: "Category not found.",
    SLUG_EXISTS: "Category with this slug already exists.",
    IMAGE_LIMIT: "A category can have a maximum of 9 images.",
  },

  VALIDATION: {
    NAME_REQUIRED: "Name is required.",
    NAME_MIN: "Name must be at least 2 characters long.",
    NAME_MAX: "Name must not exceed 100 characters.",
    SLUG_REQUIRED: "Slug is required.",
    SLUG_INVALID:
      "Slug must contain only lowercase letters, numbers and hyphens.",
    DESCRIPTION_MAX: "Description must not exceed 1000 characters.",
  },
} as const;