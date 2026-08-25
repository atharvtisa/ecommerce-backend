import jwt from "jsonwebtoken";

interface AdminTokenPayload {
  id: number;
  email: string;
  role: "admin";
}

export const generateAdminToken = (
  payload: AdminTokenPayload,
): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(payload, secret, {
    expiresIn: "1d",
  });
};