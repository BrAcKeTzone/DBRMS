// Minimal stub user API for development
export const userApi = {
  getCurrentUser: async () => {
    const userStr = localStorage.getItem("user");
    const user = userStr
      ? JSON.parse(userStr)
      : { id: 1, firstName: "Demo", lastName: "User", role: "HR" };
    return Promise.resolve({ data: user });
  },
};
