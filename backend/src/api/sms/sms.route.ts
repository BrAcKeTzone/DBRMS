import { Router } from "express";
import * as smsController from "./sms.controller";
import * as smsValidation from "./sms.validation";
import validate from "../../middlewares/validate.middleware";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

// Only staff can send or view SMS logs
router.use(authenticate);
router.use(authorize("CLINIC_STAFF"));

router.post("/send", validate(smsValidation.sendSMS), smsController.sendSMS);
router.get("/logs", smsController.getLogs);
router.post("/resend/:id", smsController.resendSMS);

export default router;
