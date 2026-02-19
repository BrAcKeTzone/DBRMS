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
exports.deleteCourse = exports.updateCourse = exports.createCourse = exports.getAllCourses = void 0;
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiResponse_1 = __importDefault(require("../../utils/ApiResponse"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const courseService = __importStar(require("./courses.service"));
exports.getAllCourses = (0, asyncHandler_1.default)(async (req, res) => {
    const courses = await courseService.getAllCourses();
    res
        .status(200)
        .json(new ApiResponse_1.default(200, courses, "Courses retrieved successfully"));
});
exports.createCourse = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new ApiError_1.default(401, "User not authenticated");
    const data = req.body;
    const course = await courseService.createCourse({
        ...data,
        createdById: userId,
    });
    res
        .status(201)
        .json(new ApiResponse_1.default(201, course, "Course created successfully"));
});
exports.updateCourse = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const courseId = parseInt(id, 10);
    if (isNaN(courseId))
        throw new ApiError_1.default(400, "Invalid course ID");
    const course = await courseService.updateCourse(courseId, req.body);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, course, "Course updated successfully"));
});
exports.deleteCourse = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const courseId = parseInt(id, 10);
    if (isNaN(courseId))
        throw new ApiError_1.default(400, "Invalid course ID");
    const result = await courseService.deleteCourse(courseId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Course deleted successfully"));
});
//# sourceMappingURL=courses.controller.js.map