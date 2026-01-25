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

/**
 * @desc    Backup all system data to XLSX
 * @route   POST /api/settings/backup
 * @access  Private (Admin only)
 */
export const backupSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    const buffer = await settingsService.exportDataToXLSX(userId);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=dmrms-backup-${
        new Date().toISOString().split("T")[0]
      }.xlsx`,
    );

    res.status(200).send(buffer);
  },
);

/**
 * @desc    Restore system data from XLSX
 * @route   POST /api/settings/restore
 * @access  Private (Admin only)
 */
export const restoreSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    if (!req.file) {
      throw new ApiError(400, "Please upload an XLSX backup file");
    }

    await settingsService.importDataFromXLSX(req.file.buffer, userId);

    res
      .status(200)
      .json(new ApiResponse(200, null, "Data restored successfully"));
  },
);
