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
exports.changePassword = exports.resetPassword = exports.login = exports.register = exports.sendOtpForChange = exports.sendOtpForReset = exports.verifyOtpForChange = exports.verifyOtpForReset = exports.verifyOtp = exports.sendOtp = void 0;
const authService = __importStar(require("./auth.service"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiResponse_1 = __importDefault(require("../../utils/ApiResponse"));
exports.sendOtp = (0, asyncHandler_1.default)(async (req, res) => {
    const { email } = req.body;
    const result = await authService.sendOtp(email);
    res.status(200).json(new ApiResponse_1.default(200, result));
});
exports.verifyOtp = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, otp } = req.body;
    const result = await authService.verifyOtp(email, otp);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Email verified successfully"));
});
exports.verifyOtpForReset = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, otp } = req.body;
    const result = await authService.verifyOtpForReset(email, otp);
    res.status(200).json(new ApiResponse_1.default(200, result));
});
exports.verifyOtpForChange = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, otp } = req.body;
    const result = await authService.verifyOtpForChange(email, otp);
    res.status(200).json(new ApiResponse_1.default(200, result));
});
exports.sendOtpForReset = (0, asyncHandler_1.default)(async (req, res) => {
    const { email } = req.body;
    const result = await authService.sendOtpForReset(email);
    res.status(200).json(new ApiResponse_1.default(200, result));
});
exports.sendOtpForChange = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.sendOtpForChange(email, password);
    res.status(200).json(new ApiResponse_1.default(200, result));
});
exports.register = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await authService.register(req.body);
    res
        .status(201)
        .json(new ApiResponse_1.default(201, result, "User registered successfully"));
});
exports.login = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json(new ApiResponse_1.default(200, result, "Login successful"));
});
exports.resetPassword = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, otp, password } = req.body;
    const result = await authService.resetPassword(email, otp, password);
    res.status(200).json(new ApiResponse_1.default(200, result));
});
exports.changePassword = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, oldPassword, otp, newPassword } = req.body;
    const result = await authService.changePassword(email, oldPassword, otp, newPassword);
    res.status(200).json(new ApiResponse_1.default(200, result));
});
//# sourceMappingURL=auth.controller.js.map