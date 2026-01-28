import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import User from "../models/User.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";

const isProd = process.env.NODE_ENV === "production";

/* ================= REGISTER ================= */

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });

    if (existing && !existing.verified) {
      return res.status(409).json({
        message: "Email registered but not verified",
        requiresVerification: true,
        email,
      });
    }

    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    await User.create({
      name,
      email,
      password: hashedPassword,
      verificationCode,
      verified: false,
    });

    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      message: "Registered successfully. Verify your email.",
      requiresVerification: true,
      email,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

/* ================= EMAIL VERIFY ================= */

export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification" });
    }

    user.verified = true;
    user.verificationCode = null;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ message: "Verification failed" });
  }
};

/* ================= LOGIN ================= */

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    if (!user.verified)
      return res.status(403).json({
        message: "Please verify your email",
      });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

/* ================= REFRESH TOKEN ================= */

export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token)
    return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(
      token,
      process.env.REFRESH_SECRET
    );

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(401).json({ message: "Token expired" });
  }
};

/* ================= LOGOUT ================= */

export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.REFRESH_SECRET
      );
      await User.findByIdAndUpdate(decoded.id, {
        refreshToken: null,
      });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
    });

    res.json({ message: "Logged out successfully" });
  } catch {
    res.json({ message: "Logged out" });
  }
};

/* ================= GOOGLE OAUTH ================= */

export const googleAuth = (req, res) => {
  const redirectUrl =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    `?client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(
      process.env.GOOGLE_REDIRECT_URI
    )}` +
    `&response_type=code&scope=profile email`;

  res.redirect(redirectUrl);
};

export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code)
      return res.status(400).json({ message: "Code missing" });

    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
        code,
      })
    );

    const { access_token } = tokenRes.data;

    const profile = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const { email, name, picture, id } = profile.data;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name,
        avatar: picture,
        provider: "google",
        providerId: id,
        verified: true,
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.redirect(
      `${process.env.FRONTEND_URL}/oauth-success?token=${accessToken}`
    );
  } catch (err) {
    console.error("Google OAuth error:", err);
    res.status(500).json({ message: "Google auth failed" });
  }
};

/* ================= GITHUB OAUTH ================= */

export const githubAuth = (req, res) => {
  try {
    const redirectUrl =
      "https://github.com/login/oauth/authorize" +
      `?client_id=${process.env.GITHUB_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(
        process.env.GITHUB_REDIRECT_URI
      )}` +
      `&scope=user:email`;

    res.redirect(redirectUrl);
  } catch (err) {
    console.error("GitHub Auth Error:", err);
    res.status(500).json({ message: "GitHub auth failed" });
  }
};

export const githubCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res
        .status(400)
        .json({ message: "Authorization code missing" });
    }

    /* ---------- Exchange code for access token ---------- */
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const { access_token } = tokenRes.data;

    if (!access_token) {
      return res.status(401).json({
        message: "GitHub access token not received",
      });
    }

    /* ---------- Fetch GitHub user ---------- */
    const userRes = await axios.get(
      "https://api.github.com/user",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    /* ---------- Fetch GitHub emails ---------- */
    const emailRes = await axios.get(
      "https://api.github.com/user/emails",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const primaryEmail = emailRes.data.find(
      (e) => e.primary && e.verified
    )?.email;

    if (!primaryEmail) {
      return res.status(400).json({
        message: "GitHub email not available",
      });
    }

    const { id, name, avatar_url } = userRes.data;

    /* ---------- Find or create user ---------- */
    let user = await User.findOne({ email: primaryEmail });

    if (!user) {
      user = await User.create({
        name: name || "GitHub User",
        email: primaryEmail,
        avatar: avatar_url,
        provider: "github",
        providerId: id,
        verified: true,
      });
    }

    /* ---------- Generate tokens ---------- */
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    /* ---------- Set refresh token cookie ---------- */
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    /* ---------- Redirect to frontend ---------- */
    res.redirect(
      `${process.env.FRONTEND_URL}/oauth-success?token=${accessToken}`
    );

  } catch (err) {
    console.error(
      "GitHub OAuth Error:",
      err.response?.data || err.message
    );

    res.status(500).json({
      message: "GitHub authentication failed",
    });
  }
};

/* ================= AUTH ME ================= */

export const authMe = async (req, res) => {
  res.json(req.user);
};
