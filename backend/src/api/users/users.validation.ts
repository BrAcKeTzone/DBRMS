import Joi from "joi";
import { UserRole } from "@prisma/client";

export const updateUserProfile = Joi.object().keys({
  firstName: Joi.string().min(2).max(100).optional(),
  middleName: Joi.string().min(1).max(100).optional().allow(null, ""),
  lastName: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
});

export const updateUserRole = Joi.object().keys({
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .required(),
});

export const userIdParam = Joi.object().keys({
  id: Joi.number().integer().positive().required(),
});

export const getUsers = Joi.object().keys({
  search: Joi.string().max(100).optional(),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .optional(),
  isActive: Joi.boolean().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  sortBy: Joi.string()
    .valid(
      "firstName",
      "lastName",
      "email",
      "role",
      "createdAt",
      "updatedAt",
      "isActive"
    )
    .optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().min(Joi.ref("dateFrom")).optional(),
});

export const changePassword = Joi.object().keys({
  currentPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
    }),
});

export const createUser = Joi.object().keys({
  firstName: Joi.string().min(2).max(100).required(),
  middleName: Joi.string().min(1).max(100).optional().allow(null, ""),
  lastName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional().allow(null, ""),
  password: Joi.string().min(6).required(),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .required(),
});

export const updateUserByAdmin = Joi.object().keys({
  firstName: Joi.string().min(2).max(100).optional(),
  middleName: Joi.string().min(1).max(100).optional().allow(null, ""),
  lastName: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional().allow(null, ""),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .optional(),
  isActive: Joi.boolean().optional(),
});
