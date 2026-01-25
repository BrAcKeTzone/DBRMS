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

  // Log the activity
  await prisma.activityLog.create({
    data: {
      action: "SMS_SENT_MANUAL",
      details: JSON.stringify({
        recipients,
        status: result.success ? "SUCCESS" : "FAILED",
        error: result.error,
      }),
      // Assuming userId might be available if sent from a dashboard
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

  return {
    logs,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};
