import Transaction from "../models/Transaction.js";

// @desc    Add a new transaction
export const addTransaction = async (req, res) => {
  try {
    const { type, amount, category, description } = req.body;

    // Validation
    if (!type || !amount || !category) {
      return res.status(400).json({ message: "Type, amount, and category are required" });
    }

    const transaction = new Transaction({
      user: req.user._id, // Add user reference from auth middleware
      type,
      amount,
      category,
      description,
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all transactions for logged-in user
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ date: -1 }); // latest first
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get single transaction
export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id // Only fetch if belongs to user
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update a transaction
export const updateTransaction = async (req, res) => {
  try {
    const { type, amount, category, description } = req.body;

    const transaction = await Transaction.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id // Only update if belongs to user
      },
      { type, amount, category, description },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a transaction
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id // Only delete if belongs to user
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get expenses by date range for logged-in user
export const getExpensesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Please provide startDate and endDate in query params" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const expenses = await Transaction.find({
      user: req.user._id, // Only get user's expenses
      type: "expense",
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

import * as mindee from "mindee";

// Init Mindee Client
const mindeeClient = new mindee.ClientV2({
  apiKey: process.env.MINDEE_API_KEY, // keep API key in .env
});

export const imagetoocr = async (req, res) => {
  try {
    let localPath;

    // Step 1: Handle uploaded image from Multer
    if (req.files && req.files.UserImage && req.files.UserImage[0]) {
      localPath = req.files.UserImage[0].path;
      console.log("Local file:", localPath);
    }

    if (!localPath) {
      return res.status(400).json({ message: "Image file is required" });
    }

    // Step 2: Send local image file to Mindee for OCR
    const inputSource = new mindee.PathInput({ inputPath: localPath });

    const inferenceParams = {
      modelId: "c44a1051-fec8-4ba8-86e5-b245f3ce5490", // replace with your modelId
      rag: false,
    };

    const response = await mindeeClient.enqueueAndGetInference(
      inputSource,
      inferenceParams
    );
    console.log("Hi there",response.rawHttp.inference.result.fields.amount.value);
    // Step 3: Send extracted OCR data back
    return res.status(200).json({
      amount : response.rawHttp.inference.result.fields.amount.value,
      description : response.rawHttp.inference.result.fields.description.value,
    });
  } catch (error) {
    console.error("OCR Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
