import React, { useEffect, useState } from "react";
import { clinicVisitsApi } from "../../api/clinicVisitsApi";
import { useStudentsStore } from "../../store/studentsStore";
import DashboardCard from "../../components/dashboard/DashboardCard";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LogVisitModal from "../../components/clinic/LogVisitModal";
import ChildHealthModal from "../../components/health/ChildHealthModal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { formatDate } from "../../utils/formatDate";

const ClinicVisitLogging = () => {
  const { students, fetchAllStudents } = useStudentsStore();
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState([]);
  const [stats, setStats] = useState({
    totalVisits: 0,
    visitsToday: 0,
    emergencyVisits: 0,
  });
  const [search, setSearch] = useState("");

  const [showLogModal, setShowLogModal] = useState(false);

  const [showHealthModal, setShowHealthModal] = useState(false);
  const [selectedStudentForHealth, setSelectedStudentForHealth] =
    useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchAllStudents({ page: 1, limit: 100 });
      await loadData();
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async (searchQuery) => {
    try {
      const [visitsResp, statsResp] = await Promise.all([
        clinicVisitsApi.getAll({ search: searchQuery }),
        clinicVisitsApi.getStats(),
      ]);

      const visitsData = visitsResp?.data?.data || visitsResp?.data || [];
      setVisits(Array.isArray(visitsData) ? visitsData : []);

      const statsData = statsResp?.data?.data || statsResp?.data || {};
      setStats({
        totalVisits: statsData.totalVisits || 0,
        visitsToday: statsData.visitsToday || 0,
        emergencyVisits: statsData.emergencyVisits || 0,
      });
    } catch (err) {
      console.error("Failed to load clinic data", err);
    }
  };

  const filteredVisits = visits.filter((v) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const studentName = v.student
      ? `${v.student.firstName} ${v.student.lastName}`
      : "Unknown";
    return (
      studentName.toLowerCase().includes(q) ||
      (v.symptoms || "").toLowerCase().includes(q) ||
      (v.diagnosis || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Clinic Visit Logging
          </h1>
          <p className="text-gray-600">
            Log clinic visits and track recent activity
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <Button
            onClick={() => setShowLogModal(true)}
            variant="primary"
            className="w-full sm:w-auto"
          >
            Log New Visit
          </Button>
          <Button
            onClick={() => loadData()}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <DashboardCard title="Visits Today" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">
            {stats.visitsToday}
          </div>
          <p className="text-xs text-gray-500 mt-1">Logged today</p>
        </DashboardCard>

        <DashboardCard title="Total Visits" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600">
            {stats.totalVisits}
          </div>
          <p className="text-xs text-gray-500 mt-1">All time</p>
        </DashboardCard>

        <DashboardCard title="Emergencies" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-red-600">
            {stats.emergencyVisits}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Total flagged emergencies
          </p>
        </DashboardCard>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name or reason"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setSearch("");
                loadData("");
              }}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Clear
            </Button>
            <Button
              onClick={() => loadData(search)}
              variant="primary"
              className="w-full sm:w-auto"
            >
              Retrieve
            </Button>
          </div>
        </div>
      </div>

      {/* Visits list - responsive */}
      <DashboardCard title={`Recent Visits (${visits.length})`}>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <LoadingSpinner />
          </div>
        ) : visits.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No visits logged</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-3 py-2">Student</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Reason</th>
                    <th className="px-3 py-2">Hospital Referred</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((v) => (
                    <tr
                      key={v.id}
                      className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedStudentForHealth(v.student);
                        setShowHealthModal(true);
                      }}
                    >
                      <td className="px-3 py-3 text-sm text-gray-900 flex items-center">
                        <span
                          className={`inline-block w-2 h-2 rounded-full mr-2 ${v.isEmergency ? "bg-red-600" : "bg-blue-600"}`}
                          aria-hidden="true"
                        ></span>
                        {v.student.firstName} {v.student.lastName}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {v.visitDateTime ? formatDate(v.visitDateTime) : "N/A"}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {v.symptoms || "N/A"}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {v.isReferredToHospital
                          ? v.hospitalName
                            ? v.hospitalName
                            : "Referred"
                          : "No"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden space-y-3">
              {filteredVisits.map((v) => (
                <div
                  key={v.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:border-blue-300 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedStudentForHealth(v.student);
                    setShowHealthModal(true);
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 flex items-center">
                        <span
                          className={`inline-block w-2 h-2 rounded-full mr-2 ${v.isEmergency ? "bg-red-600" : "bg-blue-600"}`}
                          aria-hidden="true"
                        ></span>
                        {v.student
                          ? `${v.student.firstName} ${v.student.lastName}`
                          : "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {v.visitDateTime ? formatDate(v.visitDateTime) : "N/A"}
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        {v.symptoms || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {v.isReferredToHospital
                          ? `Hospital: ${v.hospitalName ? v.hospitalName : "Referred"}`
                          : "Hospital: No"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </DashboardCard>

      <LogVisitModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        students={students}
        onSuccess={() => loadData()}
      />

      <ChildHealthModal
        isOpen={showHealthModal}
        onClose={() => setShowHealthModal(false)}
        selectedChild={selectedStudentForHealth}
      />
    </div>
  );
};

export default ClinicVisitLogging;
