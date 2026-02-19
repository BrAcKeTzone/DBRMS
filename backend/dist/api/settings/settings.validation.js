"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettingsByCategorySchema = exports.updateSettingsSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Validation schema for updating system settings
exports.updateSettingsSchema = joi_1.default.object({
    enableSMSNotifications: joi_1.default.boolean().optional().messages({
        "boolean.base": "Enable SMS notifications must be true or false",
    }),
    smsApiKey: joi_1.default.string().trim().allow(null, "").optional().messages({
        "string.base": "SMS API Key must be a string",
    }),
    senderName: joi_1.default.string().trim().allow(null, "").optional().messages({
        "string.base": "Sender Name must be a string",
    }),
    defaultTemplate: joi_1.default.string().trim().allow(null, "").optional().messages({
        "string.base": "Default Template must be a string",
    }),
    lastBackup: joi_1.default.string().trim().allow(null, "").optional().messages({
        "string.base": "Last backup must be a string",
    }),
})
    .min(1)
    .messages({
    "object.min": "At least one setting field must be provided",
});
// Validation for getting settings by category
exports.getSettingsByCategorySchema = joi_1.default.object({
    category: joi_1.default.string()
        .valid("system", "notification", "all")
        .required()
        .messages({
        "string.base": "Category must be a string",
        "any.only": "Category must be one of: system, notification, all",
        "any.required": "Category is required",
    }),
});
//# sourceMappingURL=settings.validation.js.map