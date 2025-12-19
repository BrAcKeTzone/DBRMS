import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import * as settingsService from "./settings.service";
import ApiError from "../../utils/ApiError";

/**
 * @desc    Get system settings
 * @route   GET /api/settings
 * @access  Private (Admin only)
 */
export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await settingsService.getSettings();

  // Parse documentCategories from JSON string to array for response
  const responseSettings = {
    ...settings,
    documentCategories: JSON.parse(settings.documentCategories),
  };

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        responseSettings,
        "System settings retrieved successfully"
      )
    );
});

/**
 * @desc    Update system settings
 * @route   PUT /api/settings
 * @access  Private (Admin only)
 */
export const updateSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    const updatedSettings = await settingsService.updateSettings(
      req.body,
      userId
    );

    // Parse documentCategories from JSON string to array for response
    const responseSettings = {
      ...updatedSettings,
      documentCategories: JSON.parse(updatedSettings.documentCategories),
    };

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          responseSettings,
          "System settings updated successfully"
        )
      );
  }
);

/**
 * @desc    Get settings by category
 * @route   GET /api/settings/category/:category
 * @access  Private (Admin only)
 */
export const getSettingsByCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { category } = req.params;

    const settings = await settingsService.getSettingsByCategory(
      category || "all"
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          settings,
          `${category || "All"} settings retrieved successfully`
        )
      );
  }
);

/**
 * @desc    Reset settings to defaults
 * @route   POST /api/settings/reset
 * @access  Private (Admin only)
 */
export const resetToDefaults = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    const settings = await settingsService.resetToDefaults(userId);

    // Parse documentCategories from JSON string to array for response
    const responseSettings = {
      ...settings,
      documentCategories: JSON.parse(settings.documentCategories),
    };

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          responseSettings,
          "System settings reset to defaults successfully"
        )
      );
  }
);

/**
 * @desc    Get document categories
 * @route   GET /api/settings/documents/categories
 * @access  Private
 */
export const getDocumentCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await settingsService.getDocumentCategories();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { categories },
          "Document categories retrieved successfully"
        )
      );
  }
);

/**
 * @desc    Add document category
 * @route   POST /api/settings/documents/categories
 * @access  Private (Admin only)
 */
export const addDocumentCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { category } = req.body;

    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    if (!category || typeof category !== "string" || category.trim() === "") {
      throw new ApiError(400, "Category name is required");
    }

    const categories = await settingsService.addDocumentCategory(
      category.trim(),
      userId
    );

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { categories },
          "Document category added successfully"
        )
      );
  }
);

/**
 * @desc    Remove document category
 * @route   DELETE /api/settings/documents/categories/:category
 * @access  Private (Admin only)
 */
export const removeDocumentCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { category } = req.params;

    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    if (!category) {
      throw new ApiError(400, "Category name is required");
    }

    const categories = await settingsService.removeDocumentCategory(
      category,
      userId
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { categories },
          "Document category removed successfully"
        )
      );
  }
);

/**
 * @desc    Initialize default settings (first-time setup)
 * @route   POST /api/settings/initialize
 * @access  Private (Admin only)
 */
export const initializeSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    const settings = await settingsService.initializeSettings(userId);

    // Parse documentCategories from JSON string to array for response
    const responseSettings = {
      ...settings,
      documentCategories: JSON.parse(settings.documentCategories),
    };

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          responseSettings,
          "System settings initialized successfully"
        )
      );
  }
);
