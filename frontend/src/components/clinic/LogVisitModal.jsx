import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { clinicVisitsApi } from "../../api/clinicVisitsApi";

const LogVisitModal = ({
  isOpen,
  onClose,
  students,
  onSuccess,
  initialStudent,
}) => {
  const getLocalDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const [step, setStep] = useState(1);
  const [studentSearch, setStudentSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    date: getLocalDateTime(),
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

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (initialStudent) {
        setStep(2);
        setForm({
          studentId: initialStudent.id,
          date: getLocalDateTime(),
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
      } else {
        setStep(1);
        setStudentSearch("");
        setForm({
          studentId: "",
          date: getLocalDateTime(),
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
      }
    }
  }, [isOpen, initialStudent]);

  const handleBloodPressureChange = (e) => {
    const value = e.target.value;
    let sanitizedValue = value.replace(/[^0-9/]/g, "");
    const parts = sanitizedValue.split("/");
    if (parts.length > 2) {
      sanitizedValue = parts[0] + "/" + parts.slice(1).join("");
    }
    setForm({ ...form, bloodPressure: sanitizedValue });
  };

  const handleNumericInputChange = (e, fieldName) => {
    const value = e.target.value;
    let sanitizedValue = value.replace(/[^0-9.]/g, "");
    const parts = sanitizedValue.split(".");
    if (parts.length > 2) {
      sanitizedValue = parts[0] + "." + parts.slice(1).join("");
    }
    setForm({ ...form, [fieldName]: sanitizedValue });
  };

  const handleIntegerInputChange = (e, fieldName) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(/[^0-9]/g, "");
    setForm({ ...form, [fieldName]: sanitizedValue });
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
      if (onSuccess) await onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to log visit");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedStudent = students.find((s) => s.id === form.studentId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        step === 1
          ? "Select a Student"
          : `Log Visit for ${
              selectedStudent?.firstName || initialStudent?.firstName || ""
            } ${selectedStudent?.lastName || initialStudent?.lastName || ""}`
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
                  (s.middleName || "").toLowerCase().includes(q) ||
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
            <Button variant="outline" type="button" onClick={onClose}>
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
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
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
                  onChange={handleBloodPressureChange}
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
                  onChange={(e) => handleIntegerInputChange(e, "pulseRate")}
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
                onClick={() => (initialStudent ? onClose() : setStep(1))}
              >
                {initialStudent ? "Cancel" : "Back"}
              </Button>
              <Button type="submit" disabled={submitting} variant="primary">
                {submitting ? "Logging Visit..." : "Log Visit"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};

export default LogVisitModal;
