import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  source: String,
  ext_id: String,
  title: String,
  desc: String,
  url: String,
  topic: String,
  popularity: Number,
  difficulty: Number,
  created_at: Date,
  numeric_id: Number,
});

export default mongoose.model("items", ItemSchema);
