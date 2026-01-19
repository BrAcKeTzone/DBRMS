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
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    studentId: "",
    date: new Date().toISOString().slice(0, 16),
    reason: "",
    notes: "",
    isEmergency: false,
    sendSms: true,
    isReferredToHospital: false,
    hospitalName: "",
    bloodPressure: "",
    temperature: "",
    pulseRate: "",
    treatment: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleNumericInputChange = (e, fieldName) => {
    const value = e.target.value;
    // Allow only numbers and a single decimal point
    let sanitizedValue = value.replace(/[^0-9.]/g, "");
    // Ensure only one decimal point is present
    const parts = sanitizedValue.split(".");
    if (parts.length > 2) {
      sanitizedValue = parts[0] + "." + parts.slice(1).join("");
    }
    setForm({ ...form, [fieldName]: sanitizedValue });
  };

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

  const handleLogVisit = async (e) => {
    e && e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        studentId: parseInt(form.studentId),
        visitDateTime: form.date ? new Date(form.date) : new Date(),
        symptoms: form.reason,
        diagnosis: form.notes,
        isEmergency: !!form.isEmergency,
        isReferredToHospital: !!form.isReferredToHospital,
        hospitalName: form.hospitalName,
        bloodPressure: form.bloodPressure,
        temperature: form.temperature,
        pulseRate: form.pulseRate,
        treatment: form.treatment,
      };

      await clinicVisitsApi.create(payload);
      await loadData(); // Refresh data
      setShowLogModal(false);
      setStep(1);
      setForm({
        studentId: "",
        date: new Date().toISOString().slice(0, 16),
        reason: "",
        notes: "",
        isEmergency: false,
        sendSms: true,
        isReferredToHospital: false,
        hospitalName: "",
        bloodPressure: "",
        temperature: "",
        pulseRate: "",
        treatment: "",
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
                    <th className="px-3 py-2">SMS</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((v) => (
                    <tr key={v.id} className="border-t">
                      <td className="px-3 py-3 text-sm text-gray-900">
                        {v.student.firstName} {v.student.lastName}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {v.visitDateTime ? formatDate(v.visitDateTime) : "N/A"}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {v.symptoms || "N/A"}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {v.smsLog ? "Yes" : "No"}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {v.isEmergency ? "Emergency" : "Routine"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden space-y-3">
              {visits.map((v) => (
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
          setStep(1);
          setForm({
            studentId: "",
            date: new Date().toISOString().slice(0, 16),
            reason: "",
            notes: "",
            isEmergency: false,
            sendSms: true,
            isReferredToHospital: false,
            hospitalName: "",
            bloodPressure: "",
            temperature: "",
            pulseRate: "",
            treatment: "",
          });
        }}
        title={
          step === 1
            ? "Select a Student"
            : `Log Visit for ${
                students.find((s) => s.id === form.studentId)?.firstName || ""
              } ${
                students.find((s) => s.id === form.studentId)?.lastName || ""
              }`
        }
        size="full"
      >
        {step === 1 ? (
          <div className="flex flex-col h-[calc(100vh-200px)]">
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
            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setShowLogModal(false);
                  setStep(1);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!form.studentId}
                onClick={() => setStep(2)}
                variant="primary"
              >
                Confirm
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full overflow-y-auto">
            <form onSubmit={handleLogVisit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Reason / Symptoms
                  </label>
                  <Input
                    value={form.reason}
                    onChange={(e) =>
                      setForm({ ...form, reason: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Pressure (mmHg)
                  </label>
                  <Input
                    value={form.bloodPressure}
                    onChange={(e) =>
                      handleNumericInputChange(e, "bloodPressure")
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperature (°C)
                  </label>
                  <Input
                    value={form.temperature}
                    onChange={(e) => handleNumericInputChange(e, "temperature")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pulse Rate (bpm)
                  </label>
                  <Input
                    value={form.pulseRate}
                    onChange={(e) => handleNumericInputChange(e, "pulseRate")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Treatment
                </label>
                <textarea
                  value={form.treatment}
                  onChange={(e) =>
                    setForm({ ...form, treatment: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnosis / Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={4}
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
                  />
                  <span className="text-sm font-medium text-gray-900">
                    Mark as Emergency
                  </span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isReferredToHospital}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        isReferredToHospital: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    Referred to Hospital
                  </span>
                </label>
              </div>

              {form.isReferredToHospital && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hospital Name
                  </label>
                  <Input
                    value={form.hospitalName}
                    onChange={(e) =>
                      setForm({ ...form, hospitalName: e.target.value })
                    }
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button type="submit" disabled={submitting} variant="primary">
                  {submitting ? "Logging Visit..." : "Log Visit"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ClinicVisitLogging;
