import usersData from "../data/users.json";

const USERS_KEY = "dmrms_users";
const OTPS_KEY = "dmrms_otps";

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
  loadOtps() {
    try {
      const raw = localStorage.getItem(OTPS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  },
  saveOtps(otps) {
    try {
      localStorage.setItem(OTPS_KEY, JSON.stringify(otps));
    } catch (e) {}
  },
};

function genOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function genToken(user) {
  const header = { alg: "none", typ: "JWT" };
  const payload = {
    id: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + 86400,
  };
  return (
    btoa(JSON.stringify(header)) + "." + btoa(JSON.stringify(payload)) + "."
  );
}

function findUserByEmail(email) {
  const list = storage.loadUsers();
  return list.find(
    (u) => u.email && u.email.toLowerCase() === (email || "").toLowerCase()
  );
}

const authApi = {
  async sendOtp(email) {
    const otps = storage.loadOtps();
    const otp = genOtp();
    otps[(email || "").toLowerCase()] = otp;
    storage.saveOtps(otps);
    return { data: { message: "OTP sent (mock)", otp } };
  },
  async verifyOtp(email, otp) {
    const otps = storage.loadOtps();
    const key = (email || "").toLowerCase();
    if (otps[key] === otp) {
      delete otps[key];
      storage.saveOtps(otps);
      return { data: { message: "OTP verified" } };
    }
    const err = new Error("Invalid OTP");
    err.response = { data: { message: "Invalid OTP" } };
    throw err;
  },
  async register(userData) {
    const users = storage.loadUsers();
    const exists = users.some(
      (u) =>
        u.email &&
        u.email.toLowerCase() === (userData.email || "").toLowerCase()
    );
    if (exists) {
      const err = new Error("Email already registered");
      err.response = { data: { message: "Email already registered" } };
      throw err;
    }
    const newUser = {
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      role: userData.role || "APPLICANT",
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      email: userData.email,
      phone: userData.phone || "",
      password: userData.password || "",
      isActive: true,
    };
    users.push(newUser);
    storage.saveUsers(users);
    const { password, ...publicUser } = newUser;
    return { data: { user: publicUser } };
  },
  async login(credentials) {
    const user = findUserByEmail(credentials.email);
    if (!user) {
      const err = new Error("User not found");
      err.response = { data: { message: "User not found" } };
      throw err;
    }
    if (user.password !== credentials.password) {
      const err = new Error("Invalid email or password");
      err.response = { data: { message: "Invalid email or password" } };
      throw err;
    }
    if (user.requiresOtp) {
      const otps = storage.loadOtps();
      const otp = genOtp();
      otps[user.email.toLowerCase()] = otp;
      storage.saveOtps(otps);
      return { data: { requiresOtp: true, otp } };
    }
    const token = genToken(user);
    const { password, ...publicUser } = user;
    return { data: { user: publicUser, token } };
  },
  async verifyLoginOtp(email, otp) {
    const otps = storage.loadOtps();
    const key = (email || "").toLowerCase();
    if (otps[key] !== otp) {
      const err = new Error("Invalid OTP");
      err.response = { data: { message: "Invalid OTP" } };
      throw err;
    }
    delete otps[key];
    storage.saveOtps(otps);
    const user = findUserByEmail(email);
    const token = genToken(user);
    const { password, ...publicUser } = user;
    return { data: { user: publicUser, token } };
  },
  async sendOtpForReset(email) {
    const user = findUserByEmail(email);
    if (!user) {
      const err = new Error("User not found");
      err.response = { data: { message: "User not found" } };
      throw err;
    }
    const otps = storage.loadOtps();
    const otp = genOtp();
    otps[email.toLowerCase()] = otp;
    storage.saveOtps(otps);
    return { data: { message: "OTP sent", otp } };
  },
  async verifyOtpForReset(email, otp) {
    return authApi.verifyOtp(email, otp);
  },
  async resetPassword(email, otp, password) {
    const otps = storage.loadOtps();
    const key = (email || "").toLowerCase();
    if (otps[key] !== otp) {
      const err = new Error("Invalid OTP");
      err.response = { data: { message: "Invalid OTP" } };
      throw err;
    }
    const users = storage.loadUsers();
    const idx = users.findIndex(
      (u) => u.email && u.email.toLowerCase() === key
    );
    if (idx === -1) {
      const err = new Error("User not found");
      err.response = { data: { message: "User not found" } };
      throw err;
    }
    users[idx].password = password;
    users[idx].updatedAt = new Date().toISOString();
    storage.saveUsers(users);
    delete otps[key];
    storage.saveOtps(otps);
    return { data: { message: "Password reset successful" } };
  },
  async changePassword(email, oldPassword, otp, newPassword) {
    const otps = storage.loadOtps();
    const key = (email || "").toLowerCase();
    if (otps[key] !== otp) {
      const err = new Error("Invalid OTP");
      err.response = { data: { message: "Invalid OTP" } };
      throw err;
    }
    const users = storage.loadUsers();
    const idx = users.findIndex(
      (u) => u.email && u.email.toLowerCase() === key
    );
    if (idx === -1) {
      const err = new Error("User not found");
      err.response = { data: { message: "User not found" } };
      throw err;
    }
    if (users[idx].password !== oldPassword) {
      const err = new Error("Incorrect current password");
      err.response = { data: { message: "Incorrect current password" } };
      throw err;
    }
    users[idx].password = newPassword;
    users[idx].updatedAt = new Date().toISOString();
    storage.saveUsers(users);
    delete otps[key];
    storage.saveOtps(otps);
    return { data: { message: "Password changed" } };
  },
  async getProfile() {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No token stored");
      const payload = JSON.parse(atob(token.split(".")[1] || token));
      const users = storage.loadUsers();
      const user = users.find((u) => u.id === payload.id?.toString());
      if (!user) throw new Error("User not found");
      const { password, ...pu } = user;
      return { data: pu };
    } catch (e) {
      const err = new Error("Unauthorized");
      err.response = { data: { message: "Unauthorized" } };
      throw err;
    }
  },
  async updateProfile(profileData) {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No token stored");
      const payload = JSON.parse(atob(token.split(".")[1] || token));
      const users = storage.loadUsers();
      const idx = users.findIndex((u) => u.id === payload.id?.toString());
      if (idx === -1) throw new Error("User not found");
      users[idx] = {
        ...users[idx],
        firstName: profileData.firstName || users[idx].firstName,
        lastName: profileData.lastName || users[idx].lastName,
        email: profileData.email || users[idx].email,
        phone: profileData.phone || users[idx].phone,
        updatedAt: new Date().toISOString(),
      };
      storage.saveUsers(users);
      const { password, ...pu } = users[idx];
      return { data: pu };
    } catch (e) {
      const err = new Error("Failed to update profile");
      err.response = { data: { message: "Failed to update profile" } };
      throw err;
    }
  },
};

export default authApi;
