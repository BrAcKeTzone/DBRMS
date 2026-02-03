import express from "express";
import * as coursesController from "./courses.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import validate from "../../middlewares/validate.middleware";
import { createCourseSchema, updateCourseSchema } from "./courses.validation";

const router = express.Router();

router.use(authenticate);

router.get("/", coursesController.getAllCourses);
router.post(
  "/",
  authorize("CLINIC_STAFF"),
  validate(createCourseSchema),
  coursesController.createCourse,
);
router.put(
  "/:id",
  authorize("CLINIC_STAFF"),
  validate(updateCourseSchema),
  coursesController.updateCourse,
);
router.delete(
  "/:id",
  authorize("CLINIC_STAFF"),
  coursesController.deleteCourse,
);

export default router;
