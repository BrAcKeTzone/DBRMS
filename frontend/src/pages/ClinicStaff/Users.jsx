import React, { useState, useEffect } from "react";
import { useUserManagementStore } from "../../store/userManagementStore";
import { useAuthStore } from "../../store/authStore";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Pagination from "../../components/ui/Pagination";
import StatusBadge from "../../components/ui/StatusBadge";
import DashboardCard from "../../components/dashboard/DashboardCard";
import { formatDate, formatDateOnly } from "../../utils/formatDate";
import { getRoleLabel, getRoleBadgeClasses } from "../../utils/helpers";

const UsersManagement = () => {
  const { user: currentUser } = useAuthStore();
  const {
    users,
    loading,
    error,
    totalCount,
    totalPages,
    currentPage,
    hasNextPage,
    hasPrevPage,
    pageSize,
    filters,
    sortBy,
    sortOrder,
    getAllUsers,
    setSorting,
    setPageSize,
    setCurrentPage,
    addUser,
    updateUser,
    deleteUser,
    getUserStats,
    clearError,
  } = useUserManagementStore();

  const [stats, setStats] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    role: "PARENT_GUARDIAN",
    phone: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [createError, setCreateError] = useState(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, sortBy, sortOrder, filters]);

  const fetchData = async () => {
    await getAllUsers();
    const statsData = await getUserStats();
    setStats(statsData);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSorting(column, sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSorting(column, "asc");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    // Client-side validation for password match
    if (!newUser.password || newUser.password.length < 6) {
      setCreateError("Password must be at least 6 characters");
      return;
    }

    if (newUser.password !== confirmPassword) {
      setCreateError("Passwords do not match");
      return;
    }

    setCreateError(null);

    try {
      await addUser({
        firstName: newUser.firstName,
        middleName: newUser.middleName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        password: newUser.password,
      });
      setShowCreateModal(false);
      setNewUser({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        password: "",
        role: "PARENT_GUARDIAN",
        phone: "",
      });
      setConfirmPassword("");
      setCreateError(null);
      fetchData();
    } catch (error) {
      console.error("Error creating user:", error);
      // Show any server-side validation error
      setCreateError(error.response?.data?.message || error.message);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      await updateUser(selectedUser.id, selectedUser);
      setShowEditModal(false);
      setSelectedUser(null);
      fetchData();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(userId);
        fetchData();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  // Handle search and filter
  const handleSearchAndFilter = () => {
    let result = [...users];

    // Apply search query (search in firstName, lastName, email)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((user) => {
        const fullName = `${user.firstName} ${user.middleName || ""} ${
          user.lastName
        }`.toLowerCase();
        const email = user.email?.toLowerCase() || "";
        const phone = user.phone?.toLowerCase() || "";
        return (
          fullName.includes(query) ||
          email.includes(query) ||
          phone.includes(query)
        );
      });
    }

    // Apply role filter
    if (filterRole) {
      if (filterRole === "CLINIC_STAFF") {
        // include both clinic admin and staff under Clinic Staff umbrella
        result = result.filter((user) =>
          ["CLINIC_ADMIN", "CLINIC_STAFF"].includes(user.role)
        );
      } else {
        result = result.filter((user) => user.role === filterRole);
      }
    }

    // Apply status filter
    if (filterStatus) {
      const isActive = filterStatus === "ACTIVE";
      result = result.filter((user) => user.isActive === isActive);
    }

    // Apply date range filter
    if (filterDateFrom) {
      const dateFrom = new Date(filterDateFrom);
      result = result.filter((user) => new Date(user.createdAt) >= dateFrom);
    }

    if (filterDateTo) {
      const dateTo = new Date(filterDateTo);
      dateTo.setHours(23, 59, 59, 999); // Set to end of day
      result = result.filter((user) => new Date(user.createdAt) <= dateTo);
    }

    setFilteredUsers(result);
    setHasAppliedFilters(true);
    setCurrentPage(1); // Reset to first page after filtering
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterRole("");
    setFilterStatus("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilteredUsers([]);
    setHasAppliedFilters(false);
    setCurrentPage(1);
  };

  const userColumns = [
    {
      key: "firstName",
      header: "User",
      sortable: true,
      render: (user) => (
        <div>
          <div className="flex items-center gap-2">
            <div className="font-medium text-gray-900">
              {user.firstName} {user.middleName ? user.middleName + " " : ""}
              {user.lastName}
            </div>
            {user.id === currentUser?.id && (
              <span className="px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                You
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">{user.email}</div>
          {user.phone && (
            <div className="text-xs text-gray-500">{user.phone}</div>
          )}
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (user) => (
        <StatusBadge className={getRoleBadgeClasses(user.role)}>
          {getRoleLabel(user.role)}
        </StatusBadge>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      sortable: true,
      render: (user) => (
        <StatusBadge
          status={user.isActive ? "Active" : "Inactive"}
          variant={user.isActive ? "success" : "warning"}
        />
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      sortable: true,
      render: (user) => (
        <div>
          <div className="text-sm text-gray-900">
            {formatDateOnly(user.createdAt)}
          </div>
          <div className="text-xs text-gray-500">
            Updated: {formatDateOnly(user.updatedAt)}
          </div>
        </div>
      ),
    },
    {
      key: "_count",
      header: "Activity",
      render: (user) => (
        <div className="text-xs text-gray-600">
          <div>Students: {user._count?.students || 0}</div>
          <div>Link Requests: {user._count?.linkRequests || 0}</div>
          <div>Activity Logs: {user._count?.activityLogs || 0}</div>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (user) => (
        <div className="flex space-x-2">
          {user.id !== currentUser?.id && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedUser(user);
                  setShowEditModal(true);
                }}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteUser(user.id)}
                className="text-red-600 hover:text-red-700"
              >
                Delete
              </Button>
            </>
          )}
          {user.id === currentUser?.id && (
            <span className="text-xs text-gray-500">Current User</span>
          )}
        </div>
      ),
    },
  ];

  if (loading && !users.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Users Management
          </h1>
          <p className="text-gray-600">
            Manage user accounts with advanced filtering and sorting
          </p>
        </div>
        <Button
          onClick={() => {
            setShowCreateModal(true);
            setCreateError(null);
            setConfirmPassword("");
          }}
          variant="primary"
          className="w-full md:w-auto whitespace-nowrap"
        >
          Add New User
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={clearError}
          >
            <span className="sr-only">Dismiss</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <DashboardCard title="Total Users" className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">
              {stats.totalUsers}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Active: {stats.activeUsers} | Inactive: {stats.inactiveUsers}
            </p>
          </DashboardCard>

          <DashboardCard title="Parents" className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-600">
              {stats.parentCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              With Students: {stats.usersWithStudents}
            </p>
          </DashboardCard>

          <DashboardCard title="Admins" className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600">
              {stats.adminCount}
            </div>
          </DashboardCard>

          <DashboardCard title="Recent Users" className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600">
              {stats.recentUsers}
            </div>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </DashboardCard>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Search & Filter Users
        </h3>

        <div className="space-y-4">
          {/* Search Input */}
          <div>
            <label
              htmlFor="users-search"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Search by Name, Email, or Phone
            </label>
            <Input
              id="users-search"
              type="text"
              placeholder="e.g., John Doe, john@email.com, +63-123-456-7890"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Roles</option>
                <option value="CLINIC_STAFF">Clinic Staff</option>
                <option value="PARENT_GUARDIAN">Parent/Guardians</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Date From Filter */}
            <div>
              <label
                htmlFor="joined-from"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Joined From
              </label>
              <input
                id="joined-from"
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date To Filter */}
            <div>
              <label
                htmlFor="joined-to"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Joined To
              </label>
              <input
                id="joined-to"
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <Button
              onClick={handleSearchAndFilter}
              variant="primary"
              className="w-full sm:w-auto whitespace-nowrap"
            >
              🔍 Search & Filter
            </Button>
            <Button
              onClick={handleClearFilters}
              variant="outline"
              className="w-full sm:w-auto whitespace-nowrap"
            >
              ✕ Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <DashboardCard
        title={`Users (${
          hasAppliedFilters ? filteredUsers.length : totalCount || 0
        })`}
        headerActions={
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 font-medium">Show:</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-700">entries</span>
          </div>
        }
      >
        {(
          hasAppliedFilters
            ? filteredUsers.length > 0
            : users && users.length > 0
        ) ? (
          <div className="mt-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Table
                data={hasAppliedFilters ? filteredUsers : users}
                columns={userColumns}
                emptyMessage="No users found"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                loading={loading}
              />
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading users...</p>
                </div>
              ) : (hasAppliedFilters ? filteredUsers : users) &&
                (hasAppliedFilters ? filteredUsers.length : users.length) >
                  0 ? (
                <div className="p-4 space-y-4">
                  {(hasAppliedFilters ? filteredUsers : users).map((user) => (
                    <div
                      key={user.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 break-words">
                            {user.firstName} {user.middleName} {user.lastName}
                          </h3>
                          <p className="text-sm text-gray-500 break-all">
                            {user.email}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={getRoleBadgeClasses(user.role)}>
                              {getRoleLabel(user.role)}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* User Details */}
                      <div className="text-sm text-gray-600 space-y-1 mb-4">
                        <div className="flex justify-between">
                          <span>Phone:</span>
                          <span className="break-all">
                            {user.contactNumber || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Address:</span>
                          <span className="break-all text-right">
                            {user.address || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Joined:</span>
                          <span>{formatDateOnly(user.createdAt)}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-3 border-t border-gray-100">
                        <Button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          size="sm"
                          variant="outline"
                          className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No users found
                </div>
              )}
            </div>

            {/* Pagination */}
            {(hasAppliedFilters
              ? filteredUsers.length > 0
              : users && users.length > 0) && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  hasNext={hasNextPage}
                  hasPrev={hasPrevPage}
                  totalItems={
                    hasAppliedFilters ? filteredUsers.length : totalCount
                  }
                  itemsPerPage={pageSize}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            {loading ? "Loading users..." : "No users found"}
          </div>
        )}
      </DashboardCard>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setCreateError(null);
          setConfirmPassword("");
        }}
        title="Add New User"
        size="lg"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 sm:space-y-6">
          {createError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              {createError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={newUser.firstName}
              onChange={(e) =>
                setNewUser({ ...newUser, firstName: e.target.value })
              }
              required
            />
            <Input
              label="Middle Name"
              value={newUser.middleName}
              onChange={(e) =>
                setNewUser({ ...newUser, middleName: e.target.value })
              }
            />
            <Input
              label="Last Name"
              value={newUser.lastName}
              onChange={(e) =>
                setNewUser({ ...newUser, lastName: e.target.value })
              }
              required
            />
            <Input
              label="Phone"
              type="tel"
              value={newUser.phone}
              onChange={(e) =>
                setNewUser({ ...newUser, phone: e.target.value })
              }
              placeholder="+63-XXX-XXX-XXXX"
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
          />

          <PasswordInput
            label="Password"
            name="password"
            value={newUser.password}
            onChange={(e) => {
              setNewUser({ ...newUser, password: e.target.value });
              if (createError) setCreateError(null);
            }}
            required
            placeholder="Minimum 6 characters"
          />

          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (createError) setCreateError(null);
            }}
            required
            placeholder="Re-enter password"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="CLINIC_STAFF">Clinic Staff</option>
              <option value="PARENT_GUARDIAN">Parent/Guardian</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
        size="lg"
      >
        {selectedUser && (
          <form onSubmit={handleEditUser} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={selectedUser.firstName || ""}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    firstName: e.target.value,
                  })
                }
                required
              />

              <Input
                label="Last Name"
                value={selectedUser.lastName || ""}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    lastName: e.target.value,
                  })
                }
                required
              />

              <Input
                label="Middle Name"
                value={selectedUser.middleName || ""}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    middleName: e.target.value,
                  })
                }
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={selectedUser.email}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, email: e.target.value })
              }
              required
            />

            <Input
              label="Phone"
              value={selectedUser.phone || ""}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, phone: e.target.value })
              }
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                value={selectedUser.role}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, role: e.target.value })
                }
              >
                <option value="CLINIC_STAFF">Clinic Staff</option>
                <option value="PARENT_GUARDIAN">Parent/Guardian</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={selectedUser.isActive}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    isActive: e.target.checked,
                  })
                }
                className="mr-2"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-gray-700"
              >
                User is active
              </label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update User</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default UsersManagement;
