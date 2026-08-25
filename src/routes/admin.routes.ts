







import { Router } from "express";

import * as adminAuthController from "../controllers/adminControllers/adminAuth.controller";
import { adminLoginRateLimiter } from "../middlewares/rateLimit.middleware";
import { validate } from "../middlewares/validation.middleware";
import { adminLoginSchema } from "../validations/adminAuth.validation";
import {  updateProfile,} from "../controllers/adminControllers/adminAuth.controller";

import { authenticateAdmin, AuthenticatedRequest} from "../middlewares/auth.middleware";
import { authorizeAdmin } from "../middlewares/authorization.middleware";


 import * as categoryController from "../controllers/adminControllers/category.controller";
 import {createCategorySchema,} from "../validations/category.validation";
import { categoryImageUpload } from "../middlewares/upload.middleware";
import {adminProfileImageUpload } from "../middlewares/upload.middleware";

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
  adminLoginRateLimiter,
  adminAuthController.changePassword,
);


router.post(
  "/auth/profile",
  authenticateAdmin,
  authorizeAdmin,
  adminProfileImageUpload.single("profileImage"),
  updateProfile,
);



// Category
router.post(
  "/categories",
  validate(createCategorySchema),
 categoryController.createCategoryController,
);



router.post(
  "/categories/detail",
  authenticateAdmin,
  categoryController.getCategory,
);


router.post(
  "/categories/update",
  authorizeAdmin,
  categoryController.updateCategory,
);


router.post(
  "/categories/delete",
  authorizeAdmin,
  categoryController.deleteCategory,
);



router.post(
  "/categories/images/upload",
  authorizeAdmin,
  categoryImageUpload.array("images", 10),
  categoryController.uploadCategoryImages,
);


router.post(
  "/categories/images/delete",
  authorizeAdmin,
  categoryController.deleteCategoryImage,
);






export default router;
