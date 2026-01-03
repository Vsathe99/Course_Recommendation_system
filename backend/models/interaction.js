import mongoose from "mongoose";

const InteractionSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  item_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  liked: { type: Boolean, default: false },
  saved: { type: Boolean, default: false },
  rating: { type: Number },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.model("interactions", InteractionSchema);
