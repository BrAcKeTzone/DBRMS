import express from "express";
import * as userController from "./users.controller";
import validate from "../../middlewares/validate.middleware";
import * as userValidation from "./users.validation";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = express.Router();

// User profile routes (self-service) - require authentication
router.get("/me", authenticate, userController.getUserProfile);

router.get("/profile", authenticate, userController.getUserProfile);

router.put(
  "/me",
  authenticate,
  validate(userValidation.updateUserProfile),
  userController.updateUserProfile
);

router.put(
  "/profile",
  authenticate,
  validate(userValidation.updateUserProfile),
  userController.updateUserProfile
);

router.post(
  "/change-password",
  authenticate,
  validate(userValidation.changePassword),
  userController.changePassword
);

router.post(
  "/profile-picture",
  authenticate,
  userController.uploadProfilePicture
);

// Admin routes for user management - specific routes BEFORE dynamic :id routes
router.post(
  "/",
  authenticate,
  authorize("CLINIC_ADMIN"),
  validate(userValidation.createUser),
  userController.createUser
);

router.get(
  "/stats",
  authenticate,
  authorize("CLINIC_ADMIN"),
  userController.getUserStats
);

// Promote to admin
router.patch(
  "/:id/promote",
  authenticate,
  authorize("CLINIC_ADMIN"),
  userController.promoteToAdmin
);

router.get(
  "/",
  authenticate,
  authorize("CLINIC_ADMIN"),
  validate(userValidation.getUsers),
  userController.getAllUsers
);

// Dynamic :id routes - MUST come after specific routes
router.get(
  "/:id",
  authenticate,
  authorize("CLINIC_ADMIN"),
  userController.getUserById
);

router.put(
  "/:id",
  authenticate,
  authorize("CLINIC_ADMIN"),
  validate(userValidation.updateUserByAdmin),
  userController.updateUserByAdmin
);

router.delete(
  "/:id",
  authenticate,
  authorize("CLINIC_ADMIN"),
  userController.deleteUser
);

router.patch(
  "/:id/role",
  authenticate,
  authorize("CLINIC_ADMIN"),
  validate(userValidation.updateUserRole),
  userController.updateUserRole
);

router.patch(
  "/:id/deactivate",
  authenticate,
  authorize("CLINIC_ADMIN"),
  userController.deactivateUser
);

router.patch(
  "/:id/activate",
  authenticate,
  authorize("CLINIC_ADMIN"),
  userController.activateUser
);

export default router;
