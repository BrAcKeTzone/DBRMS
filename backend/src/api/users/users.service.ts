import prisma from "../../configs/prisma";
import { User, UserRole } from "@prisma/client";
import ApiError from "../../utils/ApiError";
import bcrypt from "bcrypt";
import cloudinary from "../../configs/cloudinary";

interface CreateUserData {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
}

interface UpdateUserProfileData {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

interface UpdateUserByAdminData {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}

interface GetUsersFilter {
  search?: string;
  role?: UserRole | string;
  isActive?: boolean | string;
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
}

interface UserSafeData {
  id: number;
  email: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  phone: string | null;
  profilePicture: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to exclude password from user object
const excludePassword = (user: any): UserSafeData => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Create new user (admin only)
export const createUser = async (
  data: CreateUserData
): Promise<UserSafeData> => {
  const { email, password, firstName, middleName, lastName, phone, role } =
    data;

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(400, "Email already exists");
  }

  // If phone is provided, ensure it's unique
  if (phone) {
    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      throw new ApiError(400, "Phone number already exists");
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      middleName: middleName || null,
      lastName,
      phone: phone || "",
      role,
      isActive: true,
    },
  });

  return excludePassword(user);
};

// Get user by ID (admin only)
export const getUserById = async (id: number): Promise<UserSafeData> => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      students: {
        select: {
          id: true,
          studentId: true,
          firstName: true,
          lastName: true,
          middleName: true,
          birthDate: true,
          yearEnrolled: true,
          status: true,
        },
      },
      _count: {
        select: {
          students: true,
          linkRequests: true,
          approvedRequests: true,
          activityLogs: true,
          createdCourses: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return excludePassword(user);
};

// Get current user profile (self)
export const getUserProfile = async (userId: number): Promise<UserSafeData> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      students: {
        select: {
          id: true,
          studentId: true,
          firstName: true,
          lastName: true,
          middleName: true,
          birthDate: true,
          yearEnrolled: true,
          status: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return excludePassword(user);
};

// Update user profile (self)
export const updateUserProfile = async (
  userId: number,
  data: UpdateUserProfileData
): Promise<UserSafeData> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if email is being changed and is already taken
  if (data.email && data.email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ApiError(400, "Email is already in use");
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
    },
  });

  return excludePassword(updatedUser);
};

// Get all users with filters (admin only)
export const getAllUsers = async (filter: GetUsersFilter) => {
  const { search, role, isActive, sortBy, sortOrder, dateFrom, dateTo } =
    filter;

  // Parse pagination parameters
  const page =
    typeof filter.page === "string" ? parseInt(filter.page) : filter.page || 1;
  const limit =
    typeof filter.limit === "string"
      ? parseInt(filter.limit)
      : filter.limit || 10;

  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (search) {
    // For SQLite compatibility, use contains without mode
    // SQLite is case-insensitive by default for text searches
    whereClause.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ];
  }

  if (role) {
    // Validate and cast role to UserRole enum
    const roleUpper = typeof role === "string" ? role.toUpperCase() : role;
    if (
      roleUpper === UserRole.CLINIC_ADMIN ||
      roleUpper === UserRole.PARENT_GUARDIAN
    ) {
      whereClause.role = roleUpper as UserRole;
    }
  }

  if (typeof isActive === "boolean") {
    whereClause.isActive = isActive;
  } else if (typeof isActive === "string") {
    // Convert string to boolean
    whereClause.isActive = isActive === "true";
  }

  // Date range filtering
  if (dateFrom || dateTo) {
    whereClause.createdAt = {};
    if (dateFrom) {
      whereClause.createdAt.gte = new Date(dateFrom);
    }
    if (dateTo) {
      whereClause.createdAt.lte = new Date(dateTo);
    }
  }

  // Build orderBy clause
  const orderBy: any = [];

  if (
    sortBy &&
    [
      "firstName",
      "lastName",
      "email",
      "role",
      "createdAt",
      "updatedAt",
      "isActive",
    ].includes(sortBy)
  ) {
    orderBy.push({ [sortBy]: sortOrder || "asc" });
  } else {
    // Default sorting
    orderBy.push({ role: "asc" }); // Admins first
    orderBy.push({ createdAt: "desc" });
  }

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        middleName: true,
        phone: true,
        profilePicture: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            students: true,
            linkRequests: true,
            approvedRequests: true,
            activityLogs: true,
            createdCourses: true,
          },
        },
      },
    }),
    prisma.user.count({ where: whereClause }),
  ]);

  return {
    users,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    hasNextPage: page < Math.ceil(totalCount / limit),
    hasPrevPage: page > 1,
  };
};

// Update user role (admin only)
export const updateUserRole = async (
  userId: number,
  newRole: UserRole
): Promise<UserSafeData> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if this is the last admin
  if (
    user.role === UserRole.CLINIC_ADMIN &&
    newRole !== UserRole.CLINIC_ADMIN
  ) {
    const adminCount = await prisma.user.count({
      where: { role: UserRole.CLINIC_ADMIN },
    });

    if (adminCount <= 1) {
      throw new ApiError(400, "Cannot change role of the last admin");
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  return excludePassword(updatedUser);
};

// Promote user to Clinic Admin and demote existing admins to Clinic Staff
export const promoteUserToAdmin = async (
  userId: number
): Promise<{ promoted: UserSafeData; demotedIds: number[] }> => {
  const userToPromote = await prisma.user.findUnique({ where: { id: userId } });
  if (!userToPromote) {
    throw new ApiError(404, "User not found");
  }

  // Find current admin ids BEFORE transaction so we can inform clients who was demoted
  const currentAdmins = await prisma.user.findMany({
    where: { role: UserRole.CLINIC_ADMIN },
    select: { id: true },
  });
  const demotedIds = currentAdmins
    .map((a) => a.id)
    .filter((id) => id !== userId);

  // Use transaction to ensure atomicity: demote all current admins, then promote target
  await prisma.$transaction(async (tx) => {
    await tx.user.updateMany({
      where: { role: UserRole.CLINIC_ADMIN },
      data: { role: UserRole.CLINIC_STAFF },
    });

    await tx.user.update({
      where: { id: userId },
      data: { role: UserRole.CLINIC_ADMIN },
    });
  });

  // Return the promoted user (fresh) and list of demoted ids
  const promoted = await prisma.user.findUnique({ where: { id: userId } });
  if (!promoted) throw new ApiError(500, "Failed to promote user");
  return { promoted: excludePassword(promoted), demotedIds };
};

// Deactivate user (admin only)
export const deactivateUser = async (userId: number): Promise<UserSafeData> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isActive) {
    throw new ApiError(400, "User is already deactivated");
  }

  // Check if this is the last active admin
  if (user.role === UserRole.CLINIC_ADMIN) {
    const activeAdminCount = await prisma.user.count({
      where: {
        role: UserRole.CLINIC_ADMIN,
        isActive: true,
      },
    });

    if (activeAdminCount <= 1) {
      throw new ApiError(400, "Cannot deactivate the last active admin");
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });

  return excludePassword(updatedUser);
};

// Activate user (admin only)
export const activateUser = async (userId: number): Promise<UserSafeData> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isActive) {
    throw new ApiError(400, "User is already active");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive: true },
  });

  return excludePassword(updatedUser);
};

// Update user by admin (admin only)
export const updateUserByAdmin = async (
  userId: number,
  data: UpdateUserByAdminData
): Promise<UserSafeData> => {
  const userCheck = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!userCheck) {
    throw new ApiError(404, "User not found");
  }

  // Check if email is being changed and is already taken
  if (data.email && data.email !== userCheck.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ApiError(400, "Email is already in use");
    }
  }

  // Check if changing role from admin
  if (
    data.role &&
    userCheck.role === UserRole.CLINIC_ADMIN &&
    data.role !== UserRole.CLINIC_ADMIN
  ) {
    const adminCount = await prisma.user.count({
      where: { role: UserRole.CLINIC_ADMIN },
    });

    if (adminCount <= 1) {
      throw new ApiError(400, "Cannot change role of the last admin");
    }
  }

  // Check if deactivating admin
  if (
    data.isActive === false &&
    userCheck.role === UserRole.CLINIC_ADMIN &&
    userCheck.isActive
  ) {
    const activeAdminCount = await prisma.user.count({
      where: {
        role: UserRole.CLINIC_ADMIN,
        isActive: true,
      },
    });

    if (activeAdminCount <= 1) {
      throw new ApiError(400, "Cannot deactivate the last active admin");
    }
  }

  // Filter data to only include allowed fields
  const updateData: any = {};
  if (data.firstName !== undefined) updateData.firstName = data.firstName;
  if (data.middleName !== undefined) updateData.middleName = data.middleName;
  if (data.lastName !== undefined) updateData.lastName = data.lastName;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return excludePassword(updatedUser);
};

// Delete user (admin only)
export const deleteUser = async (userId: number): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if this is the last admin
  if (user.role === UserRole.CLINIC_ADMIN) {
    const adminCount = await prisma.user.count({
      where: { role: UserRole.CLINIC_ADMIN },
    });

    if (adminCount <= 1) {
      throw new ApiError(400, "Cannot delete the last admin");
    }
  }

  await prisma.user.delete({
    where: { id: userId },
  });
};

// Change password (self)
export const changePassword = async (
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};

// Get user statistics (admin only)
export const getUserStats = async () => {
  const [
    totalUsers,
    activeUsers,
    inactiveUsers,
    adminCount,
    parentCount,
    usersWithStudents,
    usersWithoutStudents,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: false } }),
    prisma.user.count({ where: { role: UserRole.CLINIC_ADMIN } }),
    prisma.user.count({ where: { role: UserRole.PARENT_GUARDIAN } }),
    // Parents who have at least one student linked (parentId set on Student)
    prisma.user.count({
      where: {
        role: UserRole.PARENT_GUARDIAN,
        students: {
          some: {},
        },
      },
    }),
    // Parents who have no students linked
    prisma.user.count({
      where: {
        role: UserRole.PARENT_GUARDIAN,
        students: {
          none: {},
        },
      },
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    }),
  ]);

  return {
    totalUsers,
    activeUsers,
    inactiveUsers,
    adminCount,
    parentCount,
    usersWithStudents,
    usersWithoutStudents,
    recentUsers,
  };
};

// Update user profile picture
export const updateProfilePicture = async (
  userId: number,
  profilePictureData: string
): Promise<UserSafeData> => {
  // Validate user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  let profilePictureUrl = profilePictureData;

  // If it's a base64 string, upload to Cloudinary
  if (profilePictureData.startsWith("data:image")) {
    try {
      const uploadResponse = await cloudinary.uploader.upload(
        profilePictureData,
        {
          folder: "clinic-record-ms/profile-picture",
          resource_type: "image",
        }
      );
      profilePictureUrl = uploadResponse.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new ApiError(500, "Failed to upload profile picture to Cloudinary");
    }
  }

  // Update profile picture
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      profilePicture: profilePictureUrl,
    },
  });

  return excludePassword(updatedUser);
};
