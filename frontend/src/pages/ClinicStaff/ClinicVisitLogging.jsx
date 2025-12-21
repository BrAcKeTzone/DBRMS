import React, { useEffect, useState } from "react";
import { studentsApi } from "../../api/studentsApi";
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
  const [search, setSearch] = useState("");

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
      await loadVisits();
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadVisits = async () => {
    try {
      const resp = await studentsApi.getMeetings({});
      // resp from dummy service is createResponse({ meetings: [] }) - adapt
      const data =
        resp?.data || resp?.success ? resp.data || resp : { meetings: [] };
      setVisits(data.meetings || []);
    } catch (err) {
      console.error("Failed to load visits", err);
      setVisits([]);
    }
  };

  const handleLogVisit = async (e) => {
    e && e.preventDefault();
    setSubmitting(true);
    try {
      // This demo doesn't post to backend, simulate adding to local list
      const newVisit = {
        id: `v_${Date.now()}`,
        studentId: form.studentId,
        studentName:
          (students || []).find((s) => s.id === form.studentId)?.firstName ||
          "Unknown",
        date: form.date || new Date().toISOString(),
        reason: form.reason,
        notes: form.notes,
        isEmergency: !!form.isEmergency,
        sentSms: !!form.sendSms,
        status: "COMPLETED",
      };
      setVisits((prev) => [newVisit, ...prev]);
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
    }
    setSubmitting(false);
  };

  const filteredVisits = visits.filter((v) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (v.studentName || "").toLowerCase().includes(q) ||
      (v.reason || "").toLowerCase().includes(q)
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
            onClick={() => loadVisits()}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardCard title="Total Visits" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">
            {visits.length}
          </div>
          <p className="text-xs text-gray-500 mt-1">Recent logged visits</p>
        </DashboardCard>

        <DashboardCard title="Emergencies" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-red-600">
            {visits.filter((v) => v.isEmergency).length}
          </div>
          <p className="text-xs text-gray-500 mt-1">Flagged emergencies</p>
        </DashboardCard>

        <DashboardCard title="SMS Sent" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600">
            {visits.filter((v) => v.sentSms).length}
          </div>
          <p className="text-xs text-gray-500 mt-1">Notifications sent</p>
        </DashboardCard>

        <DashboardCard title="Pending Actions" className="text-center">
          <div className="text-sm text-gray-700">
            Manage follow-ups and referrals
          </div>
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
        onClose={() => setShowLogModal(false)}
        title="Log New Visit"
        size="md"
      >
        <form onSubmit={handleLogVisit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md bg-white"
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              required
            >
              <option value="">Select a student</option>
              {(students || []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} — {s.studentId}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason
            </label>
            <Input
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            ></textarea>
          </div>

          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isEmergency}
                onChange={(e) =>
                  setForm({ ...form, isEmergency: e.target.checked })
                }
              />{" "}
              <span className="text-sm">Emergency</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.sendSms}
                onChange={(e) =>
                  setForm({ ...form, sendSms: e.target.checked })
                }
              />{" "}
              <span className="text-sm">Send SMS to parent</span>
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setShowLogModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Logging..." : "Log Visit"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClinicVisitLogging;
