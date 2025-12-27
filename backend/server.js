import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

/* -------------------- ENV VALIDATION -------------------- */
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

/* -------------------- DB CONNECTION -------------------- */
connectDB();

/* -------------------- APP INIT -------------------- */
const app = express();

/* -------------------- SECURITY & PERFORMANCE -------------------- */
app.use(helmet());              // Security headers
app.use(compression());         // Gzip compression

/* -------------------- BODY PARSERS -------------------- */
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

/* -------------------- CORS -------------------- */
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

/* -------------------- COOKIES -------------------- */
app.use(cookieParser());

/* -------------------- LOGGING -------------------- */
if (NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

/* -------------------- ROUTES -------------------- */
app.use("/api/auth", authRoutes);

/* -------------------- HEALTH CHECK -------------------- */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/* -------------------- 404 HANDLER -------------------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* -------------------- GLOBAL ERROR HANDLER -------------------- */
app.use((err, req, res, next) => {
  console.error("Error:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message:
      NODE_ENV === "production"
        ? "Something went wrong"
        : err.message,
  });
});

/* -------------------- SERVER START -------------------- */
app.listen(PORT, () => {
  console.log(
    `Server running in ${NODE_ENV} mode on port ${PORT}`
  );
});
