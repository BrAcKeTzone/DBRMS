import express from "express";
const router = express.Router();
import * as authController from "./auth.controller";
import validate from "../../middlewares/validate.middleware";
import * as authValidation from "./auth.validation";

router.post(
  "/send-otp",
  validate(authValidation.sendOtp),
  authController.sendOtp
);
router.post(
  "/verify-otp",
  validate(authValidation.verifyOtp),
  authController.verifyOtp
);
router.post(
  "/send-otp-reset",
  validate(authValidation.sendOtpReset),
  authController.sendOtpForReset
);
router.post(
  "/verify-otp-reset",
  validate(authValidation.verifyOtpForReset),
  authController.verifyOtpForReset
);
router.post(
  "/send-otp-change",
  validate(authValidation.sendOtpChange),
  authController.sendOtpForChange
);
router.post(
  "/verify-otp-change",
  validate(authValidation.verifyOtpForChange),
  authController.verifyOtpForChange
);
router.post(
  "/register",
  validate(authValidation.register),
  authController.register
);
router.post("/login", validate(authValidation.login), authController.login);
router.post(
  "/reset-password",
  validate(authValidation.resetPassword),
  authController.resetPassword
);
router.post(
  "/change-password",
  validate(authValidation.changePassword),
  authController.changePassword
);

export default router;
