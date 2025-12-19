import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../api/authAPI";
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

      // Actions
      login: async (credentials) => {
        try {
          set({ loading: true, error: null });

          // Call backend API
          const response = await authApi.login(credentials);

          // Extract user and token from response
          const { user, token } = response.data;

          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          // Store token and user data in localStorage
          localStorage.setItem("authToken", token);
          localStorage.setItem("user", JSON.stringify(user));

          return { user, token };
        } catch (error) {
          // Handle API error response
          const errorMessage =
            error.response?.data?.message || error.message || "Login failed";

          set({
            loading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      register: async (userData) => {
        try {
          set({ loading: true, error: null });

          // Call backend API
          const response = await authApi.register(userData);

          set({
            loading: false,
            error: null,
          });

          return response.data;
        } catch (error) {
          // Handle API error response
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Registration failed";

          set({
            loading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Phase 1: Send OTP to email
      sendOtp: async (email) => {
        try {
          set({ loading: true, error: null });

          // Call backend API
          const response = await authApi.sendOtp(email);

          set({
            loading: false,
            error: null,
            signupPhase: 2,
            signupData: { ...get().signupData, email },
            generatedOtp: null, // Don't store OTP on frontend
          });

          return response.data;
        } catch (error) {
          // Handle API error response
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to send OTP";

          set({
            loading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Phase 2: Verify OTP
      verifyOtp: async (otp) => {
        try {
          set({ loading: true, error: null });

          const { signupData } = get();

          // Call backend API
          const response = await authApi.verifyOtp(signupData.email, otp);

          set({
            loading: false,
            error: null,
            signupPhase: 3,
            signupData: { ...signupData, otp },
          });

          return response.data;
        } catch (error) {
          // Handle API error response
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "OTP verification failed";

          set({
            loading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Phase 3: Complete registration
      completeRegistration: async (personalData) => {
        try {
          set({ loading: true, error: null });

          const { signupData } = get();

          // Prepare registration data for backend
          const registrationData = {
            email: signupData.email,
            password: personalData.password,
            firstName: personalData.firstName,
            middleName: personalData.middleName,
            lastName: personalData.lastName,
          };

          // Call backend API
          const response = await authApi.register(registrationData);

          set({
            loading: false,
            error: null,
            signupPhase: 4,
            signupData: { ...signupData, ...personalData },
          });

          return response.data;
        } catch (error) {
          // Handle API error response
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Registration failed";

          set({
            loading: false,
            error: errorMessage,
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
      // Phase 1: Send OTP for password reset
      sendPasswordResetOtp: async (email) => {
        try {
          set({ loading: true, error: null });

          // Call backend API
          const response = await authApi.sendOtpForReset(email);

          set({
            loading: false,
            error: null,
            forgotPasswordPhase: 2,
            forgotPasswordData: { ...get().forgotPasswordData, email },
            forgotPasswordOtp: null, // Don't store OTP on frontend
          });

          return response.data;
        } catch (error) {
          // Handle API error response
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to send password reset OTP";

          set({
            loading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Phase 2: Verify OTP for password reset
      verifyPasswordResetOtp: async (otp) => {
        try {
          set({ loading: true, error: null });

          const { forgotPasswordData } = get();

          // Call backend API
          const response = await authApi.verifyOtpForReset(
            forgotPasswordData.email,
            otp
          );

          set({
            loading: false,
            error: null,
            forgotPasswordPhase: 3,
            forgotPasswordData: { ...forgotPasswordData, otp },
          });

          return response.data;
        } catch (error) {
          // Handle API error response
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "OTP verification failed";

          set({
            loading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Phase 3: Reset password
      resetPassword: async (passwordData) => {
        try {
          set({ loading: true, error: null });

          const { forgotPasswordData } = get();

          // Call backend API
          const response = await authApi.resetPassword(
            forgotPasswordData.email,
            forgotPasswordData.otp,
            passwordData.newPassword
          );

          set({
            loading: false,
            error: null,
            forgotPasswordPhase: 4,
            forgotPasswordData: { ...forgotPasswordData, ...passwordData },
          });

          return response.data;
        } catch (error) {
          // Handle API error response
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Password reset failed";

          set({
            loading: false,
            error: errorMessage,
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

      // Send OTP for password change
      sendOtpForPasswordChange: async (currentPassword) => {
        try {
          set({ loading: true, error: null });

          const { user } = get();
          if (!user) {
            throw new Error("No user logged in");
          }

          // Call backend API
          const response = await authApi.sendOtpForChange(
            user.email,
            currentPassword
          );

          set({
            loading: false,
            error: null,
          });

          return response.data;
        } catch (error) {
          // Handle API error response
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to send OTP for password change";

          set({
            loading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Password change with OTP verification
      changePasswordWithOtp: async (currentPassword, newPassword, otp) => {
        try {
          set({ loading: true, error: null });

          const { user } = get();
          if (!user) {
            throw new Error("No user logged in");
          }

          // First verify the OTP
          await authApi.verifyOtpForChange(user.email, otp);

          // Then change the password
          const response = await authApi.changePassword(
            user.email,
            currentPassword,
            otp,
            newPassword
          );

          // Update user state with password change timestamp
          set({
            user: {
              ...user,
              passwordChangedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            loading: false,
            error: null,
          });

          return response.data;
        } catch (error) {
          // Handle API error response
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to change password";

          set({
            loading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Simple password change (keeping the existing functionality for compatibility)
      changePassword: async (currentPassword, newPassword) => {
        try {
          set({ loading: true, error: null });

          const { user } = get();
          if (!user) {
            throw new Error("No user logged in");
          }

          // For now, we'll keep the dummy data logic for compatibility
          // In a real app, you'd call the OTP-based password change or a simpler endpoint
          const userData = usersData.find((u) => u.id === user.id);
          if (!userData) {
            throw new Error("User not found");
          }

          // Verify current password
          if (userData.password !== currentPassword) {
            throw new Error("Current password is incorrect");
          }

          // Update password in usersData (for demo purposes)
          const userIndex = usersData.findIndex((u) => u.id === user.id);
          if (userIndex !== -1) {
            usersData[userIndex] = {
              ...usersData[userIndex],
              password: newPassword,
              passwordChangedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }

          // Update user state with password change timestamp
          set({
            user: {
              ...user,
              passwordChangedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            loading: false,
            error: null,
          });

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

      // Initialize auth state from localStorage
      initializeAuth: () => {
        const token = localStorage.getItem("authToken");
        if (token) {
          set({ token });
          get()
            .verifyToken()
            .catch(() => {
              // Token is invalid, clear it
              localStorage.removeItem("authToken");
            });
        }
      },

      // Helper methods
      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },

      isHROrAdmin: () => {
        const { user } = get();
        return user?.role === "HR";
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
