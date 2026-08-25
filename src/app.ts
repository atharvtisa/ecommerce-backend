import express from "express";
import cors from "cors";

import path from "path";

import { env } from "./config/env";
import routes from "./routes";

const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

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