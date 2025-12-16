import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import axios from "axios";
import { googleConfig, githubConfig } from "../config/oauth.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });

    // 🔁 User exists but not verified
    if (existing && !existing.verified) {
      return res.status(409).json({
        message: "Email registered but not verified",
        requiresVerification: true,
        email: existing.email,
      });
    }

    if (existing && existing.verified) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    await User.create({
      name,
      email,
      password: hashed,
      verificationCode,
      verified: false,
    });

    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      message: "Registered! Check your email for verification code.",
      requiresVerification: true,
      email,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email" });
    if (user.verificationCode !== code) return res.status(400).json({ message: "Invalid code" });

    user.verified = true;
    user.verificationCode = null;
    await user.save();

    res.json({ message: "Email verified successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid password" });
    if (!user.verified) return res.status(400).json({ message: "Please verify your email first." });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: false });
    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });P

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token)
      return res.status(401).json({ message: "Invalid refresh token" });

    const accessToken = generateAccessToken(user);
    res.json({ accessToken });
  } catch {
    res.status(401).json({ message: "Token expired" });
  }
};

export const logout = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  }
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
};

/* ================= GOOGLE ================= */

export const googleAuth = (req, res) => {
  try {
    const redirectUrl =
      "https://accounts.google.com/o/oauth2/v2/auth" +
      `?client_id=${process.env.GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=profile email`;

    console.log("GOOGLE AUTH URL:", redirectUrl); // debug

    res.redirect(redirectUrl);
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(500).json({ message: "Google auth failed" });
  }
};

export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ message: "Authorization code missing" });
    }

    console.log("Auth code received:", code);

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
      code,
    });

    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = tokenRes.data;

    const profileRes = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const { id, email, name, picture } = profileRes.data;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        avatar: picture,
        provider: "google",
        providerId: id,
        verified: true,
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
    });

    res.redirect(
      `${process.env.FRONTEND_URL}/oauth-success?token=${accessToken}`
    );

  } catch (err) {
    console.error("Google OAuth Error:", err.response?.data || err.message);
    res.status(500).json({
      message: "Google authentication failed",
      error: err.response?.data || err.message,
    });
  }
};



/* ================= GITHUB ================= */

export const githubAuth = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI;

  console.log("GitHub Client ID:", clientId);
  console.log("GitHub Redirect URI:", redirectUri);

  const redirectUrl =
    "https://github.com/login/oauth/authorize" +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=user:email`;

  res.redirect(redirectUrl);
};


export const githubCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ message: "Authorization code missing" });
    }

    // 🔹 Exchange code for access token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI,
      },
      {
        headers: {
          Accept: "application/json", // VERY IMPORTANT
        },
      }
    );

    const { access_token } = tokenRes.data;

    if (!access_token) {
      return res.status(401).json({
        message: "GitHub access token not received",
        error: tokenRes.data,
      });
    }

    // 🔹 Get user profile
    const userRes = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    // 🔹 Get user email (GitHub may hide it)
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

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
    });

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
      error: err.response?.data || err.message,
    });
  }
};

export const authMe = async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
};
