// Minimal stub user API for development
// Provides both named and default exports to match various import styles
const userApi = {
  getCurrentUser: async () => {
    const userStr = localStorage.getItem("user");
    const user = userStr
      ? JSON.parse(userStr)
      : { id: 1, firstName: "Demo", lastName: "User", role: "HR" };
    return Promise.resolve({ data: user });
  },

  // Return an empty paginated users response for list endpoints
  getAllUsers: async (options = {}) => {
    return Promise.resolve({
      data: {
        users: [],
        totalPages: 0,
        currentPage: options.page || 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });
  },

  createUser: async (userData) => {
    // For demo, echo back the created user with a fake id
    const user = { id: String(Date.now()), ...userData };
    return Promise.resolve({ data: user });
  },

  updateUser: async (userId, userData) => {
    // For demo, return the updated user
    const user = { id: userId, ...userData };
    return Promise.resolve({ data: user });
  },

  deleteUser: async (userId) => {
    return Promise.resolve({ data: { success: true } });
  },

  getUserById: async (userId) => {
    // Return a small demo user or null
    const demoUser = {
      id: userId,
      firstName: "Demo",
      lastName: "User",
      role: "PARENT_GUARDIAN",
    };
    return Promise.resolve({ data: demoUser });
  },

  getUserStats: async () => {
    return Promise.resolve({ data: { total: 0 } });
  },

  updateUserPassword: async (userId, passwordData) => {
    return Promise.resolve({ data: { success: true } });
  },
};

export { userApi };
export default userApi;
