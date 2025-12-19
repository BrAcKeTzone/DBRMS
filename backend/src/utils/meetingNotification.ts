import nodemailer from "nodemailer";
import { Meeting } from "@prisma/client";

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send meeting notification email
 */
export const sendMeetingNotification = async (
  recipientEmail: string,
  recipientName: string,
  meeting: any,
  customMessage?: string
): Promise<void> => {
  const meetingDate = new Date(meeting.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject = `Meeting Notification: ${meeting.title}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .meeting-details { background-color: white; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0; }
        .detail-row { margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
        .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 Meeting Notification</h1>
        </div>
        <div class="content">
          <p>Dear ${recipientName},</p>
          
          ${
            customMessage
              ? `<p><strong>${customMessage}</strong></p>`
              : `<p>You are invited to attend the following meeting:</p>`
          }
          
          <div class="meeting-details">
            <h2>${meeting.title}</h2>
            
            <div class="detail-row">
              <span class="label">Type:</span> ${meeting.meetingType}
            </div>
            
            <div class="detail-row">
              <span class="label">Date:</span> ${meetingDate}
            </div>
            
            <div class="detail-row">
              <span class="label">Time:</span> ${meeting.startTime}${
    meeting.endTime ? ` - ${meeting.endTime}` : ""
  }
            </div>
            
            <div class="detail-row">
              <span class="label">Venue:</span> ${meeting.venue}
            </div>
            
            ${
              meeting.isVirtual && meeting.meetingLink
                ? `
              <div class="detail-row">
                <span class="label">Meeting Link:</span><br>
                <a href="${meeting.meetingLink}" class="button" target="_blank">Join Virtual Meeting</a>
              </div>
            `
                : ""
            }
            
            ${
              meeting.description
                ? `
              <div class="detail-row">
                <span class="label">Description:</span><br>
                <p>${meeting.description}</p>
              </div>
            `
                : ""
            }
            
            ${
              meeting.agenda
                ? `
              <div class="detail-row">
                <span class="label">Agenda:</span><br>
                <p>${meeting.agenda}</p>
              </div>
            `
                : ""
            }
          </div>
          
          <p>Please make sure to attend this meeting. Your participation is important.</p>
          
          <p>If you have any questions or concerns, please contact the PTA office.</p>
          
          <p>Best regards,<br>
          <strong>JHCSC Dumingag Campus PTA</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated message from the PTA Management System.</p>
          <p>Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Meeting Notification: ${meeting.title}

Dear ${recipientName},

${customMessage || "You are invited to attend the following meeting:"}

Meeting Details:
---------------
Title: ${meeting.title}
Type: ${meeting.meetingType}
Date: ${meetingDate}
Time: ${meeting.startTime}${meeting.endTime ? ` - ${meeting.endTime}` : ""}
Venue: ${meeting.venue}
${
  meeting.isVirtual && meeting.meetingLink
    ? `\nMeeting Link: ${meeting.meetingLink}`
    : ""
}
${meeting.description ? `\nDescription: ${meeting.description}` : ""}
${meeting.agenda ? `\nAgenda: ${meeting.agenda}` : ""}

Please make sure to attend this meeting. Your participation is important.

Best regards,
JHCSC Dumingag Campus PTA
  `;

  await transporter.sendMail({
    from: `"JHCSC PTA" <${process.env.EMAIL_USERNAME}>`,
    to: recipientEmail,
    subject,
    text: textContent,
    html: htmlContent,
  });
};

/**
 * Send meeting reminder email
 */
export const sendMeetingReminder = async (
  recipientEmail: string,
  recipientName: string,
  meeting: any
): Promise<void> => {
  const meetingDate = new Date(meeting.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject = `Reminder: ${meeting.title} - ${meetingDate}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .meeting-details { background-color: white; padding: 20px; border-left: 4px solid #FF9800; margin: 20px 0; }
        .detail-row { margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
        .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #FF9800; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .reminder-badge { background-color: #FF9800; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; margin-bottom: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Meeting Reminder</h1>
        </div>
        <div class="content">
          <p>Dear ${recipientName},</p>
          
          <div class="reminder-badge">📢 Upcoming Meeting</div>
          
          <p>This is a friendly reminder about the upcoming meeting:</p>
          
          <div class="meeting-details">
            <h2>${meeting.title}</h2>
            
            <div class="detail-row">
              <span class="label">Date:</span> ${meetingDate}
            </div>
            
            <div class="detail-row">
              <span class="label">Time:</span> ${meeting.startTime}${
    meeting.endTime ? ` - ${meeting.endTime}` : ""
  }
            </div>
            
            <div class="detail-row">
              <span class="label">Venue:</span> ${meeting.venue}
            </div>
            
            ${
              meeting.isVirtual && meeting.meetingLink
                ? `
              <div class="detail-row">
                <span class="label">Meeting Link:</span><br>
                <a href="${meeting.meetingLink}" class="button" target="_blank">Join Virtual Meeting</a>
              </div>
            `
                : ""
            }
          </div>
          
          <p><strong>Please confirm your attendance and be on time.</strong></p>
          
          <p>Best regards,<br>
          <strong>JHCSC Dumingag Campus PTA</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated reminder from the PTA Management System.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"JHCSC PTA" <${process.env.EMAIL_USERNAME}>`,
    to: recipientEmail,
    subject,
    html: htmlContent,
  });
};
