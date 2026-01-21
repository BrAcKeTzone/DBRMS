import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentsStore } from "../../store/studentsStore";
import { useUserManagementStore } from "../../store/userManagementStore";
import DashboardCard from "../../components/dashboard/DashboardCard";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { formatDate } from "../../utils/formatDate";
import { useAuthStore } from "../../store/authStore";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    students,
    fetchAllStudents,
    loading: studentsLoading,
    getStudentStatistics,
  } = useStudentsStore();

  const { getUserStats } = useUserManagementStore();

  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sexData, setSexData] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // Fetch a reasonable sample for dashboard lists
      await fetchAllStudents({ page: 1, limit: 50 });
      // Local computed stats (from the store)
      const s = getStudentStatistics();
      setStats(s);

      // Prepare sex distribution data for pie chart
      const sexDistribution = [
        {
          name: "Male",
          value: s?.sexCounts?.MALE || 0,
          color: "#3B82F6",
        },
        {
          name: "Female",
          value: s?.sexCounts?.FEMALE || 0,
          color: "#EC4899",
        },
      ];
      setSexData(sexDistribution);

      // Fetch user stats (parents/admins)
      try {
        const resp = await getUserStats();
        setUserStats(resp);
      } catch (err) {
        setUserStats(null);
      }

      setLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recentStudents = (students || []).slice(0, 6);

  const user = useAuthStore((s) => s.user);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Clinic Dashboard
          </h1>
          <p className="text-gray-600">
            Overview of students, users and recent activity
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto">
          <Button
            onClick={() => navigate("/clinic/students")}
            variant="outline"
            className="w-full"
          >
            Manage Students
          </Button>

          {user?.role === "CLINIC_ADMIN" && (
            <Button
              onClick={() => navigate("/clinic/users")}
              variant="outline"
              className="w-full"
            >
              Manage Users
            </Button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <DashboardCard title="Students" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">
            {stats ? stats.total : "—"}
          </div>
        </DashboardCard>

        <DashboardCard title="Parents/Guardians" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600">
            {userStats?.parentCount ?? "—"}
          </div>
        </DashboardCard>
      </div>

      {/* Sex Distribution Chart */}
      <div className="max-w-md mx-auto">
        <DashboardCard title="Students by Sex" className="text-center">
          <div className="h-64">
            {loading || sexData.every((item) => item.value === 0) ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                {loading ? <LoadingSpinner /> : "No data available"}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sexData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sexData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, "Students"]}
                    labelFormatter={(label) => `${label} Students`}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry) =>
                      `${value}: ${entry.payload.value}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </DashboardCard>
      </div>

      {/* Recent students list */}
      <DashboardCard title={`Recent Students (${recentStudents.length})`}>
        {loading || studentsLoading ? (
          <div className="flex items-center justify-center h-40">
            <LoadingSpinner />
          </div>
        ) : recentStudents.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No students found</div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-3 py-2">Student</th>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Course</th>
                    <th className="px-3 py-2">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="px-3 py-3 text-sm text-gray-900">
                        {s.firstName} {s.middleName ? s.middleName + " " : ""}
                        {s.lastName}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {s.studentId || "N/A"}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {s.course
                          ? `${s.course.code} - ${s.course.name}`
                          : "N/A"}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {s.createdAt
                          ? new Date(s.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="lg:hidden space-y-3">
              {recentStudents.map((s) => (
                <div
                  key={s.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        {s.firstName} {s.middleName ? s.middleName + " " : ""}
                        {s.lastName}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        ID: {s.studentId || "N/A"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {s.course
                          ? `${s.course.code} - ${s.course.name}`
                          : "No course"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Added:{" "}
                        {s.createdAt
                          ? new Date(s.createdAt).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </DashboardCard>
    </div>
  );
};

export default AdminDashboard;
