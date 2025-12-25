import { fetchClient } from "../utils/fetchClient";

const userApi = {
  getCurrentUser: async () => {
    return fetchClient.get("/users/me");
  },

  // Get paginated users
  getAllUsers: async (options = {}) => {
    return fetchClient.get("/users", { params: options });
  },

  createUser: async (userData) => {
    return fetchClient.post("/users", userData);
  },

  updateUser: async (userId, userData) => {
    return fetchClient.put(`/users/${userId}`, userData);
  },

  deleteUser: async (userId) => {
    return fetchClient.delete(`/users/${userId}`);
  },

  getUserById: async (userId) => {
    return fetchClient.get(`/users/${userId}`);
  },

  getUserStats: async () => {
    return fetchClient.get("/users/stats");
  },

  // For now use the change-password route (self-service). Admin password reset is not implemented separately.
  updateUserPassword: async (userId, passwordData) => {
    return fetchClient.post("/users/change-password", passwordData);
  },
};

export { userApi };
export default userApi;
