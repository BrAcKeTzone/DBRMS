"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendSMS = exports.getSMSLogs = exports.sendManualSMS = void 0;
const prisma_1 = __importDefault(require("../../configs/prisma"));
const smsService_1 = require("../../utils/smsService");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const sendManualSMS = async (data) => {
    const { recipients, message, userId } = data;
    if (!recipients || !message) {
        throw new ApiError_1.default(400, "Recipients and message are required");
    }
    const result = await (0, smsService_1.sendSMS)(recipients, message);
    // Try to find a user with this phone number to get their name
    const user = await prisma_1.default.user.findFirst({
        where: { phone: recipients },
        select: { firstName: true, lastName: true },
    });
    const recipientName = user
        ? `${user.firstName} ${user.lastName}`.trim()
        : "Manual SMS";
    // Log to SmsLog for tracking
    await prisma_1.default.smsLog.create({
        data: {
            message,
            status: result.success ? "SENT" : "FAILED",
            recipientPhone: recipients,
            recipientName,
            sentAt: result.success ? new Date() : null,
            failReason: result.success
                ? null
                : typeof result.error === "string"
                    ? result.error
                    : result.message ||
                        JSON.stringify(result.error) ||
                        "Unknown error",
        },
    });
    // Log the activity
    await prisma_1.default.activityLog.create({
        data: {
            action: "SMS_SENT_MANUAL",
            details: JSON.stringify({
                recipients,
                status: result.success ? "SUCCESS" : "FAILED",
                error: result.error,
            }),
            userId: userId,
        },
    });
    return result;
};
exports.sendManualSMS = sendManualSMS;
const getSMSLogs = async (query, user) => {
    const { page = 1, limit = 10 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {};
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
    const logs = await prisma_1.default.smsLog.findMany({
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
    const total = await prisma_1.default.smsLog.count({ where });
    const sentCount = await prisma_1.default.smsLog.count({
        where: { ...where, status: "SENT" },
    });
    const failedCount = await prisma_1.default.smsLog.count({
        where: { ...where, status: "FAILED" },
    });
    const queuedCount = await prisma_1.default.smsLog.count({
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
exports.getSMSLogs = getSMSLogs;
const resendSMS = async (logId) => {
    const log = await prisma_1.default.smsLog.findUnique({
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
        throw new ApiError_1.default(404, "SMS log not found");
    }
    if (!log.recipientPhone) {
        throw new ApiError_1.default(400, "No recipient phone found in log");
    }
    const result = await (0, smsService_1.sendSMS)(log.recipientPhone, log.message);
    // Update the log with the latest attempt status
    const updatedLog = await prisma_1.default.smsLog.update({
        where: { id: logId },
        data: {
            status: result.success ? "SENT" : "FAILED",
            sentAt: result.success ? new Date() : log.sentAt,
            failReason: result.success
                ? null
                : typeof result.error === "string"
                    ? result.error
                    : result.message ||
                        JSON.stringify(result.error) ||
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
exports.resendSMS = resendSMS;
//# sourceMappingURL=sms.service.js.map