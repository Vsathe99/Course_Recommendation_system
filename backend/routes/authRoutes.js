import express from "express";
import { body } from "express-validator";
import { register, verifyEmail, login, refreshToken, logout } from "../controllers/authController.js";

const router = express.Router();

// Validation error handler middleware
const validate = async(req, res, next) => {
  const { validationResult } = await import("express-validator");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ------------------ ROUTES ------------------ //

// Register
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  validate,
  register
);

// Verify Email
router.post(
  "/verify-email",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("code").isLength({ min: 6, max: 6 }).withMessage("Valid 6-digit code required"),
  ],
  validate,
  verifyEmail
);

// Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

// Refresh Token (no body validation needed)
router.post("/refresh", refreshToken);

// Logout (no body validation needed)
router.post("/logout", logout);

export default router;
