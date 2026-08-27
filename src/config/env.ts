import dotenv from "dotenv";

dotenv.config();

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] ?? defaultValue;

  if (value === undefined || value === "") {
    throw new Error(`Environment variable ${key} is required`);
  }

  return value;
};

const getNumberEnv = (
  key: string,
  defaultValue: number,
): number => {
  const value = process.env[key];

  if (value === undefined || value === "") {
    return defaultValue;
  }

  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    throw new Error(
      `Environment variable ${key} must be a valid number`,
    );
  }

  return parsedValue;
};

export const env = {
  nodeEnv: getEnv("NODE_ENV", "development"),

  port: getNumberEnv("PORT", 5000),

  database: {
    host: getEnv("DB_HOST", "localhost"),
    port: getNumberEnv("DB_PORT", 3306),
    name: getEnv("DB_NAME"),
    user: getEnv("DB_USER"),
    password: process.env.DB_PASSWORD ?? "",
  },

  jwt: {
    secret: getEnv("JWT_SECRET"),
    expiresIn: getEnv("JWT_EXPIRES_IN", "1d"),
  },


  smtpHost: process.env.SMTP_HOST ?? "",
smtpPort: Number(process.env.SMTP_PORT ?? 587),
smtpUser: process.env.SMTP_USER ?? "",
smtpPassword: process.env.SMTP_PASSWORD ?? "",
smtpFrom: process.env.SMTP_FROM ?? "",

  corsOrigin: getEnv(
    "CORS_ORIGIN",
    "http://localhost:3001",
  ),

  category: {
    maxImages: getNumberEnv("MAX_CATEGORY_IMAGES", 10),
    maxImageSizeMB: getNumberEnv(
      "MAX_IMAGE_SIZE_MB",
      5,
    ),
  },
};