"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const prisma_1 = __importDefault(require("../configs/prisma"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
exports.authenticate = (0, asyncHandler_1.default)(async (req, res, next) => {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ApiError_1.default(401, "Authentication token is required");
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        throw new ApiError_1.default(401, "Authentication token is required");
    }
    try {
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Get user from database
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
            },
        });
        if (!user) {
            throw new ApiError_1.default(401, "User not found");
        }
        if (!user.isActive) {
            throw new ApiError_1.default(403, "Account is deactivated. Please contact admin.");
        }
        // Attach user to request
        req.user = user;
        next();
    }
    catch (error) {
        if (error.name === "JsonWebTokenError") {
            throw new ApiError_1.default(401, "Invalid authentication token");
        }
        else if (error.name === "TokenExpiredError") {
            throw new ApiError_1.default(401, "Authentication token has expired");
        }
        throw error;
    }
});
/**
 * Authorization middleware - Check if user has required role
 */
const authorize = (...allowedRoles) => {
    return (0, asyncHandler_1.default)(async (req, res, next) => {
        if (!req.user) {
            throw new ApiError_1.default(401, "User not authenticated");
        }
        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError_1.default(403, `Access denied. Required role: ${allowedRoles.join(" or ")}`);
        }
        next();
    });
};
exports.authorize = authorize;
//# sourceMappingURL=auth.middleware.js.map