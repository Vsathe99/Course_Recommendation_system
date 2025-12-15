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
    if (existing) {
      if (!existing.verified) {
        return res.status(400).json({ message: "Email registered but not verified. Check your email for code." });
      }
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      name,
      email,
      password: hashed,
      verificationCode,
      verified: false, // New field
    });

    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({ message: "Registered! Check your email for verification code." });
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
  if (!token) return res.status(401).json({ message: "No refresh token" });

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
  const url =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${googleConfig.clientId}` +
    `&redirect_uri=${googleConfig.redirectUri}` +
    `&response_type=code` +
    `&scope=profile email`;

  res.redirect(url);
};

export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        client_id: googleConfig.clientId,
        client_secret: googleConfig.clientSecret,
        redirect_uri: googleConfig.redirectUri,
        grant_type: "authorization_code",
        code,
      }
    );

    const { access_token } = tokenRes.data;

    const profile = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const { id, email, name, picture } = profile.data;

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

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, { httpOnly: true });
    res.redirect(`http://localhost:3000/oauth-success?token=${accessToken}`);
  } catch (err) {
    res.status(500).json({ message: "Google authentication failed" });
  }
};

/* ================= GITHUB ================= */

export const githubAuth = (req, res) => {
  const url =
    `https://github.com/login/oauth/authorize?` +
    `client_id=${githubConfig.clientId}` +
    `&redirect_uri=${githubConfig.redirectUri}` +
    `&scope=user:email`;

  res.redirect(url);
};

export const githubCallback = async (req, res) => {
  try {
    const { code } = req.query;

    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: githubConfig.clientId,
        client_secret: githubConfig.clientSecret,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const { access_token } = tokenRes.data;

    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const emailRes = await axios.get("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const email = emailRes.data.find(e => e.primary).email;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: userRes.data.name || userRes.data.login,
        email,
        avatar: userRes.data.avatar_url,
        provider: "github",
        providerId: userRes.data.id,
        verified: true,
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, { httpOnly: true });
    res.redirect(`http://localhost:3000/oauth-success?token=${accessToken}`);
  } catch (err) {
    res.status(500).json({ message: "GitHub authentication failed" });
  }
};