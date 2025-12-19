import { create } from "zustand";
import { persist } from "zustand/middleware";
import usersData from "../data/users.json";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Signup phase state
      signupPhase: 1, // 1: Email, 2: OTP, 3: Personal Details, 4: Success
      signupData: {
        email: "",
        otp: "",
        firstName: "",
        middleName: "",
        lastName: "",
        password: "",
        confirmPassword: "",
      },
      generatedOtp: null,

      // Forgot password phase state
      forgotPasswordPhase: 1, // 1: Email, 2: OTP, 3: New Password, 4: Success
      forgotPasswordData: {
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
      },
      forgotPasswordOtp: null,
      changePasswordOtp: null,

      // Actions
      login: async (credentials) => {
        try {
          set({ loading: true, error: null });

          const { email, password } = credentials;
          const users = get().users || usersData;
          const user = users.find((u) => u.email === email);

          if (!user || user.password !== password) {
            const errMsg = "Invalid email or password";
            set({ loading: false, error: errMsg });
            throw new Error(errMsg);
          }

          const token = `demo-token-${user.id}`;

          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          try {
            localStorage.setItem("authToken", token);
            localStorage.setItem("user", JSON.stringify(user));
            // persist users list for the demo
            localStorage.setItem("users", JSON.stringify(users));
          } catch (e) {
            // ignore localStorage failures in some environments
          }

          return { user, token };
        } catch (error) {
          if (!error.message) {
            set({ loading: false, error: "Login failed" });
          }
          throw error;
        }
      },

      register: async (userData) => {
        try {
          set({ loading: true, error: null });

          const users = get().users ? [...get().users] : [...usersData];
          const exists = users.find((u) => u.email === userData.email);
          if (exists) {
            const errMsg = "Email already registered";
            set({ loading: false, error: errMsg });
            throw new Error(errMsg);
          }

          const id = users.reduce((maxId, u) => Math.max(maxId, u.id), 0) + 1;
          const newUser = {
            id,
            email: userData.email,
            password: userData.password,
            firstName: userData.firstName || "",
            middleName: userData.middleName || "",
            lastName: userData.lastName || "",
            role: userData.role || "PARENT_GUARDIAN",
            isActive: true,
          };

          users.push(newUser);
          set({ users, loading: false, error: null });

          try {
            localStorage.setItem("users", JSON.stringify(users));
          } catch (e) {}

          return newUser;
        } catch (error) {
          set({
            loading: false,
            error: error.message || "Registration failed",
          });
          throw error;
        }
      },

      // Phase 1: Send OTP to email (demo)
      sendOtp: async (email) => {
        try {
          set({ loading: true, error: null });

          const otp = Math.floor(100000 + Math.random() * 900000).toString();

          set({
            loading: false,
            error: null,
            signupPhase: 2,
            signupData: { ...get().signupData, email },
            generatedOtp: otp,
          });

          return { otp };
        } catch (error) {
          set({ loading: false, error: "Failed to send OTP" });
          throw error;
        }
      },

      // Phase 2: Verify OTP (demo)
      verifyOtp: async (otp) => {
        try {
          set({ loading: true, error: null });

          const { signupData, generatedOtp } = get();

          if (!generatedOtp || otp !== generatedOtp) {
            const errMsg = "Invalid OTP";
            set({ loading: false, error: errMsg });
            throw new Error(errMsg);
          }

          set({
            loading: false,
            error: null,
            signupPhase: 3,
            signupData: { ...signupData, otp },
          });

          return { success: true };
        } catch (error) {
          set({
            loading: false,
            error: error.message || "OTP verification failed",
          });
          throw error;
        }
      },

      // Phase 3: Complete registration (demo)
      completeRegistration: async (personalData) => {
        try {
          set({ loading: true, error: null });

          const { signupData } = get();
          const users = get().users ? [...get().users] : [...usersData];

          const exists = users.find((u) => u.email === signupData.email);
          if (exists) {
            const errMsg = "Email already registered";
            set({ loading: false, error: errMsg });
            throw new Error(errMsg);
          }

          const id = users.reduce((maxId, u) => Math.max(maxId, u.id), 0) + 1;
          const newUser = {
            id,
            email: signupData.email,
            password: personalData.password,
            firstName: personalData.firstName || "",
            middleName: personalData.middleName || "",
            lastName: personalData.lastName || "",
            role: personalData.role || "PARENT_GUARDIAN",
            isActive: true,
          };

          users.push(newUser);

          set({
            users,
            loading: false,
            error: null,
            signupPhase: 4,
            signupData: { ...signupData, ...personalData },
          });

          try {
            localStorage.setItem("users", JSON.stringify(users));
          } catch (e) {}

          return newUser;
        } catch (error) {
          set({
            loading: false,
            error: error.message || "Registration failed",
          });
          throw error;
        }
      },

      // Reset signup process
      resetSignup: () => {
        set({
          signupPhase: 1,
          signupData: {
            email: "",
            otp: "",
            firstName: "",
            middleName: "",
            lastName: "",
            password: "",
            confirmPassword: "",
          },
          generatedOtp: null,
          error: null,
        });
      },

      // Forgot Password Functions
      // Phase 1: Send OTP for password reset (demo)
      sendPasswordResetOtp: async (email) => {
        try {
          set({ loading: true, error: null });

          const users = get().users || usersData;
          const user = users.find((u) => u.email === email);
          if (!user) {
            const errMsg = "No account found for this email";
            set({ loading: false, error: errMsg });
            throw new Error(errMsg);
          }

          const otp = Math.floor(100000 + Math.random() * 900000).toString();

          set({
            loading: false,
            error: null,
            forgotPasswordPhase: 2,
            forgotPasswordData: { ...get().forgotPasswordData, email },
            forgotPasswordOtp: otp,
          });

          return { otp };
        } catch (error) {
          set({
            loading: false,
            error: error.message || "Failed to send password reset OTP",
          });
          throw error;
        }
      },

      // Phase 2: Verify OTP for password reset (demo)
      verifyPasswordResetOtp: async (otp) => {
        try {
          set({ loading: true, error: null });

          const { forgotPasswordOtp, forgotPasswordData } = get();

          if (!forgotPasswordOtp || otp !== forgotPasswordOtp) {
            const errMsg = "Invalid OTP";
            set({ loading: false, error: errMsg });
            throw new Error(errMsg);
          }

          set({
            loading: false,
            error: null,
            forgotPasswordPhase: 3,
            forgotPasswordData: { ...forgotPasswordData, otp },
          });

          return { success: true };
        } catch (error) {
          set({
            loading: false,
            error: error.message || "OTP verification failed",
          });
          throw error;
        }
      },

      // Phase 3: Reset password (demo)
      resetPassword: async (passwordData) => {
        try {
          set({ loading: true, error: null });

          const { forgotPasswordData } = get();
          const users = get().users ? [...get().users] : [...usersData];

          const idx = users.findIndex(
            (u) => u.email === forgotPasswordData.email
          );
          if (idx === -1) {
            const errMsg = "No account found";
            set({ loading: false, error: errMsg });
            throw new Error(errMsg);
          }

          users[idx] = { ...users[idx], password: passwordData.newPassword };

          set({
            users,
            loading: false,
            error: null,
            forgotPasswordPhase: 4,
            forgotPasswordData: { ...forgotPasswordData, ...passwordData },
          });

          try {
            localStorage.setItem("users", JSON.stringify(users));
          } catch (e) {}

          return { success: true };
        } catch (error) {
          set({
            loading: false,
            error: error.message || "Password reset failed",
          });
          throw error;
        }
      },

      // Reset forgot password process
      resetForgotPassword: () => {
        set({
          forgotPasswordPhase: 1,
          forgotPasswordData: {
            email: "",
            otp: "",
            newPassword: "",
            confirmPassword: "",
          },
          forgotPasswordOtp: null,
          error: null,
        });
      },

      logout: async () => {
        try {
          // Note: Backend doesn't have logout endpoint, so we just clear local state
          // In a real JWT implementation, you might want to blacklist the token
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          });
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
        }
      },

      getProfile: async () => {
        try {
          set({ loading: true, error: null });

          // Get latest user data from the backend
          const { userApi } = await import("../api/userApi");
          const response = await userApi.getCurrentUser();

          // Update local user state with fresh data from backend
          const updatedUser = response.data;

          set({
            user: updatedUser,
            loading: false,
            error: null,
          });

          return { user: updatedUser };
        } catch (error) {
          set({
            loading: false,
            error: error.message || "Failed to fetch profile",
          });
          throw error;
        }
      },

      updateProfile: async (profileData) => {
        try {
          set({ loading: true, error: null });

          // Import userApi dynamically to avoid circular imports
          const { userApi } = await import("../api/userApi");

          // Call the backend API to update the current user
          const response = await userApi.updateCurrentUser({
            firstName: profileData.firstName,
            middleName: profileData.middleName,
            lastName: profileData.lastName,
            email: profileData.email,
          });

          // Update the local user state with the response from backend
          const updatedUser = response.data;

          set({
            user: updatedUser,
            loading: false,
            error: null,
          });

          return {
            user: updatedUser,
            message: "Profile updated successfully!",
          };
        } catch (error) {
          const errorMessage =
            error?.response?.data?.message ||
            error.message ||
            "Failed to update profile";
          set({
            loading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Upload profile picture and update user in store
      uploadProfilePicture: async (profilePictureData) => {
        try {
          set({ loading: true, error: null });

          const { user } = get();
          if (!user) {
            throw new Error("No user logged in");
          }

          const { userApi } = await import("../api/userApi");
          const response = await userApi.uploadProfilePicture(
            profilePictureData
          );

          const updatedUser = response.data;

          set({
            user: updatedUser,
            loading: false,
            error: null,
          });

          try {
            localStorage.setItem("user", JSON.stringify(updatedUser));
          } catch (err) {
            // ignore localStorage errors
          }

          return { user: updatedUser };
        } catch (error) {
          const errorMessage =
            error?.response?.data?.message ||
            error.message ||
            "Failed to upload profile picture";
          set({ loading: false, error: errorMessage });
          throw error;
        }
      },

      // Send OTP for password change (demo)
      sendOtpForPasswordChange: async (currentPassword) => {
        try {
          set({ loading: true, error: null });

          const { user } = get();
          if (!user) {
            throw new Error("No user logged in");
          }

          // Verify current password against stored users
          const users = get().users || usersData;
          const account = users.find((u) => u.email === user.email);
          if (!account || account.password !== currentPassword) {
            const errMsg = "Current password is incorrect";
            set({ loading: false, error: errMsg });
            throw new Error(errMsg);
          }

          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          set({ loading: false, error: null, changePasswordOtp: otp });

          return { otp };
        } catch (error) {
          set({
            loading: false,
            error: error.message || "Failed to send OTP for password change",
          });
          throw error;
        }
      },

      // Password change with OTP verification (demo)
      changePasswordWithOtp: async (currentPassword, newPassword, otp) => {
        try {
          set({ loading: true, error: null });

          const { user, changePasswordOtp } = get();
          if (!user) {
            throw new Error("No user logged in");
          }

          if (!changePasswordOtp || otp !== changePasswordOtp) {
            const errMsg = "Invalid OTP";
            set({ loading: false, error: errMsg });
            throw new Error(errMsg);
          }

          const users = get().users ? [...get().users] : [...usersData];
          const idx = users.findIndex((u) => u.email === user.email);
          if (idx === -1) {
            const errMsg = "User not found";
            set({ loading: false, error: errMsg });
            throw new Error(errMsg);
          }

          if (users[idx].password !== currentPassword) {
            const errMsg = "Current password is incorrect";
            set({ loading: false, error: errMsg });
            throw new Error(errMsg);
          }

          users[idx] = { ...users[idx], password: newPassword };

          set({
            users,
            changePasswordOtp: null,
            user: { ...users[idx] },
            loading: false,
            error: null,
          });

          try {
            localStorage.setItem("users", JSON.stringify(users));
            localStorage.setItem("user", JSON.stringify(users[idx]));
          } catch (e) {}

          return { success: true };
        } catch (error) {
          set({
            loading: false,
            error: error.message || "Failed to change password",
          });
          throw error;
        }
      },

      // Simple password change (demo)
      changePassword: async (currentPassword, newPassword) => {
        try {
          set({ loading: true, error: null });

          const { user } = get();
          if (!user) {
            throw new Error("No user logged in");
          }

          const users = get().users ? [...get().users] : [...usersData];
          const idx = users.findIndex((u) => u.id === user.id);
          if (idx === -1) {
            throw new Error("User not found");
          }

          // Verify current password
          if (users[idx].password !== currentPassword) {
            throw new Error("Current password is incorrect");
          }

          // Update password in users list
          users[idx] = {
            ...users[idx],
            password: newPassword,
            passwordChangedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set({ users, user: users[idx], loading: false, error: null });

          try {
            localStorage.setItem("users", JSON.stringify(users));
            localStorage.setItem("user", JSON.stringify(users[idx]));
          } catch (e) {}

          return { message: "Password changed successfully!" };
        } catch (error) {
          set({
            loading: false,
            error: error.message || "Failed to change password",
          });
          throw error;
        }
      },

      verifyToken: async () => {
        try {
          const token = localStorage.getItem("authToken");
          if (!token) {
            throw new Error("No token found");
          }

          set({ loading: true, error: null });

          // Call backend API to get current user data instead of using static JSON
          try {
            // Import userApi dynamically to avoid circular imports
            const { userApi } = await import("../api/userApi");

            // Get current user from backend API
            const response = await userApi.getCurrentUser();
            const user = response.data;

            if (!user) {
              // Clear invalid token and user data
              localStorage.removeItem("authToken");
              localStorage.removeItem("user");
              throw new Error("Invalid token - user not found");
            }

            set({
              user,
              token,
              isAuthenticated: true,
              loading: false,
              error: null,
            });

            return { user };
          } catch (apiError) {
            // If API call fails, fall back to JWT decoding for basic validation
            console.warn(
              "Failed to fetch user from API, falling back to JWT decode:",
              apiError
            );

            try {
              const payload = JSON.parse(atob(token.split(".")[1]));
              const currentTime = Date.now() / 1000;

              if (payload.exp && payload.exp < currentTime) {
                throw new Error("Token expired");
              }

              // Only use static data as absolute fallback
              const user = usersData.find(
                (u) => u.id === payload.id.toString()
              );

              if (!user) {
                throw new Error("Invalid token");
              }

              const { password: _, ...userWithoutPassword } = user;

              set({
                user: userWithoutPassword,
                token,
                isAuthenticated: true,
                loading: false,
                error: null,
              });

              return { user: userWithoutPassword };
            } catch (jwtError) {
              throw new Error("Invalid token format");
            }
          }
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          });
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      // Initialize auth state from localStorage and seed users for demo
      initializeAuth: () => {
        try {
          const storedUsers = localStorage.getItem("users");
          const users = storedUsers ? JSON.parse(storedUsers) : usersData;
          set({ users });
        } catch (e) {
          set({ users: usersData });
        }

        const token = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("user");
        if (token && storedUser) {
          try {
            const user = JSON.parse(storedUser);
            set({ token, user, isAuthenticated: true });
          } catch (e) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
          }
        }
      },

      // Helper methods
      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },

      isHROrAdmin: () => {
        const { user } = get();
        return user?.role === "CLINIC_ADMIN" || user?.role === "CLINIC_STAFF";
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
