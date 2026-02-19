"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetToDefaults = exports.getSettingsByCategory = exports.initializeSettings = exports.updateSettings = exports.getSettings = exports.sendTestSMS = void 0;
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const prisma_1 = __importDefault(require("../../configs/prisma"));
const smsService_1 = require("../../utils/smsService");
const SYSTEM_CONFIG_KEY = "system_config";
/**
 * Send a test SMS to verify configuration
 */
const sendTestSMS = async (phoneNumber) => {
    if (!phoneNumber) {
        throw new ApiError_1.default(400, "Phone number is required");
    }
    const message = "BCFI School Clinic Management System: This is a test message to verify your SMS configuration. If you received this, your settings are working correctly!";
    const result = await (0, smsService_1.sendSMS)(phoneNumber, message);
    // Log to SmsLog for tracking
    await prisma_1.default.smsLog.create({
        data: {
            message,
            status: result.success ? "SENT" : "FAILED",
            recipientPhone: phoneNumber,
            recipientName: "Test SMS",
            sentAt: result.success ? new Date() : null,
            failReason: result.success
                ? null
                : result.error || result.message,
        },
    });
    if (!result.success) {
        throw new ApiError_1.default(500, `SMS failed: ${result.error || result.message}`);
    }
    return result;
};
exports.sendTestSMS = sendTestSMS;
/**
 * Get system settings (creates default if not exists)
 */
const getSettings = async () => {
    let settings = await prisma_1.default.systemSetting.findUnique({
        where: { key: SYSTEM_CONFIG_KEY },
        include: {
            updatedBy: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    middleName: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
    // If settings don't exist, create with defaults
    if (!settings) {
        // Find first staff to set as updatedBy
        const staff = await prisma_1.default.user.findFirst({
            where: { role: "CLINIC_STAFF" },
        });
        if (!staff) {
            throw new ApiError_1.default(500, "No clinic staff user found to initialize settings");
        }
        settings = await prisma_1.default.systemSetting.create({
            data: {
                key: SYSTEM_CONFIG_KEY,
                updatedById: staff.id,
                enableSMSNotifications: true,
                senderName: "DMRMS",
            },
            include: {
                updatedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        middleName: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
    }
    return settings;
};
exports.getSettings = getSettings;
/**
 * Update system settings
 */
const updateSettings = async (updateData, updatedById) => {
    // Ensure settings exist
    let settings = await prisma_1.default.systemSetting.findUnique({
        where: { key: SYSTEM_CONFIG_KEY },
    });
    // If settings don't exist, create them first
    if (!settings) {
        settings = await prisma_1.default.systemSetting.create({
            data: {
                key: SYSTEM_CONFIG_KEY,
                updatedById,
                enableSMSNotifications: true,
                senderName: "DMRMS",
            },
        });
    }
    // Update settings
    const updatedSettings = await prisma_1.default.systemSetting.update({
        where: { key: SYSTEM_CONFIG_KEY },
        data: {
            ...updateData,
            updatedById,
        },
        include: {
            updatedBy: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    middleName: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
    return updatedSettings;
};
exports.updateSettings = updateSettings;
/**
 * Initialize default settings (used during first setup)
 */
const initializeSettings = async (adminId) => {
    // Check if settings already exist
    const existingSettings = await prisma_1.default.systemSetting.findUnique({
        where: { key: SYSTEM_CONFIG_KEY },
    });
    if (existingSettings) {
        return existingSettings;
    }
    // Create default settings
    const settings = await prisma_1.default.systemSetting.create({
        data: {
            key: SYSTEM_CONFIG_KEY,
            updatedById: adminId,
            enableSMSNotifications: true,
            senderName: "DMRMS",
        },
        include: {
            updatedBy: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    middleName: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
    return settings;
};
exports.initializeSettings = initializeSettings;
/**
 * Get settings by category
 */
const getSettingsByCategory = async (category) => {
    const settings = await (0, exports.getSettings)();
    switch (category) {
        case "system":
            return {};
        case "notification":
            return {
                enableSMSNotifications: settings.enableSMSNotifications,
                smsApiKey: settings.smsApiKey,
                senderName: settings.senderName,
            };
        case "all":
        default:
            return settings;
    }
};
exports.getSettingsByCategory = getSettingsByCategory;
/**
 * Reset settings to defaults
 */
const resetToDefaults = async (adminId) => {
    // Delete existing settings
    await prisma_1.default.systemSetting.deleteMany({
        where: { key: SYSTEM_CONFIG_KEY },
    });
    // Create new default settings
    return (0, exports.initializeSettings)(adminId);
};
exports.resetToDefaults = resetToDefaults;
//# sourceMappingURL=settings.service.js.map