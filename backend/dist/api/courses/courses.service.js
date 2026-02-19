"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCourse = exports.updateCourse = exports.createCourse = exports.getAllCourses = void 0;
const prisma_1 = __importDefault(require("../../configs/prisma"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const getAllCourses = async () => {
    const courses = await prisma_1.default.course.findMany({
        orderBy: { name: "asc" },
    });
    return courses;
};
exports.getAllCourses = getAllCourses;
const createCourse = async (data) => {
    // Check uniqueness
    const existing = await prisma_1.default.course.findUnique({
        where: { code: data.code },
    });
    if (existing) {
        throw new ApiError_1.default(400, "Course code already exists");
    }
    const course = await prisma_1.default.course.create({
        data: {
            code: data.code,
            name: data.name,
            description: data.description,
            createdById: data.createdById,
        },
    });
    return course;
};
exports.createCourse = createCourse;
const updateCourse = async (id, data) => {
    const course = await prisma_1.default.course.findUnique({ where: { id } });
    if (!course) {
        throw new ApiError_1.default(404, "Course not found");
    }
    // If code change, ensure unique
    if (data.code && data.code !== course.code) {
        const existing = await prisma_1.default.course.findUnique({
            where: { code: data.code },
        });
        if (existing)
            throw new ApiError_1.default(400, "Course code already exists");
    }
    const updated = await prisma_1.default.course.update({
        where: { id },
        data,
    });
    return updated;
};
exports.updateCourse = updateCourse;
const deleteCourse = async (id) => {
    const course = await prisma_1.default.course.findUnique({ where: { id } });
    if (!course)
        throw new ApiError_1.default(404, "Course not found");
    // No relational constraints for now (minimal)
    await prisma_1.default.course.delete({ where: { id } });
    return { message: "Course deleted successfully" };
};
exports.deleteCourse = deleteCourse;
//# sourceMappingURL=courses.service.js.map