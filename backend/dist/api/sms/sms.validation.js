"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsIdParam = exports.sendSMS = void 0;
const joi_1 = __importDefault(require("joi"));
exports.sendSMS = joi_1.default.object().keys({
    recipients: joi_1.default.string()
        .required()
        .description("Phone number of the recipient"),
    message: joi_1.default.string()
        .required()
        .max(160)
        .description("Message content (max 160 chars for 1 credit)"),
});
exports.smsIdParam = joi_1.default.object().keys({
    id: joi_1.default.number().required(),
});
//# sourceMappingURL=sms.validation.js.map