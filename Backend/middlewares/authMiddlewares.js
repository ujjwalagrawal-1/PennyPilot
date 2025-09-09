// middleware/verifyJWT.js
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { errorhandler } from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // Extract token from cookies or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "").trim();

    // If no token, unauthorized
    if (!token) {
      throw new errorhandler(401, "Access token is missing. Unauthorized access.");
    }

    // Verify JWT
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find user and exclude sensitive fields
    const user = await User.findById(decodedToken?.id).select("-password -refreshToken");

    if (!user) {
      throw new errorhandler(401, "Invalid Access Token: User not found.");
    }

    if (!user.isActive) {
      throw new errorhandler(401, "Account is deactivated.");
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    // Handle JWT-specific errors
    if (error.name === "JsonWebTokenError") {
      throw new errorhandler(401, "Invalid access token");
    }

    if (error.name === "TokenExpiredError") {
      throw new errorhandler(401, "Access token has expired");
    }

    // Re-throw any other error
    throw new errorhandler(401, error.message || "Unauthorized access");
  }
});