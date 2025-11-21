import userApi from './userApi.mock';

export default userApi;
export { userApi };
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
    const exists = users.some((u) => u.email?.toLowerCase() === email?.toLowerCase());
    return { data: { exists } };
  },
  async getAllUsers(options = {}) {
    const users = storage.loadUsers();
    let filtered = [...users];
    if (options.role) filtered = filtered.filter((u) => u.role === options.role);
    if (options.search) {
      const q = options.search.toLowerCase();
      filtered = filtered.filter(
        (u) => (u.firstName && u.firstName.toLowerCase().includes(q)) ||
          (u.lastName && u.lastName.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)),
      );
    }
    const page = Math.max(Number(options.page) || 1, 1);
    const limit = Math.max(Number(options.limit) || 10, 1);
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit);
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);
    return { data: { users: paged.map(normalizeUser), totalCount, totalPages, currentPage: page } };
  },
  async createUser(userData) {
    const users = storage.loadUsers();
    const exists = users.some((u) => u.email && u.email.toLowerCase() === userData.email.toLowerCase());
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
    users[idx] = { ...users[idx], ...userData, updatedAt: new Date().toISOString() };
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
    users.forEach((u) => { roles[u.role] = (roles[u.role] || 0) + 1; });
    return { data: { totalUsers: users.length, roles } };
  },
  async updateUserPassword(userId, passwordData) {
    const users = storage.loadUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) {
      const err = new Error("User not found");
      err.response = { data: { message: "User not found" } };
      throw err;
    }
    if (passwordData.oldPassword && users[idx].password !== passwordData.oldPassword) {
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
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("No token");
    const payload = JSON.parse(atob(token.split(".")[1] || token));
    const users = storage.loadUsers();
    const user = users.find((u) => u.id === payload.id?.toString());
    if (!user) throw new Error("User not found");
    return { data: normalizeUser(user) };
  },
  async updateCurrentUser(userData) {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("No token");
    const payload = JSON.parse(atob(token.split(".")[1] || token));
    const users = storage.loadUsers();
    const idx = users.findIndex((u) => u.id === payload.id?.toString());
    if (idx === -1) throw new Error("User not found");
    users[idx] = { ...users[idx], firstName: userData.firstName ?? users[idx].firstName, lastName: userData.lastName ?? users[idx].lastName, email: userData.email ?? users[idx].email, phone: userData.phone ?? users[idx].phone, updatedAt: new Date().toISOString() };
    storage.saveUsers(users);
    return { data: normalizeUser(users[idx]) };
  },
  async checkEmailExists(email) {
    const users = storage.loadUsers();
    const exists = users.some((u) => u.email?.toLowerCase() === email?.toLowerCase());
    return { data: { exists } };
  },
  async getAllUsers(options = {}) {
    const users = storage.loadUsers();
    let filtered = [...users];
    if (options.role) filtered = filtered.filter((u) => u.role === options.role);
    if (options.search) { const q = options.search.toLowerCase(); filtered = filtered.filter((u) => (u.firstName && u.firstName.toLowerCase().includes(q)) || (u.lastName && u.lastName.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q))); }
    const page = Math.max(Number(options.page) || 1, 1);
    const limit = Math.max(Number(options.limit) || 10, 1);
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit);
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);
    return { data: { users: paged.map(normalizeUser), totalCount, totalPages, currentPage: page } };
  },
  async createUser(userData) {
    const users = storage.loadUsers();
    const exists = users.some((u) => u.email && u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) { const err = new Error("Email already registered"); err.response = { data: { message: "Email already registered" } }; throw err; }
    const newUser = { id: (Date.now() + Math.floor(Math.random() * 1000)).toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), firstName: userData.firstName || "", lastName: userData.lastName || "", email: userData.email, phone: userData.phone || "", role: userData.role || "GUARDIAN", password: userData.password || "", isActive: true };
    users.push(newUser);
    storage.saveUsers(users);
    return { data: normalizeUser(newUser) };
  },
  async updateUser(userId, userData) { const users = storage.loadUsers(); const idx = users.findIndex((u) => u.id === userId); if (idx === -1) { const err = new Error("User not found"); err.response = { data: { message: "User not found" } }; throw err; } users[idx] = { ...users[idx], ...userData, updatedAt: new Date().toISOString() }; storage.saveUsers(users); return { data: normalizeUser(users[idx]) }; },
  async deleteUser(userId) { const users = storage.loadUsers(); const idx = users.findIndex((u) => u.id === userId); if (idx === -1) { const err = new Error("User not found"); err.response = { data: { message: "User not found" } }; throw err; } const deleted = users.splice(idx, 1); storage.saveUsers(users); return { data: normalizeUser(deleted[0]) }; },
  async getUserById(userId) { const user = storage.loadUsers().find((u) => u.id === userId); if (!user) { const err = new Error("User not found"); err.response = { data: { message: "User not found" } }; throw err; } return { data: normalizeUser(user) }; },
  async getUserStats() { const users = storage.loadUsers(); const roles = {}; users.forEach((u) => { roles[u.role] = (roles[u.role] || 0) + 1; }); return { data: { totalUsers: users.length, roles } }; },
  async updateUserPassword(userId, passwordData) { const users = storage.loadUsers(); const idx = users.findIndex((u) => u.id === userId); if (idx === -1) { const err = new Error("User not found"); err.response = { data: { message: "User not found" } }; throw err; } if (passwordData.oldPassword && users[idx].password !== passwordData.oldPassword) { const err = new Error("Incorrect current password"); err.response = { data: { message: "Incorrect current password" } }; throw err; } users[idx].password = passwordData.newPassword; users[idx].updatedAt = new Date().toISOString(); storage.saveUsers(users); return { data: { message: "Password updated" } }; },
};

export default userApi;
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

const userApi = {
  async getCurrentUser() {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No token");
      const payload = JSON.parse(atob(token.split(".")[1] || token));
      const users = storage.loadUsers();
      const user = users.find((u) => u.id === payload.id?.toString());
      if (!user) throw new Error("User not found");
      const { password, ...publicUser } = user;
      return { data: publicUser };
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
      users[idx] = { ...users[idx], firstName: userData.firstName ?? users[idx].firstName, lastName: userData.lastName ?? users[idx].lastName, email: userData.email ?? users[idx].email, phone: userData.phone ?? users[idx].phone, updatedAt: new Date().toISOString() };
      storage.saveUsers(users);
      const { password, ...publicUser } = users[idx];
      return { data: publicUser };
    } catch (e) {
      const err = new Error("Failed to update profile");
      err.response = { data: { message: "Failed to update profile" } };
      throw err;
    }
  },
  async checkEmailExists(email) { const users = storage.loadUsers(); const exists = users.some((u) => u.email?.toLowerCase() === email?.toLowerCase()); return { data: { exists } }; },
  async getAllUsers(options = {}) { const users = storage.loadUsers(); let filtered = [...users]; if (options.role) filtered = filtered.filter((u) => u.role === options.role); if (options.search) { const q = options.search.toLowerCase(); filtered = filtered.filter((u) => (u.firstName && u.firstName.toLowerCase().includes(q)) || (u.lastName && u.lastName.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q))); } const page = Math.max(Number(options.page) || 1, 1); const limit = Math.max(Number(options.limit) || 10, 1); const totalCount = filtered.length; const totalPages = Math.ceil(totalCount / limit); const start = (page - 1) * limit; const paged = filtered.slice(start, start + limit); return { data: { users: paged.map((u) => { const { password, ...rest } = u; return rest; }), totalCount, totalPages, currentPage: page } }; },
  async createUser(userData) { const users = storage.loadUsers(); const exists = users.some((u) => u.email && u.email.toLowerCase() === userData.email.toLowerCase()); if (exists) { const err = new Error("Email already registered"); err.response = { data: { message: "Email already registered" } }; throw err; } const newUser = { id: (Date.now() + Math.floor(Math.random() * 1000)).toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), firstName: userData.firstName || "", lastName: userData.lastName || "", email: userData.email, phone: userData.phone || "", role: userData.role || "APPLICANT", password: userData.password || "", isActive: true }; users.push(newUser); storage.saveUsers(users); const { password, ...rest } = newUser; return { data: rest }; },
  async updateUser(userId, userData) { const users = storage.loadUsers(); const idx = users.findIndex((u) => u.id === userId); if (idx === -1) { const err = new Error("User not found"); err.response = { data: { message: "User not found" } }; throw err; } users[idx] = { ...users[idx], ...userData, updatedAt: new Date().toISOString() }; storage.saveUsers(users); const { password, ...rest } = users[idx]; return { data: rest }; },
  async deleteUser(userId) { const users = storage.loadUsers(); const idx = users.findIndex((u) => u.id === userId); if (idx === -1) { const err = new Error("User not found"); err.response = { data: { message: "User not found" } }; throw err; } const deleted = users.splice(idx, 1); storage.saveUsers(users); const { password, ...rest } = deleted[0]; return { data: rest }; },
  async getUserById(userId) { const user = storage.loadUsers().find((u) => u.id === userId); if (!user) { const err = new Error("User not found"); err.response = { data: { message: "User not found" } }; throw err; } const { password, ...rest } = user; return { data: rest }; },
  async getUserStats() { const users = storage.loadUsers(); const roles = {}; users.forEach((u) => { roles[u.role] = (roles[u.role] || 0) + 1; }); return { data: { totalUsers: users.length, roles } }; },
  async updateUserPassword(userId, passwordData) { const users = storage.loadUsers(); const idx = users.findIndex((u) => u.id === userId); if (idx === -1) { const err = new Error("User not found"); err.response = { data: { message: "User not found" } }; throw err; } if (passwordData.oldPassword && users[idx].password !== passwordData.oldPassword) { const err = new Error("Incorrect current password"); err.response = { data: { message: "Incorrect current password" } }; throw err; } users[idx].password = passwordData.newPassword; users[idx].updatedAt = new Date().toISOString(); storage.saveUsers(users); return { data: { message: "Password updated" } }; },
};

export default userApi;
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

const userApi = {
  async getCurrentUser() {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No token");
      const payload = JSON.parse(atob(token.split(".")[1] || token));
      const users = storage.loadUsers();
      const user = users.find((u) => u.id === payload.id?.toString());
      if (!user) throw new Error("User not found");
      const { password, ...publicUser } = user;
      return { data: publicUser };
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
      users[idx] = { ...users[idx], firstName: userData.firstName ?? users[idx].firstName, lastName: userData.lastName ?? users[idx].lastName, email: userData.email ?? users[idx].email, phone: userData.phone ?? users[idx].phone, updatedAt: new Date().toISOString() };
      storage.saveUsers(users);
      const { password, ...publicUser } = users[idx];
      return { data: publicUser };
    } catch (e) {
      const err = new Error("Failed to update profile");
      err.response = { data: { message: "Failed to update profile" } };
      throw err;
    }
  },
  async checkEmailExists(email) { const users = storage.loadUsers(); const exists = users.some((u) => u.email?.toLowerCase() === email?.toLowerCase()); return { data: { exists } }; },
  async getAllUsers(options = {}) {
    const users = storage.loadUsers();
    let filtered = [...users];
    if (options.role) filtered = filtered.filter((u) => u.role === options.role);
    if (options.search) { const q = options.search.toLowerCase(); filtered = filtered.filter((u) => (u.firstName && u.firstName.toLowerCase().includes(q)) || (u.lastName && u.lastName.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q))); }
    const page = Math.max(Number(options.page) || 1, 1);
    const limit = Math.max(Number(options.limit) || 10, 1);
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit);
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);
    return { data: { users: paged.map((u) => { const { password, ...rest } = u; return rest; }), totalCount, totalPages, currentPage: page } };
  },
  async createUser(userData) {
    const users = storage.loadUsers();
    const exists = users.some((u) => u.email && u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) { const err = new Error("Email already registered"); err.response = { data: { message: "Email already registered" } }; throw err; }
    const newUser = { id: (Date.now() + Math.floor(Math.random() * 1000)).toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), firstName: userData.firstName || "", lastName: userData.lastName || "", email: userData.email, phone: userData.phone || "", role: userData.role || "GUARDIAN", password: userData.password || "", isActive: true };
    users.push(newUser);
    storage.saveUsers(users);
    const { password, ...rest } = newUser;
    return { data: rest };
  },
  async updateUser(userId, userData) { const users = storage.loadUsers(); const idx = users.findIndex((u) => u.id === userId); if (idx === -1) { const err = new Error("User not found"); err.response = { data: { message: "User not found" } }; throw err; } users[idx] = { ...users[idx], ...userData, updatedAt: new Date().toISOString() }; storage.saveUsers(users); const { password, ...rest } = users[idx]; return { data: rest }; },
  async deleteUser(userId) { const users = storage.loadUsers(); const idx = users.findIndex((u) => u.id === userId); if (idx === -1) { const err = new Error("User not found"); err.response = { data: { message: "User not found" } }; throw err; } const deleted = users.splice(idx, 1); storage.saveUsers(users); const { password, ...rest } = deleted[0]; return { data: rest }; },
  async getUserById(userId) { const user = storage.loadUsers().find((u) => u.id === userId); if (!user) { const err = new Error("User not found"); err.response = { data: { message: "User not found" } }; throw err; } const { password, ...rest } = user; return { data: rest }; },
  async getUserStats() { const users = storage.loadUsers(); const roles = {}; users.forEach((u) => { roles[u.role] = (roles[u.role] || 0) + 1; }); return { data: { totalUsers: users.length, roles } }; },
  async updateUserPassword(userId, passwordData) { const users = storage.loadUsers(); const idx = users.findIndex((u) => u.id === userId); if (idx === -1) { const err = new Error("User not found"); err.response = { data: { message: "User not found" } }; throw err; } if (passwordData.oldPassword && users[idx].password !== passwordData.oldPassword) { const err = new Error("Incorrect current password"); err.response = { data: { message: "Incorrect current password" } }; throw err; } users[idx].password = passwordData.newPassword; users[idx].updatedAt = new Date().toISOString(); storage.saveUsers(users); return { data: { message: "Password updated" } }; },
};

export default userApi;
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

const userApi = {
  async getCurrentUser() {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No token");
      const payload = JSON.parse(atob(token.split(".")[1] || token));
      const users = storage.loadUsers();
      const user = users.find((u) => u.id === payload.id?.toString());
      if (!user) throw new Error("User not found");
      const { password, ...publicUser } = user;
      return { data: publicUser };
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
      users[idx] = { ...users[idx], firstName: userData.firstName ?? users[idx].firstName, lastName: userData.lastName ?? users[idx].lastName, email: userData.email ?? users[idx].email, phone: userData.phone ?? users[idx].phone, updatedAt: new Date().toISOString() };
      storage.saveUsers(users);
      const { password, ...publicUser } = users[idx];
      return { data: publicUser };
    } catch (e) {
      const err = new Error("Failed to update profile");
      err.response = { data: { message: "Failed to update profile" } };
      throw err;
    }
  },

  async checkEmailExists(email) {
    const users = storage.loadUsers();
    const exists = users.some((u) => u.email?.toLowerCase() === email?.toLowerCase());
    return { data: { exists } };
  },

  async getAllUsers(options = {}) {
    const users = storage.loadUsers();
    let filtered = [...users];
    if (options.role) filtered = filtered.filter((u) => u.role === options.role);
    if (options.search) {
      const q = options.search.toLowerCase();
      filtered = filtered.filter((u) => (u.firstName && u.firstName.toLowerCase().includes(q)) || (u.lastName && u.lastName.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q)));
    }
    const page = Math.max(Number(options.page) || 1, 1);
    const limit = Math.max(Number(options.limit) || 10, 1);
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit);
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);
    return { data: { users: paged.map((u) => { const { password, ...rest } = u; return rest; }), totalCount, totalPages, currentPage: page } };
  },

  async createUser(userData) {
    const users = storage.loadUsers();
    const exists = users.some((u) => u.email && u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) { const err = new Error("Email already registered"); err.response = { data: { message: "Email already registered" } }; throw err; }
    const newUser = { id: (Date.now() + Math.floor(Math.random() * 1000)).toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), firstName: userData.firstName || "", lastName: userData.lastName || "", email: userData.email, phone: userData.phone || "", role: userData.role || "GUARDIAN", password: userData.password || "", isActive: true };
    users.push(newUser);
    storage.saveUsers(users);
    const { password, ...rest } = newUser;
    return { data: rest };
  },

  async updateUser(userId, userData) {
    const users = storage.loadUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) { const err = new Error("User not found"); err.response = { data: { message: "User not found" } }; throw err; }
    users[idx] = { ...users[idx], ...userData, updatedAt: new Date().toISOString() };
    storage.saveUsers(users);
    const { password, ...rest } = users[idx];
    return { data: rest };
  },

  async deleteUser(userId) {
    const users = storage.loadUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) { const err = new Error("User not found"); err.response = { data: { message: "User not found" } }; throw err; }
    const deleted = users.splice(idx, 1);
    storage.saveUsers(users);
    const { password, ...rest } = deleted[0];
    return { data: rest };
  },

  async getUserById(userId) {
    const user = storage.loadUsers().find((u) => u.id === userId);
    if (!user) { const err = new Error("User not found"); err.response = { data: { message: "User not found" } }; throw err; }
    const { password, ...rest } = user;
    return { data: rest };
  },

  async getUserStats() { const users = storage.loadUsers(); const roles = {}; users.forEach((u) => { roles[u.role] = (roles[u.role] || 0) + 1; }); return { data: { totalUsers: users.length, roles } }; },

  async updateUserPassword(userId, passwordData) {
    const users = storage.loadUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) { const err = new Error("User not found"); err.response = { data: { message: "User not found" } }; throw err; }
    if (passwordData.oldPassword && users[idx].password !== passwordData.oldPassword) { const err = new Error("Incorrect current password"); err.response = { data: { message: "Incorrect current password" } }; throw err; }
    users[idx].password = passwordData.newPassword;
    users[idx].updatedAt = new Date().toISOString();
    storage.saveUsers(users);
    return { data: { message: "Password updated" } };
  },
};

export default userApi;
import usersData from "../data/users.json";

const USERS_KEY = "dmrms_users";

const _loadUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw);
    return usersData || [];
  } catch (error) {
    return usersData || [];
  }
};

const _saveUsers = (users) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    // ignore
  }
};

export const userApi = {
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No token");
      const payload = JSON.parse(atob(token));
      const user = _loadUsers().find((u) => u.id === payload.id?.toString());
      if (!user) throw new Error("User not found");
      const { password, ...publicUser } = user;
      return { data: publicUser };
    } catch (error) {
      const err = new Error("Unauthorized");
      err.response = { data: { message: "Unauthorized" } };
      throw err;
    }
  },

  updateCurrentUser: async (userData) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No token");
      const payload = JSON.parse(atob(token));
      const users = _loadUsers();
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
      _saveUsers(users);
      const { password, ...publicUser } = users[idx];
      return { data: publicUser };
    } catch (error) {
      const err = new Error("Failed to update profile");
      err.response = { data: { message: "Failed to update profile" } };
      throw err;
    }
  },

  checkEmailExists: async (email) => {
    const users = _loadUsers();
    const exists = users.some((u) => u.email?.toLowerCase() === email?.toLowerCase());
    return { data: { exists } };
  },
  getAllUsers: async (options = {}) => {
    const users = _loadUsers();
    // Simple filtering and pagination
    let filtered = [...users];
    if (options.role) filtered = filtered.filter((u) => u.role === options.role);
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
        users: paged.map((u) => {
          const { password, ...rest } = u;
          return rest;
        }),
        totalCount,
        totalPages,
        currentPage: page,
      },
    };
  },

  createUser: async (userData) => {
    const users = _loadUsers();
    const exists = users.some((u) => u.email.toLowerCase() === userData.email.toLowerCase());
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
      role: userData.role || "APPLICANT",
      password: userData.password || "",
      isActive: true,
    };
    users.push(newUser);
    _saveUsers(users);
    const { password, ...rest } = newUser;
    return { data: rest };
  },

  updateUser: async (userId, userData) => {
    const users = _loadUsers();
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
    _saveUsers(users);
    const { password, ...rest } = users[idx];
    return { data: rest };
  },

  deleteUser: async (userId) => {
    const users = _loadUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) {
      const err = new Error("User not found");
      err.response = { data: { message: "User not found" } };
      throw err;
    }
    const deleted = users.splice(idx, 1);
    _saveUsers(users);
    const { password, ...rest } = deleted[0];
    return { data: rest };
  },

  getUserById: async (userId) => {
    const user = _loadUsers().find((u) => u.id === userId);
    if (!user) {
      const err = new Error("User not found");
      err.response = { data: { message: "User not found" } };
      throw err;
    }
    const { password, ...rest } = user;
    return { data: rest };
  },

  getUserStats: async () => {
    const users = _loadUsers();
    const roles = {};
    users.forEach((u) => {
      roles[u.role] = (roles[u.role] || 0) + 1;
    });
    return { data: { totalUsers: users.length, roles } };
  },

  updateUserPassword: async (userId, passwordData) => {
    const users = _loadUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) {
      const err = new Error("User not found");
      err.response = { data: { message: "User not found" } };
      throw err;
    }
    // If oldPassword is provided, verify it
    if (passwordData.oldPassword && users[idx].password !== passwordData.oldPassword) {
      const err = new Error("Incorrect current password");
      err.response = { data: { message: "Incorrect current password" } };
      throw err;
    }
    users[idx].password = passwordData.newPassword;
    users[idx].updatedAt = new Date().toISOString();
    _saveUsers(users);
    return { data: { message: "Password updated" } };
  },
};

export default userApi;
import { fetchClient } from "../utils/fetchClient";

const API_BASE = "/api/users";

export const userApi = {
  // Get current user profile
  getCurrentUser: async () => {
    const response = await fetchClient.get(`${API_BASE}/me`);
    return response.data;
  },

  // Update current user profile
  updateCurrentUser: async (userData) => {
    const response = await fetchClient.put(`${API_BASE}/me`, userData);
    return response.data;
  },

  // Get all users with pagination and filtering
  getAllUsers: async (options = {}) => {
    const params = new URLSearchParams();

    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.role) params.append("role", options.role);
    if (options.search) params.append("search", options.search);
    if (options.sortBy) params.append("sortBy", options.sortBy);
    if (options.sortOrder) params.append("sortOrder", options.sortOrder);

    const queryString = params.toString();
    const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;

    const response = await fetchClient.get(url);
    return response.data;
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await fetchClient.get(`${API_BASE}/stats`);
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await fetchClient.get(`${API_BASE}/${userId}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData) => {
    const response = await fetchClient.post(API_BASE, userData);
    return response.data;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await fetchClient.put(`${API_BASE}/${userId}`, userData);
    return response.data;
  },

  // Update user password
  updateUserPassword: async (userId, passwordData) => {
    const response = await fetchClient.put(
      `${API_BASE}/${userId}/password`,
      passwordData
    );
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await fetchClient.delete(`${API_BASE}/${userId}`);
    return response.data;
  },

  // Send OTP for Clinic Staff deletion
  sendOtpForClinicStaffDeletion: async () => {
    const response = await fetchClient.post(
      `${API_BASE}/clinic-staff-deletion/send-otp`,
      {}
    );
    return response.data;
  },

  // Verify OTP and delete Clinic Staff user
  verifyOtpAndDeleteClinicStaff: async (userId, otp) => {
    const response = await fetchClient.post(
      `${API_BASE}/${userId}/verify-and-delete-clinic-staff`,
      { otp }
    );
    return response.data;
  },

  // Check if email exists
  checkEmailExists: async (email) => {
    const response = await fetchClient.get(
      `${API_BASE}/check-email?email=${encodeURIComponent(email)}`
    );
    return response.data;
  },
};

export default userApi;
