import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError";
import prisma from "../configs/prisma";
import asyncHandler from "../utils/asyncHandler";

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        isActive: boolean;
      };
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication token is required");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Authentication token is required");
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: number;
        email: string;
      };

      // Get user from database
      const user = await prisma.user.findUnique({
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
        throw new ApiError(401, "User not found");
      }

      if (!user.isActive) {
        throw new ApiError(
          403,
          "Account is deactivated. Please contact admin."
        );
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error: any) {
      if (error.name === "JsonWebTokenError") {
        throw new ApiError(401, "Invalid authentication token");
      } else if (error.name === "TokenExpiredError") {
        throw new ApiError(401, "Authentication token has expired");
      }
      throw error;
    }
  }
);

/**
 * Authorization middleware - Check if user has required role
 */
export const authorize = (...allowedRoles: string[]) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        throw new ApiError(401, "User not authenticated");
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ApiError(
          403,
          `Access denied. Required role: ${allowedRoles.join(" or ")}`
        );
      }

      next();
    }
  );
};
