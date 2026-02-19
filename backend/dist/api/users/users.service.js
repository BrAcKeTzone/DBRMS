"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfilePicture = exports.getUserStats = exports.changePassword = exports.deleteUser = exports.updateUserByAdmin = exports.activateUser = exports.deactivateUser = exports.updateUserRole = exports.getAllUsers = exports.updateUserProfile = exports.getUserProfile = exports.getUserById = exports.createUser = void 0;
const prisma_1 = __importDefault(require("../../configs/prisma"));
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const cloudinary_1 = __importDefault(require("../../configs/cloudinary"));
// Helper function to exclude password from user object
const excludePassword = (user) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
// Create new user (admin only)
const createUser = async (data) => {
    const { email, password, firstName, middleName, lastName, phone, role } = data;
    // Check if email already exists
    const existingUser = await prisma_1.default.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        throw new ApiError_1.default(400, "Email already exists");
    }
    // If phone is provided, ensure it's unique
    if (phone) {
        const existingPhone = await prisma_1.default.user.findUnique({ where: { phone } });
        if (existingPhone) {
            throw new ApiError_1.default(400, "Phone number already exists");
        }
    }
    // Hash password
    const hashedPassword = await bcrypt_1.default.hash(password, 12);
    const user = await prisma_1.default.user.create({
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
exports.createUser = createUser;
// Get user by ID (admin only)
const getUserById = async (id) => {
    const user = await prisma_1.default.user.findUnique({
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
                    yearLevel: true,
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
        throw new ApiError_1.default(404, "User not found");
    }
    return excludePassword(user);
};
exports.getUserById = getUserById;
// Get current user profile (self)
const getUserProfile = async (userId) => {
    const user = await prisma_1.default.user.findUnique({
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
                    yearLevel: true,
                    status: true,
                },
            },
        },
    });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    return excludePassword(user);
};
exports.getUserProfile = getUserProfile;
// Update user profile (self)
const updateUserProfile = async (userId, data) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    // Check if email is being changed and is already taken
    if (data.email && data.email !== user.email) {
        const existingEmail = await prisma_1.default.user.findUnique({
            where: { email: data.email },
        });
        if (existingEmail) {
            throw new ApiError_1.default(400, "Email is already in use");
        }
    }
    // Check if phone number is being changed and is already taken
    if (data.phone && data.phone !== user.phone) {
        const existingPhone = await prisma_1.default.user.findUnique({
            where: { phone: data.phone },
        });
        if (existingPhone) {
            throw new ApiError_1.default(400, "Phone number is already in use");
        }
    }
    const updatedUser = await prisma_1.default.user.update({
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
exports.updateUserProfile = updateUserProfile;
// Get all users with filters (admin only)
const getAllUsers = async (filter) => {
    const { search, role, isActive, sortBy, sortOrder, dateFrom, dateTo } = filter;
    // Parse pagination parameters
    const page = typeof filter.page === "string" ? parseInt(filter.page) : filter.page || 1;
    const limit = typeof filter.limit === "string"
        ? parseInt(filter.limit)
        : filter.limit || 10;
    const skip = (page - 1) * limit;
    const whereClause = {};
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
        if (roleUpper === client_1.UserRole.CLINIC_STAFF ||
            roleUpper === client_1.UserRole.PARENT_GUARDIAN) {
            whereClause.role = roleUpper;
        }
    }
    if (typeof isActive === "boolean") {
        whereClause.isActive = isActive;
    }
    else if (typeof isActive === "string") {
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
    const orderBy = [];
    if (sortBy &&
        [
            "firstName",
            "lastName",
            "email",
            "role",
            "createdAt",
            "updatedAt",
            "isActive",
        ].includes(sortBy)) {
        orderBy.push({ [sortBy]: sortOrder || "asc" });
    }
    else {
        // Default sorting
        orderBy.push({ role: "asc" }); // Admins first
        orderBy.push({ createdAt: "desc" });
    }
    const [users, totalCount] = await Promise.all([
        prisma_1.default.user.findMany({
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
        prisma_1.default.user.count({ where: whereClause }),
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
exports.getAllUsers = getAllUsers;
// Update user role (admin only)
const updateUserRole = async (userId, newRole) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    // Check if this is the last admin
    if (user.role === client_1.UserRole.CLINIC_STAFF &&
        newRole !== client_1.UserRole.CLINIC_STAFF) {
        const adminCount = await prisma_1.default.user.count({
            where: { role: client_1.UserRole.CLINIC_STAFF },
        });
        if (adminCount <= 1) {
            throw new ApiError_1.default(400, "Cannot change role of the last staff");
        }
    }
    const updatedUser = await prisma_1.default.user.update({
        where: { id: userId },
        data: { role: newRole },
    });
    return excludePassword(updatedUser);
};
exports.updateUserRole = updateUserRole;
// Deactivate user (admin only)
const deactivateUser = async (userId) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    if (!user.isActive) {
        throw new ApiError_1.default(400, "User is already deactivated");
    }
    // Check if this is the last active staff
    if (user.role === client_1.UserRole.CLINIC_STAFF) {
        const activeAdminCount = await prisma_1.default.user.count({
            where: {
                role: client_1.UserRole.CLINIC_STAFF,
                isActive: true,
            },
        });
        if (activeAdminCount <= 1) {
            throw new ApiError_1.default(400, "Cannot deactivate the last active staff");
        }
    }
    const updatedUser = await prisma_1.default.user.update({
        where: { id: userId },
        data: { isActive: false },
    });
    return excludePassword(updatedUser);
};
exports.deactivateUser = deactivateUser;
// Activate user (admin only)
const activateUser = async (userId) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    if (user.isActive) {
        throw new ApiError_1.default(400, "User is already active");
    }
    const updatedUser = await prisma_1.default.user.update({
        where: { id: userId },
        data: { isActive: true },
    });
    return excludePassword(updatedUser);
};
exports.activateUser = activateUser;
// Update user by admin (admin only)
const updateUserByAdmin = async (userId, data) => {
    const userCheck = await prisma_1.default.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!userCheck) {
        throw new ApiError_1.default(404, "User not found");
    }
    // Check if email is being changed and is already taken
    if (data.email && data.email !== userCheck.email) {
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new ApiError_1.default(400, "Email is already in use");
        }
    }
    // Check if changing role from staff
    if (data.role &&
        userCheck.role === client_1.UserRole.CLINIC_STAFF &&
        data.role !== client_1.UserRole.CLINIC_STAFF) {
        const adminCount = await prisma_1.default.user.count({
            where: { role: client_1.UserRole.CLINIC_STAFF },
        });
        if (adminCount <= 1) {
            throw new ApiError_1.default(400, "Cannot change role of the last staff");
        }
    }
    // Check if deactivating staff
    if (data.isActive === false &&
        userCheck.role === client_1.UserRole.CLINIC_STAFF &&
        userCheck.isActive) {
        const activeAdminCount = await prisma_1.default.user.count({
            where: {
                role: client_1.UserRole.CLINIC_STAFF,
                isActive: true,
            },
        });
        if (activeAdminCount <= 1) {
            throw new ApiError_1.default(400, "Cannot deactivate the last active staff");
        }
    }
    // Filter data to only include allowed fields
    const updateData = {};
    if (data.firstName !== undefined)
        updateData.firstName = data.firstName;
    if (data.middleName !== undefined)
        updateData.middleName = data.middleName;
    if (data.lastName !== undefined)
        updateData.lastName = data.lastName;
    if (data.email !== undefined)
        updateData.email = data.email;
    if (data.phone !== undefined)
        updateData.phone = data.phone;
    if (data.role !== undefined)
        updateData.role = data.role;
    if (data.isActive !== undefined)
        updateData.isActive = data.isActive;
    const updatedUser = await prisma_1.default.user.update({
        where: { id: userId },
        data: updateData,
    });
    return excludePassword(updatedUser);
};
exports.updateUserByAdmin = updateUserByAdmin;
// Delete user (admin only)
const deleteUser = async (userId) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    // Check if this is the last staff
    if (user.role === client_1.UserRole.CLINIC_STAFF) {
        const adminCount = await prisma_1.default.user.count({
            where: { role: client_1.UserRole.CLINIC_STAFF },
        });
        if (adminCount <= 1) {
            throw new ApiError_1.default(400, "Cannot delete the last staff");
        }
    }
    await prisma_1.default.user.delete({
        where: { id: userId },
    });
};
exports.deleteUser = deleteUser;
// Change password (self)
const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    // Verify current password
    const isPasswordValid = await bcrypt_1.default.compare(currentPassword, user.password);
    if (!isPasswordValid) {
        throw new ApiError_1.default(401, "Current password is incorrect");
    }
    // Hash new password
    const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
    // Update password
    await prisma_1.default.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });
};
exports.changePassword = changePassword;
// Get user statistics (admin only)
const getUserStats = async () => {
    const [totalUsers, activeUsers, inactiveUsers, adminCount, parentCount, usersWithStudents, usersWithoutStudents, recentUsers,] = await Promise.all([
        prisma_1.default.user.count(),
        prisma_1.default.user.count({ where: { isActive: true } }),
        prisma_1.default.user.count({ where: { isActive: false } }),
        prisma_1.default.user.count({ where: { role: client_1.UserRole.CLINIC_STAFF } }),
        prisma_1.default.user.count({ where: { role: client_1.UserRole.PARENT_GUARDIAN } }),
        // Parents who have at least one student linked (parentId set on Student)
        prisma_1.default.user.count({
            where: {
                role: client_1.UserRole.PARENT_GUARDIAN,
                students: {
                    some: {},
                },
            },
        }),
        // Parents who have no students linked
        prisma_1.default.user.count({
            where: {
                role: client_1.UserRole.PARENT_GUARDIAN,
                students: {
                    none: {},
                },
            },
        }),
        prisma_1.default.user.count({
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
exports.getUserStats = getUserStats;
// Update user profile picture
const updateProfilePicture = async (userId, profilePictureData) => {
    // Validate user exists
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    let profilePictureUrl = profilePictureData;
    // If it's a base64 string, upload to Cloudinary
    if (profilePictureData.startsWith("data:image")) {
        try {
            const uploadResponse = await cloudinary_1.default.uploader.upload(profilePictureData, {
                folder: "clinic-record-ms/profile-picture",
                resource_type: "image",
            });
            profilePictureUrl = uploadResponse.secure_url;
        }
        catch (error) {
            console.error("Cloudinary upload error:", error);
            throw new ApiError_1.default(500, "Failed to upload profile picture to Cloudinary");
        }
    }
    // Update profile picture
    const updatedUser = await prisma_1.default.user.update({
        where: { id: userId },
        data: {
            profilePicture: profilePictureUrl,
        },
    });
    return excludePassword(updatedUser);
};
exports.updateProfilePicture = updateProfilePicture;
//# sourceMappingURL=users.service.js.map