"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserByAdmin = exports.createUser = exports.changePassword = exports.getUsers = exports.userIdParam = exports.updateUserRole = exports.updateUserProfile = void 0;
const joi_1 = __importDefault(require("joi"));
const client_1 = require("@prisma/client");
exports.updateUserProfile = joi_1.default.object().keys({
    firstName: joi_1.default.string().min(2).max(100).optional(),
    middleName: joi_1.default.string().min(1).max(100).optional().allow(null, ""),
    lastName: joi_1.default.string().min(2).max(100).optional(),
    email: joi_1.default.string().email().optional(),
    phone: joi_1.default.string().min(10).max(15).optional().allow(null, ""),
});
exports.updateUserRole = joi_1.default.object().keys({
    role: joi_1.default.string()
        .valid(...Object.values(client_1.UserRole))
        .required(),
});
exports.userIdParam = joi_1.default.object().keys({
    id: joi_1.default.number().integer().positive().required(),
});
exports.getUsers = joi_1.default.object().keys({
    search: joi_1.default.string().max(100).optional(),
    role: joi_1.default.string()
        .valid(...Object.values(client_1.UserRole))
        .optional(),
    isActive: joi_1.default.boolean().optional(),
    page: joi_1.default.number().integer().min(1).optional(),
    limit: joi_1.default.number().integer().min(1).max(100).optional(),
    sortBy: joi_1.default.string()
        .valid("firstName", "lastName", "email", "role", "createdAt", "updatedAt", "isActive")
        .optional(),
    sortOrder: joi_1.default.string().valid("asc", "desc").optional(),
    dateFrom: joi_1.default.date().iso().optional(),
    dateTo: joi_1.default.date().iso().min(joi_1.default.ref("dateFrom")).optional(),
});
exports.changePassword = joi_1.default.object().keys({
    currentPassword: joi_1.default.string().min(6).required(),
    newPassword: joi_1.default.string().min(6).required(),
    confirmPassword: joi_1.default.string()
        .valid(joi_1.default.ref("newPassword"))
        .required()
        .messages({
        "any.only": "Passwords do not match",
    }),
});
exports.createUser = joi_1.default.object().keys({
    firstName: joi_1.default.string().min(2).max(100).required(),
    middleName: joi_1.default.string().min(1).max(100).optional().allow(null, ""),
    lastName: joi_1.default.string().min(2).max(100).required(),
    email: joi_1.default.string().email().required(),
    phone: joi_1.default.string().optional().allow(null, ""),
    password: joi_1.default.string().min(6).required(),
    role: joi_1.default.string()
        .valid(...Object.values(client_1.UserRole))
        .required(),
});
exports.updateUserByAdmin = joi_1.default.object().keys({
    firstName: joi_1.default.string().min(2).max(100).optional(),
    middleName: joi_1.default.string().min(1).max(100).optional().allow(null, ""),
    lastName: joi_1.default.string().min(2).max(100).optional(),
    email: joi_1.default.string().email().optional(),
    phone: joi_1.default.string().optional().allow(null, ""),
    role: joi_1.default.string()
        .valid(...Object.values(client_1.UserRole))
        .optional(),
    isActive: joi_1.default.boolean().optional(),
});
//# sourceMappingURL=users.validation.js.map