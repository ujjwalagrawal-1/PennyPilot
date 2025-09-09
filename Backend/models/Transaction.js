import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ["revenue", "expense"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0, // no negative amounts
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Food",
      "Transport",
      "Shopping",
      "Bills",
      "Salary",
      "Investment",
      "Entertainment",
      "Other",
    ],
  },
  description: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Add index for better query performance
transactionSchema.index({ user: 1, date: -1 });

// Create model
const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
