import Joi from "joi";

export const createCourseSchema = Joi.object({
  code: Joi.string().max(50).required(),
  name: Joi.string().max(255).required(),
  description: Joi.string().max(5000).optional().allow(null, ""),
});

export const updateCourseSchema = Joi.object({
  code: Joi.string().max(50).optional(),
  name: Joi.string().max(255).optional(),
  description: Joi.string().max(5000).optional().allow(null, ""),
});
