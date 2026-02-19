import { Resend } from "resend";

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options: EmailOptions): Promise<void> => {
  // Log email configuration (without API key)
  console.log("Email Configuration:", {
    fromEmail: process.env.FROM_EMAIL,
    hasApiKey: !!process.env.RESEND_API_KEY,
  });

  const mailOptions = {
    from:
      process.env.FROM_EMAIL || "BCFI Clinic Portal <onboarding@resend.dev>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message}</p>`,
  };

  console.log("Attempting to send email via Resend to:", options.email);

  try {
    const { data, error } = await resend.emails.send(mailOptions);

    if (error) {
      console.error("❌ Resend email sending failed:", error);
      throw error;
    }

    console.log("✅ Email sent successfully via Resend:", data?.id);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
};

export default sendEmail;
