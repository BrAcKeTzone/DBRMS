import axios from "axios";
import prisma from "../configs/prisma";

const SMS_BASE_URL = "https://api.smsmobileapi.com/sendsms/";
const SYSTEM_CONFIG_KEY = "system_config";

/**
 * Service to handle sending SMS notifications via SMSmobileAPI
 */
export const sendSMS = async (recipients: string, message: string) => {
  try {
    // Fetch SMS settings from database
    const settings = await prisma.systemSetting.findUnique({
      where: { key: SYSTEM_CONFIG_KEY },
      select: {
        smsApiKey: true,
        enableSMSNotifications: true,
      },
    });

    if (!settings?.enableSMSNotifications) {
      console.warn("SMS notifications are disabled in settings.");
      return { success: false, message: "SMS notifications disabled" };
    }

    if (!settings?.smsApiKey) {
      console.warn(
        "SMS API Key is not defined in database. Skipping SMS delivery.",
      );
      return { success: false, message: "API key missing" };
    }

    // Clean up the phone number - ensure it's in the correct format
    const cleanRecipient = recipients.replace(/\+/g, "").trim();

    const data = {
      recipients: cleanRecipient,
      message: message,
      apikey: settings.smsApiKey,
    };

    console.log(`📤 Sending SMS to ${cleanRecipient}...`);

    const response = await axios.post(SMS_BASE_URL, data);

    console.log("✅ SMS response:", response.data);

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error(
      "❌ SMS delivery failed:",
      error.response?.data || error.message,
    );
    return {
      success: false,
      error: error.response?.data || error.message,
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
