import { create } from "zustand";
import { persist } from "zustand/middleware";
import userApi from "../api/userApi.mock";

export const useUserManagementStore = create(
  persist(
    (set, get) => ({
      users: [],
      usersData: null,
      loading: false,
      error: null,
      totalPages: 0,
      currentPage: 1,
      totalCount: 0,

      // Get all users with pagination and filtering
      getAllUsers: async (options = {}) => {
        set({ loading: true, error: null });
        try {
          const response = await userApi.getAllUsers(options);
          set({
            users: response.data.users || [],
            usersData: response.data,
            totalPages: response.data.totalPages || 0,
            currentPage: response.data.currentPage || 1,
            totalCount: response.data.totalCount || 0,
            loading: false,
          });
          return response.data;
        } catch (error) {
          console.error("Error fetching users:", error);
          set({
            error:
              error.response?.data?.message ||
              error.message ||
              "Failed to fetch users",
            loading: false,
            users: [], // Clear users on error
            totalPages: 0,
            currentPage: 1,
            totalCount: 0,
          });
          // Don't throw error to prevent UI crashes during search
          return { users: [], totalCount: 0, totalPages: 0, currentPage: 1 };
        }
      },

      // Add a new user
      addUser: async (userData) => {
        set({ loading: true, error: null });
        try {
          // Send the data with correct field names for backend
          const mappedUserData = {
            email: userData.email,
            password: userData.password,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phoneNumber || "",
            role: userData.role,
          };

          const response = await userApi.createUser(mappedUserData);

          // Refresh the users list
          const { getAllUsers } = get();
          await getAllUsers();

          set({ loading: false });
          return response.data;
        } catch (error) {
          set({
            error: error.response?.data?.message || error.message,
            loading: false,
          });
          throw error;
        }
      },

      // Update user
      updateUser: async (userId, userData) => {
        set({ loading: true, error: null });
        try {
          // Map frontend field names to backend field names if needed
          const mappedUserData = {
            ...userData,
            ...(userData.firstName &&
              userData.lastName && {
                name: `${userData.firstName} ${userData.lastName}`,
              }),
            ...(userData.phoneNumber && { phone: userData.phoneNumber }),
          };

          // Remove frontend-specific fields
          delete mappedUserData.firstName;
          delete mappedUserData.lastName;
          delete mappedUserData.phoneNumber;

          const response = await userApi.updateUser(userId, mappedUserData);

          // Refresh the users list
          const { getAllUsers } = get();
          await getAllUsers();

          set({ loading: false });
          return response.data;
        } catch (error) {
          set({
            error: error.response?.data?.message || error.message,
            loading: false,
          });
          throw error;
        }
      },

      // Delete user
      deleteUser: async (userId) => {
        set({ loading: true, error: null });
        try {
          const response = await userApi.deleteUser(userId);

          // Refresh the users list
          const { getAllUsers } = get();
          await getAllUsers();

          set({ loading: false });
          return response.data;
        } catch (error) {
          set({
            error: error.response?.data?.message || error.message,
            loading: false,
          });
          throw error;
        }
      },

      // Get user by ID
      getUserById: async (userId) => {
        set({ loading: true, error: null });
        try {
          const response = await userApi.getUserById(userId);
          set({ loading: false });
          return response.data;
        } catch (error) {
          set({
            error: error.response?.data?.message || error.message,
            loading: false,
          });
          throw error;
        }
      },

      // Get user statistics
      getUserStats: async () => {
        set({ loading: true, error: null });
        try {
          const response = await userApi.getUserStats();
          set({ loading: false });
          return response.data;
        } catch (error) {
          set({
            error: error.response?.data?.message || error.message,
            loading: false,
          });
          throw error;
        }
      },

      // Update user password
      updateUserPassword: async (userId, passwordData) => {
        set({ loading: true, error: null });
        try {
          const response = await userApi.updateUserPassword(
            userId,
            passwordData
          );
          set({ loading: false });
          return response.data;
        } catch (error) {
          set({
            error: error.response?.data?.message || error.message,
            loading: false,
          });
          throw error;
        }
      },

      // Clear errors
      clearError: () => set({ error: null }),

      // Reset store
      resetStore: () => {
        set({
          users: [],
          usersData: null,
          loading: false,
          error: null,
          totalPages: 0,
          currentPage: 1,
          totalCount: 0,
        });
      },
    }),
    {
      name: "userManagement-storage",
      partialize: (state) => ({
        users: state.users,
        totalPages: state.totalPages,
        currentPage: state.currentPage,
        totalCount: state.totalCount,
      }),
    }
  )
);
