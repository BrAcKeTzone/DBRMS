import express from "express";
const router = express.Router();

import authRouter from "../api/auth/auth.route";
import userRouter from "../api/users/users.route";
import studentRouter from "../api/students/students.route";
import coursesRouter from "../api/courses/courses.route";

import settingsRouter from "../api/settings/settings.route";
import clinicVisitsRouter from "../api/clinicVisits/clinicVisits.route";
import smsRouter from "../api/sms/sms.route";

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/students", studentRouter);
router.use("/clinic-visits", clinicVisitsRouter);
router.use("/sms", smsRouter);

router.use("/settings", settingsRouter);
router.use("/courses", coursesRouter);

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
