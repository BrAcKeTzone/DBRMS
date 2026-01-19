import { Request, Response } from "express";
import * as studentService from "./students.service";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import ApiError from "../../utils/ApiError";
import { StudentStatus, LinkStatus } from "@prisma/client";
import prisma from "../../configs/prisma";
import XLSX from "xlsx";
import normalizeDateToIso from "../../utils/normalizeDate";

// Create a new student
export const createStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const { courseCode, height, weight, ...studentData } = req.body;

    // If courseCode is provided, resolve it to courseId
    let courseId = undefined;
    if (courseCode) {
      const course = await prisma.course.findUnique({
        where: { code: courseCode },
        select: { id: true },
      });
      if (!course) {
        throw new ApiError(400, `Course not found with code: ${courseCode}`);
      }
      courseId = course.id;
    }

    const student = await studentService.createStudent({
      ...studentData,
      height:
        height !== undefined && height !== "" ? parseFloat(height) : undefined,
      weight:
        weight !== undefined && weight !== "" ? parseFloat(weight) : undefined,
      courseId,
    });
    res
      .status(201)
      .json(new ApiResponse(201, student, "Student created successfully"));
  },
);

// Get all students with filtering and pagination
export const getStudents = asyncHandler(async (req: Request, res: Response) => {
  const {
    search,
    yearEnrolled,
    status,
    linkStatus,
    parentId,
    page = 1,
    limit = 10,
  } = req.query;

  // Parse and validate query parameters
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
    throw new ApiError(400, "Invalid pagination parameters");
  }

  const filters: studentService.StudentSearchFilters = {};

  if (search) filters.search = search as string;
  if (yearEnrolled) filters.yearEnrolled = yearEnrolled as string;
  if (status) filters.status = status as StudentStatus;
  if (linkStatus) filters.linkStatus = linkStatus as LinkStatus;
  if (parentId) filters.parentId = parseInt(parentId as string, 10);

  const result = await studentService.getStudents(filters, pageNum, limitNum);
  res
    .status(200)
    .json(new ApiResponse(200, result, "Students retrieved successfully"));
});

// Get student by ID
export const getStudentById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const studentId = parseInt(id, 10);

    if (isNaN(studentId)) {
      throw new ApiError(400, "Invalid student ID");
    }

    const student = await studentService.getStudentById(studentId);
    res
      .status(200)
      .json(new ApiResponse(200, student, "Student retrieved successfully"));
  },
);

// Get student by student ID
export const getStudentByStudentId = asyncHandler(
  async (req: Request, res: Response) => {
    const { studentId } = req.params;
    const student = await studentService.getStudentByStudentId(studentId);
    res
      .status(200)
      .json(new ApiResponse(200, student, "Student retrieved successfully"));
  },
);

// Update student
export const updateStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const studentId = parseInt(id, 10);

    if (isNaN(studentId)) {
      throw new ApiError(400, "Invalid student ID");
    }

    // Extract only the allowed update fields from req.body
    const {
      firstName,
      lastName,
      middleName,
      sex,
      birthDate,
      yearEnrolled,
      status,
      linkStatus,
      courseCode,
      bloodType,
      allergies,
      height,
      weight,
    } = req.body;

    let courseId: number | null | undefined = undefined;
    if (courseCode !== undefined) {
      // allow clearing by passing empty string or null
      if (courseCode === "" || courseCode === null) {
        courseId = null;
      } else {
        const course = await prisma.course.findUnique({
          where: { code: String(courseCode).trim() },
          select: { id: true },
        });
        if (!course) {
          throw new ApiError(400, `Course not found with code: ${courseCode}`);
        }
        courseId = course.id;
      }
    }

    const updateData: any = {
      firstName,
      lastName,
      middleName,
      sex,
      birthDate,
      yearEnrolled,
      status,
      linkStatus,
      bloodType,
      allergies,
      height:
        height !== undefined && height !== "" && height !== null
          ? parseFloat(height)
          : height === "" || height === null
            ? null
            : undefined,
      weight:
        weight !== undefined && weight !== "" && weight !== null
          ? parseFloat(weight)
          : weight === "" || weight === null
            ? null
            : undefined,
    };

    if (courseId !== undefined) {
      updateData.courseId = courseId;
    }

    const student = await studentService.updateStudent(studentId, updateData);
    res
      .status(200)
      .json(new ApiResponse(200, student, "Student updated successfully"));
  },
);

// Delete student
export const deleteStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const studentId = parseInt(id, 10);

    if (isNaN(studentId)) {
      throw new ApiError(400, "Invalid student ID");
    }

    const result = await studentService.deleteStudent(studentId);
    res
      .status(200)
      .json(new ApiResponse(200, result, "Student deleted successfully"));
  },
);

// Approve student linking
export const approveStudentLink = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const studentId = parseInt(id, 10);

    if (isNaN(studentId)) {
      throw new ApiError(400, "Invalid student ID");
    }

    const student = await studentService.approveStudentLink(studentId);
    res
      .status(200)
      .json(
        new ApiResponse(200, student, "Student link approved successfully"),
      );
  },
);

// Reject student linking
export const rejectStudentLink = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const studentId = parseInt(id, 10);

    if (isNaN(studentId)) {
      throw new ApiError(400, "Invalid student ID");
    }

    const student = await studentService.rejectStudentLink(
      studentId,
      rejectionReason,
    );
    res
      .status(200)
      .json(
        new ApiResponse(200, student, "Student link rejected successfully"),
      );
  },
);

// Get students by parent ID
export const getStudentsByParentId = asyncHandler(
  async (req: Request, res: Response) => {
    const { parentId } = req.params;
    const parentIdNum = parseInt(parentId, 10);

    if (isNaN(parentIdNum)) {
      throw new ApiError(400, "Invalid parent ID");
    }

    const students = await studentService.getStudentsByParentId(parentIdNum);
    res
      .status(200)
      .json(new ApiResponse(200, students, "Students retrieved successfully"));
  },
);

// Get enrollment statistics
export const getEnrollmentStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await studentService.getEnrollmentStats();
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          stats,
          "Enrollment statistics retrieved successfully",
        ),
      );
  },
);

// Bulk update student status
export const bulkUpdateStudentStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { studentIds, status } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      throw new ApiError(400, "Student IDs array is required");
    }

    if (!Object.values(StudentStatus).includes(status)) {
      throw new ApiError(400, "Invalid student status");
    }

    // Update each student individually to ensure proper validation
    const updatePromises = studentIds.map((id: number) =>
      studentService.updateStudent(id, { status }),
    );

    try {
      const updatedStudents = await Promise.all(updatePromises);
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updatedStudents,
            "Students status updated successfully",
          ),
        );
    } catch (error) {
      throw new ApiError(500, "Failed to update some students");
    }
  },
);

// Get students pending approval
export const getPendingStudents = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      throw new ApiError(400, "Invalid pagination parameters");
    }

    const filters: studentService.StudentSearchFilters = {
      linkStatus: LinkStatus.PENDING,
    };

    const result = await studentService.getStudents(filters, pageNum, limitNum);
    res
      .status(200)
      .json(
        new ApiResponse(200, result, "Pending students retrieved successfully"),
      );
  },
);

// Request to link a student (by parent)
export const requestLinkStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const { studentId, relationship } = req.body;
    const parentId = (req as any).user.id; // Get from auth middleware

    if (!studentId) {
      throw new ApiError(400, "Student ID is required");
    }

    const student = await studentService.requestLinkStudent(
      studentId,
      parentId,
      relationship,
    );
    res
      .status(200)
      .json(
        new ApiResponse(200, student, "Link request submitted successfully"),
      );
  },
);

// Unlink a student from parent
export const unlinkStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    // When authenticated middleware runs, set req.user with id and role
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    const studentId = parseInt(id, 10);

    if (isNaN(studentId)) {
      throw new ApiError(400, "Invalid student ID");
    }

    if (!userId || !userRole) {
      throw new ApiError(401, "User authentication required");
    }

    const result = await studentService.unlinkStudent(
      studentId,
      userId,
      userRole,
    );
    res
      .status(200)
      .json(new ApiResponse(200, result, "Student unlinked successfully"));
  },
);

// Get pending link requests for a parent
export const getPendingLinksByParentId = asyncHandler(
  async (req: Request, res: Response) => {
    const { parentId } = req.params;
    const parentIdNum = parseInt(parentId, 10);

    if (isNaN(parentIdNum)) {
      throw new ApiError(400, "Invalid parent ID");
    }

    const students =
      await studentService.getPendingLinksByParentId(parentIdNum);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          students,
          "Pending link requests retrieved successfully",
        ),
      );
  },
);

// Get approved (linked) students for a parent
export const getApprovedStudentsByParentId = asyncHandler(
  async (req: Request, res: Response) => {
    const { parentId } = req.params;
    const parentIdNum = parseInt(parentId, 10);

    if (isNaN(parentIdNum)) {
      throw new ApiError(400, "Invalid parent ID");
    }

    const students =
      await studentService.getApprovedStudentsByParentId(parentIdNum);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          students,
          "Linked students retrieved successfully",
        ),
      );
  },
);

// Get authenticated user's children
export const getMyChildren = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id; // From auth middleware

    const students = await studentService.getApprovedStudentsByParentId(userId);
    res
      .status(200)
      .json(
        new ApiResponse(200, students, "My children retrieved successfully"),
      );
  },
);

// Get authenticated user's pending link requests
export const getMyLinkRequests = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id; // From auth middleware

    const requests = await studentService.getAllLinkRequestsByParentId(userId);
    res
      .status(200)
      .json(
        new ApiResponse(200, requests, "Link requests retrieved successfully"),
      );
  },
);

// Export students as XLSX (Admin only)
export const exportStudentsXlsx = asyncHandler(
  async (req: Request, res: Response) => {
    // Optionally filter by year or status via query params
    const { yearEnrolled, status } = req.query;

    const where: any = {};
    if (yearEnrolled) where.yearEnrolled = yearEnrolled as string;
    if (status) where.status = status as any;

    const students = await prisma.student.findMany({
      where,
      orderBy: [{ yearEnrolled: "asc" }, { lastName: "asc" }],
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
      "yearEnrolled",
      "courseCode",
      "status",
    ];

    // (CSV export removed - XLSX export used exclusively)

    // Build XLSX workbook where birthDate cells are true Date types
    const wsData: any[] = [headers];
    uniqueStudents.forEach((s) => {
      wsData.push([
        s.studentId,
        s.firstName,
        s.middleName || "",
        s.lastName,
        s.sex || "",
        s.birthDate ? new Date(s.birthDate) : "",
        s.yearEnrolled || "",
        s.course?.code || "",
        s.status || "",
      ]);
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData, { dateNF: "yyyy-mm-dd" });
    for (const cellAddress in ws) {
      if (!cellAddress.startsWith("!")) {
        const cell = (ws as any)[cellAddress];
        if (cell && cell.v instanceof Date) {
          cell.t = "d";
          cell.z = "yyyy-mm-dd";
        }
      }
    }
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    const buf = XLSX.write(wb, {
      type: "buffer",
      bookType: "xlsx",
      cellDates: true,
    });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="students_export_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx"`,
    );
    return res.status(200).send(buf);
  },
);

// Download a template XLSX for student imports
export const downloadStudentsTemplateXlsx = asyncHandler(
  async (req: Request, res: Response) => {
    const headers = [
      "studentId",
      "firstName",
      "middleName",
      "lastName",
      "sex",
      "birthDate",
      "yearEnrolled",
      "courseCode",
      "status",
    ];
    const sample = [
      "2024-12345",
      "Juan",
      "Santos",
      "Dela Cruz",
      "MALE",
      "2002-06-08",
      "2024",
      "BSIT",
      "ACTIVE",
    ];

    const wsData = [headers, sample];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData, { dateNF: "yyyy-mm-dd" });
    // mark dates
    for (const cellAddress in ws) {
      if (!cellAddress.startsWith("!")) {
        const cell = (ws as any)[cellAddress];
        // mark birthDate sample as a date
        if (cell && cell.v === "2002-06-08") {
          cell.v = new Date("2002-06-08");
          cell.t = "d";
          cell.z = "yyyy-mm-dd";
        }
      }
    }
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    const buf = XLSX.write(wb, {
      type: "buffer",
      bookType: "xlsx",
      cellDates: true,
    });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="students_template.xlsx"`,
    );
    res.status(200).send(buf);
  },
);

// Bulk import students from uploaded Excel (Admin only)
export const bulkImportStudents = asyncHandler(
  async (req: Request, res: Response) => {
    const file = (req as any).file;
    if (!file) {
      throw new ApiError(400, "Excel file is required");
    }
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!allowed.includes(file.mimetype)) {
      throw new ApiError(
        400,
        "Only Excel (.xls/.xlsx) files are supported for import",
      );
    }

    let header: string[] = [];
    const rows: any[] = [];

    try {
      // tell SheetJS to parse date-valued cells into JS Date objects
      const workbook = XLSX.read(file.buffer, {
        type: "buffer",
        cellDates: true,
      });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      // ensure Excel date cells get formatted consistently as ISO-like strings
      // when possible (dateNF) while still letting unknown cells be parsed
      const sheetRows: any[] = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
        raw: false,
        dateNF: "yyyy-mm-dd",
      });
      if (!sheetRows || sheetRows.length === 0) {
        throw new ApiError(
          400,
          "Excel file must contain a header and at least one row",
        );
      }
      header = Object.keys(sheetRows[0]);
      rows.push(...sheetRows);
    } catch (err) {
      throw new ApiError(400, "Invalid Excel file format");
    }

    const requiredColumns = [
      "studentId",
      "firstName",
      "lastName",
      "sex",
      "yearEnrolled",
    ];
    for (const col of requiredColumns) {
      if (!header.includes(col)) {
        throw new ApiError(400, `Missing required column: ${col}`);
      }
    }

    const toCreate = [] as any[];
    const errors: any[] = [];
    const invalidRows: any[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // account for header row when reporting row numbers
      // If row is empty skip
      if (!Object.values(row).some((v) => String(v).trim() !== "")) continue;

      // Basic validation
      const missingFields: string[] = [];
      if (!row.studentId) missingFields.push("studentId");
      if (!row.firstName) missingFields.push("firstName");
      if (!row.lastName) missingFields.push("lastName");
      if (!row.sex) missingFields.push("sex");
      if (!row.yearEnrolled) missingFields.push("yearEnrolled");
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
        } else {
          const msg = `Invalid sex value: ${row.sex}. Must be MALE or FEMALE.`;
          errors.push({ row: rowNum, error: msg });
          invalidRows.push({ row: rowNum, values: row, error: msg });
          continue;
        }
      }

      // Transform dates: normalize to JS Date for Prisma
      // reuse show-stored shared utility normalizeDateToIso

      let birthDateIso: string | null = null;
      if (row.birthDate) {
        birthDateIso = normalizeDateToIso(row.birthDate);
      }
      let birthDate = null;
      if (birthDateIso) birthDate = new Date(birthDateIso);
      // If user provided a birthDate but we could not parse it, treat it as invalid
      if (row.birthDate && !birthDateIso) {
        const msg = `Invalid birthDate value: ${row.birthDate}`;
        errors.push({ row: rowNum, error: msg });
        invalidRows.push({ row: rowNum, values: row, error: msg });
        continue;
      }
      // ignore any enrollmentDate field in import file; not supported in import

      // Validate and normalize status value if provided
      let statusVal = undefined;
      if (row.status) {
        const normalized = (row.status || "").toUpperCase();
        if (
          Object.values(StudentStatus).includes(normalized as StudentStatus)
        ) {
          statusVal = normalized;
        } else {
          const msg = `Invalid status value: ${row.status}`;
          errors.push({ row: rowNum, error: msg });
          invalidRows.push({ row: rowNum, values: row, error: msg });
          continue;
        }
      }

      // Validate courseCode if provided
      let courseId = undefined;
      if (row.courseCode) {
        const course = await prisma.course.findUnique({
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

      // Ignore parentId in import file; parents must be linked via other flows

      // Validate yearEnrolled format (YYYY)
      const yearPattern = /^[0-9]{4}$/;
      if (!yearPattern.test(String(row.yearEnrolled))) {
        const msg = `Invalid yearEnrolled value: ${row.yearEnrolled}`;
        errors.push({ row: rowNum, error: msg });
        invalidRows.push({ row: rowNum, values: row, error: msg });
        continue;
      }

      toCreate.push({
        studentId: row.studentId,
        firstName: row.firstName,
        middleName: row.middleName || null,
        lastName: row.lastName,
        sex: sexVal,
        birthDate,
        yearEnrolled: String(row.yearEnrolled),
        courseId: courseId || undefined,
        status: statusVal || undefined,
        // ignore relationship and parentId from import file
        _line: rowNum,
        // not including enrollmentDate in import
      });
    }

    // parentId is not supported in the import; any linkage should be done via separate API flows

    if (toCreate.length === 0) {
      return res
        .status(400)
        .json(new ApiResponse(400, { errors }, "No valid rows to import"));
    }

    // Deduplicate rows within the import file by studentId, and skip ones that already exist in DB
    const studentIdsInFile = Array.from(
      new Set(toCreate.map((t) => t.studentId)),
    );
    const existingStudents = await prisma.student.findMany({
      where: { studentId: { in: studentIdsInFile } },
      select: { studentId: true },
    });
    const existingStudentSet = new Set(
      existingStudents.map((s) => s.studentId),
    );

    const seenIds = new Set();
    const filtered: any[] = [];
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
    const result = await prisma.student.createMany({
      data: preparedData,
      skipDuplicates: true,
    });

    const createdCount = result.count || 0;
    const skipped =
      existingSkipped + duplicatesInFile + (preparedData.length - createdCount);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { created: createdCount, skipped, errors, invalidRows },
          "Students imported successfully",
        ),
      );
  },
);

// Search students by query
export const searchStudents = asyncHandler(
  async (req: Request, res: Response) => {
    const { q, page = 1, limit = 50 } = req.query;

    if (!q || typeof q !== "string") {
      throw new ApiError(400, "Search query is required");
    }

    // Parse and validate pagination parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      throw new ApiError(400, "Invalid pagination parameters");
    }

    const filters: studentService.StudentSearchFilters = {
      search: q,
      excludeLinked: true, // Exclude students who already have an approved parent link
    };

    const result = await studentService.getStudents(filters, pageNum, limitNum);
    res
      .status(200)
      .json(new ApiResponse(200, result, "Students found successfully"));
  },
);

// Get all pending parent-student link requests (Admin only)
export const getPendingParentLinks = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 10, status } = req.query;

    // Parse and validate pagination parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      throw new ApiError(400, "Invalid pagination parameters");
    }

    const filters: studentService.StudentSearchFilters = {
      // Only show students that have a parent assigned (actual link requests)
      hasParent: true,
    };

    // Only add linkStatus filter if status is provided
    // If no status, return all students with any parent assignment
    if (status) {
      filters.linkStatus = status as any;
    }

    const result = await studentService.getStudents(filters, pageNum, limitNum);
    res
      .status(200)
      .json(
        new ApiResponse(200, result, "Link requests retrieved successfully"),
      );
  },
);

// Clear old rejected parent links (older than 3 days)
export const clearOldRejectedLinks = asyncHandler(
  async (req: Request, res: Response) => {
    const clearedCount = await studentService.clearOldRejectedLinks();
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { clearedCount },
          `${clearedCount} old rejected links cleared successfully`,
        ),
      );
  },
);
