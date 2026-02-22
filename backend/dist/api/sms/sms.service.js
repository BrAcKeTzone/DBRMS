"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadSMSCount = exports.markSMSAsRead = exports.resendSMS = exports.getSMSLogs = exports.sendManualSMS = void 0;
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
    const unreadCount = await prisma_1.default.smsLog.count({
        where: { ...where, readAt: null },
    });
    return {
        logs,
        stats: {
            total,
            sent: sentCount,
            failed: failedCount,
            queued: queuedCount,
            unread: unreadCount,
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
    let result;
    // Check if this is a multi-part clinic visit message
    if (log.clinicVisit && log.message.includes("[1/5]")) {
        // This is a multi-part message, split and send each part
        const parts = log.message.split("\n\n").filter((part) => part.trim());
        console.log("🔄 Resending multi-part clinic visit message with", parts.length, "parts");
        let allSuccess = true;
        let lastError = "";
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i].startsWith("[")
                ? parts[i]
                : `[${i + 1}/${parts.length}] ${parts[i]}`;
            console.log(`🔄 Resending part ${i + 1}/${parts.length}:`, part.substring(0, 50) + "...");
            const partResult = await (0, smsService_1.sendSMS)(log.recipientPhone, part);
            if (!partResult.success) {
                allSuccess = false;
                lastError = partResult.error || partResult.message || "Unknown error";
                console.error(`❌ Resend part ${i + 1} failed:`, lastError);
                break; // Stop if a part fails
            }
            else {
                console.log(`✅ Resend part ${i + 1} successful`);
            }
            // Add delays between parts
            if (i < parts.length - 1) {
                console.log(`⏰ Waiting 2 seconds before resending part ${i + 2}...`);
                await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 seconds between all parts
            }
        }
        result = {
            success: allSuccess,
            message: allSuccess
                ? "All parts resent successfully"
                : "One or more parts failed",
            error: allSuccess ? null : lastError,
        };
    }
    else {
        // Single message, send as-is
        result = await (0, smsService_1.sendSMS)(log.recipientPhone, log.message);
    }
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
const markSMSAsRead = async (logId, user) => {
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
    const canAccess = user?.role === "CLINIC_STAFF" ||
        log.recipientPhone === user?.phone ||
        log.clinicVisit?.student?.parentId === user?.id;
    if (!canAccess) {
        throw new ApiError_1.default(403, "You do not have access to this SMS log");
    }
    if (log.readAt) {
        return { log };
    }
    const updatedLog = await prisma_1.default.smsLog.update({
        where: { id: logId },
        data: {
            readAt: new Date(),
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
    return { log: updatedLog };
};
exports.markSMSAsRead = markSMSAsRead;
const getUnreadSMSCount = async (user) => {
    const where = {};
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
    const unread = await prisma_1.default.smsLog.count({
        where: { ...where, readAt: null },
    });
    return { unread };
};
exports.getUnreadSMSCount = getUnreadSMSCount;
//# sourceMappingURL=sms.service.js.map