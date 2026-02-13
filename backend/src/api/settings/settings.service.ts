import { SystemSetting, User } from "@prisma/client";
import ApiError from "../../utils/ApiError";
import prisma from "../../configs/prisma";
import { sendSMS as triggerSMS } from "../../utils/smsService";

const SYSTEM_CONFIG_KEY = "system_config";

export interface Settings extends Partial<SystemSetting> {
  updatedBy?: Partial<User> | null;
}

/**
 * Send a test SMS to verify configuration
 */
export const sendTestSMS = async (phoneNumber: string) => {
  if (!phoneNumber) {
    throw new ApiError(400, "Phone number is required");
  }

  const message =
    "BCFI School Clinic Management System: This is a test message to verify your SMS configuration. If you received this, your settings are working correctly!";

  const result = await triggerSMS(phoneNumber, message);

  // Log to SmsLog for tracking
  await prisma.smsLog.create({
    data: {
      message,
      status: result.success ? "SENT" : "FAILED",
      recipientPhone: phoneNumber,
      recipientName: "Test SMS",
      sentAt: result.success ? new Date() : null,
      failReason: result.success
        ? null
        : (result as any).error || (result as any).message,
    },
  });

  if (!result.success) {
    throw new ApiError(500, `SMS failed: ${result.error || result.message}`);
  }

  return result;
};

/**
 * Get system settings (creates default if not exists)
 */
export const getSettings = async (): Promise<Settings> => {
  let settings = await prisma.systemSetting.findUnique({
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
    const staff = await prisma.user.findFirst({
      where: { role: "CLINIC_STAFF" },
    });

    if (!staff) {
      throw new ApiError(
        500,
        "No clinic staff user found to initialize settings",
      );
    }

    settings = await prisma.systemSetting.create({
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

/**
 * Update system settings
 */
export const updateSettings = async (
  updateData: Partial<
    Omit<
      Settings,
      "id" | "key" | "createdAt" | "updatedAt" | "updatedById" | "updatedBy"
    >
  >,
  updatedById: number,
): Promise<Settings> => {
  // Ensure settings exist
  let settings = await prisma.systemSetting.findUnique({
    where: { key: SYSTEM_CONFIG_KEY },
  });

  // If settings don't exist, create them first
  if (!settings) {
    settings = await prisma.systemSetting.create({
      data: {
        key: SYSTEM_CONFIG_KEY,
        updatedById,
        enableSMSNotifications: true,
        senderName: "DMRMS",
      },
    });
  }

  // Update settings
  const updatedSettings = await prisma.systemSetting.update({
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

/**
 * Initialize default settings (used during first setup)
 */
export const initializeSettings = async (
  adminId: number,
): Promise<Settings> => {
  // Check if settings already exist
  const existingSettings = await prisma.systemSetting.findUnique({
    where: { key: SYSTEM_CONFIG_KEY },
  });

  if (existingSettings) {
    return existingSettings;
  }

  // Create default settings
  const settings = await prisma.systemSetting.create({
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

/**
 * Get settings by category
 */
export const getSettingsByCategory = async (
  category: string,
): Promise<Partial<Settings>> => {
  const settings = await getSettings();

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

/**
 * Reset settings to defaults
 */
export const resetToDefaults = async (adminId: number): Promise<Settings> => {
  // Delete existing settings
  await prisma.systemSetting.deleteMany({
    where: { key: SYSTEM_CONFIG_KEY },
  });

  // Create new default settings
  return initializeSettings(adminId);
};
