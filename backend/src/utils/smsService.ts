import axios from "axios";
import prisma from "../configs/prisma";

const TEXTBEE_BASE_URL = "https://api.textbee.dev/api/v1/gateway/devices";
const SYSTEM_CONFIG_KEY = "system_config";

/**
 * Service to handle sending SMS notifications via TextBee.dev
 * Repurposes:
 * - smsApiKey as TextBee API Key
 * - senderName as TextBee Device ID
 */
export const sendSMS = async (recipients: string, message: string) => {
  try {
    // Fetch SMS settings from database
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

    if (!settings?.smsApiKey || !settings?.senderName) {
      console.warn(
        "SMS API Key or Device ID (Sender Name) is missing. Skipping SMS delivery.",
      );
      return { success: false, message: "API credentials missing" };
    }

    // Clean up the phone number. TextBee usually takes an array of strings.
    const cleanRecipient = recipients.replace(/\+/g, "").trim();

    console.log(
      `📤 Sending TextBee SMS to ${cleanRecipient} via device ${settings.senderName}...`,
    );

    const response = await axios.post(
      `${TEXTBEE_BASE_URL}/${settings.senderName}/send-sms`,
      {
        recipients: [cleanRecipient],
        message: message,
      },
      {
        headers: {
          "x-api-key": settings.smsApiKey,
        },
      },
    );

    console.log("✅ TextBee response:", response.data);

    return {
      success: true,
      data: response.data,
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
