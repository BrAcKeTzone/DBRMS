import nodemailer, { TransportOptions, Transporter } from "nodemailer";

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

interface EmailConfig {
  host: string;
  port: number;
  auth: {
    user: string;
    pass: string;
  };
}

const createTransporter = (): Transporter => {
  const config: EmailConfig = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  };

  return nodemailer.createTransport(config as TransportOptions);
};

const sendEmail = async (options: EmailOptions): Promise<void> => {
  // Log email configuration (without password)
  console.log("Email Configuration:", {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USERNAME,
    hasPassword: !!process.env.EMAIL_PASSWORD,
  });

  const transporter = createTransporter();

  const mailOptions = {
    from: "ePTA Management System <hello@epta.io>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  console.log("Attempting to send email to:", options.email);

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", result.messageId);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
};

export default sendEmail;
