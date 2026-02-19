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
exports.getClinicVisitStats = exports.getAllClinicVisits = exports.createClinicVisit = void 0;
const service = __importStar(require("./clinicVisits.service"));
const ApiResponse_1 = __importDefault(require("../../utils/ApiResponse"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
exports.createClinicVisit = (0, asyncHandler_1.default)(async (req, res) => {
    const actorId = req.user?.id;
    const visit = await service.createClinicVisit(req.body, actorId);
    const smsStatusMessage = visit?.smsStatus?.success
        ? "Clinic visit logged and SMS sent successfully"
        : "Clinic visit logged; SMS not sent";
    res.status(201).json(new ApiResponse_1.default(201, visit, smsStatusMessage));
});
exports.getAllClinicVisits = (0, asyncHandler_1.default)(async (req, res) => {
    const { search } = req.query;
    const visits = await service.getAllClinicVisits(search);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, visits, "Clinic visits retrieved successfully"));
});
exports.getClinicVisitStats = (0, asyncHandler_1.default)(async (req, res) => {
    const stats = await service.getClinicVisitStats();
    res
        .status(200)
        .json(new ApiResponse_1.default(200, stats, "Clinic visit stats retrieved successfully"));
});
//# sourceMappingURL=clinicVisits.controller.js.map