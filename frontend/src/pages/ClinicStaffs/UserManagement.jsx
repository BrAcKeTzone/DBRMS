import React, { useEffect, useState, useCallback } from "react";
import { useUserManagementStore } from "../../store/userManagementStore";
import { useAuthStore } from "../../store/authStore";
import DashboardCard from "../../components/DashboardCard";
import Button from "../../components/Button";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import PasswordInput from "../../components/PasswordInput";
import OTPInput from "../../components/OTPInput";
import Pagination from "../../components/Pagination";
import { formatDate } from "../../utils/formatDate";
import userApi from "../../api/userApi.mock";

const UserManagement = () => {
  const { user: currentUser } = useAuthStore();
  const {
    users,
    usersData,
    totalPages,
    currentPage,
    totalCount,
    getAllUsers,
    deleteUser,
    addUser,
    getUserStats,
    loading,
    error,
  } = useUserManagementStore();

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteOtp, setDeleteOtp] = useState("");
  const [deleteOtpError, setDeleteOtpError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    total: 0,
    clinicStaff: 0,
    guardians: 0,
    recent: 0,
  });

  const [filters, setFilters] = useState({
    role: "",
    search: "",
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Separate state for search input to avoid triggering API calls on every keystroke
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [newUserData, setNewUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: "GUARDIAN",
    password: "",
    confirmPassword: "",
  });

  const [addUserError, setAddUserError] = useState("");

  // Load initial data
  useEffect(() => {
    loadUsers();
    loadStats();
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (searchInput !== filters.search) {
      setIsSearching(true);
    }

    const timeoutId = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
      setIsSearching(false);
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Reload users when filters change (except search since it's handled by debounce)
  useEffect(() => {
    loadUsers();
  }, [
    filters.role,
    filters.page,
    filters.limit,
    filters.sortBy,
    filters.sortOrder,
    filters.search,
  ]);

  const loadUsers = async () => {
    try {
      const queryParams = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.role && { role: filters.role }),
        ...(filters.search &&
          filters.search.trim() && { search: filters.search.trim() }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };
      await getAllUsers(queryParams);
    } catch (error) {
      console.error("Failed to load users:", error);
      // Don't throw the error to prevent UI crashes
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getUserStats();
      setUserStats({
        total: statsData.totalUsers || 0,
        clinicStaff: statsData.roles?.CLINIC_STAFF || 0,
        guardians: statsData.roles?.GUARDIAN || 0,
        recent: 0,
      });
    } catch (error) {
      console.error("Failed to load user stats:", error);
    }
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 })); // Reset to page 1 when filters change
  };

  const handleSearchChange = (value) => {
    setSearchInput(value);
  };

  const handleDeleteUser = (user) => {
    if (user.id === currentUser?.id) {
      alert("You cannot delete your own account");
      return;
    }
    setSelectedUser(user);

    // If user is clinic staff, show OTP flow
    if (user.role === "CLINIC_STAFF") {
      setShowOtpModal(true);
      setOtpSent(false);
      setDeleteOtp("");
      setDeleteOtpError("");
      // Send OTP immediately for clinic staff deletion
      handleSendOtpForClinicStaffDeletion();
    } else {
      // For non-clinic-staff users, show standard delete modal
      setShowDeleteModal(true);
    }
  };

  const handleSendOtpForClinicStaffDeletion = async () => {
    setOtpLoading(true);
    setDeleteOtpError("");
    try {
      await userApi.sendOtpForClinicStaffDeletion();
      setOtpSent(true);
    } catch (error) {
      setDeleteOtpError(error.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleConfirmClinicStaffDeletion = async () => {
    if (!deleteOtp || deleteOtp.length !== 6) {
      setDeleteOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    setOtpLoading(true);
    setDeleteOtpError("");
    try {
      await userApi.verifyOtpAndDeleteClinicStaff(selectedUser.id, deleteOtp);

      setShowOtpModal(false);
      setSelectedUser(null);
      setDeleteOtp("");
      setOtpSent(false);
      // Refresh users list and stats
      await loadUsers();
      await loadStats();
    } catch (error) {
      setDeleteOtpError(error.message || "Failed to delete clinic staff user");
    } finally {
      setOtpLoading(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (selectedUser) {
      try {
        await deleteUser(selectedUser.id);
        setShowDeleteModal(false);
        setSelectedUser(null);
        // Refresh users list and stats
        await loadUsers();
        await loadStats();
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddUserError("");

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserData.email)) {
      setAddUserError("Please enter a valid email address");
      return;
    }

    // Check if email already exists
    try {
      const response = await userApi.checkEmailExists(newUserData.email);
      if (response.data?.exists) {
        setAddUserError("This email is already registered");
        return;
      }
    } catch (err) {
      console.error("Error checking email:", err);
      setAddUserError("Error validating email. Please try again.");
      return;
    }

    // Validate passwords
    if (newUserData.password !== newUserData.confirmPassword) {
      setAddUserError("Passwords do not match");
      return;
    }

    if (newUserData.password.length < 6) {
      setAddUserError("Password must be at least 6 characters long");
      return;
    }

    try {
      await addUser({
        firstName: newUserData.firstName,
        lastName: newUserData.lastName,
        email: newUserData.email,
        phoneNumber: newUserData.phoneNumber,
        role: newUserData.role,
        password: newUserData.password,
      });

      setShowAddUserModal(false);
      setNewUserData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        role: "GUARDIAN",
        password: "",
        confirmPassword: "",
      });

      // Refresh users list and stats
      await loadUsers();
      await loadStats();
    } catch (error) {
      setAddUserError(error.message || "Failed to add user");
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "CLINIC_STAFF":
        return "Clinic Staff";
      case "GUARDIAN":
        return "Guardian";
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "CLINIC_STAFF":
        return "bg-purple-100 text-purple-800";
      case "GUARDIAN":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const usersColumns = [
    {
      header: "User",
      accessor: (row) => `${row.firstName} ${row.lastName}`,
      cell: (row) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.firstName} {row.lastName}
          </p>
          <p className="text-sm text-gray-500">{row.email}</p>
        </div>
      ),
    },
    {
      header: "Role",
      accessor: "role",
      cell: (row) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(
            row.role
          )}`}
        >
          {getRoleDisplayName(row.role)}
        </span>
      ),
    },
    {
      header: "Phone",
      accessor: "phone",
      cell: (row) => (
        <div className="text-sm text-gray-600">
          {row.phone || "Not provided"}
        </div>
      ),
    },
    {
      header: "Created",
      accessor: "createdAt",
      cell: (row) => (
        <div className="text-sm text-gray-600">{formatDate(row.createdAt)}</div>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex space-x-2">
          {(row.role === "GUARDIAN" || row.role === "CLINIC_STAFF") &&
            row.id !== currentUser?.id && (
              <Button
                onClick={() => handleDeleteUser(row)}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Delete
              </Button>
            )}
          {row.id === currentUser?.id && (
            <span className="text-xs text-gray-500">Current User</span>
          )}
        </div>
      ),
    },
  ];

  // Display stats from API
  const displayStats = {
    total: userStats.total || 0,
    clinicStaff: userStats.clinicStaff || 0,
    guardians: userStats.guardians || 0,
  };

  if (loading && (!users || users.length === 0)) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          User Management
        </h1>
        <p className="text-gray-600">
          Manage user accounts, roles, and permissions.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <DashboardCard title="Total Users" className="">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                {/* User Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5.121 17.804A8.966 8.966 0 0112 15c2.21 0 4.23.89 5.879 2.356M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Users</div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {displayStats.total}
                </div>
              </div>
            </div>
            <div className="text-sm text-green-600 font-medium">
              {/* optional change indicator */}+0.8%
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Clinic Staff" className="">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                {/* Briefcase/Staff Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V4a1 1 0 011-1h6a1 1 0 011 1v3"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 11h18v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500">Clinic Staff</div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {displayStats.clinicStaff}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {displayStats.clinicStaff > 0
                ? `${Math.max(
                    0,
                    Math.round(
                      (displayStats.clinicStaff /
                        Math.max(1, displayStats.total)) *
                        100
                    )
                  )}%`
                : "0%"}
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Guardians" className="">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-teal-50 text-teal-600">
                {/* Users Group Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a4 4 0 00-5-4 4 4 0 00-1 3v3zM9 20H4v-2a4 4 0 015-4 4 4 0 015 3v3z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 11a4 4 0 10-8 0 4 4 0 008 0z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500">Guardians</div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {displayStats.guardians}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {displayStats.guardians > 0
                ? `${Math.max(
                    0,
                    Math.round(
                      (displayStats.guardians /
                        Math.max(1, displayStats.total)) *
                        100
                    )
                  )}%`
                : "0%"}
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => setShowAddUserModal(true)}
            variant="primary"
            className="w-full sm:w-auto"
          >
            Add New User
          </Button>
        </div>
      </div>

      {/* Filters removed per request */}

      {/* Users Table */}
      <DashboardCard
        title={`Users (${totalCount || 0})${
          filters.search || filters.role ? " - Filtered" : ""
        }`}
      >
        {users && users.length > 0 ? (
          <div className="mt-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Table columns={usersColumns} data={users} />
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {users.map((user, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 break-words">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 break-all">
                        {user.email}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {user.phone || "No phone provided"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {getRoleDisplayName(user.role)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      Created: {formatDate(user.createdAt)}
                    </span>
                    <div className="flex space-x-2">
                      {(user.role === "GUARDIAN" ||
                        user.role === "CLINIC_STAFF") &&
                        user.id !== currentUser?.id && (
                          <Button
                            onClick={() => handleDeleteUser(user)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        )}
                      {user.id === currentUser?.id && (
                        <span className="text-xs text-gray-500">
                          Current User
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  itemsPerPage={filters.limit}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {loading || isSearching
                ? "Loading users..."
                : filters.search
                ? `No users found matching "${filters.search}"`
                : "No users found matching your criteria."}
            </p>
            {!loading && !isSearching && (filters.search || filters.role) && (
              <Button
                onClick={() => {
                  setFilters({
                    role: "",
                    search: "",
                    page: 1,
                    limit: 10,
                    sortBy: "createdAt",
                    sortOrder: "desc",
                  });
                  setSearchInput("");
                }}
                variant="outline"
                className="mt-3"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </DashboardCard>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddUserModal}
        onClose={() => {
          setShowAddUserModal(false);
          setAddUserError("");
          setNewUserData({
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            role: "GUARDIAN",
            password: "",
            confirmPassword: "",
          });
        }}
        title="Add New User"
        size="large"
      >
        <form onSubmit={handleAddUser} className="space-y-4 sm:space-y-6">
          {addUserError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {addUserError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={newUserData.firstName}
              onChange={(e) =>
                setNewUserData({ ...newUserData, firstName: e.target.value })
              }
              required
            />

            <Input
              label="Last Name"
              value={newUserData.lastName}
              onChange={(e) =>
                setNewUserData({ ...newUserData, lastName: e.target.value })
              }
              required
            />

            <div className="sm:col-span-2">
              <Input
                label="Email Address"
                type="email"
                value={newUserData.email}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, email: e.target.value })
                }
                required
              />
            </div>

            <Input
              label="Phone Number"
              value={newUserData.phoneNumber}
              onChange={(e) =>
                setNewUserData({ ...newUserData, phoneNumber: e.target.value })
              }
              placeholder="Enter phone number"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={newUserData.role}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, role: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="GUARDIAN">Guardian</option>
                <option value="CLINIC_STAFF">Clinic Staff</option>
              </select>
            </div>

            <PasswordInput
              label="Password"
              name="password"
              value={newUserData.password}
              onChange={(e) =>
                setNewUserData({ ...newUserData, password: e.target.value })
              }
              required
              placeholder="Enter password (minimum 6 characters)"
            />

            <PasswordInput
              label="Confirm Password"
              name="confirmPassword"
              value={newUserData.confirmPassword}
              onChange={(e) =>
                setNewUserData({
                  ...newUserData,
                  confirmPassword: e.target.value,
                })
              }
              required
              placeholder="Re-enter password"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddUserModal(false);
                setAddUserError("");
                setNewUserData({
                  firstName: "",
                  lastName: "",
                  email: "",
                  phoneNumber: "",
                  role: "GUARDIAN",
                  password: "",
                  confirmPassword: "",
                });
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "Adding..." : "Add User"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete the user{" "}
            <strong>
              {selectedUser?.firstName} {selectedUser?.lastName}
            </strong>
            ? This action cannot be undone.
          </p>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedUser(null);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={confirmDeleteUser}
              disabled={loading}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            >
              {loading ? "Deleting..." : "Delete User"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* OTP Verification Modal for Clinic Staff Deletion */}
      <Modal
        isOpen={showOtpModal}
        onClose={() => {
          setShowOtpModal(false);
          setSelectedUser(null);
          setDeleteOtp("");
          setOtpSent(false);
          setDeleteOtpError("");
        }}
        title="Delete Clinic Staff - Verify with OTP"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            You are about to delete{" "}
            <strong>
              {selectedUser?.firstName} {selectedUser?.lastName}
            </strong>
            , a clinic staff user. For security, please verify with an OTP sent
            to your email.
          </p>

          {deleteOtpError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {deleteOtpError}
            </div>
          )}

          {!otpSent ? (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
              <p className="text-sm">
                Click "Send OTP" to receive a verification code at your email
                address.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                <p className="text-sm">
                  ✓ OTP has been sent to your email. Please enter it below.
                </p>
              </div>

              <OTPInput
                label="Enter OTP"
                value={deleteOtp}
                onChange={setDeleteOtp}
                length={6}
              />
            </>
          )}

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowOtpModal(false);
                setSelectedUser(null);
                setDeleteOtp("");
                setOtpSent(false);
                setDeleteOtpError("");
              }}
              className="w-full sm:w-auto"
              disabled={otpLoading}
            >
              Cancel
            </Button>

            {!otpSent ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleSendOtpForClinicStaffDeletion}
                disabled={otpLoading}
                className="w-full sm:w-auto"
              >
                {otpLoading ? "Sending..." : "Send OTP"}
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={handleConfirmClinicStaffDeletion}
                disabled={otpLoading || !deleteOtp || deleteOtp.length !== 6}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
              >
                {otpLoading ? "Verifying..." : "Verify & Delete"}
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
