


import { Router } from "express";

import * as adminAuthController from "../controllers/adminControllers/adminAuth.controller";
import { adminLoginRateLimiter } from "../middlewares/rateLimit.middleware";
import { validate } from "../middlewares/validation.middleware";
import { adminLoginSchema } from "../validations/adminAuth.validation";
import {  updateProfile,} from "../controllers/adminControllers/adminAuth.controller";
import {adminLogout, requestAdminEmailChangeController,
  verifyAdminEmailChangeOtpController, resendAdminEmailChangeOtpController,resendAdminPasswordResetOtpController,} 
  from "../controllers/adminControllers/adminAuth.controller";
  import {adminProfileImageUpload , settingsImageUpload } from "../middlewares/upload.middleware";

import { authenticateAdmin, AuthenticatedRequest} from "../middlewares/auth.middleware";
import { authorizeAdmin } from "../middlewares/authorization.middleware";


 import * as categoryController from "../controllers/adminControllers/category.controller";
 import {createCategorySchema,} from "../validations/category.validation";
import { categoryImageUpload } from "../middlewares/upload.middleware";


import * as settingController from "../controllers/adminControllers/setting.controller";



import { Response } from "express";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public admin routes
|--------------------------------------------------------------------------
*/

router.post(
  "/auth/login",
  adminLoginRateLimiter,
  validate(adminLoginSchema),
  adminAuthController.adminLogin,
);


router.post(
  "/auth/forgot-password",
  adminLoginRateLimiter,
  adminAuthController.forgotPassword,
);


router.post(
  "/auth/verify-otp",
  adminLoginRateLimiter,
  adminAuthController.verifyOtp,
);

router.post(
  "/auth/forgot-password/resend-otp",
   adminLoginRateLimiter,
  resendAdminPasswordResetOtpController,
);


router.post(  "/auth/reset-password",  adminLoginRateLimiter,  adminAuthController.resetPassword,);

/*
|--------------------------------------------------------------------------
| Protected admin routes
|--------------------------------------------------------------------------
*/

router.use(authenticateAdmin);
router.use(authorizeAdmin);

router.post(  "/auth/profile",  authenticateAdmin,  authorizeAdmin,  adminAuthController.getProfile,);


router.post(
  "/auth/change-password",
  adminAuthController.changePassword,
);


router.post(
  "/auth/update-profile",
  adminProfileImageUpload.single("profileImage"),
  updateProfile,
);


router.post(
  "/auth/request-email-change",

  requestAdminEmailChangeController,
);

router.post(
  "/auth/email/verify",
 
  verifyAdminEmailChangeOtpController,
);


router.post(
  "/auth/email/resend-otp",
  resendAdminEmailChangeOtpController,
);


//-------------------------
//  CATEGORIES  ROUTES
// -----------------------


router.post(
  "/categories/create",
  categoryImageUpload.array("images", 10,),
  categoryController.createCategoryController,
);

router.post(
  "/categories/list",
  categoryController.getAllCategories,
);

router.post(
  "/categories/detail",
  categoryController.getCategory,
);


router.post(
  "/categories/update",
  categoryImageUpload.array(  "images",  10,),categoryController.updateCategory,
);


router.post(
  "/categories/update-status",
  categoryController.updateCategoryStatus,
);


router.post(
  "/categories/delete",
  categoryController.deleteCategory,
);

// -----------------------
// ADMIN LOGOUT
// -----------------------

router.post(
  "/auth/logout",
  adminLogout,
);


// --------------------
// SETTINGS
// --------------------

router.post(
  "/settings",
  settingController.getSettingsController,
);

router.post(
  "/settings/update",
  settingsImageUpload.fields([
    {
      name: "storeLogo",
      maxCount: 1,
    },
    {
      name: "favicon",
      maxCount: 1,
    },
  ]),
  settingController.updateSettingsController,
);

export default router;
