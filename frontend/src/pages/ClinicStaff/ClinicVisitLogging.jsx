import React, { useEffect, useState } from "react";
import { clinicVisitsApi } from "../../api/clinicVisitsApi";
import { useStudentsStore } from "../../store/studentsStore";
import DashboardCard from "../../components/dashboard/DashboardCard";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
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
  const [studentSearch, setStudentSearch] = useState("");

  const [showLogModal, setShowLogModal] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    date: "",
    reason: "",
    notes: "",
    isEmergency: false,
    sendSms: true,
  });
  const [submitting, setSubmitting] = useState(false);

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

  const loadData = async () => {
    try {
      const [visitsResp, statsResp] = await Promise.all([
        clinicVisitsApi.getAll(),
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

  const handleLogVisit = async (e) => {
    e && e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        studentId: parseInt(form.studentId),
        visitDateTime: form.date ? new Date(form.date) : new Date(),
        symptoms: form.reason, // Mapping reason to symptoms as per schema
        diagnosis: form.notes, // Mapping notes to diagnosis
        isEmergency: !!form.isEmergency,
        // Add other fields as needed by schema or form
      };

      await clinicVisitsApi.create(payload);
      await loadData(); // Refresh data
      setShowLogModal(false);
      setForm({
        studentId: "",
        date: "",
        reason: "",
        notes: "",
        isEmergency: false,
        sendSms: true,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to log visit");
    }
    setSubmitting(false);
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name or reason"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md bg-white"
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            >
              <option value="">All</option>
              {(students || []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} — {s.studentId}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setSearch("");
                setForm({ ...form, studentId: "" });
              }}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Clear
            </Button>
            <Button
              onClick={() => {
                setSearch("");
                loadVisits();
              }}
              variant="primary"
              className="w-full sm:w-auto"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>

      {/* Visits list - responsive */}
      <DashboardCard title={`Recent Visits (${filteredVisits.length})`}>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <LoadingSpinner />
          </div>
        ) : filteredVisits.length === 0 ? (
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
                    <th className="px-3 py-2">SMS</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVisits.map((v) => (
                    <tr key={v.id} className="border-t">
                      <td className="px-3 py-3 text-sm text-gray-900">
                        {v.studentName || "Unknown"}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {v.date ? formatDate(v.date) : "N/A"}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {v.reason || "N/A"}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {v.sentSms ? "Yes" : "No"}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {v.status || "N/A"}
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
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {v.studentName || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {v.date ? formatDate(v.date) : "N/A"}
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        {v.reason}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2">
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => {
                        setSelectedVisit && setSelectedVisit(v);
                      }}
                    >
                      View
                    </Button>
                    <Button
                      className="w-full"
                      variant={v.isEmergency ? "danger" : "outline"}
                    >
                      {v.isEmergency ? "Emergency" : "Mark Follow-up"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </DashboardCard>

      {/* Log Visit Modal */}
      <Modal
        isOpen={showLogModal}
        onClose={() => {
          setShowLogModal(false);
          setForm({
            studentId: "",
            date: "",
            reason: "",
            notes: "",
            isEmergency: false,
            sendSms: true,
          });
        }}
        title={form.studentId ? "Log New Visit" : "Select a Student"}
        size="full"
      >
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-200px)]">
          {/* Left Side: Student Search & List */}
          <div
            className={`w-full ${
              form.studentId ? "md:w-1/3" : "md:w-full"
            } flex flex-col md:border-r pr-4 transition-all duration-300`}
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Student
              </label>
              <Input
                placeholder="Type name or ID..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {(students || [])
                .filter((s) => {
                  const q = studentSearch.toLowerCase();
                  return (
                    s.firstName.toLowerCase().includes(q) ||
                    s.middleName.toLowerCase().includes(q) ||
                    s.lastName.toLowerCase().includes(q) ||
                    s.studentId.toLowerCase().includes(q)
                  );
                })
                .sort((a, b) => a.lastName.localeCompare(b.lastName))
                .map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setForm({ ...form, studentId: s.id })}
                    className={`p-3 rounded cursor-pointer border transition-colors ${
                      form.studentId == s.id
                        ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500"
                        : "hover:bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="font-bold text-gray-900 flex items-center gap-2">
                      <span
                        className={`font-bold text-lg ${
                          s.sex === "MALE" ? "text-blue-600" : "text-pink-600"
                        }`}
                      >
                        {s.sex === "MALE" ? "♂" : "♀"}
                      </span>
                      <span>
                        {s.lastName}, {s.firstName} {s.middleName}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex justify-between mt-1">
                      <span>ID: {s.studentId}</span>
                      <div className="flex gap-2">
                        <span>
                          {new Date(s.birthDate).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <span>{s.course?.code}</span>
                    </div>
                  </div>
                ))}
              {(students || []).length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No students found
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Form */}
          {form.studentId && (
            <div className="w-full md:w-2/3 pl-0 md:pl-2 overflow-y-auto">
              <form onSubmit={handleLogVisit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={form.date}
                      onChange={(e) =>
                        setForm({ ...form, date: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                      disabled={!form.studentId}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason / Symptoms
                    </label>
                    <Input
                      value={form.reason}
                      onChange={(e) =>
                        setForm({ ...form, reason: e.target.value })
                      }
                      required
                      disabled={!form.studentId}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnosis / Notes
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={6}
                    disabled={!form.studentId}
                  ></textarea>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isEmergency}
                      onChange={(e) =>
                        setForm({ ...form, isEmergency: e.target.checked })
                      }
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                      disabled={!form.studentId}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      Mark as Emergency
                    </span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.sendSms}
                      onChange={(e) =>
                        setForm({ ...form, sendSms: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      disabled={!form.studentId}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      Send SMS Notification to Parent
                    </span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowLogModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || !form.studentId}
                    variant="primary"
                  >
                    {submitting ? "Logging Visit..." : "Log Visit"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ClinicVisitLogging;
