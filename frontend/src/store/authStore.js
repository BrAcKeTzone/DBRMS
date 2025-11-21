import { create } from "zustand";
import { persist } from "zustand/middleware";
import authApi from "../api/authApi.mock";
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

      // Login OTP phase state
      loginPhase: 1, // 1: Credentials, 2: OTP Verification
      loginData: {
        email: "",
        password: "",
        otp: "",
      },
      loginOtp: null,

      // Signup phase state
      signupPhase: 1, // 1: Email, 2: OTP, 3: Personal Details, 4: Success
      signupData: {
        email: "",
        otp: "",
        name: "",
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

          // Call backend API - this will now send OTP
          const response = await authApi.login(credentials);

          // Check if OTP is required
          if (response.data?.requiresOtp) {
            set({
              loading: false,
              error: null,
              loginPhase: 2,
              loginData: {
                email: credentials.email,
                password: credentials.password,
                otp: "",
              },
              loginOtp: response.data?.otp || null,
            });

            return { requiresOtp: true, email: credentials.email };
          }

          // Fallback in case backend doesn't return requiresOtp flag
          // (shouldn't happen with updated backend)
          const { user, token } = response.data;

          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
            error: null,
            loginPhase: 1,
          });

          // Store token in localStorage
          localStorage.setItem("authToken", token);

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

      // Verify login OTP and complete authentication
      verifyLoginOtp: async (otp) => {
        try {
          set({ loading: true, error: null });

          const { loginData } = get();

          // Call backend API to verify OTP
          const response = await authApi.verifyLoginOtp(loginData.email, otp);

          // Extract user and token from response
          const { user, token } = response.data;

          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
            error: null,
            loginPhase: 1,
            loginData: {
              email: "",
              password: "",
              otp: "",
            },
            loginOtp: null,
          });

          // Store token in localStorage
          localStorage.setItem("authToken", token);

          return { user, token };
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

      // Reset login process
      resetLogin: () => {
        set({
          loginPhase: 1,
          loginData: {
            email: "",
            password: "",
            otp: "",
          },
          error: null,
          loginOtp: null,
        });
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
            generatedOtp: response.data?.otp || null, // Save demo OTP if provided in mock
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
            lastName: personalData.lastName,
            phone: personalData.phone,
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
            name: "",
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
            forgotPasswordOtp: response.data?.otp || null, // demo OTP for local testing
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
        }
      },

      getProfile: async () => {
        try {
          set({ loading: true, error: null });

          // Get latest user data from the backend
          const { userApi } = await import("../api/userApi.mock");
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
          const { userApi } = await import("../api/userApi.mock");

          // Call the backend API to update the current user
          const response = await userApi.updateCurrentUser({
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            email: profileData.email,
            phone: profileData.phone,
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

          // Call mock API to change password
          const { data } = await authApi.changePassword(
            user.email,
            currentPassword,
            // We'll pass a fake OTP stored for the user when using change flow
            // For now, we'll generate and verify OTP directly in UI flows or test harness.
            // Here, we assume OTP verification was done before this call.
            "000000",
            newPassword
          );

          // Update local state with timestamp
          set({
            user: {
              ...user,
              passwordChangedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            loading: false,
            error: null,
          });

          return data;
        } catch (error) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to change password";
          set({ loading: false, error: errorMessage });
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
            const { userApi } = await import("../api/userApi.mock");

            // Get current user from backend API
            const response = await userApi.getCurrentUser();
            const user = response.data;

            if (!user) {
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
        return user?.role === "CLINIC_STAFF";
      },
      isClinicStaffOrAdmin: () => {
        const { user } = get();
        return user?.role === "CLINIC_STAFF";
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
