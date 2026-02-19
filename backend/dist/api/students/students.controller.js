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
exports.clearOldRejectedLinks = exports.getPendingParentLinks = exports.searchStudents = exports.bulkImportStudents = exports.downloadStudentsTemplateXlsx = exports.exportStudentsXlsx = exports.getMyLinkRequests = exports.getMyChildren = exports.getApprovedStudentsByParentId = exports.getPendingLinksByParentId = exports.unlinkStudent = exports.requestLinkStudent = exports.getPendingStudents = exports.bulkUpdateStudentStatus = exports.getEnrollmentStats = exports.getStudentsByParentId = exports.rejectStudentLink = exports.approveStudentLink = exports.deleteStudent = exports.updateStudent = exports.getStudentByStudentId = exports.getStudentById = exports.getStudents = exports.createStudent = void 0;
const studentService = __importStar(require("./students.service"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiResponse_1 = __importDefault(require("../../utils/ApiResponse"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../configs/prisma"));
const xlsx_1 = __importDefault(require("xlsx"));
const normalizeDate_1 = __importDefault(require("../../utils/normalizeDate"));
// Create a new student
exports.createStudent = (0, asyncHandler_1.default)(async (req, res) => {
    const { courseCode, height, weight, ...studentData } = req.body;
    // If courseCode is provided, resolve it to courseId
    let courseId = undefined;
    if (courseCode) {
        const course = await prisma_1.default.course.findUnique({
            where: { code: courseCode },
            select: { id: true },
        });
        if (!course) {
            throw new ApiError_1.default(400, `Course not found with code: ${courseCode}`);
        }
        courseId = course.id;
    }
    const student = await studentService.createStudent({
        ...studentData,
        height: height !== undefined && height !== "" ? parseFloat(height) : undefined,
        weight: weight !== undefined && weight !== "" ? parseFloat(weight) : undefined,
        courseId,
    });
    res
        .status(201)
        .json(new ApiResponse_1.default(201, student, "Student created successfully"));
});
// Get all students with filtering and pagination
exports.getStudents = (0, asyncHandler_1.default)(async (req, res) => {
    const { search, yearLevel, status, linkStatus, parentId, page = 1, limit = 10, } = req.query;
    // Parse and validate query parameters
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        throw new ApiError_1.default(400, "Invalid pagination parameters");
    }
    const filters = {};
    if (search)
        filters.search = search;
    if (yearLevel)
        filters.yearLevel = yearLevel;
    if (status)
        filters.status = status;
    if (linkStatus)
        filters.linkStatus = linkStatus;
    if (parentId)
        filters.parentId = parseInt(parentId, 10);
    const result = await studentService.getStudents(filters, pageNum, limitNum);
    // Enhance students with lastVisit
    const studentsWithLastVisit = result.students.map((student) => ({
        ...student,
        lastVisit: student.clinicVisits && student.clinicVisits.length > 0
            ? student.clinicVisits[0].visitDateTime
            : null,
    }));
    res
        .status(200)
        .json(new ApiResponse_1.default(200, { ...result, students: studentsWithLastVisit }, "Students retrieved successfully"));
});
// Get student by ID
exports.getStudentById = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
        throw new ApiError_1.default(400, "Invalid student ID");
    }
    const student = await studentService.getStudentById(studentId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, student, "Student retrieved successfully"));
});
// Get student by student ID
exports.getStudentByStudentId = (0, asyncHandler_1.default)(async (req, res) => {
    const { studentId } = req.params;
    const student = await studentService.getStudentByStudentId(studentId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, student, "Student retrieved successfully"));
});
// Update student
exports.updateStudent = (0, asyncHandler_1.default)(async (req, res) => {
    const studentId = parseInt(req.params.id, 10);
    const { studentId: newStudentId, firstName, lastName, middleName, sex, birthDate, yearLevel, status, linkStatus, bloodType, allergies, emergencyContactName, height, weight, courseCode, courseId, } = req.body;
    const data = {};
    if (newStudentId !== undefined)
        data.studentId = newStudentId;
    if (firstName !== undefined)
        data.firstName = firstName;
    if (lastName !== undefined)
        data.lastName = lastName;
    if (middleName !== undefined)
        data.middleName = middleName;
    if (sex !== undefined)
        data.sex = sex;
    if (birthDate !== undefined && birthDate !== "")
        data.birthDate = birthDate;
    if (yearLevel !== undefined)
        data.yearLevel = yearLevel;
    if (status !== undefined)
        data.status = status;
    if (linkStatus !== undefined)
        data.linkStatus = linkStatus;
    if (bloodType !== undefined)
        data.bloodType = bloodType;
    if (allergies !== undefined)
        data.allergies = allergies;
    if (emergencyContactName !== undefined)
        data.emergencyContactName = emergencyContactName;
    // Handle height
    if (height !== undefined) {
        if (height === "" || height === null) {
            data.height = 0;
        }
        else {
            data.height = parseFloat(height);
        }
    }
    // Handle weight
    if (weight !== undefined) {
        if (weight === "" || weight === null) {
            data.weight = 0;
        }
        else {
            data.weight = parseFloat(weight);
        }
    }
    // If yearLevel indicates High School (Grade 7-12), ensure course is cleared
    if (yearLevel &&
        (yearLevel.includes("Grade") || yearLevel.startsWith("HS"))) {
        data.courseId = null;
    }
    else {
        // If courseCode is provided, resolve it to courseId
        if (courseCode) {
            const course = await prisma_1.default.course.findUnique({
                where: { code: courseCode },
                select: { id: true },
            });
            if (!course) {
                throw new ApiError_1.default(400, `Course not found with code: ${courseCode}`);
            }
            data.courseId = course.id;
        }
        else if (courseId !== undefined) {
            data.courseId = courseId;
        }
    }
    const updatedStudent = await studentService.updateStudent(studentId, data);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, updatedStudent, "Student updated successfully"));
});
// Delete student
exports.deleteStudent = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
        throw new ApiError_1.default(400, "Invalid student ID");
    }
    const result = await studentService.deleteStudent(studentId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Student deleted successfully"));
});
// Approve student linking
exports.approveStudentLink = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
        throw new ApiError_1.default(400, "Invalid student ID");
    }
    const student = await studentService.approveStudentLink(studentId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, student, "Student link approved successfully"));
});
// Reject student linking
exports.rejectStudentLink = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
        throw new ApiError_1.default(400, "Invalid student ID");
    }
    const student = await studentService.rejectStudentLink(studentId, rejectionReason);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, student, "Student link rejected successfully"));
});
// Get students by parent ID
exports.getStudentsByParentId = (0, asyncHandler_1.default)(async (req, res) => {
    const { parentId } = req.params;
    const parentIdNum = parseInt(parentId, 10);
    if (isNaN(parentIdNum)) {
        throw new ApiError_1.default(400, "Invalid parent ID");
    }
    const students = await studentService.getStudentsByParentId(parentIdNum);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, students, "Students retrieved successfully"));
});
// Get enrollment statistics
exports.getEnrollmentStats = (0, asyncHandler_1.default)(async (req, res) => {
    const stats = await studentService.getEnrollmentStats();
    res
        .status(200)
        .json(new ApiResponse_1.default(200, stats, "Enrollment statistics retrieved successfully"));
});
// Bulk update student status
exports.bulkUpdateStudentStatus = (0, asyncHandler_1.default)(async (req, res) => {
    const { studentIds, status } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
        throw new ApiError_1.default(400, "Student IDs array is required");
    }
    if (!Object.values(client_1.StudentStatus).includes(status)) {
        throw new ApiError_1.default(400, "Invalid student status");
    }
    // Update each student individually to ensure proper validation
    const updatePromises = studentIds.map((id) => studentService.updateStudent(id, { status }));
    try {
        const updatedStudents = await Promise.all(updatePromises);
        res
            .status(200)
            .json(new ApiResponse_1.default(200, updatedStudents, "Students status updated successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Failed to update some students");
    }
});
// Get students pending approval
exports.getPendingStudents = (0, asyncHandler_1.default)(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        throw new ApiError_1.default(400, "Invalid pagination parameters");
    }
    const filters = {
        linkStatus: client_1.LinkStatus.PENDING,
    };
    const result = await studentService.getStudents(filters, pageNum, limitNum);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Pending students retrieved successfully"));
});
// Request to link a student (by parent)
exports.requestLinkStudent = (0, asyncHandler_1.default)(async (req, res) => {
    const { studentId, relationship } = req.body;
    const parentId = req.user.id; // Get from auth middleware
    if (!studentId) {
        throw new ApiError_1.default(400, "Student ID is required");
    }
    const student = await studentService.requestLinkStudent(studentId, parentId, relationship);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, student, "Link request submitted successfully"));
});
// Unlink a student from parent
exports.unlinkStudent = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    // When authenticated middleware runs, set req.user with id and role
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
        throw new ApiError_1.default(400, "Invalid student ID");
    }
    if (!userId || !userRole) {
        throw new ApiError_1.default(401, "User authentication required");
    }
    const result = await studentService.unlinkStudent(studentId, userId, userRole);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Student unlinked successfully"));
});
// Get pending link requests for a parent
exports.getPendingLinksByParentId = (0, asyncHandler_1.default)(async (req, res) => {
    const { parentId } = req.params;
    const parentIdNum = parseInt(parentId, 10);
    if (isNaN(parentIdNum)) {
        throw new ApiError_1.default(400, "Invalid parent ID");
    }
    const students = await studentService.getPendingLinksByParentId(parentIdNum);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, students, "Pending link requests retrieved successfully"));
});
// Get approved (linked) students for a parent
exports.getApprovedStudentsByParentId = (0, asyncHandler_1.default)(async (req, res) => {
    const { parentId } = req.params;
    const parentIdNum = parseInt(parentId, 10);
    if (isNaN(parentIdNum)) {
        throw new ApiError_1.default(400, "Invalid parent ID");
    }
    const students = await studentService.getApprovedStudentsByParentId(parentIdNum);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, students, "Linked students retrieved successfully"));
});
// Get authenticated user's children
exports.getMyChildren = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user.id; // From auth middleware
    const students = await studentService.getApprovedStudentsByParentId(userId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, students, "My children retrieved successfully"));
});
// Get authenticated user's pending link requests
exports.getMyLinkRequests = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user.id; // From auth middleware
    const requests = await studentService.getAllLinkRequestsByParentId(userId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, requests, "Link requests retrieved successfully"));
});
// Export students as XLSX (Admin only)
exports.exportStudentsXlsx = (0, asyncHandler_1.default)(async (req, res) => {
    // Optionally filter by year or status via query params
    const { yearLevel, status } = req.query;
    const where = {};
    if (yearLevel)
        where.yearLevel = yearLevel;
    if (status)
        where.status = status;
    const students = await prisma_1.default.student.findMany({
        where,
        orderBy: [{ yearLevel: "asc" }, { lastName: "asc" }],
        include: {
            course: {
                select: {
                    code: true,
                    name: true,
                },
            },
        },
    });
    // Deduplicate by studentId to avoid duplicate rows in export if data source has duplicates
    const seenExport = new Set();
    const uniqueStudents = [];
    for (const s of students) {
        if (!seenExport.has(s.studentId)) {
            seenExport.add(s.studentId);
            uniqueStudents.push(s);
        }
    }
    // Define headers and fields to export
    const headers = [
        "studentId",
        "firstName",
        "middleName",
        "lastName",
        "sex",
        "birthDate",
        "yearLevel",
        "courseCode",
        "status",
        "bloodType",
        "allergies",
        "emergencyContactName",
        "height",
        "weight",
    ];
    // (CSV export removed - XLSX export used exclusively)
    // Build XLSX workbook where birthDate cells are true Date types
    const wsData = [headers];
    uniqueStudents.forEach((s) => {
        wsData.push([
            s.studentId,
            s.firstName,
            s.middleName || "",
            s.lastName,
            s.sex || "",
            s.birthDate ? new Date(s.birthDate) : "",
            s.yearLevel || "",
            s.course?.code || "",
            s.status || "",
            s.bloodType || "",
            s.allergies || "",
            s.emergencyContactName || "",
            s.height || "",
            s.weight || "",
        ]);
    });
    const wb = xlsx_1.default.utils.book_new();
    const ws = xlsx_1.default.utils.aoa_to_sheet(wsData, { dateNF: "yyyy-mm-dd" });
    for (const cellAddress in ws) {
        if (!cellAddress.startsWith("!")) {
            const cell = ws[cellAddress];
            if (cell && cell.v instanceof Date) {
                cell.t = "d";
                cell.z = "yyyy-mm-dd";
            }
        }
    }
    xlsx_1.default.utils.book_append_sheet(wb, ws, "Students");
    const buf = xlsx_1.default.write(wb, {
        type: "buffer",
        bookType: "xlsx",
        cellDates: true,
    });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="students_export_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx"`);
    return res.status(200).send(buf);
});
// Download a template XLSX for student imports
exports.downloadStudentsTemplateXlsx = (0, asyncHandler_1.default)(async (req, res) => {
    const { type } = req.query;
    let headers = [
        "studentId",
        "firstName",
        "middleName",
        "lastName",
        "sex",
        "birthDate",
        "yearLevel",
        "courseCode",
        "status",
        "bloodType",
        "allergies",
        "emergencyContactName",
        "height",
        "weight",
    ];
    let sample = [
        "2024-12345",
        "Juan",
        "Santos",
        "Dela Cruz",
        "MALE",
        "2002-06-08",
        "1st Year College",
        "BSIT",
        "ACTIVE",
        "O+",
        "Peanuts",
        "Jane Dela Cruz",
        "175",
        "70",
    ];
    if (type === "highschool") {
        // Remove courseCode for High School
        headers = headers.filter((h) => h !== "courseCode");
        sample = [
            "2024-12345",
            "Juan",
            "Santos",
            "Dela Cruz",
            "MALE",
            "2008-06-08",
            "Grade 7",
            // courseCode removed
            "ACTIVE",
            "O+",
            "Peanuts",
            "Jane Dela Cruz",
            "150",
            "45",
        ];
    }
    const wsData = [headers, sample];
    const wb = xlsx_1.default.utils.book_new();
    const ws = xlsx_1.default.utils.aoa_to_sheet(wsData, { dateNF: "yyyy-mm-dd" });
    // mark dates
    for (const cellAddress in ws) {
        if (!cellAddress.startsWith("!")) {
            const cell = ws[cellAddress];
            // mark birthDate sample as a date
            if (cell && (cell.v === "2002-06-08" || cell.v === "2008-06-08")) {
                cell.v = new Date(cell.v);
                cell.t = "d";
                cell.z = "yyyy-mm-dd";
            }
        }
    }
    xlsx_1.default.utils.book_append_sheet(wb, ws, "Students");
    const buf = xlsx_1.default.write(wb, {
        type: "buffer",
        bookType: "xlsx",
        cellDates: true,
    });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="students_template_${type === "highschool" ? "hs" : "college"}.xlsx"`);
    res.status(200).send(buf);
});
// Bulk import students from uploaded Excel (Admin only)
exports.bulkImportStudents = (0, asyncHandler_1.default)(async (req, res) => {
    const file = req.file;
    if (!file) {
        throw new ApiError_1.default(400, "Excel file is required");
    }
    const allowed = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
    ];
    if (!allowed.includes(file.mimetype)) {
        throw new ApiError_1.default(400, "Only Excel (.xls/.xlsx) files are supported for import");
    }
    let header = [];
    const rows = [];
    try {
        // tell SheetJS to parse date-valued cells into JS Date objects
        const workbook = xlsx_1.default.read(file.buffer, {
            type: "buffer",
            cellDates: true,
        });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        // ensure Excel date cells get formatted consistently as ISO-like strings
        // when possible (dateNF) while still letting unknown cells be parsed
        const sheetRows = xlsx_1.default.utils.sheet_to_json(sheet, {
            defval: "",
            raw: false,
            dateNF: "yyyy-mm-dd",
        });
        if (!sheetRows || sheetRows.length === 0) {
            throw new ApiError_1.default(400, "Excel file must contain a header and at least one row");
        }
        header = Object.keys(sheetRows[0]);
        rows.push(...sheetRows);
    }
    catch (err) {
        throw new ApiError_1.default(400, "Invalid Excel file format");
    }
    const requiredColumns = [
        "studentId",
        "firstName",
        "lastName",
        "sex",
        "yearLevel",
    ];
    for (const col of requiredColumns) {
        if (!header.includes(col)) {
            throw new ApiError_1.default(400, `Missing required column: ${col}`);
        }
    }
    const toCreate = [];
    const errors = [];
    const invalidRows = [];
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2; // account for header row when reporting row numbers
        // If row is empty skip
        if (!Object.values(row).some((v) => String(v).trim() !== ""))
            continue;
        // Basic validation
        const missingFields = [];
        if (!row.studentId)
            missingFields.push("studentId");
        if (!row.firstName)
            missingFields.push("firstName");
        if (!row.lastName)
            missingFields.push("lastName");
        if (!row.sex)
            missingFields.push("sex");
        if (!row.yearLevel)
            missingFields.push("yearLevel");
        if (missingFields.length > 0) {
            const msg = `Missing required fields: ${missingFields.join(", ")}`;
            errors.push({ row: rowNum, error: msg });
            invalidRows.push({ row: rowNum, values: row, error: msg });
            continue;
        }
        // Validate sex
        let sexVal = undefined;
        if (row.sex) {
            const normalized = (row.sex || "").toUpperCase();
            if (["MALE", "FEMALE"].includes(normalized)) {
                sexVal = normalized;
            }
            else {
                const msg = `Invalid sex value: ${row.sex}. Must be MALE or FEMALE.`;
                errors.push({ row: rowNum, error: msg });
                invalidRows.push({ row: rowNum, values: row, error: msg });
                continue;
            }
        }
        // Transform dates: normalize to JS Date for Prisma
        // reuse show-stored shared utility normalizeDateToIso
        let birthDateIso = null;
        if (row.birthDate) {
            birthDateIso = (0, normalizeDate_1.default)(row.birthDate);
        }
        let birthDate = null;
        if (birthDateIso)
            birthDate = new Date(birthDateIso);
        // If user provided a birthDate but we could not parse it, treat it as invalid
        if (row.birthDate && !birthDateIso) {
            const msg = `Invalid birthDate value: ${row.birthDate}`;
            errors.push({ row: rowNum, error: msg });
            invalidRows.push({ row: rowNum, values: row, error: msg });
            continue;
        }
        // Validate and normalize status value if provided
        let statusVal = undefined;
        if (row.status) {
            const normalized = (row.status || "").toUpperCase();
            if (Object.values(client_1.StudentStatus).includes(normalized)) {
                statusVal = normalized;
            }
            else {
                const msg = `Invalid status value: ${row.status}`;
                errors.push({ row: rowNum, error: msg });
                invalidRows.push({ row: rowNum, values: row, error: msg });
                continue;
            }
        }
        // Validate yearLevel
        const yearLevelStr = String(row.yearLevel);
        if (!yearLevelStr) {
            const msg = `Invalid yearLevel value: ${row.yearLevel}`;
            errors.push({ row: rowNum, error: msg });
            invalidRows.push({ row: rowNum, values: row, error: msg });
            continue;
        }
        // Check yearLevel vs import type
        const { type } = req.query;
        if (type === "highschool") {
            if (yearLevelStr.toLowerCase().includes("college") ||
                yearLevelStr.toLowerCase().includes("university")) {
                const msg = `Invalid yearLevel for High School import: ${yearLevelStr}`;
                errors.push({ row: rowNum, error: msg });
                invalidRows.push({ row: rowNum, values: row, error: msg });
                continue;
            }
        }
        else if (type === "college") {
            if (yearLevelStr.includes("Grade") ||
                yearLevelStr.startsWith("HS") ||
                yearLevelStr.startsWith("JHS") ||
                yearLevelStr.startsWith("SHS")) {
                const msg = `Invalid yearLevel for College import: ${yearLevelStr}`;
                errors.push({ row: rowNum, error: msg });
                invalidRows.push({ row: rowNum, values: row, error: msg });
                continue;
            }
        }
        // Validate courseCode if provided
        let courseId = undefined;
        // If High School, force no course (redundant safeguard if type is used, but good for data integrity)
        if (yearLevelStr.includes("Grade") ||
            yearLevelStr.startsWith("HS") ||
            type === "highschool") {
            courseId = undefined; // Force null/undefined
        }
        else {
            if (row.courseCode) {
                const course = await prisma_1.default.course.findUnique({
                    where: { code: String(row.courseCode).trim() },
                    select: { id: true },
                });
                if (!course) {
                    const msg = `Course not found with code: ${row.courseCode}`;
                    errors.push({ row: rowNum, error: msg });
                    invalidRows.push({ row: rowNum, values: row, error: msg });
                    continue;
                }
                courseId = course.id;
            }
            else if (type === "college") {
                // Optional: Require course for college students?
                // For now, allow it to be optional unless strictly required by business rules
            }
        }
        // Handle height
        let height = undefined;
        if (row.height !== undefined && row.height !== "") {
            const h = parseFloat(row.height);
            if (isNaN(h)) {
                const msg = `Invalid height value: ${row.height}`;
                errors.push({ row: rowNum, error: msg });
                invalidRows.push({ row: rowNum, values: row, error: msg });
                continue;
            }
            height = h;
        }
        // Handle weight
        let weight = undefined;
        if (row.weight !== undefined && row.weight !== "") {
            const w = parseFloat(row.weight);
            if (isNaN(w)) {
                const msg = `Invalid weight value: ${row.weight}`;
                errors.push({ row: rowNum, error: msg });
                invalidRows.push({ row: rowNum, values: row, error: msg });
                continue;
            }
            weight = w;
        }
        toCreate.push({
            studentId: row.studentId,
            firstName: row.firstName,
            middleName: row.middleName || null,
            lastName: row.lastName,
            sex: sexVal,
            birthDate,
            yearLevel: yearLevelStr,
            courseId: courseId || undefined,
            status: statusVal || undefined,
            bloodType: row.bloodType ? String(row.bloodType) : undefined,
            allergies: row.allergies ? String(row.allergies) : undefined,
            emergencyContactName: row.emergencyContactName
                ? String(row.emergencyContactName)
                : undefined,
            height,
            weight,
            _line: rowNum,
        });
    }
    // parentId is not supported in the import; any linkage should be done via separate API flows
    if (toCreate.length === 0) {
        return res
            .status(400)
            .json(new ApiResponse_1.default(400, { errors }, "No valid rows to import"));
    }
    // Deduplicate rows within the import file by studentId, and skip ones that already exist in DB
    const studentIdsInFile = Array.from(new Set(toCreate.map((t) => t.studentId)));
    const existingStudents = await prisma_1.default.student.findMany({
        where: { studentId: { in: studentIdsInFile } },
        select: { studentId: true },
    });
    const existingStudentSet = new Set(existingStudents.map((s) => s.studentId));
    const seenIds = new Set();
    const filtered = [];
    let duplicatesInFile = 0;
    let existingSkipped = 0;
    for (const item of toCreate) {
        if (seenIds.has(item.studentId)) {
            duplicatesInFile += 1;
            const msg = `Duplicate studentId in file: ${item.studentId}`;
            errors.push({ row: item._line || null, error: msg });
            invalidRows.push({ row: item._line || null, values: item, error: msg });
            continue;
        }
        seenIds.add(item.studentId);
        if (existingStudentSet.has(item.studentId)) {
            existingSkipped += 1;
            // Existing in DB; skip but record as skipped (not an invalid row)
            continue;
        }
        filtered.push(item);
    }
    // Use createMany with skipDuplicates to avoid unique constraint errors
    // Remove internal helper fields such as _line before sending to DB
    const preparedData = filtered.map(({ _line, ...rest }) => rest);
    const result = await prisma_1.default.student.createMany({
        data: preparedData,
        skipDuplicates: true,
    });
    const createdCount = result.count || 0;
    const skipped = existingSkipped + duplicatesInFile + (preparedData.length - createdCount);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, { created: createdCount, skipped, errors, invalidRows }, "Students imported successfully"));
});
// Search students by query
exports.searchStudents = (0, asyncHandler_1.default)(async (req, res) => {
    const { q, page = 1, limit = 50 } = req.query;
    if (!q || typeof q !== "string") {
        throw new ApiError_1.default(400, "Search query is required");
    }
    // Parse and validate pagination parameters
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        throw new ApiError_1.default(400, "Invalid pagination parameters");
    }
    const filters = {
        search: q,
        excludeLinked: true, // Exclude students who already have an approved parent link
    };
    const result = await studentService.getStudents(filters, pageNum, limitNum);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Students found successfully"));
});
// Get all pending parent-student link requests (Admin only)
exports.getPendingParentLinks = (0, asyncHandler_1.default)(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    // Parse and validate pagination parameters
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        throw new ApiError_1.default(400, "Invalid pagination parameters");
    }
    const filters = {
        // Only show students that have a parent assigned (actual link requests)
        hasParent: true,
    };
    // Only add linkStatus filter if status is provided
    // If no status, return all students with any parent assignment
    if (status) {
        filters.linkStatus = status;
    }
    const result = await studentService.getStudents(filters, pageNum, limitNum);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Link requests retrieved successfully"));
});
// Clear old rejected parent links (older than 3 days)
exports.clearOldRejectedLinks = (0, asyncHandler_1.default)(async (req, res) => {
    const clearedCount = await studentService.clearOldRejectedLinks();
    res
        .status(200)
        .json(new ApiResponse_1.default(200, { clearedCount }, `${clearedCount} old rejected links cleared successfully`));
});
//# sourceMappingURL=students.controller.js.map