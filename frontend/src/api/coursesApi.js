import { fetchClient } from "../utils/fetchClient";
import config from "../config";
import { dummyDataService } from "../services/dummyDataService";

const API_BASE = "/api/courses";

export const coursesApi = {
  getAllCourses: async () => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.getCourses();
    }
    return await fetchClient.get(API_BASE);
  },

  createCourse: async (courseData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.createCourse(courseData);
    }
    return await fetchClient.post(API_BASE, courseData);
  },

  updateCourse: async (courseId, courseData) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.updateCourse(courseId, courseData);
    }
    return await fetchClient.put(`${API_BASE}/${courseId}`, courseData);
  },

  deleteCourse: async (courseId) => {
    if (config.USE_DUMMY_DATA) {
      return await dummyDataService.deleteCourse(courseId);
    }
    return await fetchClient.delete(`${API_BASE}/${courseId}`);
  },
};
