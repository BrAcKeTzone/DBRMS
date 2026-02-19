"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const studentController = __importStar(require("./students.controller"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = __importDefault(require("../../middlewares/validate.middleware"));
const studentValidation = __importStar(require("./students.validation"));
const multer_1 = __importDefault(require("multer"));
const auth_middleware_2 = require("../../middlewares/auth.middleware");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Get authenticated user's children (must be before /:id routes)
router.get("/my-children", studentController.getMyChildren);
// Get authenticated user's pending link requests (must be before /:id routes)
router.get("/my-link-requests", studentController.getMyLinkRequests);
// Search students by query (must be before /:id routes)
router.get("/search", studentController.searchStudents);
// Get all pending parent-student link requests (Admin only, must be before /:id routes)
router.get("/pending-parent-links", studentController.getPendingParentLinks);
// Clear old rejected parent links (older than 3 days)
router.post("/clear-rejected-links", (0, auth_middleware_2.authorize)("CLINIC_STAFF"), studentController.clearOldRejectedLinks);
// Create a new student
router.post("/", (0, validate_middleware_1.default)(studentValidation.createStudent), studentController.createStudent);
// Export students XLSX (Admin only)
router.get("/export", auth_middleware_1.authenticate, (0, auth_middleware_2.authorize)("CLINIC_STAFF"), studentController.exportStudentsXlsx);
// Download a blank students template (XLSX)
router.get("/template", auth_middleware_1.authenticate, (0, auth_middleware_2.authorize)("CLINIC_STAFF"), studentController.downloadStudentsTemplateXlsx);
// XLSX upload config for import
const excelStorage = multer_1.default.memoryStorage();
const excelUpload = (0, multer_1.default)({
    storage: excelStorage,
    fileFilter: (req, file, cb) => {
        const allowed = [
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Only Excel (.xls/.xlsx) files are allowed"));
        }
    },
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});
// Bulk import students from Excel (Admin only)
router.post("/bulk-import", auth_middleware_1.authenticate, (0, auth_middleware_2.authorize)("CLINIC_STAFF"), excelUpload.single("file"), studentController.bulkImportStudents);
// Get all students with filtering and pagination (query params will be validated in controller)
router.get("/", studentController.getStudents);
// Get enrollment statistics
router.get("/stats", studentController.getEnrollmentStats);
// Get students pending approval (query params will be validated in controller)
router.get("/pending", studentController.getPendingStudents);
// Request to link a student to a parent
router.post("/link", (0, validate_middleware_1.default)(studentValidation.requestLinkStudent), studentController.requestLinkStudent);
// Get pending link requests for a parent
router.get("/parent/:parentId/pending", studentController.getPendingLinksByParentId);
// Get approved (linked) students for a parent
router.get("/parent/:parentId/approved", studentController.getApprovedStudentsByParentId);
// Get students by parent ID (all statuses)
router.get("/parent/:parentId", studentController.getStudentsByParentId);
// Get student by student ID (string format)
router.get("/student-id/:studentId", studentController.getStudentByStudentId);
// Get student by ID
router.get("/:id", studentController.getStudentById);
// Update student
router.put("/:id", (0, validate_middleware_1.default)(studentValidation.updateStudent), studentController.updateStudent);
// Delete student
router.delete("/:id", studentController.deleteStudent);
// Approve student linking
router.patch("/:id/approve", studentController.approveStudentLink);
// Reject student linking
router.patch("/:id/reject", studentController.rejectStudentLink);
// Unlink a student from parent
router.patch("/:id/unlink", (0, validate_middleware_1.default)(studentValidation.unlinkStudent), studentController.unlinkStudent);
// Bulk update student status
router.patch("/bulk/status", (0, validate_middleware_1.default)(studentValidation.bulkUpdateStatus), studentController.bulkUpdateStudentStatus);
exports.default = router;
//# sourceMappingURL=students.route.js.map