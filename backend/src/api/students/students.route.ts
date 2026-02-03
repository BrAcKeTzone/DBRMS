import express from "express";
import * as studentController from "./students.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import validate from "../../middlewares/validate.middleware";
import * as studentValidation from "./students.validation";
import multer from "multer";
import { authorize } from "../../middlewares/auth.middleware";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get authenticated user's children (must be before /:id routes)
router.get("/my-children", studentController.getMyChildren);

// Get authenticated user's pending link requests (must be before /:id routes)
router.get("/my-link-requests", studentController.getMyLinkRequests);

// Search students by query (must be before /:id routes)
router.get("/search", studentController.searchStudents);

// Get all pending parent-student link requests (Admin only, must be before /:id routes)
router.get("/pending-parent-links", studentController.getPendingParentLinks);

// Clear old rejected parent links (older than 3 days)
router.post(
  "/clear-rejected-links",
  authorize("CLINIC_STAFF"),
  studentController.clearOldRejectedLinks,
);

// Create a new student
router.post(
  "/",
  validate(studentValidation.createStudent),
  studentController.createStudent,
);

// Export students XLSX (Admin only)
router.get(
  "/export",
  authenticate,
  authorize("CLINIC_STAFF"),
  studentController.exportStudentsXlsx,
);

// Download a blank students template (XLSX)
router.get(
  "/template",
  authenticate,
  authorize("CLINIC_STAFF"),
  studentController.downloadStudentsTemplateXlsx,
);

// XLSX upload config for import
const excelStorage = multer.memoryStorage();
const excelUpload = multer({
  storage: excelStorage,
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel (.xls/.xlsx) files are allowed"));
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// Bulk import students from Excel (Admin only)
router.post(
  "/bulk-import",
  authenticate,
  authorize("CLINIC_STAFF"),
  excelUpload.single("file"),
  studentController.bulkImportStudents,
);

// Get all students with filtering and pagination (query params will be validated in controller)
router.get("/", studentController.getStudents);

// Get enrollment statistics
router.get("/stats", studentController.getEnrollmentStats);

// Get students pending approval (query params will be validated in controller)
router.get("/pending", studentController.getPendingStudents);

// Request to link a student to a parent
router.post(
  "/link",
  validate(studentValidation.requestLinkStudent),
  studentController.requestLinkStudent,
);

// Get pending link requests for a parent
router.get(
  "/parent/:parentId/pending",
  studentController.getPendingLinksByParentId,
);

// Get approved (linked) students for a parent
router.get(
  "/parent/:parentId/approved",
  studentController.getApprovedStudentsByParentId,
);

// Get students by parent ID (all statuses)
router.get("/parent/:parentId", studentController.getStudentsByParentId);

// Get student by student ID (string format)
router.get("/student-id/:studentId", studentController.getStudentByStudentId);

// Get student by ID
router.get("/:id", studentController.getStudentById);

// Update student
router.put(
  "/:id",
  validate(studentValidation.updateStudent),
  studentController.updateStudent,
);

// Delete student
router.delete("/:id", studentController.deleteStudent);

// Approve student linking
router.patch("/:id/approve", studentController.approveStudentLink);

// Reject student linking
router.patch("/:id/reject", studentController.rejectStudentLink);

// Unlink a student from parent
router.patch(
  "/:id/unlink",
  validate(studentValidation.unlinkStudent),
  studentController.unlinkStudent,
);

// Bulk update student status
router.patch(
  "/bulk/status",
  validate(studentValidation.bulkUpdateStatus),
  studentController.bulkUpdateStudentStatus,
);

export default router;
