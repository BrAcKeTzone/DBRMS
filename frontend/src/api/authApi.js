import { fetchClient } from "../utils/fetchClient";

export const authApi = {
  login: async ({ email, password }) => {
    return fetchClient.post("/auth/login", { email, password });
  },
  loginByPhone: async ({ phone, password }) => {
    return fetchClient.post("/auth/login-phone", { phone, password });
  },
  register: async (userData) => {
    return fetchClient.post("/auth/register", userData);
  },
  sendOtp: async (email) => {
    return fetchClient.post("/auth/send-otp", { email });
  },
  sendOtpByPhone: async (phone) => {
    return fetchClient.post("/auth/send-otp-phone", { phone });
  },
  verifyOtp: async (email, otp) => {
    return fetchClient.post("/auth/verify-otp", { email, otp });
  },
  verifyOtpByPhone: async (phone, otp) => {
    return fetchClient.post("/auth/verify-otp-phone", { phone, otp });
  },
  sendOtpForReset: async (phone) => {
    return fetchClient.post("/auth/send-otp-reset", { phone });
  },
  verifyOtpForReset: async (phone, otp) => {
    return fetchClient.post("/auth/verify-otp-reset", { phone, otp });
  },
  sendOtpForChange: async (phone, password) => {
    return fetchClient.post("/auth/send-otp-change", { phone, password });
  },
  verifyOtpForChange: async (phone, otp) => {
    return fetchClient.post("/auth/verify-otp-change", { phone, otp });
  },
  resetPassword: async (phone, otp, newPassword) => {
    return fetchClient.post("/auth/reset-password", {
      phone,
      otp,
      password: newPassword,
    });
  },
  changePassword: async (phone, oldPassword, otp, newPassword) => {
    return fetchClient.post("/auth/change-password", {
      phone,
      oldPassword,
      otp,
      newPassword,
    });
  },
  verifyToken: async (token) => {
    return fetchClient.post("/auth/verify-token", { token });
  },
};
