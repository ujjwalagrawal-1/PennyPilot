import express from "express";
import { createCategory, getCategories, updateCategory, deleteCategory } from "../controllers/Category.controller.js";
import { verifyJWT } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.post("/", verifyJWT, createCategory);
router.get("/", verifyJWT, getCategories);
router.put("/:categoryId", verifyJWT, updateCategory);
router.delete("/:categoryId", verifyJWT, deleteCategory);

export default router;