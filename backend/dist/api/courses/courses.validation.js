"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCourseSchema = exports.createCourseSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createCourseSchema = joi_1.default.object({
    code: joi_1.default.string().max(50).required(),
    name: joi_1.default.string().max(255).required(),
    description: joi_1.default.string().max(5000).optional().allow(null, ""),
});
exports.updateCourseSchema = joi_1.default.object({
    code: joi_1.default.string().max(50).optional(),
    name: joi_1.default.string().max(255).optional(),
    description: joi_1.default.string().max(5000).optional().allow(null, ""),
});
//# sourceMappingURL=courses.validation.js.map