import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
  verificationCode: { type: String },
  refreshToken: { type: String },
  provider: {
  type: String,
  enum: ["local", "google", "github"],
  default: "local",
  },
  providerId: {type: String},
  avatar: {type: String}
});

export default mongoose.model("User", userSchema);
