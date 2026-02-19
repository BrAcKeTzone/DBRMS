"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendSMS = exports.getLogs = exports.sendSMS = void 0;
const smsService = __importStar(require("./sms.service"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiResponse_1 = __importDefault(require("../../utils/ApiResponse"));
exports.sendSMS = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await smsService.sendManualSMS({
        ...req.body,
        userId: req.user?.id,
    });
    if (!result.success) {
        return res
            .status(500)
            .json(new ApiResponse_1.default(500, result, "Failed to send SMS"));
    }
    res.status(200).json(new ApiResponse_1.default(200, result, "SMS sent successfully"));
});
exports.getLogs = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await smsService.getSMSLogs(req.query, req.user);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "SMS logs fetched successfully"));
});
exports.resendSMS = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await smsService.resendSMS(Number(id));
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "SMS resend attempt completed"));
});
//# sourceMappingURL=sms.controller.js.map