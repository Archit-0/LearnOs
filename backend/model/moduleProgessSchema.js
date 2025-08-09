// models/ModuleProgress.js
import mongoose from "mongoose";

const moduleProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  module: { type: String, required: true }, 
  completed: { type: Boolean, default: false },
  lastAccessed: { type: Date, default: Date.now },
  timeSpent: { type: Number },
});

export default mongoose.model("ModuleProgress", moduleProgressSchema);
