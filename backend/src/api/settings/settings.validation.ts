import Joi from "joi";

// Validation schema for updating system settings
export const updateSettingsSchema = Joi.object({
  enableSMSNotifications: Joi.boolean().optional().messages({
    "boolean.base": "Enable SMS notifications must be true or false",
  }),

  smsApiKey: Joi.string().trim().allow(null, "").optional().messages({
    "string.base": "SMS API Key must be a string",
  }),

  senderName: Joi.string().trim().allow(null, "").optional().messages({
    "string.base": "Sender Name must be a string",
  }),

  defaultTemplate: Joi.string().trim().allow(null, "").optional().messages({
    "string.base": "Default Template must be a string",
  }),

  lastBackup: Joi.string().trim().allow(null, "").optional().messages({
    "string.base": "Last backup must be a string",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one setting field must be provided",
  });

// Validation for getting settings by category
export const getSettingsByCategorySchema = Joi.object({
  category: Joi.string()
    .valid("system", "notification", "all")
    .required()
    .messages({
      "string.base": "Category must be a string",
      "any.only": "Category must be one of: system, notification, all",
      "any.required": "Category is required",
    }),
});
