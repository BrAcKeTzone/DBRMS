import { Router } from "express";
import * as settingsController from "./settings.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import validate from "../../middlewares/validate.middleware";
import {
  updateSettingsSchema,
  getSettingsByCategorySchema,
} from "./settings.validation";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Note: Role-based authorization middleware should be added here
// For now, all authenticated users can access these routes
// TODO: Add admin-only middleware for settings modification

/**
 * @route   GET /api/settings
 * @desc    Get all system settings
 * @access  Private (Admin only)
 */
router.get("/", settingsController.getSettings);

/**
 * @route   PUT /api/settings
 * @desc    Update system settings
 * @access  Private (Admin only)
 */
router.put(
  "/",
  validate(updateSettingsSchema),
  settingsController.updateSettings
);

/**
 * @route   POST /api/settings/initialize
 * @desc    Initialize default settings (first-time setup)
 * @access  Private (Admin only)
 */
router.post("/initialize", settingsController.initializeSettings);

/**
 * @route   POST /api/settings/reset
 * @desc    Reset settings to defaults
 * @access  Private (Admin only)
 */
router.post("/reset", settingsController.resetToDefaults);

/**
 * @route   GET /api/settings/category/:category
 * @desc    Get settings by category (penalty, contribution, payment, meeting, document, academic, system, notification, all)
 * @access  Private (Admin only)
 */
router.get(
  "/category/:category",
  validate(getSettingsByCategorySchema, "params"),
  settingsController.getSettingsByCategory
);

/**
 * @route   GET /api/settings/documents/categories
 * @desc    Get document categories
 * @access  Private
 */
router.get("/documents/categories", settingsController.getDocumentCategories);

/**
 * @route   POST /api/settings/documents/categories
 * @desc    Add document category
 * @access  Private (Admin only)
 */
router.post("/documents/categories", settingsController.addDocumentCategory);

/**
 * @route   DELETE /api/settings/documents/categories/:category
 * @desc    Remove document category
 * @access  Private (Admin only)
 */
router.delete(
  "/documents/categories/:category",
  settingsController.removeDocumentCategory
);

export default router;
