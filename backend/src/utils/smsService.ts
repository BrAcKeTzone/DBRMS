import axios from "axios";
import prisma from "../configs/prisma";

const TEXTBEE_BASE_URL = "https://api.textbee.dev/api/v1/gateway/devices";
const SYSTEM_CONFIG_KEY = "system_config";
const MAX_SMS_LENGTH = Number(process.env.SMS_MAX_LENGTH || "140");

const formatToE164 = (raw: string) => {
  const defaultCode = process.env.SMS_DEFAULT_COUNTRY_CODE || "63"; // Philippines by default
  const digits = (raw || "").replace(/\D+/g, "");
  if (!digits) return "";

  // If already starts with country code, keep it; if starts with 0, swap to country code
  if (digits.startsWith(defaultCode)) return digits;
  if (digits.startsWith("0")) return `${defaultCode}${digits.slice(1)}`;
  return `${defaultCode}${digits}`;
};

const splitMessageWithParts = (message: string, limit: number) => {
  const normalized = (message || "").replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const baseChunks: string[] = [];
  const words = normalized.split(" ");
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= limit) {
      current = candidate;
    } else {
      if (current) baseChunks.push(current);
      if (word.length > limit) {
        // Hard split very long word to avoid infinite loop
        const slices = word.match(new RegExp(`.{1,${limit}}`, "g")) || [];
        if (slices.length) {
          baseChunks.push(...slices.slice(0, slices.length - 1));
          current = slices[slices.length - 1];
        } else {
          current = "";
        }
      } else {
        current = word;
      }
    }
  }
  if (current) baseChunks.push(current);

  if (baseChunks.length <= 1) return baseChunks;

  // Re-split with part headers included (worst-case header length uses total for both numbers)
  const total = baseChunks.length;
  const headerTemplate = `Part ${total}/${total}: `;
  const contentLimit = Math.max(20, limit - headerTemplate.length); // keep some room

  const finalChunks: string[] = [];
  let buffer = "";
  const wordsWithTotal = normalized.split(" ");
  for (const word of wordsWithTotal) {
    const candidate = buffer ? `${buffer} ${word}` : word;
    if (candidate.length <= contentLimit) {
      buffer = candidate;
    } else {
      if (buffer) finalChunks.push(buffer);
      if (word.length > contentLimit) {
        const slices = word.match(new RegExp(`.{1,${contentLimit}}`, "g")) || [];
        if (slices.length) {
          finalChunks.push(...slices.slice(0, slices.length - 1));
          buffer = slices[slices.length - 1];
        } else {
          buffer = "";
        }
      } else {
        buffer = word;
      }
    }
  }
  if (buffer) finalChunks.push(buffer);

  return finalChunks.map(
    (chunk, idx) => `Part ${idx + 1}/${finalChunks.length}: ${chunk}`,
  );
};

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

    // Normalize to digits with country code (E.164-like without +)
    const cleanRecipient = formatToE164(recipients);

    if (!cleanRecipient) {
      console.warn(
        "SMS skipped: recipient phone is empty after normalization.",
      );
      return { success: false, message: "Invalid recipient phone" };
    }

    const parts = splitMessageWithParts(message, MAX_SMS_LENGTH);

    if (!parts.length) {
      console.warn("SMS skipped: empty message after normalization.");
      return { success: false, message: "Empty SMS body" };
    }

    const responses: any[] = [];
    let overallSuccess = true;

    for (const part of parts) {
      console.log(
        `📤 Sending TextBee SMS to ${cleanRecipient} via device ${settings.senderName}...`,
        { partLength: part.length },
      );

      const response = await axios.post(
        `${TEXTBEE_BASE_URL}/${settings.senderName}/send-sms`,
        {
          recipients: [cleanRecipient],
          message: part,
        },
        {
          headers: {
            "x-api-key": settings.smsApiKey,
          },
          validateStatus: (status) => status >= 200 && status < 500,
        },
      );

      console.log("✅ TextBee response:", response.data);

      const partSuccess = response.data?.success !== false && response.status < 400;
      if (!partSuccess) {
        overallSuccess = false;
      }

      responses.push({
        success: partSuccess,
        status: response.status,
        data: response.data,
        message: part,
      });
    }

    return {
      success: overallSuccess,
      data: responses,
      message: responses[responses.length - 1]?.data?.message,
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
