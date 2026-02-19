"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = errorHandler;
const multer_1 = __importDefault(require("multer"));
const errors_1 = require("../utils/errors");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const client_1 = require("@prisma/client");
// Centralized error handler for express
function errorHandler(err, req, res, next) {
    // Handle Prisma errors
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            const target = err.meta?.target;
            const field = Array.isArray(target)
                ? target.join(", ")
                : target || "Record";
            return res.status(400).json({
                success: false,
                message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
                errors: [],
            });
        }
    }
    // Handle multer errors (file size, file filter rejections, etc.)
    if (err instanceof multer_1.default.MulterError) {
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
    if (err instanceof ApiError_1.default) {
        return res
            .status(err.statusCode)
            .json({ success: false, message: err.message, errors: err.errors });
    }
    // Handle authentication errors
    if (err instanceof errors_1.AuthenticationError) {
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
//# sourceMappingURL=error.middleware.js.map