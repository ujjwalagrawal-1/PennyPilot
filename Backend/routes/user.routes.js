// routes/user.routes.js
import { Router } from "express";
import { verifyJWT } from "../middlewares/authMiddlewares.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getUserProfile,
  updateAccountDetails,
  updateCurrency,
  updateMonthlyBudget,
  deleteAccount
} from "../controllers/User.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const userRouter = Router();

// 🌐 Public Routes (No Auth Required)
userRouter.post(
  "/register",
  upload.fields([
    {
      name: "UserImage",
      maxCount: 1,
    }
  ]),
  registerUser
);
userRouter.post("/login", loginUser);
userRouter.post("/refresh-token", refreshAccessToken);

// 🔐 Protected Routes (Require JWT)
userRouter.post("/logout", verifyJWT, logoutUser);
userRouter.get("/me", verifyJWT, getUserProfile); // Better than "/current-user"
userRouter.patch("/update", verifyJWT, updateAccountDetails);
userRouter.post("/change-password", verifyJWT, changeCurrentPassword);

// 💰 User Preferences
userRouter.patch("/currency", verifyJWT, updateCurrency);
userRouter.patch("/monthly-budget", verifyJWT, updateMonthlyBudget);

// 🗑️ Account Management
userRouter.delete("/delete", verifyJWT, deleteAccount);

// 🚫 Catch-all for undefined routes
// userRouter.all("*", (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.method} ${req.originalUrl} not found. Please check the API documentation.`
//   });
// });

export default userRouter;