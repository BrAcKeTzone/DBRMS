import { PrismaClient, Settings } from "@prisma/client";
import ApiError from "../../utils/ApiError";
import prisma from "../../configs/prisma";

const SYSTEM_CONFIG_KEY = "system_config";

// Default document categories
const DEFAULT_DOCUMENT_CATEGORIES = [
  "Minutes",
  "Resolutions",
  "Financial Reports",
  "Project Proposals",
  "Attendance Records",
  "Legal Documents",
  "Communications",
  "Other",
];

/**
 * Get system settings (creates default if not exists)
 */
export const getSettings = async (): Promise<Settings> => {
  let settings = await prisma.settings.findUnique({
    where: { key: SYSTEM_CONFIG_KEY },
    include: {
      updatedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,

          lastName: true,
          middleName: true,

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
    // Find first admin to set as updatedBy
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!admin) {
      throw new ApiError(500, "No admin user found to initialize settings");
    }

    settings = await prisma.settings.create({
      data: {
        key: SYSTEM_CONFIG_KEY,
        documentCategories: JSON.stringify(DEFAULT_DOCUMENT_CATEGORIES),
        updatedById: admin.id,
      },
      include: {
        updatedBy: {
          select: {
            id: true,
            firstName: true,
          lastName: true,
          middleName: true,

          lastName: true,
          middleName: true,

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
    Omit<Settings, "id" | "key" | "createdAt" | "updatedAt" | "updatedById">
  >,
  updatedById: number
): Promise<Settings> => {
  // Ensure settings exist
  let settings = await prisma.settings.findUnique({
    where: { key: SYSTEM_CONFIG_KEY },
  });

  // If settings don't exist, create them first
  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        key: SYSTEM_CONFIG_KEY,
        documentCategories: JSON.stringify(DEFAULT_DOCUMENT_CATEGORIES),
        updatedById,
      },
    });
  }

  // Prepare update data
  const updatePayload: any = {
    ...updateData,
    updatedById,
  };

  // Convert documentCategories array to JSON string if provided
  if (updateData.documentCategories) {
    if (Array.isArray(updateData.documentCategories)) {
      updatePayload.documentCategories = JSON.stringify(
        updateData.documentCategories
      );
    } else {
      updatePayload.documentCategories = updateData.documentCategories;
    }
  }

  // Validate penalty rates
  if (
    updateData.penaltyRatePerAbsence !== undefined &&
    updateData.penaltyRatePerAbsence < 0
  ) {
    throw new ApiError(400, "Penalty rate per absence cannot be negative");
  }
  if (
    updateData.penaltyRateLate !== undefined &&
    updateData.penaltyRateLate < 0
  ) {
    throw new ApiError(
      400,
      "Penalty rate for late attendance cannot be negative"
    );
  }

  // Validate contribution amounts
  if (
    updateData.monthlyContributionAmount !== undefined &&
    updateData.monthlyContributionAmount < 0
  ) {
    throw new ApiError(400, "Monthly contribution amount cannot be negative");
  }
  if (
    updateData.projectContributionMinimum !== undefined &&
    updateData.projectContributionMinimum < 0
  ) {
    throw new ApiError(400, "Project contribution minimum cannot be negative");
  }

  // Validate percentage values
  if (
    updateData.quorumPercentage !== undefined &&
    (updateData.quorumPercentage < 0 || updateData.quorumPercentage > 100)
  ) {
    throw new ApiError(400, "Quorum percentage must be between 0 and 100");
  }

  // Update settings
  const updatedSettings = await prisma.settings.update({
    where: { key: SYSTEM_CONFIG_KEY },
    data: updatePayload,
    include: {
      updatedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,

          lastName: true,
          middleName: true,

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
  adminId: number
): Promise<Settings> => {
  // Check if settings already exist
  const existingSettings = await prisma.settings.findUnique({
    where: { key: SYSTEM_CONFIG_KEY },
  });

  if (existingSettings) {
    return existingSettings;
  }

  // Create default settings
  const settings = await prisma.settings.create({
    data: {
      key: SYSTEM_CONFIG_KEY,
      documentCategories: JSON.stringify(DEFAULT_DOCUMENT_CATEGORIES),
      updatedById: adminId,
    },
    include: {
      updatedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,

          lastName: true,
          middleName: true,

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
  category: string
): Promise<Partial<Settings>> => {
  const settings = await getSettings();

  // Parse documentCategories from JSON string to array
  const parsedSettings = {
    ...settings,
    documentCategories: JSON.parse(settings.documentCategories),
  };

  switch (category) {
    case "penalty":
      return {
        penaltyRatePerAbsence: parsedSettings.penaltyRatePerAbsence,
        penaltyRateLate: parsedSettings.penaltyRateLate,
        penaltyGracePeriodDays: parsedSettings.penaltyGracePeriodDays,
        enableAutoPenalty: parsedSettings.enableAutoPenalty,
      };

    case "contribution":
      return {
        monthlyContributionAmount: parsedSettings.monthlyContributionAmount,
        projectContributionMinimum: parsedSettings.projectContributionMinimum,
        enableMandatoryContribution: parsedSettings.enableMandatoryContribution,
      };

    case "payment":
      return {
        paymentBasis: parsedSettings.paymentBasis,
        allowPartialPayment: parsedSettings.allowPartialPayment,
        paymentDueDays: parsedSettings.paymentDueDays,
      };

    case "meeting":
      return {
        minimumMeetingsPerYear: parsedSettings.minimumMeetingsPerYear,
        quorumPercentage: parsedSettings.quorumPercentage,
        notificationDaysBeforeMeet: parsedSettings.notificationDaysBeforeMeet,
      };

    case "document":
      return {
        documentCategories: parsedSettings.documentCategories,
      };

    case "academic":
      return {
        currentAcademicYear: parsedSettings.currentAcademicYear,
        academicYearStart: parsedSettings.academicYearStart,
        academicYearEnd: parsedSettings.academicYearEnd,
      };

    case "system":
      return {
        systemName: parsedSettings.systemName,
        systemEmail: parsedSettings.systemEmail,
        systemPhone: parsedSettings.systemPhone,
      };

    case "notification":
      return {
        enableEmailNotifications: parsedSettings.enableEmailNotifications,
        enableSMSNotifications: parsedSettings.enableSMSNotifications,
      };

    case "all":
    default:
      return parsedSettings;
  }
};

/**
 * Reset settings to defaults
 */
export const resetToDefaults = async (adminId: number): Promise<Settings> => {
  // Delete existing settings
  await prisma.settings.deleteMany({
    where: { key: SYSTEM_CONFIG_KEY },
  });

  // Create new default settings
  return initializeSettings(adminId);
};

/**
 * Get document categories as array
 */
export const getDocumentCategories = async (): Promise<string[]> => {
  const settings = await getSettings();
  return JSON.parse(settings.documentCategories);
};

/**
 * Add document category
 */
export const addDocumentCategory = async (
  category: string,
  adminId: number
): Promise<string[]> => {
  const categories = await getDocumentCategories();

  // Check if category already exists (case-insensitive)
  if (categories.some((cat) => cat.toLowerCase() === category.toLowerCase())) {
    throw new ApiError(400, "Document category already exists");
  }

  categories.push(category);

  await updateSettings(
    { documentCategories: JSON.stringify(categories) },
    adminId
  );

  return categories;
};

/**
 * Remove document category
 */
export const removeDocumentCategory = async (
  category: string,
  adminId: number
): Promise<string[]> => {
  const categories = await getDocumentCategories();

  // Find and remove category (case-insensitive)
  const index = categories.findIndex(
    (cat) => cat.toLowerCase() === category.toLowerCase()
  );

  if (index === -1) {
    throw new ApiError(404, "Document category not found");
  }

  categories.splice(index, 1);

  if (categories.length === 0) {
    throw new ApiError(400, "At least one document category is required");
  }

  await updateSettings(
    { documentCategories: JSON.stringify(categories) },
    adminId
  );

  return categories;
};







