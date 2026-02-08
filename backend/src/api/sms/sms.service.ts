import prisma from "../../configs/prisma";
import { sendSMS as triggerSMS } from "../../utils/smsService";
import ApiError from "../../utils/ApiError";

export const sendManualSMS = async (data: {
  recipients: string;
  message: string;
  userId?: number;
}) => {
  const { recipients, message, userId } = data;

  if (!recipients || !message) {
    throw new ApiError(400, "Recipients and message are required");
  }

  const result = await triggerSMS(recipients, message);

  // Try to find a user with this phone number to get their name
  const user = await prisma.user.findFirst({
    where: { phone: recipients },
    select: { firstName: true, lastName: true },
  });

  const recipientName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "Manual SMS";

  // Log to SmsLog for tracking
  await prisma.smsLog.create({
    data: {
      message,
      status: result.success ? "SENT" : "FAILED",
      recipientPhone: recipients,
      recipientName,
      sentAt: result.success ? new Date() : null,
      failReason: result.success
        ? null
        : typeof (result as any).error === "string"
          ? (result as any).error
          : (result as any).message ||
            JSON.stringify((result as any).error) ||
            "Unknown error",
    },
  });

  // Log the activity
  await prisma.activityLog.create({
    data: {
      action: "SMS_SENT_MANUAL",
      details: JSON.stringify({
        recipients,
        status: result.success ? "SUCCESS" : "FAILED",
        error: (result as any).error,
      }),
      userId: userId,
    },
  });

  return result;
};

export const getSMSLogs = async (query: any, user: any) => {
  const { page = 1, limit = 10 } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};

  // If user is a parent, only show logs relevant to them or their students
  if (user.role === "PARENT_GUARDIAN") {
    where.OR = [
      { recipientPhone: user.phone },
      {
        clinicVisit: {
          student: {
            parentId: user.id,
          },
        },
      },
    ];
  }

  const logs = await prisma.smsLog.findMany({
    where,
    include: {
      clinicVisit: {
        include: {
          student: {
            include: {
              parent: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: Number(limit),
  });

  const total = await prisma.smsLog.count({ where });
  const sentCount = await prisma.smsLog.count({
    where: { ...where, status: "SENT" },
  });
  const failedCount = await prisma.smsLog.count({
    where: { ...where, status: "FAILED" },
  });
  const queuedCount = await prisma.smsLog.count({
    where: { ...where, status: "QUEUED" },
  });

  return {
    logs,
    stats: {
      total,
      sent: sentCount,
      failed: failedCount,
      queued: queuedCount,
    },
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const resendSMS = async (logId: number) => {
  const log = await prisma.smsLog.findUnique({
    where: { id: logId },
    include: {
      clinicVisit: {
        include: {
          student: {
            include: {
              parent: true,
            },
          },
        },
      },
    },
  });

  if (!log) {
    throw new ApiError(404, "SMS log not found");
  }

  if (!log.recipientPhone) {
    throw new ApiError(400, "No recipient phone found in log");
  }

  const result = await triggerSMS(log.recipientPhone, log.message);

  // Update the log with the latest attempt status
  const updatedLog = await prisma.smsLog.update({
    where: { id: logId },
    data: {
      status: result.success ? "SENT" : "FAILED",
      sentAt: result.success ? new Date() : log.sentAt,
      failReason: result.success
        ? null
        : typeof (result as any).error === "string"
          ? (result as any).error
          : (result as any).message ||
            JSON.stringify((result as any).error) ||
            "Unknown error",
    },
    include: {
      clinicVisit: {
        include: {
          student: {
            include: {
              parent: true,
            },
          },
        },
      },
    },
  });

  return { success: result.success, log: updatedLog };
};
