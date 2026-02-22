"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsApp = exports.sendSMS = void 0;
const axios_1 = __importDefault(require("axios"));
const prisma_1 = __importDefault(require("../configs/prisma"));
const TEXTBEE_BASE_URL = "https://api.textbee.dev/api/v1/gateway/devices";
const SYSTEM_CONFIG_KEY = "system_config";
const formatToE164 = (raw) => {
    const defaultCode = process.env.SMS_DEFAULT_COUNTRY_CODE || "63"; // Philippines by default
    const digits = (raw || "").replace(/\D+/g, "");
    if (!digits)
        return "";
    // If already starts with country code, keep it; if starts with 0, swap to country code
    if (digits.startsWith(defaultCode))
        return digits;
    if (digits.startsWith("0"))
        return `${defaultCode}${digits.slice(1)}`;
    return `${defaultCode}${digits}`;
};
/**
 * Service to handle sending SMS notifications via TextBee.dev
 * Uses environment variables for credentials with optional database fallback
 * - SMS_API_KEY for TextBee API Key
 * - SMS_DEVICE_ID for TextBee Device ID
 */
const sendSMS = async (recipients, message) => {
    try {
        // Try to get credentials from environment variables first
        let smsApiKey = process.env.SMS_API_KEY;
        let smsDeviceId = process.env.SMS_DEVICE_ID;
        // Fall back to database settings if env vars are not set
        if (!smsApiKey || !smsDeviceId) {
            const settings = await prisma_1.default.systemSetting.findUnique({
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
            console.warn("SMS API Key or Device ID is missing from environment or database.");
            return { success: false, message: "API credentials missing" };
        }
        // Normalize to digits with country code (E.164-like without +)
        const cleanRecipient = formatToE164(recipients);
        if (!cleanRecipient) {
            console.warn("SMS skipped: recipient phone is empty after normalization.");
            return { success: false, message: "Invalid recipient phone" };
        }
        console.log(`📤 Sending TextBee SMS to ${cleanRecipient} via device ${smsDeviceId}...`);
        const response = await axios_1.default.post(`${TEXTBEE_BASE_URL}/${smsDeviceId}/send-sms`, {
            recipients: [cleanRecipient],
            message: message,
        }, {
            headers: {
                "x-api-key": smsApiKey,
            },
            validateStatus: (status) => status >= 200 && status < 500,
        });
        console.log("✅ TextBee response:", response.data);
        const success = response.data?.success !== false && response.status < 400;
        return {
            success,
            data: response.data,
            message: response.data?.message,
        };
    }
    catch (error) {
        const errorData = error.response?.data || error.message;
        console.error("❌ TextBee delivery failed:", errorData);
        return {
            success: false,
            error: errorData,
        };
    }
};
exports.sendSMS = sendSMS;
/**
 * Placeholder for WhatsApp sending if supported by the same API
 */
const sendWhatsApp = async (recipients, message) => {
    // If the API uses the same endpoint but different params, modify accordingly
    // For now, we'll just log it as a placeholder or use the same logic if applicable
    console.log("📱 WhatsApp sending requested (using SMS logic for now if supported):", recipients);
    return (0, exports.sendSMS)(recipients, message);
};
exports.sendWhatsApp = sendWhatsApp;
//# sourceMappingURL=smsService.js.map