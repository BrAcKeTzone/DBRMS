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
      failReason: result.success ? null : (result as any).error || (result as any).message,
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

export const getSMSLogs = async (query: any) => {
  const { page = 1, limit = 10 } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const logs = await prisma.smsLog.findMany({
    include: {
      clinicVisit: {
        include: {
          student: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: Number(limit),
  });

  const total = await prisma.smsLog.count();
  const sentCount = await prisma.smsLog.count({ where: { status: "SENT" } });
  const failedCount = await prisma.smsLog.count({ where: { status: "FAILED" } });
  const queuedCount = await prisma.smsLog.count({ where: { status: "QUEUED" } });

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
  });

  if (!log) {
    throw new ApiError(404, "SMS log not found");
  }

  if (!log.recipientPhone) {
    throw new ApiError(400, "No recipient phone found in log");
  }

  const result = await triggerSMS(log.recipientPhone, log.message);

  // Update the log or create a new one? Usually updating the status and sentAt is fine for a resend, 
  // or we could track attempts. Let's update the existing log to show most recent attempt.
  const updatedLog = await prisma.smsLog.update({
    where: { id: logId },
    data: {
      status: result.success ? "SENT" : "FAILED",
      sentAt: result.success ? new Date() : log.sentAt,
      failReason: result.success ? null : (result as any).error || (result as any).message,
    },
  });

  return { success: result.success, log: updatedLog };
};
