import prisma from "../../configs/prisma";
import ApiError from "../../utils/ApiError";
import { Course } from "@prisma/client";

export const getAllCourses = async (): Promise<Course[]> => {
  const courses = await prisma.course.findMany({
    orderBy: { name: "asc" },
  });
  return courses;
};

export const createCourse = async (data: {
  code: string;
  name: string;
  description?: string;
  createdById: number;
}): Promise<Course> => {
  // Check uniqueness
  const existing = await prisma.course.findUnique({
    where: { code: data.code },
  });
  if (existing) {
    throw new ApiError(400, "Course code already exists");
  }

  const course = await prisma.course.create({
    data: {
      code: data.code,
      name: data.name,
      description: data.description,
      createdById: data.createdById,
    },
  });

  return course;
};

export const updateCourse = async (
  id: number,
  data: { code?: string; name?: string; description?: string }
): Promise<Course> => {
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  // If code change, ensure unique
  if (data.code && data.code !== course.code) {
    const existing = await prisma.course.findUnique({
      where: { code: data.code },
    });
    if (existing) throw new ApiError(400, "Course code already exists");
  }

  const updated = await prisma.course.update({
    where: { id },
    data,
  });
  return updated;
};

export const deleteCourse = async (
  id: number
): Promise<{ message: string }> => {
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) throw new ApiError(404, "Course not found");

  // No relational constraints for now (minimal)
  await prisma.course.delete({ where: { id } });
  return { message: "Course deleted successfully" };
};
