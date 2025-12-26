import { fetchClient } from "../utils/fetchClient";

const userApi = {
  getCurrentUser: async () => {
    return fetchClient.get("/users/me");
  },

  updateCurrentUser: async (userData) => {
    const res = await fetchClient.put("/users/me", userData);
    return { data: res.data.data };
  },

  uploadProfilePicture: async (base64Image) => {
    const res = await fetchClient.post("/users/profile-picture", {
      image: base64Image,
    });
    return { data: res.data.data };
  },

  // Get paginated users
  getAllUsers: async (options = {}) => {
    const res = await fetchClient.get("/users", { params: options });
    // Unwrap ApiResponse -> res.data.data
    return { data: res.data.data };
  },

  createUser: async (userData) => {
    const res = await fetchClient.post("/users", userData);
    return { data: res.data.data };
  },

  updateUser: async (userId, userData) => {
    const res = await fetchClient.put(`/users/${userId}`, userData);
    return { data: res.data.data };
  },

  deleteUser: async (userId) => {
    const res = await fetchClient.delete(`/users/${userId}`);
    return { data: res.data.data };
  },

  getUserById: async (userId) => {
    const res = await fetchClient.get(`/users/${userId}`);
    return { data: res.data.data };
  },

  getUserStats: async () => {
    const res = await fetchClient.get("/users/stats");
    return { data: res.data.data };
  },

  // For now use the change-password route (self-service). Admin password reset is not implemented separately.
  updateUserPassword: async (userId, passwordData) => {
    return fetchClient.post("/users/change-password", passwordData);
  },

  // Promote user to Clinic Admin (demotes existing admins)
  promoteToAdmin: async (userId) => {
    const res = await fetchClient.patch(`/users/${userId}/promote`);
    return { data: res.data.data };
  },
};

export { userApi };
export default userApi;
