import { Router } from "express";

import adminRoutes from "./admin.routes";
// import userRoutes from "./user.routes";

const router = Router();

router.use("/admin", adminRoutes);
// router.use("/user", userRoutes);

export default router;