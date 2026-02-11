import { fetchClient } from "../utils/fetchClient";

export const authApi = {
  login: async ({ email, password }) => {
    return fetchClient.post("/auth/login", { email, password });
  },
  register: async (userData) => {
    return fetchClient.post("/auth/register", userData);
  },
  sendOtp: async (email) => {
    return fetchClient.post("/auth/send-otp", { email });
  },
  verifyOtp: async (email, otp) => {
    return fetchClient.post("/auth/verify-otp", { email, otp });
  },
  sendOtpForReset: async (email) => {
    return fetchClient.post("/auth/send-otp-reset", { email });
  },
  verifyOtpForReset: async (email, otp) => {
    return fetchClient.post("/auth/verify-otp-reset", { email, otp });
  },
  sendOtpForChange: async (email, password) => {
    return fetchClient.post("/auth/send-otp-change", { email, password });
  },
  verifyOtpForChange: async (email, otp) => {
    return fetchClient.post("/auth/verify-otp-change", { email, otp });
  },
  resetPassword: async (email, otp, newPassword) => {
    return fetchClient.post("/auth/reset-password", {
      email,
      otp,
      password: newPassword,
    });
  },
  changePassword: async (email, oldPassword, otp, newPassword) => {
    return fetchClient.post("/auth/change-password", {
      email,
      oldPassword,
      otp,
      newPassword,
    });
  },
  verifyToken: async (token) => {
    return fetchClient.post("/auth/verify-token", { token });
  },
};
