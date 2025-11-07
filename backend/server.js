import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
