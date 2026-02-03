import { PrismaClient, SystemSetting, User } from "@prisma/client";
import ApiError from "../../utils/ApiError";
import prisma from "../../configs/prisma";
import * as XLSX from "xlsx";
import { sendSMS as triggerSMS } from "../../utils/smsService";

const SYSTEM_CONFIG_KEY = "system_config";

export interface Settings extends Partial<SystemSetting> {
  updatedBy?: Partial<User>;
}

/**
 * Send a test SMS to verify configuration
 */
export const sendTestSMS = async (phoneNumber: string) => {
  if (!phoneNumber) {
    throw new ApiError(400, "Phone number is required");
  }

  const message =
    "DMRMS: This is a test message to verify your SMS configuration. If you received this, your settings are working correctly!";

  const result = await triggerSMS(phoneNumber, message);

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
        defaultTemplate:
          "Clinic Alert: Your child {student} visited the clinic on {date}. Symptoms: {reason}. Diagnosis: Pending.",
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
    Omit<Settings, "id" | "key" | "createdAt" | "updatedAt" | "updatedById">
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
        defaultTemplate:
          "Clinic Alert: Your child {student} visited the clinic on {date}. Symptoms: {reason}. Diagnosis: Pending.",
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
      defaultTemplate:
        "Clinic Alert: Your child {student} visited the clinic on {date}. Symptoms: {reason}. Diagnosis: Pending.",
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
      return {
        lastBackup: settings.lastBackup,
      };

    case "notification":
      return {
        enableSMSNotifications: settings.enableSMSNotifications,
        smsApiKey: settings.smsApiKey,
        senderName: settings.senderName,
        defaultTemplate: settings.defaultTemplate,
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

/**
 * Export all system data to XLSX buffer
 */
export const exportDataToXLSX = async (adminId: number): Promise<Buffer> => {
  // Fetch data from various models
  const students = await prisma.student.findMany({
    include: { course: true },
  });
  const courses = await prisma.course.findMany();
  const visits = await prisma.clinicVisit.findMany({
    include: { student: true },
  });
  const metrics = await prisma.healthMetric.findMany({
    include: { student: true },
  });
  const settings = await prisma.systemSetting.findMany();

  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // 1. Students Sheet
  const studentsData = students.map((s) => ({
    "Student ID": s.studentId,
    "First Name": s.firstName,
    "Last Name": s.lastName,
    "Middle Name": s.middleName || "",
    Sex: s.sex,
    "Birth Date": s.birthDate.toISOString().split("T")[0],
    "Year Enrolled": s.yearEnrolled,
    "Year Level": s.yearLevel || "",
    Status: s.status,
    Course: s.course.code,
    "Blood Type": s.bloodType || "",
    Allergies: s.allergies || "",
  }));
  const wsStudents = XLSX.utils.json_to_sheet(studentsData);
  XLSX.utils.book_append_sheet(wb, wsStudents, "Students");

  // 2. Courses Sheet
  const coursesData = courses.map((c) => ({
    Code: c.code,
    Name: c.name,
    Description: c.description || "",
  }));
  const wsCourses = XLSX.utils.json_to_sheet(coursesData);
  XLSX.utils.book_append_sheet(wb, wsCourses, "Courses");

  // 3. Clinic Visits Sheet
  const visitsData = visits.map((v) => ({
    Student: `${v.student.firstName} ${v.student.lastName}`,
    "Student ID": v.student.studentId,
    Date: v.visitDateTime.toISOString(),
    Symptoms: v.symptoms,
    Diagnosis: v.diagnosis || "",
    Treatment: v.treatment || "",
    "Blood Pressure": v.bloodPressure || "",
    Temperature: v.temperature || "",
    "Pulse Rate": v.pulseRate || "",
    Emergency: v.isEmergency ? "YES" : "NO",
    Referred: v.isReferredToHospital ? "YES" : "NO",
    Hospital: v.hospitalName || "",
  }));
  const wsVisits = XLSX.utils.json_to_sheet(visitsData);
  XLSX.utils.book_append_sheet(wb, wsVisits, "Clinic Visits");

  // 4. Health Metrics Sheet
  const metricsData = metrics.map((m) => ({
    Student: `${m.student.firstName} ${m.student.lastName}`,
    "Student ID": m.student.studentId,
    Year: m.year,
    "Height (cm)": m.heightCm || "",
    "Weight (kg)": m.weightKg || "",
    BMI: m.bmi || "",
    "Blood Type": m.bloodType || "",
    Allergies: m.allergies || "",
  }));
  const wsMetrics = XLSX.utils.json_to_sheet(metricsData);
  XLSX.utils.book_append_sheet(wb, wsMetrics, "Health Metrics");

  // 5. Settings Sheet
  const settingsData = settings.map((s) => ({
    Key: s.key,
    "SMS Enabled": s.enableSMSNotifications ? "YES" : "NO",
    "Sender Name": s.senderName || "",
    "Default Template": s.defaultTemplate || "",
    "Last Backup": s.lastBackup || "",
  }));
  const wsSettings = XLSX.utils.json_to_sheet(settingsData);
  XLSX.utils.book_append_sheet(wb, wsSettings, "System Settings");

  // Write to buffer
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  // Update last backup timestamp
  await prisma.systemSetting.update({
    where: { key: SYSTEM_CONFIG_KEY },
    data: {
      lastBackup: new Date().toLocaleString(),
      updatedById: adminId,
    },
  });

  return buf;
};

/**
 * Import system data from XLSX buffer
 */
export const importDataFromXLSX = async (
  buffer: Buffer,
  adminId: number,
): Promise<void> => {
  const wb = XLSX.read(buffer, { type: "buffer" });

  // 1. Courses Import
  if (wb.SheetNames.includes("Courses")) {
    const coursesData = XLSX.utils.sheet_to_json(wb.Sheets["Courses"]) as any[];
    for (const item of coursesData) {
      await prisma.course.upsert({
        where: { code: item.Code },
        update: {
          name: item.Name,
          description: item.Description,
        },
        create: {
          code: item.Code,
          name: item.Name,
          description: item.Description,
          createdById: adminId,
        },
      });
    }
  }

  // 2. Students Import
  if (wb.SheetNames.includes("Students")) {
    const studentsData = XLSX.utils.sheet_to_json(
      wb.Sheets["Students"],
    ) as any[];
    for (const item of studentsData) {
      const course = await prisma.course.findUnique({
        where: { code: item.Course },
      });
      if (course) {
        await prisma.student.upsert({
          where: { studentId: item["Student ID"] },
          update: {
            firstName: item["First Name"],
            lastName: item["Last Name"],
            middleName: item["Middle Name"],
            sex: item.Sex as any,
            birthDate: new Date(item["Birth Date"]),
            yearEnrolled: item["Year Enrolled"],
            yearLevel: item["Year Level"],
            status: item.Status as any,
            courseId: course.id,
            bloodType: item["Blood Type"],
            allergies: item.Allergies,
          },
          create: {
            studentId: item["Student ID"],
            firstName: item["First Name"],
            lastName: item["Last Name"],
            middleName: item["Middle Name"],
            sex: item.Sex as any,
            birthDate: new Date(item["Birth Date"]),
            yearEnrolled: item["Year Enrolled"],
            yearLevel: item["Year Level"],
            status: item.Status as any,
            courseId: course.id,
            bloodType: item["Blood Type"],
            allergies: item.Allergies,
          },
        });
      }
    }
  }

  // Note: Clinic Visits and health metrics are more complex due to relational IDs.
  // We'll skip deep restore of visits/metrics for now to keep it safe,
  // or just append them if student matches.
};
