"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSingleAnnouncementNotification = exports.sendAnnouncementNotifications = void 0;
const email_1 = __importDefault(require("./email"));
const smsService_1 = require("./smsService");
const getPriorityLabel = (priority) => {
    const labels = {
        LOW: "Low Priority",
        MEDIUM: "Medium Priority",
        HIGH: "High Priority",
        URGENT: "🔴 URGENT",
    };
    return labels[priority];
};
const formatAnnouncementEmail = (title, content, priority, recipientName, attachmentUrl) => {
    const priorityLabel = getPriorityLabel(priority);
    const attachmentSection = attachmentUrl
        ? `\n\nAttachment: ${attachmentUrl}`
        : "";
    return `
Dear ${recipientName},

${priorityLabel}

ANNOUNCEMENT: ${title}

${content}
${attachmentSection}

---
This is an automated notification from the BCFI Clinic Portal.
John H. Catolico Sr. College - Dumingag Campus
Parent and Teacher Association

Please do not reply to this email.
  `.trim();
};
const sendAnnouncementNotifications = async (options) => {
    const { title, content, priority, recipients, attachmentUrl } = options;
    let sent = 0;
    let failed = 0;
    const errors = [];
    // Send emails in batches to avoid overwhelming the email server
    const batchSize = 10;
    for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        const promises = batch.map(async (recipient) => {
            try {
                const recipientName = `${recipient.firstName} ${recipient.lastName}`;
                const message = formatAnnouncementEmail(title, content, priority, recipientName, attachmentUrl);
                await (0, email_1.default)({
                    email: recipient.email,
                    subject: `[${getPriorityLabel(priority)}] ${title}`,
                    message,
                });
                // Also send SMS if phone is available
                if (recipient.phone) {
                    const smsMessage = `[${getPriorityLabel(priority)}] Announcement: ${title}. ${content.substring(0, 100)}${content.length > 100 ? "..." : ""}`;
                    await (0, smsService_1.sendSMS)(recipient.phone, smsMessage);
                }
                sent++;
            }
            catch (error) {
                failed++;
                const errorMsg = `Failed to send to ${recipient.email}: ${error instanceof Error ? error.message : "Unknown error"}`;
                errors.push(errorMsg);
                console.error(errorMsg);
            }
        });
        // Wait for the current batch to complete before moving to the next
        await Promise.all(promises);
        // Small delay between batches to prevent rate limiting
        if (i + batchSize < recipients.length) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
    return { sent, failed, errors };
};
exports.sendAnnouncementNotifications = sendAnnouncementNotifications;
const sendSingleAnnouncementNotification = async (email, firstName, lastName, title, content, priority, attachmentUrl, phone) => {
    const recipientName = `${firstName} ${lastName}`;
    const message = formatAnnouncementEmail(title, content, priority, recipientName, attachmentUrl);
    await (0, email_1.default)({
        email,
        subject: `[${getPriorityLabel(priority)}] ${title}`,
        message,
    });
    if (phone) {
        const smsMessage = `[${getPriorityLabel(priority)}] Announcement: ${title}. ${content.substring(0, 100)}${content.length > 100 ? "..." : ""}`;
        await (0, smsService_1.sendSMS)(phone, smsMessage);
    }
};
exports.sendSingleAnnouncementNotification = sendSingleAnnouncementNotification;
//# sourceMappingURL=announcementNotification.js.map