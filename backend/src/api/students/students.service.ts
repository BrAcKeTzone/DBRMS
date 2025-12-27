import prisma from "../../configs/prisma";
import ApiError from "../../utils/ApiError";
import {
  Student,
  StudentStatus,
  LinkStatus,
  Sex,
  Prisma,
} from "@prisma/client";

export interface CreateStudentData {
  studentId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  sex: Sex;
  birthDate?: string | Date;
  yearEnrolled: string;
  courseId?: number;
  parentId?: number;
}

export interface UpdateStudentData {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  sex?: Sex;
  yearEnrolled?: string;
  courseId?: number | null;
  status?: StudentStatus;
  linkStatus?: LinkStatus;
}

export interface StudentSearchFilters {
  search?: string; // Search by name or student ID
  yearEnrolled?: string;
  status?: StudentStatus;
  linkStatus?: LinkStatus;
  parentId?: number;
  hasParent?: boolean; // Filter for students with or without parent assigned
  excludeLinked?: boolean; // Exclude students with APPROVED link status
}

// Create a new student
export const createStudent = async (
  studentData: CreateStudentData
): Promise<Student> => {
  try {
    // Check if student ID already exists
    const existingStudent = await prisma.student.findUnique({
      where: { studentId: studentData.studentId },
    });

    if (existingStudent) {
      throw new ApiError(400, "Student ID already exists");
    }

    // Verify parent exists (if provided)
    if (studentData.parentId) {
      const parent = await prisma.user.findUnique({
        where: { id: studentData.parentId },
      });

      if (!parent) {
        throw new ApiError(404, "Parent not found");
      }
    }

    // Verify course exists (if provided)
    if (studentData.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: studentData.courseId },
      });

      if (!course) {
        throw new ApiError(404, "Course not found");
      }
    }

    // Prepare data with defaults for optional fields
    const dataToCreate: any = {
      studentId: studentData.studentId,
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      middleName: studentData.middleName,
      sex: studentData.sex,
      birthDate: studentData.birthDate,
      yearEnrolled: studentData.yearEnrolled,
    };

    // Only include parentId if it's provided
    if (studentData.parentId) {
      dataToCreate.parentId = studentData.parentId;
    }

    // Only include courseId if it's provided
    if (studentData.courseId) {
      dataToCreate.courseId = studentData.courseId;
    }

    const student = await prisma.student.create({
      data: dataToCreate,
      include: {
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            phone: true,
          },
        },
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return student;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new ApiError(400, "Student ID already exists");
      }
    }
    throw error;
  }
};

// Get all students with filtering and pagination
export const getStudents = async (
  filters: StudentSearchFilters = {},
  page: number = 1,
  limit: number = 10
): Promise<{
  students: Student[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> => {
  const skip = (page - 1) * limit;

  const whereClause: Prisma.StudentWhereInput = {};

  // Search filter (name or student ID)
  if (filters.search) {
    whereClause.OR = [
      {
        studentId: {
          contains: filters.search,
        },
      },
      {
        firstName: {
          contains: filters.search,
        },
      },
      {
        lastName: {
          contains: filters.search,
        },
      },
    ];
  }

  // Other filters
  if (filters.yearEnrolled) {
    whereClause.yearEnrolled = filters.yearEnrolled;
  }
  if (filters.status) {
    whereClause.status = filters.status;
  }
  if (filters.linkStatus) {
    whereClause.linkStatus = filters.linkStatus;
  }
  if (filters.parentId) {
    whereClause.parentId = filters.parentId;
  }
  // Filter for students with or without parent
  if (filters.hasParent !== undefined) {
    if (filters.hasParent) {
      whereClause.parentId = { not: null };
    } else {
      whereClause.parentId = null;
    }
  }
  // Exclude students who already have an approved parent link
  if (filters.excludeLinked) {
    whereClause.linkStatus = { not: LinkStatus.APPROVED };
  }

  const [students, totalCount] = await Promise.all([
    prisma.student.findMany({
      where: whereClause,
      include: {
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            phone: true,
          },
        },
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      skip,
      take: limit,
    }),
    prisma.student.count({ where: whereClause }),
  ]);

  return {
    students,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
};

// Get student by ID
export const getStudentById = async (id: number): Promise<Student> => {
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      parent: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,
          email: true,
          phone: true,
        },
      },
      course: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  return student;
};

// Get student by student ID
export const getStudentByStudentId = async (
  studentId: string
): Promise<Student> => {
  const student = await prisma.student.findUnique({
    where: { studentId },
    include: {
      parent: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,
          email: true,
          phone: true,
        },
      },
      course: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  return student;
};

// Update student
export const updateStudent = async (
  id: number,
  updateData: UpdateStudentData
): Promise<Student> => {
  // Check if student exists
  const existingStudent = await prisma.student.findUnique({
    where: { id },
  });

  if (!existingStudent) {
    throw new ApiError(404, "Student not found");
  }

  try {
    // Prisma update does not accept explicit `null` for numeric foreign keys; remove them if present
    const dataToUpdate: any = { ...updateData };
    if (dataToUpdate.courseId === null) delete dataToUpdate.courseId;

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: dataToUpdate,
      include: {
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            phone: true,
          },
        },
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return updatedStudent;
  } catch (error) {
    throw error;
  }
};

// Delete student
export const deleteStudent = async (
  id: number
): Promise<{ message: string }> => {
  const student = await prisma.student.findUnique({
    where: { id },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  await prisma.student.delete({
    where: { id },
  });

  return { message: "Student deleted successfully" };
};

// Approve student linking
export const approveStudentLink = async (id: number): Promise<Student> => {
  const student = await prisma.student.findUnique({
    where: { id },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  if (student.linkStatus !== LinkStatus.PENDING) {
    throw new ApiError(400, "Student link is not pending approval");
  }

  const updatedStudent = await prisma.student.update({
    where: { id },
    data: { linkStatus: LinkStatus.APPROVED },
    include: {
      parent: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,
          email: true,
          phone: true,
        },
      },
      course: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
  });

  return updatedStudent;
};

// Reject student linking
export const rejectStudentLink = async (
  id: number,
  rejectionReason?: string
): Promise<Student> => {
  const student = await prisma.student.findUnique({
    where: { id },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  if (student.linkStatus !== LinkStatus.PENDING) {
    throw new ApiError(400, "Student link is not pending approval");
  }

  const updatedStudent = await prisma.student.update({
    where: { id },
    data: {
      linkStatus: LinkStatus.REJECTED,
      rejectionReason: rejectionReason || null,
    },
    include: {
      parent: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,
          email: true,
          phone: true,
        },
      },
      course: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
  });

  return updatedStudent;
};

// Get students by parent ID
export const getStudentsByParentId = async (
  parentId: number
): Promise<Student[]> => {
  const students = await prisma.student.findMany({
    where: {
      parentId,
      status: StudentStatus.ACTIVE, // Only show active students to parents
    },
    include: {
      parent: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,
          email: true,
          phone: true,
        },
      },
      course: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return students;
};

// Get enrollment statistics
export const getEnrollmentStats = async (): Promise<{
  totalStudents: number;
  activeStudents: number;
  graduatedStudents: number;
  inactiveStudents: number;
  pendingLinks: number;
  byYearEnrolled: { yearEnrolled: string; count: number }[];
}> => {
  const [
    totalStudents,
    activeStudents,
    graduatedStudents,
    inactiveStudents,
    pendingLinks,
    byYearEnrolled,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.student.count({ where: { status: StudentStatus.ACTIVE } }),
    prisma.student.count({ where: { status: StudentStatus.GRADUATED } }),
    prisma.student.count({ where: { status: StudentStatus.INACTIVE } }),
    prisma.student.count({ where: { linkStatus: LinkStatus.PENDING } }),
    prisma.student.groupBy({
      by: ["yearEnrolled"],
      _count: { yearEnrolled: true },
    }),
  ]);

  return {
    totalStudents,
    activeStudents,
    graduatedStudents,
    inactiveStudents,
    pendingLinks,
    byYearEnrolled: byYearEnrolled.map((item) => ({
      yearEnrolled: item.yearEnrolled,
      count: item._count.yearEnrolled,
    })),
  };
};

// Request to link a student to a parent account
export const requestLinkStudent = async (
  studentId: string,
  parentId: number,
  relationship?: string
): Promise<Student> => {
  // Verify parent exists
  const parent = await prisma.user.findUnique({
    where: { id: parentId },
  });

  if (!parent) {
    throw new ApiError(404, "Parent account not found");
  }

  if (parent.role !== "PARENT_GUARDIAN") {
    throw new ApiError(400, "Only parent accounts can link students");
  }

  // Find student by student ID
  const student = await prisma.student.findUnique({
    where: { studentId },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  // Check if student is already linked to this parent
  if (
    student.parentId === parentId &&
    student.linkStatus === LinkStatus.APPROVED
  ) {
    throw new ApiError(400, "Student is already linked to your account");
  }

  // Check if student is already linked to another parent
  if (
    student.linkStatus === LinkStatus.APPROVED &&
    student.parentId !== parentId
  ) {
    throw new ApiError(
      400,
      "Student is already linked to another parent. A student can only have one parent account."
    );
  }

  // Check if there's already a pending request from this parent
  if (
    student.parentId === parentId &&
    student.linkStatus === LinkStatus.PENDING
  ) {
    throw new ApiError(400, "Link request is already pending approval");
  }

  // Update student with new parent ID, relationship, and set status to PENDING
  const updatedStudent = await prisma.student.update({
    where: { id: student.id },
    data: {
      parentId,
      linkStatus: LinkStatus.PENDING,
      relationship: relationship || "PARENT", // Default to PARENT if not provided
    },
    include: {
      parent: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,
          email: true,
          phone: true,
        },
      },
      course: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
  });

  return updatedStudent;
};

// Unlink a student from parent (by parent or admin)
export const unlinkStudent = async (
  studentId: number,
  requestingUserId: number,
  requestingUserRole: string
): Promise<{ message: string }> => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      parent: true,
    },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  // Check if student is linked
  if (student.linkStatus !== LinkStatus.APPROVED) {
    throw new ApiError(400, "Student is not currently linked to any parent");
  }

  // Only the linked parent or admin can unlink
  if (
    requestingUserRole !== "CLINIC_ADMIN" &&
    student.parentId !== requestingUserId
  ) {
    throw new ApiError(403, "You can only unlink your own students");
  }

  // Instead of marking as REJECTED, reset link status to PENDING so the
  // student appears in the pending list again (keeps parentId for the
  // record of who requested the link). This allows re-approval if desired.
  await prisma.student.update({
    where: { id: studentId },
    data: {
      linkStatus: LinkStatus.PENDING,
    },
  });

  return { message: "Student unlinked successfully" };
};

// Get pending link requests for a specific parent
export const getPendingLinksByParentId = async (
  parentId: number
): Promise<Student[]> => {
  const students = await prisma.student.findMany({
    where: {
      parentId,
      linkStatus: LinkStatus.PENDING,
    },
    include: {
      parent: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,
          email: true,
          phone: true,
        },
      },
      course: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return students;
};

// Get all link requests (PENDING and REJECTED) for a specific parent
export const getAllLinkRequestsByParentId = async (
  parentId: number
): Promise<Student[]> => {
  const students = await prisma.student.findMany({
    where: {
      parentId,
      linkStatus: {
        in: [LinkStatus.PENDING, LinkStatus.REJECTED],
      },
    },
    include: {
      parent: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,
          email: true,
          phone: true,
        },
      },
      course: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }], // Most recent first
  });

  return students;
};

// Get approved (linked) students for a specific parent
export const getApprovedStudentsByParentId = async (
  parentId: number
): Promise<Student[]> => {
  const students = await prisma.student.findMany({
    where: {
      parentId,
      linkStatus: LinkStatus.APPROVED,
      status: StudentStatus.ACTIVE, // Only show active students to parents
    },
    include: {
      parent: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,
          email: true,
          phone: true,
        },
      },
      course: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return students;
};

// Clear old rejected parent links (older than 3 days)
export const clearOldRejectedLinks = async (): Promise<number> => {
  try {
    // Calculate date 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Update rejected students with parentId set to NULL if updatedAt is older than 3 days
    const result = await prisma.student.updateMany({
      where: {
        linkStatus: LinkStatus.REJECTED,
        parentId: { not: null },
        updatedAt: { lt: threeDaysAgo },
      },
      data: {
        parentId: null,
      },
    });

    return result.count;
  } catch (error) {
    console.error("Error clearing old rejected links:", error);
    throw error;
  }
};
