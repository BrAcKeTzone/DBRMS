import axios from "axios";
import prisma from "../configs/prisma";

const TEXTBEE_BASE_URL = "https://api.textbee.dev/api/v1/gateway/devices";
const SYSTEM_CONFIG_KEY = "system_config";

const formatToE164 = (raw: string) => {
  const defaultCode = process.env.SMS_DEFAULT_COUNTRY_CODE || "63"; // Philippines by default
  const digits = (raw || "").replace(/\D+/g, "");
  if (!digits) return "";

  // If already starts with country code, keep it; if starts with 0, swap to country code
  if (digits.startsWith(defaultCode)) return digits;
  if (digits.startsWith("0")) return `${defaultCode}${digits.slice(1)}`;
  return `${defaultCode}${digits}`;
};

/**
 * Service to handle sending SMS notifications via TextBee.dev
 * Uses environment variables for credentials with optional database fallback
 * - SMS_API_KEY for TextBee API Key
 * - SMS_DEVICE_ID for TextBee Device ID
 */
export const sendSMS = async (recipients: string, message: string) => {
  try {
    // Try to get credentials from environment variables first
    let smsApiKey: string | null | undefined = process.env.SMS_API_KEY;
    let smsDeviceId: string | null | undefined = process.env.SMS_DEVICE_ID;

    // Fall back to database settings if env vars are not set
    if (!smsApiKey || !smsDeviceId) {
      const settings = await prisma.systemSetting.findUnique({
        where: { key: SYSTEM_CONFIG_KEY },
        select: {
          smsApiKey: true,
          senderName: true,
          enableSMSNotifications: true,
        },
      });

      if (!settings?.enableSMSNotifications) {
        console.warn("SMS notifications are disabled in settings.");
        return { success: false, message: "SMS notifications disabled" };
      }

      smsApiKey = smsApiKey || settings?.smsApiKey || undefined;
      smsDeviceId = smsDeviceId || settings?.senderName || undefined;
    }

    if (!smsApiKey || !smsDeviceId) {
      console.warn(
        "SMS API Key or Device ID is missing from environment or database.",
      );
      return { success: false, message: "API credentials missing" };
    }

    // Normalize to digits with country code (E.164-like without +)
    const cleanRecipient = formatToE164(recipients);

    if (!cleanRecipient) {
      console.warn(
        "SMS skipped: recipient phone is empty after normalization.",
      );
      return { success: false, message: "Invalid recipient phone" };
    }

    console.log(
      `📤 Sending TextBee SMS to ${cleanRecipient} via device ${smsDeviceId}...`,
    );

    const response = await axios.post(
      `${TEXTBEE_BASE_URL}/${smsDeviceId}/send-sms`,
      {
        recipients: [cleanRecipient],
        message: message,
      },
      {
        headers: {
          "x-api-key": smsApiKey,
        },
        validateStatus: (status) => status >= 200 && status < 500,
      },
    );

    console.log("✅ TextBee response:", response.data);

    const success = response.data?.success !== false && response.status < 400;

    return {
      success,
      data: response.data,
      message: response.data?.message,
    };
  } catch (error: any) {
    const errorData = error.response?.data || error.message;
    console.error("❌ TextBee delivery failed:", errorData);
    return {
      success: false,
      error: errorData,
    };
  }
};

/**
 * Placeholder for WhatsApp sending if supported by the same API
 */
export const sendWhatsApp = async (recipients: string, message: string) => {
  // If the API uses the same endpoint but different params, modify accordingly
  // For now, we'll just log it as a placeholder or use the same logic if applicable
  console.log(
    "📱 WhatsApp sending requested (using SMS logic for now if supported):",
    recipients,
  );
  return sendSMS(recipients, message);
};
