import usersData from "../data/users.json";

const USERS_KEY = "dmrms_users";

const storage = {
  loadUsers() {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      if (raw) return JSON.parse(raw);
      return usersData || [];
    } catch (e) {
      return usersData || [];
    }
  },
  saveUsers(users) {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (e) {}
  },
};

function normalizeUser(u) {
  const { password, ...rest } = u;
  return rest;
}

const userApi = {
  async getCurrentUser() {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No token");
      const payload = JSON.parse(atob(token.split(".")[1] || token));
      const users = storage.loadUsers();
      const user = users.find((u) => u.id === payload.id?.toString());
      if (!user) throw new Error("User not found");
      return { data: normalizeUser(user) };
    } catch (e) {
      const err = new Error("Unauthorized");
      err.response = { data: { message: "Unauthorized" } };
      throw err;
    }
  },
  async updateCurrentUser(userData) {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No token");
      const payload = JSON.parse(atob(token.split(".")[1] || token));
      const users = storage.loadUsers();
      const idx = users.findIndex((u) => u.id === payload.id?.toString());
      if (idx === -1) throw new Error("User not found");
      users[idx] = {
        ...users[idx],
        firstName: userData.firstName ?? users[idx].firstName,
        lastName: userData.lastName ?? users[idx].lastName,
        email: userData.email ?? users[idx].email,
        phone: userData.phone ?? users[idx].phone,
        updatedAt: new Date().toISOString(),
      };
      storage.saveUsers(users);
      return { data: normalizeUser(users[idx]) };
    } catch (e) {
      const err = new Error("Failed to update profile");
      err.response = { data: { message: "Failed to update profile" } };
      throw err;
    }
  },
  async checkEmailExists(email) {
    const users = storage.loadUsers();
    const exists = users.some(
      (u) => u.email?.toLowerCase() === email?.toLowerCase()
    );
    return { data: { exists } };
  },
  async getAllUsers(options = {}) {
    const users = storage.loadUsers();
    let filtered = [...users];
    if (options.role)
      filtered = filtered.filter((u) => u.role === options.role);
    if (options.search) {
      const q = options.search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          (u.firstName && u.firstName.toLowerCase().includes(q)) ||
          (u.lastName && u.lastName.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q))
      );
    }
    const page = Math.max(Number(options.page) || 1, 1);
    const limit = Math.max(Number(options.limit) || 10, 1);
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit);
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);
    return {
      data: {
        users: paged.map(normalizeUser),
        totalCount,
        totalPages,
        currentPage: page,
      },
    };
  },
  async createUser(userData) {
    const users = storage.loadUsers();
    const exists = users.some(
      (u) => u.email && u.email.toLowerCase() === userData.email.toLowerCase()
    );
    if (exists) {
      const err = new Error("Email already registered");
      err.response = { data: { message: "Email already registered" } };
      throw err;
    }
    const newUser = {
      id: (Date.now() + Math.floor(Math.random() * 1000)).toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      email: userData.email,
      phone: userData.phone || "",
      role: userData.role || "GUARDIAN",
      password: userData.password || "",
      isActive: true,
    };
    users.push(newUser);
    storage.saveUsers(users);
    return { data: normalizeUser(newUser) };
  },
  async updateUser(userId, userData) {
    const users = storage.loadUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) {
      const err = new Error("User not found");
      err.response = { data: { message: "User not found" } };
      throw err;
    }
    users[idx] = {
      ...users[idx],
      ...userData,
      updatedAt: new Date().toISOString(),
    };
    storage.saveUsers(users);
    return { data: normalizeUser(users[idx]) };
  },
  async deleteUser(userId) {
    const users = storage.loadUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) {
      const err = new Error("User not found");
      err.response = { data: { message: "User not found" } };
      throw err;
    }
    const deleted = users.splice(idx, 1);
    storage.saveUsers(users);
    return { data: normalizeUser(deleted[0]) };
  },
  async getUserById(userId) {
    const user = storage.loadUsers().find((u) => u.id === userId);
    if (!user) {
      const err = new Error("User not found");
      err.response = { data: { message: "User not found" } };
      throw err;
    }
    return { data: normalizeUser(user) };
  },
  async getUserStats() {
    const users = storage.loadUsers();
    const roles = {};
    users.forEach((u) => {
      roles[u.role] = (roles[u.role] || 0) + 1;
    });
    return { data: { totalUsers: users.length, roles } };
  },

  // OTP for Clinic Staff deletion flows (mocked via localStorage)
  async sendOtpForClinicStaffDeletion() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 1000 * 60 * 10; // 10 minutes
    try {
      localStorage.setItem(
        "clinic_staff_deletion_otp",
        JSON.stringify({ otp, expiresAt })
      );
      // In a real backend you'd send the OTP to the current user's email
      return { data: { success: true, otp } };
    } catch (e) {
      const err = new Error("Failed to send OTP");
      err.response = { data: { message: "Failed to send OTP" } };
      throw err;
    }
  },

  async verifyOtpAndDeleteClinicStaff(userId, otp) {
    const raw = localStorage.getItem("clinic_staff_deletion_otp");
    try {
      if (!raw) {
        const err = new Error("No OTP sent");
        err.response = { data: { message: "No OTP sent" } };
        throw err;
      }
      const { otp: storedOtp, expiresAt } = JSON.parse(raw);
      if (Date.now() > expiresAt) {
        const err = new Error("OTP expired");
        err.response = { data: { message: "OTP expired" } };
        throw err;
      }
      if (storedOtp !== otp) {
        const err = new Error("Invalid OTP");
        err.response = { data: { message: "Invalid OTP" } };
        throw err;
      }
      // Valid OTP - delete the user
      const deleted = await this.deleteUser(userId);
      localStorage.removeItem("clinic_staff_deletion_otp");
      return { data: deleted.data };
    } catch (e) {
      throw e;
    }
  },
  async updateUserPassword(userId, passwordData) {
    const users = storage.loadUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) {
      const err = new Error("User not found");
      err.response = { data: { message: "User not found" } };
      throw err;
    }
    if (
      passwordData.oldPassword &&
      users[idx].password !== passwordData.oldPassword
    ) {
      const err = new Error("Incorrect current password");
      err.response = { data: { message: "Incorrect current password" } };
      throw err;
    }
    users[idx].password = passwordData.newPassword;
    users[idx].updatedAt = new Date().toISOString();
    storage.saveUsers(users);
    return { data: { message: "Password updated" } };
  },
};

export default userApi;
export { userApi };
