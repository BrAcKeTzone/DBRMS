import { create } from "zustand";
import { persist } from "zustand/middleware";
import userApi from "../api/userApi";

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
      hasNextPage: false,
      hasPrevPage: false,

      // Filter and sort state
      filters: {
        search: "",
        role: "",
        isActive: "",
        dateFrom: "",
        dateTo: "",
      },
      sortBy: "createdAt",
      sortOrder: "desc",
      pageSize: 10,

      // Set filters
      setFilters: (newFilters) => {
        set({
          filters: { ...get().filters, ...newFilters },
          currentPage: 1, // Reset to first page when filtering
        });
      },

      // Set sorting
      setSorting: (sortBy, sortOrder = "asc") => {
        set({
          sortBy,
          sortOrder,
          currentPage: 1, // Reset to first page when sorting
        });
      },

      // Set page size
      setPageSize: (pageSize) => {
        set({
          pageSize,
          currentPage: 1, // Reset to first page when changing page size
        });
      },

      // Set current page
      setCurrentPage: (page) => {
        set({ currentPage: page });
      },

      // Clear all filters
      clearFilters: () => {
        set({
          filters: {
            search: "",
            role: "",
            isActive: "",
            dateFrom: "",
            dateTo: "",
          },
          currentPage: 1,
        });
      },

      // Get all users with pagination and filtering
      getAllUsers: async (customOptions = {}) => {
        const state = get();
        const options = {
          page: state.currentPage,
          limit: state.pageSize,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
          ...state.filters,
          ...customOptions, // Allow override
        };

        // Remove empty filter values
        Object.keys(options).forEach((key) => {
          if (
            options[key] === "" ||
            options[key] === null ||
            options[key] === undefined
          ) {
            delete options[key];
          }
        });

        set({ loading: true, error: null });
        try {
          const response = await userApi.getAllUsers(options);
          set({
            users: response.data.users || [],
            usersData: response.data,
            totalPages: response.data.totalPages || 0,
            currentPage: response.data.currentPage || 1,
            totalCount: response.data.totalCount || 0,
            hasNextPage: response.data.hasNextPage || false,
            hasPrevPage: response.data.hasPrevPage || false,
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
            hasNextPage: false,
            hasPrevPage: false,
          });
          // Don't throw error to prevent UI crashes during search
          return { users: [], totalCount: 0, totalPages: 0, currentPage: 1 };
        }
      },

      // Add a new user
      addUser: async (userData) => {
        set({ loading: true, error: null });
        try {
          // Map frontend field names to backend field names
          const mappedUserData = {
            email: userData.email,
            password: userData.password,
            firstName: userData.firstName,
            middleName: userData.middleName || "",
            lastName: userData.lastName,
            phone: userData.phone || "",
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
            email: userData.email,
            firstName: userData.firstName,
            middleName: userData.middleName || "",
            lastName: userData.lastName,
            phone: userData.phone || "",
            role: userData.role,
            isActive:
              userData.isActive !== undefined ? userData.isActive : true,
          };

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
        hasNextPage: state.hasNextPage,
        hasPrevPage: state.hasPrevPage,
        pageSize: state.pageSize,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
    }
  )
);
