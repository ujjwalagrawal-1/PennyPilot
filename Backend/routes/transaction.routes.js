import express from "express";
import { upload } from "../middlewares/multer.middleware.js"; 
import {
  addTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getExpensesByDateRange,
  imagetoocr
} from "../controllers/Transaction.controller.js";

const router = express.Router();
import { verifyJWT } from "../middlewares/authMiddlewares.js";
// CRUD routes
router.post("/",verifyJWT, addTransaction);         // Add transaction
router.get("/",verifyJWT, getTransactions);          // Get all transactions
router.get("/:id",verifyJWT, getTransactionById);    // Get single transaction
router.put("/:id",verifyJWT, updateTransaction);     // Update transaction
router.delete("/:id",verifyJWT, deleteTransaction);  // Delete transaction
router.post("/ocr",verifyJWT,upload.fields([
    {
      name: "UserImage",
      maxCount: 1,
    }
  ]), imagetoocr); // OCR route

// Custom route for expenses by date range
router.get("/expenses/date-range/filter", verifyJWT,getExpensesByDateRange);

export default router;
