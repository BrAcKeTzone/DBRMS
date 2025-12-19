import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { AuthenticationError } from "../utils/errors";
import ApiError from "../utils/ApiError";

// Centralized error handler for express
export default function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Handle multer errors (file size, file filter rejections, etc.)
  if (err instanceof multer.MulterError) {
    // Map common multer errors to user-friendly messages
    let message = "File upload error";
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        message = "File size exceeds the maximum allowed size";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = "Unexpected file field";
        break;
      default:
        message = err.message || message;
        break;
    }
    return res.status(400).json({ success: false, message, errors: [] });
  }

  // Handle our ApiError class instances
  if (err instanceof ApiError) {
    return res
      .status(err.statusCode)
      .json({ success: false, message: err.message, errors: err.errors });
  }

  // Handle authentication errors
  if (err instanceof AuthenticationError) {
    return res
      .status(err.statusCode)
      .json({ success: false, message: err.message, errors: [] });
  }

  // Generic handler for other errors
  console.error(err.stack || err);
  return res
    .status(500)
    .json({ success: false, message: "Internal server error", errors: [] });
}
