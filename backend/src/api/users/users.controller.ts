import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import * as userService from "./users.service";

// Create new user (admin only)
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);

  res.status(201).json(new ApiResponse(201, user, "User created successfully"));
});

// Get user by ID (admin only)
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid user ID"));
  }

  const user = await userService.getUserById(id);

  res
    .status(200)
    .json(new ApiResponse(200, user, "User retrieved successfully"));
});

// Get current user profile (self)
export const getUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    // Get userId from auth middleware (req.user is set by authenticate middleware)
    const userId = (req as any).user?.id;

    if (!userId) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Unauthorized - User ID not found"));
    }

    const user = await userService.getUserProfile(userId);

    res
      .status(200)
      .json(new ApiResponse(200, user, "Profile retrieved successfully"));
  }
);

// Update user profile (self)
export const updateUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    // Get userId from auth middleware
    const userId = (req as any).user?.id;

    if (!userId) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Unauthorized - User ID not found"));
    }

    const user = await userService.updateUserProfile(userId, req.body);

    res
      .status(200)
      .json(new ApiResponse(200, user, "Profile updated successfully"));
  }
);

// Get all users with filters (admin only)
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.getAllUsers(req.query);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Users retrieved successfully"));
});

// Update user role (admin only)
export const updateUserRole = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid user ID"));
    }

    const { role } = req.body;
    const user = await userService.updateUserRole(id, role);

    res
      .status(200)
      .json(new ApiResponse(200, user, "User role updated successfully"));
  }
);

// Deactivate user (admin only)
export const deactivateUser = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid user ID"));
    }

    const user = await userService.deactivateUser(id);

    res
      .status(200)
      .json(new ApiResponse(200, user, "User deactivated successfully"));
  }
);

// Promote user to Clinic Admin (admin only)
export const promoteToAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid user ID"));
    }

    const result = await userService.promoteUserToAdmin(id);

    res
      .status(200)
      .json(new ApiResponse(200, result, "User promoted to Clinic Admin"));
  }
);

// Activate user (admin only)
export const activateUser = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid user ID"));
    }

    const user = await userService.activateUser(id);

    res
      .status(200)
      .json(new ApiResponse(200, user, "User activated successfully"));
  }
);

// Update user by admin (admin only)
export const updateUserByAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid user ID"));
    }

    const user = await userService.updateUserByAdmin(id, req.body);

    res
      .status(200)
      .json(new ApiResponse(200, user, "User updated successfully"));
  }
);

// Delete user (admin only)
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid user ID"));
  }

  await userService.deleteUser(id);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { message: "User deleted successfully" },
        "User deleted successfully"
      )
    );
});

// Change password (self)
export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    // Get userId from auth middleware
    const userId = (req as any).user?.id;

    if (!userId) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Unauthorized - User ID not found"));
    }

    const { currentPassword, newPassword } = req.body;

    await userService.changePassword(userId, currentPassword, newPassword);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { message: "Password changed successfully" },
          "Password changed successfully"
        )
      );
  }
);

// Get user statistics (admin only)
export const getUserStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await userService.getUserStats();

    res
      .status(200)
      .json(
        new ApiResponse(200, stats, "User statistics retrieved successfully")
      );
  }
);

// Upload profile picture (self)
export const uploadProfilePicture = asyncHandler(
  async (req: Request, res: Response) => {
    // Get userId from auth middleware
    const userId = (req as any).user?.id;

    if (!userId) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Unauthorized - User ID not found"));
    }

    const { image, profilePicture } = req.body;
    const pictureData = image || profilePicture;

    if (!pictureData) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Profile picture data is required"));
    }

    const user = await userService.updateProfilePicture(userId, pictureData);

    res
      .status(200)
      .json(new ApiResponse(200, user, "Profile picture updated successfully"));
  }
);
