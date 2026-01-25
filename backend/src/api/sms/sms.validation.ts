import Joi from "joi";

export const sendSMS = Joi.object().keys({
  recipients: Joi.string()
    .required()
    .description("Phone number of the recipient"),
  message: Joi.string()
    .required()
    .max(160)
    .description("Message content (max 160 chars for 1 credit)"),
});
