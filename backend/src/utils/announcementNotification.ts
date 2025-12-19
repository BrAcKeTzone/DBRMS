import sendEmail from "./email";
import { AnnouncementPriority } from "@prisma/client";

interface AnnouncementNotificationOptions {
  title: string;
  content: string;
  priority: AnnouncementPriority;
  recipients: Array<{
    email: string;
    firstName: string;
    lastName: string;
    middleName: string | null;
  }>;
  attachmentUrl?: string;
}

const getPriorityLabel = (priority: AnnouncementPriority): string => {
  const labels = {
    LOW: "Low Priority",
    MEDIUM: "Medium Priority",
    HIGH: "High Priority",
    URGENT: "🔴 URGENT",
  };
  return labels[priority];
};

const formatAnnouncementEmail = (
  title: string,
  content: string,
  priority: AnnouncementPriority,
  recipientName: string,
  attachmentUrl?: string
): string => {
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
This is an automated notification from the ePTA Management System.
John H. Catolico Sr. College - Dumingag Campus
Parent and Teacher Association

Please do not reply to this email.
  `.trim();
};

export const sendAnnouncementNotifications = async (
  options: AnnouncementNotificationOptions
): Promise<{ sent: number; failed: number; errors: string[] }> => {
  const { title, content, priority, recipients, attachmentUrl } = options;

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  // Send emails in batches to avoid overwhelming the email server
  const batchSize = 10;
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    const promises = batch.map(async (recipient) => {
      try {
        const recipientName = `${recipient.firstName} ${recipient.lastName}`;
        const message = formatAnnouncementEmail(
          title,
          content,
          priority,
          recipientName,
          attachmentUrl
        );

        await sendEmail({
          email: recipient.email,
          subject: `[${getPriorityLabel(priority)}] ${title}`,
          message,
        });

        sent++;
      } catch (error) {
        failed++;
        const errorMsg = `Failed to send to ${recipient.email}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
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

export const sendSingleAnnouncementNotification = async (
  email: string,
  firstName: string,
  lastName: string,
  title: string,
  content: string,
  priority: AnnouncementPriority,
  attachmentUrl?: string
): Promise<void> => {
  const recipientName = `${firstName} ${lastName}`;
  const message = formatAnnouncementEmail(
    title,
    content,
    priority,
    recipientName,
    attachmentUrl
  );

  await sendEmail({
    email,
    subject: `[${getPriorityLabel(priority)}] ${title}`,
    message,
  });
};
