import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import ApiError from "../../utils/ApiError";
import * as courseService from "./courses.service";

export const getAllCourses = asyncHandler(
  async (req: Request, res: Response) => {
    const courses = await courseService.getAllCourses();
    res
      .status(200)
      .json(new ApiResponse(200, courses, "Courses retrieved successfully"));
  }
);

export const createCourse = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "User not authenticated");

    const data = req.body;
    const course = await courseService.createCourse({
      ...data,
      createdById: userId,
    });
    res
      .status(201)
      .json(new ApiResponse(201, course, "Course created successfully"));
  }
);

export const updateCourse = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const courseId = parseInt(id, 10);
    if (isNaN(courseId)) throw new ApiError(400, "Invalid course ID");

    const course = await courseService.updateCourse(courseId, req.body);
    res
      .status(200)
      .json(new ApiResponse(200, course, "Course updated successfully"));
  }
);

export const deleteCourse = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const courseId = parseInt(id, 10);
    if (isNaN(courseId)) throw new ApiError(400, "Invalid course ID");

    const result = await courseService.deleteCourse(courseId);
    res
      .status(200)
      .json(new ApiResponse(200, result, "Course deleted successfully"));
  }
);
