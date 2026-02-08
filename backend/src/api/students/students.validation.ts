import Joi from "joi";
import { StudentStatus, LinkStatus } from "@prisma/client";

// Common patterns for college
const studentIdPattern = /^[0-9]{4}-[0-9]{5}$/; // Format: 2024-12345
const yearEnrolledPattern = /^[0-9]{4}$/; // Format: 2024 (just the year)

export const createStudent = Joi.object().keys({
  studentId: Joi.string().pattern(studentIdPattern).required().messages({
    "string.pattern.base":
      "Student ID must follow format: YYYY-NNNNN (e.g., 2024-12345)",
  }),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  middleName: Joi.string().min(2).max(50).optional().allow("", null),
  birthDate: Joi.date().optional().allow("", null),
  yearEnrolled: Joi.string()
    .pattern(yearEnrolledPattern)
    .optional()
    .allow("", null)
    .messages({
      "string.pattern.base":
        "Year enrolled must follow format: YYYY (e.g., 2024)",
    }),
  yearLevel: Joi.string().required().messages({
    "any.required": "Year level is required",
  }),
  parentId: Joi.number().integer().positive().optional(),
  courseCode: Joi.string().optional().allow("", null),
  bloodType: Joi.string().optional().allow("", null),
  allergies: Joi.string().optional().allow("", null),
  height: Joi.alternatives()
    .try(Joi.number(), Joi.string().allow(""))
    .optional()
    .allow(null),
  weight: Joi.alternatives()
    .try(Joi.number(), Joi.string().allow(""))
    .optional()
    .allow(null),
});

export const updateStudent = Joi.object()
  .keys({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    middleName: Joi.string().min(2).max(50).optional().allow("", null),
    birthDate: Joi.date().optional().allow("", null),
    yearEnrolled: Joi.string()
      .pattern(yearEnrolledPattern)
      .optional()
      .messages({
        "string.pattern.base":
          "Year enrolled must follow format: YYYY (e.g., 2024)",
      }),
    yearLevel: Joi.string().optional().allow("", null),
    status: Joi.string()
      .valid(...Object.values(StudentStatus))
      .optional(),
    linkStatus: Joi.string()
      .valid(...Object.values(LinkStatus))
      .optional(),
    bloodType: Joi.string().optional().allow("", null),
    allergies: Joi.string().optional().allow("", null),
    height: Joi.alternatives()
      .try(Joi.number(), Joi.string().allow(""))
      .optional()
      .allow(null),
    weight: Joi.alternatives()
      .try(Joi.number(), Joi.string().allow(""))
      .optional()
      .allow(null),
  })
  .unknown(true); // Allow unknown fields (like id, studentId, etc.) - they will be stripped

export const getStudents = Joi.object().keys({
  search: Joi.string().max(100).optional(),
  yearEnrolled: Joi.string().pattern(yearEnrolledPattern).optional(),
  status: Joi.string()
    .valid(...Object.values(StudentStatus))
    .optional(),
  linkStatus: Joi.string()
    .valid(...Object.values(LinkStatus))
    .optional(),
  parentId: Joi.number().integer().positive().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

export const studentIdParam = Joi.object().keys({
  id: Joi.number().integer().positive().required(),
});

export const studentIdStringParam = Joi.object().keys({
  studentId: Joi.string().pattern(studentIdPattern).required(),
});

export const parentIdParam = Joi.object().keys({
  parentId: Joi.number().integer().positive().required(),
});

export const bulkUpdateStatus = Joi.object().keys({
  studentIds: Joi.array()
    .items(Joi.number().integer().positive())
    .min(1)
    .required(),
  status: Joi.string()
    .valid(...Object.values(StudentStatus))
    .required(),
});

export const getPaginated = Joi.object().keys({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

export const requestLinkStudent = Joi.object().keys({
  studentId: Joi.string().pattern(studentIdPattern).required().messages({
    "string.pattern.base":
      "Student ID must follow format: YYYY-NNNNN (e.g., 2024-12345)",
  }),
  relationship: Joi.string().min(2).max(50).optional(),
  // parentId comes from authenticated user, not from request body
});

export const unlinkStudent = Joi.object().keys({});
