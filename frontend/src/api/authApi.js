// Minimal stub API for development
export const authApi = {
  login: async ({ email, password }) => {
    // For local dev, accept any credentials and return a demo user
    const demoUser = {
      id: 1,
      email,
      firstName: "Demo",
      lastName: "User",
      role: "HR",
    };
    const token = "demo-token";
    return Promise.resolve({ data: { user: demoUser, token } });
  },
  register: async (userData) => {
    // Accept registration and return success
    return Promise.resolve({ data: { success: true } });
  },
  sendOtp: async (email) => {
    return Promise.resolve({ data: { success: true } });
  },
  verifyOtp: async (email, otp) => {
    return Promise.resolve({ data: { success: true } });
  },
  sendOtpForReset: async (email) => {
    return Promise.resolve({ data: { success: true } });
  },
  verifyOtpForReset: async (email, otp) => {
    return Promise.resolve({ data: { success: true } });
  },
  resetPassword: async (email, otp, newPassword) => {
    return Promise.resolve({ data: { success: true } });
  },
  verifyToken: async (token) => {
    // In demo, treat any token as valid
    return Promise.resolve({ data: { valid: true } });
  },
};
