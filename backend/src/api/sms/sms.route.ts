import { Router } from "express";
import * as smsController from "./sms.controller";
import * as smsValidation from "./sms.validation";
import validate from "../../middlewares/validate.middleware";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

// Only staff can send or view all SMS logs, parents can view their own
router.use(authenticate);

router.post(
  "/send",
  authorize("CLINIC_STAFF"),
  validate(smsValidation.sendSMS),
  smsController.sendSMS,
);
router.get("/logs/unread-count", smsController.getUnreadCount);
router.get("/logs", smsController.getLogs);
router.post(
  "/logs/:id/read",
  validate(smsValidation.smsIdParam, "params"),
  smsController.markAsRead,
);
router.post("/resend/:id", authorize("CLINIC_STAFF"), smsController.resendSMS);

export default router;
