import { fetchClient } from "../utils/fetchClient";

const API_BASE = "/courses";

export const coursesApi = {
  getAllCourses: async () => {
    return await fetchClient.get(API_BASE);
  },

  createCourse: async (courseData) => {
    return await fetchClient.post(API_BASE, courseData);
  },

  updateCourse: async (courseId, courseData) => {
    return await fetchClient.put(`${API_BASE}/${courseId}`, courseData);
  },

  deleteCourse: async (courseId) => {
    return await fetchClient.delete(`${API_BASE}/${courseId}`);
  },
};
