import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "./auth.middleware";

export const authorizeAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.admin) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  if (req.admin.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Access denied",
    });
    return;
  }

  next();
};