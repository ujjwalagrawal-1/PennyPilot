import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  type: {
    type: String,
    required: true,
    enum: ["expense", "revenue"]
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

categorySchema.index({ userId: 1, type: 1, name: 1 }, { unique: true });

export const Category = mongoose.model("Category", categorySchema);