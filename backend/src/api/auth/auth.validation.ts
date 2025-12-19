import Joi from "joi";

export const sendOtp = Joi.object().keys({
  email: Joi.string().email().required(),
});

export const verifyOtp = Joi.object().keys({
  email: Joi.string().email().required(),
  otp: Joi.string().required(),
});

export const verifyOtpForReset = Joi.object().keys({
  email: Joi.string().email().required(),
  otp: Joi.string().required(),
});

export const verifyOtpForChange = Joi.object().keys({
  email: Joi.string().email().required(),
  otp: Joi.string().required(),
});

export const sendOtpReset = Joi.object().keys({
  email: Joi.string().email().required(),
});

export const sendOtpChange = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const register = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(8),
  firstName: Joi.string().required(),
  middleName: Joi.string().allow("", null).optional(),
  lastName: Joi.string().required(),
});

export const login = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const resetPassword = Joi.object().keys({
  email: Joi.string().email().required(),
  otp: Joi.string().required(),
  password: Joi.string().required().min(8),
});

export const changePassword = Joi.object().keys({
  email: Joi.string().email().required(),
  oldPassword: Joi.string().required(),
  otp: Joi.string().required(),
  newPassword: Joi.string().required().min(8),
});
