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
  authorize("CLINIC_ADMIN"),
  validate(createCourseSchema),
  coursesController.createCourse
);
router.put(
  "/:id",
  authorize("CLINIC_ADMIN"),
  validate(updateCourseSchema),
  coursesController.updateCourse
);
router.delete(
  "/:id",
  authorize("CLINIC_ADMIN"),
  coursesController.deleteCourse
);

export default router;
