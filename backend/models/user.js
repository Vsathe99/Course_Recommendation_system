import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: function () {
      return this.provider === "local";
    },
  },

  avatar: String,

  provider: {
    type: String,
    enum: ["local", "google", "github"],
    default: "local",
  },

  providerId: String,

  verified: {
    type: Boolean,
    default: false,
  },

  refreshToken: String,
	verificationCode: { type: String },
});

export default mongoose.model("User", userSchema);