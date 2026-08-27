import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface AdminTokenPayload {
  id: number;
  email: string;
  role: "admin";
}

export interface AuthenticatedRequest extends Request {
  admin?: AdminTokenPayload;
}

export const authenticateAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    // 1. Get token from cookie first
    const cookieToken = req.cookies?.adminToken;

    // 2. Get token from Authorization header as fallback
    const authorization = req.headers.authorization;

    const headerToken =
      authorization?.startsWith("Bearer ")
        ? authorization.split(" ")[1]
        : undefined;

    const token = cookieToken || headerToken;

    // 3. No token found
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });

      return;
    }

    // 4. Get JWT secret
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      res.status(500).json({
        success: false,
        message: "JWT secret is not configured",
      });

      return;
    }

    // 5. Verify token
    const decoded = jwt.verify(token, secret);

    // 6. Validate token payload
    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof decoded.id !== "number" ||
      typeof decoded.email !== "string" ||
      decoded.role !== "admin"
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });

      return;
    }

    // 7. Store authenticated admin
    req.admin = {
      id: decoded.id,
      email: decoded.email,
      role: "admin",
    };

    // 8. Continue to controller
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};