import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { errorhandler } from "../utils/errorHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt, { decode } from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

/**
 * Register User
 */
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password, currency, monthlyBudget } =
    req.body;

  // Validate required fields
  if (!username || !email || !fullName || !password) {
    return res
      .status(400)
      .json(
        new errorhandler(
          400,
          "Username, email, full name, and password are required"
        )
      );
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    return res
      .status(400)
      .json(
        new errorhandler(400, "User with this email or username already exists")
      );
  }

  let avatar =
    "https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light";
  // if (req.files && req.files.UserImage && req.files.UserImage[0]) {
  //     const User_Image_local_path = req.files.UserImage[0].path;
  //     console.log(User_Image_local_path);
  //     // Upload the image to Cloudinary and get only the URL
  //     const avatarUrl = await uploadOnCloudinary(User_Image_local_path);
  //     avatar = avatarUrl.url;
  // }
  console.log(avatar);
  // Create user object
  const userData = {
    username,
    email,
    fullName,
    password,
    avatar: avatar || null,
    currency: currency || "IND",
    monthlyBudget: monthlyBudget || 0,
  };

  const user = await User.create(userData);

  // Generate tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save();

  // Remove password from response
  const userResponse = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(201)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .json(
      new ApiResponse(
        201,
        {
          userResponse,
          accessToken,
          refreshToken,
        },
        "User registered successfully"
      )
    );
});

/**
 * Login User
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res
      .status(400)
      .json(new ErrorHandler(400, "Email and password are required"));
  }

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json(new ErrorHandler(401, "Invalid credentials"));
  }

  // Check password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    return res.status(401).json(new ErrorHandler(401, "Invalid credentials"));
  }

  // Generate tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Save refresh token and update last login
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false }); // Avoid rehashing password if pre-save hooks exist

  // Remove sensitive fields from response
  const userResponse = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Send response with cookies
  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 6 * 60 * 60 * 1000, // 6 hours
    })

    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000, // e.g., 7 days
    })
    .json(
      new ApiResponse(
        200,
        {
          user: userResponse,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

/**
 * Logout User
 */
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

/**
 * Refresh Access Token
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  console.log(incomingRefreshToken);
  if (!incomingRefreshToken) {
    return res
      .status(401)
      .json(new errorhandler(401, "Refresh token is required"));
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken.id);
    if (!user || user.refreshToken !== incomingRefreshToken) {
      return res
        .status(401)
        .json(new errorhandler(401, "Invalid or expired refresh token"));
    }

    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    // Update refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    return res
      .status(200)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      })
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      })
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    return res.status(401).json(new errorhandler(401, "Invalid refresh token"));
  }
});

/**
 * Get User Profile
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    return res.status(404).json(new errorhandler(404, "User not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile fetched successfully"));
});

/**
 * Change Password
 */
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json(
        new errorhandler(400, "Old password and new password are required")
      );
  }

  if (newPassword.length < 4) {
    return res
      .status(400)
      .json(
        new errorhandler(400, "New password must be at least 4 characters long")
      );
  }

  const user = await User.findById(req.user._id);

  // Verify old password
  const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isOldPasswordCorrect) {
    return res.status(400).json(new errorhandler(400, "Invalid old password"));
  }

  // Update password
  user.password = newPassword;
  user.refreshToken = undefined;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

/**
 * Update Account Details
 */
const updateAccountDetails = asyncHandler(async (req, res) => {
  let updateFields = { ...req.body };

  // Remove fields that shouldn't be updated via this endpoint
  delete updateFields.password;
  delete updateFields.email; // Email changes might need verification
  delete updateFields.refreshToken;

  // Handle avatar upload
  if (req.files && req.files.avatar) {
    const avatarLocalPath = req.files.avatar[0].path;
    const avatarUrl = await uploadOnCloudinary(avatarLocalPath);
    updateFields.avatar = avatarUrl.url;
  }

  // Validate currency if provided
  if (updateFields.currency) {
    const validCurrencies = ["USD", "EUR", "INR", "GBP", "JPY", "CAD", "AUD"];
    if (!validCurrencies.includes(updateFields.currency)) {
      return res.status(400).json(new errorhandler(400, "Invalid currency"));
    }
  }

  // Validate monthly budget if provided
  if (
    updateFields.monthlyBudget !== undefined &&
    updateFields.monthlyBudget < 0
  ) {
    return res
      .status(400)
      .json(new errorhandler(400, "Monthly budget cannot be negative"));
  }

  // Validate username if provided
  if (updateFields.username) {
    const existingUser = await User.findOne({
      username: updateFields.username,
      _id: { $ne: req.user._id }, // Exclude current user
    });

    if (existingUser) {
      return res
        .status(400)
        .json(new errorhandler(400, "Username already taken"));
    }
  }

  if (Object.keys(updateFields).length === 0) {
    return res
      .status(400)
      .json(new errorhandler(400, "No valid fields to update"));
  }

  // Update user
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

/**
 * Update User Currency
 */
const updateCurrency = asyncHandler(async (req, res) => {
  const { currency } = req.body;

  if (!currency) {
    return res.status(400).json(new errorhandler(400, "Currency is required"));
  }

  const validCurrencies = ["USD", "EUR", "INR", "GBP", "JPY", "CAD", "AUD"];
  if (!validCurrencies.includes(currency)) {
    return res.status(400).json(new errorhandler(400, "Invalid currency"));
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { currency },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Currency updated successfully"));
});

/**
 * Update Monthly Budget
 */
const updateMonthlyBudget = asyncHandler(async (req, res) => {
  const { monthlyBudget } = req.body;

  if (monthlyBudget === undefined || monthlyBudget === null) {
    return res
      .status(400)
      .json(new errorhandler(400, "Monthly budget is required"));
  }

  if (monthlyBudget < 0) {
    return res
      .status(400)
      .json(new errorhandler(400, "Monthly budget cannot be negative"));
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { monthlyBudget },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Monthly budget updated successfully"));
});

/**
 * Delete Account
 */
const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res
      .status(400)
      .json(new errorhandler(400, "Password is required to delete account"));
  }

  const user = await User.findById(req.user._id);

  // Verify password
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    return res.status(400).json(new errorhandler(400, "Invalid password"));
  }

  // Instead of deleting, we can deactivate the account
  user.isActive = false;
  user.refreshToken = undefined;
  await user.save();

  return res
    .status(200)
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .json(new ApiResponse(200, {}, "Account deactivated successfully"));
});

export {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateAccountDetails,
  updateCurrency,
  updateMonthlyBudget,
  // forgotPassword,
  // resetPassword,
  // sendEmailVerification,
  // verifyEmail,
  deleteAccount,
};
