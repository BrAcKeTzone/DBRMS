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

  res
    .status(200)
    .json(
      new ApiResponse(200, settings, "System settings retrieved successfully"),
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
      userId,
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedSettings,
          "System settings updated successfully",
        ),
      );
  },
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
      category || "all",
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          settings,
          `${category || "All"} settings retrieved successfully`,
        ),
      );
  },
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

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          settings,
          "System settings reset to defaults successfully",
        ),
      );
  },
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

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          settings,
          "System settings initialized successfully",
        ),
      );
  },
);

/** * @desc    Send test SMS
 * @route   POST /api/settings/test-sms
 * @access  Private (Admin only)
 */
export const sendTestSMS = asyncHandler(async (req: Request, res: Response) => {
  const { phoneNumber } = req.body;
  const result = await settingsService.sendTestSMS(phoneNumber);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Test SMS sent successfully"));
});
