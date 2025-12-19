import express from "express";
const router = express.Router();

import authRouter from "../api/auth/auth.route";
import userRouter from "../api/users/users.route";
import studentRouter from "../api/students/students.route";
import coursesRouter from "../api/courses/courses.route";

import settingsRouter from "../api/settings/settings.route";

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/students", studentRouter);

router.use("/settings", settingsRouter);
router.use("/courses", coursesRouter);
export default router;
