import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../api/authApi";

// Empty array to replace dummy data - forces reliance on real API
const usersData = [];

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      loading: true, // Start with loading true to prevent premature redirects on reload
      _hasHydrated: false,
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

          try {
            const response = await authApi.login({ email, password });
            const payload = response.data?.data || response.data;
            const { user, token } = payload;

            set({
              user,
              token,
              isAuthenticated: true,
              loading: false,
              error: null,
            });

            // Persisted by zustand persist middleware

            return { user, token };
          } catch (apiError) {
            // If backend returned error, try demo fallback
            const apiMessage =
              apiError?.response?.data?.message || apiError?.message;
            const users = get().users || usersData;
            const user = users.find((u) => u.email === email);

            if (user && user.password === password) {
              const token = `demo-token-${user.id}`;
              set({
                user,
                token,
                isAuthenticated: true,
                loading: false,
                error: null,
              });
              // Persisted by zustand persist middleware
              return { user, token };
            }

            const errMsg = apiMessage || "Invalid email or password";
            set({ loading: false, error: errMsg });
            throw new Error(errMsg);
          }
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
          } catch (e) {
            console.debug(e);
          }

          return newUser;
        } catch (error) {
          set({
            loading: false,
            error: error.message || "Registration failed",
          });
          throw error;
        }
      },

      // Phase 1: Send OTP to email (server-backed, with fallback)
      sendOtp: async (email) => {
        try {
          set({ loading: true, error: null });

          try {
            const response = await authApi.sendOtp(email);
            const result = response.data?.data || response.data;
            const otp = result?.otp || null;

            set({
              loading: false,
              error: null,
              signupPhase: 2,
              signupData: { ...get().signupData, email },
              generatedOtp: otp,
            });

            return { success: true, otp };
          } catch (apiError) {
            const msg =
              apiError?.response?.data?.message ||
              apiError?.message ||
              "Failed to send OTP";
            // If no response (network), fallback to demo OTP
            if (!apiError?.response) {
              const otp = Math.floor(
                100000 + Math.random() * 900000,
              ).toString();
              set({
                loading: false,
                error: null,
                signupPhase: 2,
                signupData: { ...get().signupData, email },
                generatedOtp: otp,
              });
              return { otp };
            }

            set({ loading: false, error: msg });
            throw new Error(msg);
          }
        } catch (error) {
          set({ loading: false, error: error.message || "Failed to send OTP" });
          throw error;
        }
      },

      // Phase 2: Verify OTP (server-backed, with fallback)
      verifyOtp: async (otp) => {
        try {
          set({ loading: true, error: null });

          const { signupData } = get();

          try {
            await authApi.verifyOtp(signupData.email, otp);

            set({
              loading: false,
              error: null,
              signupPhase: 3,
              signupData: { ...signupData, otp },
            });

            console.debug(
              "authStore.verifyOtp success",
              get().signupPhase,
              get().signupData,
            );

            return { success: true };
          } catch (apiError) {
            const msg =
              apiError?.response?.data?.message ||
              apiError?.message ||
              "Invalid OTP";
            // Fallback: if generatedOtp exists, verify against that
            const { generatedOtp } = get();
            if (!apiError?.response && generatedOtp && otp === generatedOtp) {
              set({
                loading: false,
                error: null,
                signupPhase: 3,
                signupData: { ...signupData, otp },
              });
              return { success: true };
            }

            set({ loading: false, error: msg });
            throw new Error(msg);
          }
        } catch (error) {
          set({
            loading: false,
            error: error.message || "OTP verification failed",
          });
          throw error;
        }
      },

      // Phase 3: Complete registration (server-backed, with fallback)
      completeRegistration: async (personalData) => {
        console.debug(
          "authStore.completeRegistration called",
          personalData,
          get().signupData,
        );
        try {
          set({ loading: true, error: null });

          const { signupData } = get();

          try {
            const payload = {
              email: signupData.email,
              otp: signupData.otp,
              firstName: personalData.firstName,
              middleName: personalData.middleName,
              lastName: personalData.lastName,
              phone: personalData.phone || "",
              password: personalData.password,
            };

            const response = await authApi.register(payload);
            const result = response.data?.data || response.data;
            const { user, token } = result;

            console.debug("authStore.completeRegistration success", {
              user,
              token,
            });

            set({
              user,
              token,
              isAuthenticated: true,
              loading: false,
              error: null,
              signupPhase: 4,
              signupData: { ...signupData, ...personalData },
            });

            // Persisted by zustand persist middleware

            return user;
          } catch (apiError) {
            const msg =
              apiError?.response?.data?.message ||
              apiError?.message ||
              "Registration failed";
            // Fallback: create demo user locally if network error
            if (!apiError?.response) {
              const users = get().users ? [...get().users] : [...usersData];
              const exists = users.find((u) => u.email === signupData.email);
              if (exists) {
                const errMsg = "Email already registered";
                set({ loading: false, error: errMsg });
                throw new Error(errMsg);
              }

              const id =
                users.reduce((maxId, u) => Math.max(maxId, u.id), 0) + 1;
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
                user: newUser,
                token: `demo-token-${id}`,
                isAuthenticated: true,
              });

              try {
                // Persist users for demo mode
                localStorage.setItem("users", JSON.stringify(users));
              } catch (e) {
                console.debug(e);
              }

              return newUser;
            }

            set({ loading: false, error: msg });
            throw new Error(msg);
          }
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
        console.debug("authStore.resetSignup called");
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
      // Phase 1: Send OTP for password reset (server-backed, with fallback)
      sendPasswordResetOtp: async (email) => {
        try {
          set({ loading: true, error: null });

          try {
            const response = await authApi.sendOtpForReset(email);
            const result = response.data?.data || response.data;
            const otp = result?.otp || null;

            set({
              loading: false,
              error: null,
              forgotPasswordPhase: 2,
              forgotPasswordData: { ...get().forgotPasswordData, email },
              forgotPasswordOtp: otp,
            });

            return { success: true, otp };
          } catch (apiError) {
            const msg =
              apiError?.response?.data?.message ||
              apiError?.message ||
              "Failed to send password reset OTP";
            if (!apiError?.response) {
              const users = get().users || usersData;
              const user = users.find((u) => u.email === email);
              if (!user) {
                const errMsg = "No account found for this email";
                set({ loading: false, error: errMsg });
                throw new Error(errMsg);
              }
              const otp = Math.floor(
                100000 + Math.random() * 900000,
              ).toString();
              set({
                loading: false,
                error: null,
                forgotPasswordPhase: 2,
                forgotPasswordData: { ...get().forgotPasswordData, email },
                forgotPasswordOtp: otp,
              });
              return { otp };
            }
            set({ loading: false, error: msg });
            throw new Error(msg);
          }
        } catch (error) {
          set({
            loading: false,
            error: error.message || "Failed to send password reset OTP",
          });
          throw error;
        }
      },

      // Phase 2: Verify OTP for password reset (server-backed, with fallback)
      verifyPasswordResetOtp: async (otp) => {
        try {
          set({ loading: true, error: null });

          const { forgotPasswordData } = get();

          try {
            await authApi.verifyOtpForReset(forgotPasswordData.email, otp);
            set({
              loading: false,
              error: null,
              forgotPasswordPhase: 3,
              forgotPasswordData: { ...forgotPasswordData, otp },
            });
            return { success: true };
          } catch (apiError) {
            const msg =
              apiError?.response?.data?.message ||
              apiError?.message ||
              "Invalid OTP";
            const { forgotPasswordOtp } = get();
            if (
              !apiError?.response &&
              forgotPasswordOtp &&
              otp === forgotPasswordOtp
            ) {
              set({
                loading: false,
                error: null,
                forgotPasswordPhase: 3,
                forgotPasswordData: { ...forgotPasswordData, otp },
              });
              return { success: true };
            }
            set({ loading: false, error: msg });
            throw new Error(msg);
          }
        } catch (error) {
          set({
            loading: false,
            error: error.message || "OTP verification failed",
          });
          throw error;
        }
      },

      // Phase 3: Reset password (server-backed, with fallback)
      resetPassword: async (passwordData) => {
        try {
          set({ loading: true, error: null });

          const { forgotPasswordData } = get();

          try {
            await authApi.resetPassword(
              forgotPasswordData.email,
              forgotPasswordData.otp,
              passwordData.newPassword,
            );
            set({
              loading: false,
              error: null,
              forgotPasswordPhase: 4,
              forgotPasswordData: { ...forgotPasswordData, ...passwordData },
            });
            return { success: true };
          } catch (apiError) {
            const msg =
              apiError?.response?.data?.message ||
              apiError?.message ||
              "Password reset failed";
            if (!apiError?.response) {
              const users = get().users ? [...get().users] : [...usersData];
              const idx = users.findIndex(
                (u) => u.email === forgotPasswordData.email,
              );
              if (idx === -1) {
                const errMsg = "No account found";
                set({ loading: false, error: errMsg });
                throw new Error(errMsg);
              }
              users[idx] = {
                ...users[idx],
                password: passwordData.newPassword,
              };
              set({
                users,
                loading: false,
                error: null,
                forgotPasswordPhase: 4,
                forgotPasswordData: { ...forgotPasswordData, ...passwordData },
              });
              try {
                localStorage.setItem("users", JSON.stringify(users));
              } catch (e) {
                console.debug(e);
              }
              return { success: true };
            }

            set({ loading: false, error: msg });
            throw new Error(msg);
          }
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
          // Persisted state will update via zustand persist middleware
        }
      },

      getProfile: async () => {
        try {
          set({ loading: true, error: null });

          // Get latest user data from the backend
          const { userApi } = await import("../api/userApi");
          const response = await userApi.getCurrentUser();

          // Update local user state with fresh data from backend
          const updatedUser = response.data?.data || response.data;

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
            phone: profileData.phone,
          });

          // Update the local user state with the response from backend
          const updatedUser = response.data?.data || response.data;

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
          const response =
            await userApi.uploadProfilePicture(profilePictureData);

          const updatedUser = response.data?.data || response.data;

          set({
            user: updatedUser,
            loading: false,
            error: null,
          });

          // Updated user persisted by zustand persist middleware

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

          try {
            // Try API first
            const response = await authApi.sendOtpForChange(
              user.email,
              currentPassword,
            );
            const result = response.data?.data || response.data;
            const apiOtp = result?.otp; // In prod this might be undefined, handled by email

            // Store email for verification step to match backend expectations if needed
            // But here we just return success
            return { success: true, otp: apiOtp };
          } catch (apiError) {
            const msg =
              apiError?.response?.data?.message ||
              apiError?.message ||
              "Failed to send OTP";

            // If API not available (network error), try demo fallback
            if (!apiError?.response) {
              const users = get().users || usersData;
              const account = users.find((u) => u.email === user.email);
              if (!account || account.password !== currentPassword) {
                const errMsg = "Current password is incorrect";
                set({ loading: false, error: errMsg });
                throw new Error(errMsg);
              }

              const otp = Math.floor(
                100000 + Math.random() * 900000,
              ).toString();
              set({ loading: false, error: null, changePasswordOtp: otp });
              return { otp };
            }

            // Real API error (e.g. wrong password)
            set({ loading: false, error: msg });
            throw new Error(msg);
          }
        } catch (error) {
          set({
            loading: false,
            error: error.message || "Failed to send OTP for password change",
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

          try {
            // Try API first
            await authApi.changePassword(
              user.email,
              currentPassword,
              otp,
              newPassword,
            );

            // Update local state if needed (user obj might not change unless password hash is stored locally which it shouldn't be)
            set({ loading: false, error: null });

            return { success: true };
          } catch (apiError) {
            const msg =
              apiError?.response?.data?.message ||
              apiError?.message ||
              "Failed to change password";

            // Fallback to demo mode if network error
            if (!apiError?.response) {
              const { changePasswordOtp } = get();
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
              } catch (e) {
                console.debug(e);
              }

              return { success: true };
            }

            set({ loading: false, error: msg });
            throw new Error(msg);
          }
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
            // Persist updated users list for demo mode
            localStorage.setItem("users", JSON.stringify(users));
          } catch (e) {
            console.debug(e);
          }

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
          const token = get().token;
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
            const user = response.data?.data || response.data;

            if (
              !user ||
              (typeof user === "object" && Object.keys(user).length === 0)
            ) {
              // Invalid token - user not found
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
              "Failed to fetch user from API, falling back to local validation:",
              apiError,
            );

            try {
              // Handle demo tokens
              if (token.startsWith("demo-token-")) {
                const userId = token.replace("demo-token-", "");
                const user = (get().users || usersData).find(
                  (u) => u.id === userId || u.id === parseInt(userId),
                );
                if (!user) throw new Error("Demo user not found");

                const { password: _, ...userWithoutPassword } = user;
                set({
                  user: userWithoutPassword,
                  token,
                  isAuthenticated: true,
                  loading: false,
                  error: null,
                });
                return { user: userWithoutPassword };
              }

              // Handle JWT tokens
              const payload = JSON.parse(atob(token.split(".")[1]));
              const currentTime = Date.now() / 1000;

              if (payload.exp && payload.exp < currentTime) {
                throw new Error("Token expired");
              }

              // Only use static data as absolute fallback
              const user = (get().users || usersData).find(
                (u) => u.id === payload.id.toString() || u.id === payload.id,
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
            } catch (err) {
              console.error("Local token validation failed:", err);
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
          // Persisted state will reflect cleared auth
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      // Initialize auth state: seed users and verify any existing token in store
      initializeAuth: () => {
        console.debug("initializeAuth: starting");
        try {
          const storedUsers = localStorage.getItem("users");
          const users = storedUsers ? JSON.parse(storedUsers) : usersData;
          set({ users });
        } catch {
          set({ users: usersData });
        }

        // Migrate legacy localStorage auth keys to zustand persisted state if present
        try {
          const legacyToken = localStorage.getItem("authToken");
          const legacyUserStr = localStorage.getItem("user");
          if (legacyToken || legacyUserStr) {
            console.debug("initializeAuth: found legacy keys, migrating");
            let legacyUser = null;
            try {
              legacyUser = legacyUserStr ? JSON.parse(legacyUserStr) : null;
            } catch {
              legacyUser = null;
            }

            set({
              token: legacyToken || get().token,
              user: legacyUser || get().user,
              isAuthenticated: !!(legacyToken || legacyUser),
            });

            // Remove legacy keys to avoid duplication
            try {
              localStorage.removeItem("authToken");
              localStorage.removeItem("user");
            } catch {
              // ignore
            }

            // verify and refresh profile
            const tokenToVerify = legacyToken || get().token;
            if (tokenToVerify) {
              get()
                .verifyToken()
                .catch(() => {
                  /* verifyToken will clear state on failure */
                  set({ loading: false });
                });
            } else {
              set({ loading: false });
            }

            return;
          }
        } catch (err) {
          console.error("initializeAuth: legacy migration failed", err);
        }

        // If a token exists in the zustand state (rehydrated by persist), verify it
        const token = get().token;
        const isAuthenticated = get().isAuthenticated;
        console.debug("initializeAuth: checking rehydrated state", {
          hasToken: !!token,
          isAuthenticated,
        });

        if (token) {
          get()
            .verifyToken()
            .catch((err) => {
              console.error("initializeAuth: verifyToken failed", err);
              // verification failed; verifyToken will clear the state on failure
              set({ loading: false });
            });
        } else {
          console.debug("initializeAuth: no token found, clearing auth state");
          // No token found, ensure state is clean and stop loading
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      },

      // Helper methods
      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },

      isStaff: () => {
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
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    },
  ),
);
