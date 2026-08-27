import express from "express";
import cors from "cors";

import path from "path";

import cookieParser from "cookie-parser";

import { env } from "./config/env";
import routes from "./routes";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/", routes);

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads")),
);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "E-Commerce API is running",
  });
});

export default app;