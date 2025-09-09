import { Category } from "../models/Category.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createCategory = async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;
    if (!name || !type) {
      return res.status(400).json({ success: false, message: "Name and type are required" });
    }
    if (!["expense", "revenue"].includes(type)) {
      return res.status(400).json({ success: false, message: "Type must be 'expense' or 'revenue'" });
    }
    const exists = await Category.findOne({ name, type, userId: req.user._id });
    if (exists) {
      return res.status(409).json({ success: false, message: "Category already exists" });
    }
    const category = await Category.create({
      name,
      type,
      icon,
      color,
      userId: req.user._id
    });
    return res.status(201).json(new ApiResponse(201, category, "Category created successfully"));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

export const getCategories = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { userId: req.user._id };
    if (type) filter.type = type;
    const categories = await Category.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, categories, "Categories fetched"));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, icon, color } = req.body;
    const category = await Category.findOneAndUpdate(
      { _id: categoryId, userId: req.user._id },
      { $set: { name, icon, color } },
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found or not authorized" });
    }
    return res.status(200).json(new ApiResponse(200, category, "Category updated"));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findOneAndDelete({ _id: categoryId, userId: req.user._id });
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found or not authorized" });
    }
    return res.status(200).json(new ApiResponse(200, {}, "Category deleted"));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};