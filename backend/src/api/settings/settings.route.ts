import { Router } from "express";
import * as settingsController from "./settings.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import validate from "../../middlewares/validate.middleware";
import {
  updateSettingsSchema,
  getSettingsByCategorySchema,
} from "./settings.validation";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/settings
 * @desc    Get all system settings
 * @access  Private (Admin only)
 */
router.get("/", authorize("CLINIC_STAFF"), settingsController.getSettings);

/**
 * @route   PUT /api/settings
 * @desc    Update system settings
 * @access  Private (Admin only)
 */
router.put(
  "/",
  authorize("CLINIC_STAFF"),
  validate(updateSettingsSchema),
  settingsController.updateSettings,
);

/**
 * @route   POST /api/settings/test-sms
 * @desc    Send test SMS
 * @access  Private (Admin only)
 */
router.post(
  "/test-sms",
  authorize("CLINIC_STAFF"),
  settingsController.sendTestSMS,
);

/**
 * @route   POST /api/settings/initialize
 * @desc    Initialize default settings (first-time setup)
 * @access  Private (Admin only)
 */
router.post(
  "/initialize",
  authorize("CLINIC_STAFF"),
  settingsController.initializeSettings,
);

/**
 * @route   POST /api/settings/reset
 * @desc    Reset settings to defaults
 * @access  Private (Admin only)
 */
router.post(
  "/reset",
  authorize("CLINIC_STAFF"),
  settingsController.resetToDefaults,
);

/**
 * @route   GET /api/settings/category/:category
 * @desc    Get settings by category (penalty, contribution, payment, meeting, document, academic, system, notification, all)
 * @access  Private (Admin only)
 */
router.get(
  "/category/:category",
  authorize("CLINIC_STAFF"),
  validate(getSettingsByCategorySchema, "params"),
  settingsController.getSettingsByCategory,
);

export default router;
