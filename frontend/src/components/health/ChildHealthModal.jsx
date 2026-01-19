import React from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { formatDate } from "../../utils/formatDate";

const ChildHealthModal = ({ isOpen, onClose, selectedChild }) => {
  if (!selectedChild) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Child Health Details"
        size="full"
      >
        <div className="p-6 text-center text-gray-500">No data</div>
      </Modal>
    );
  }

  const sortedVisits = [...(selectedChild.clinicVisits || [])].sort(
    (a, b) =>
      new Date(b.visitDateTime || b.date) - new Date(a.visitDateTime || a.date),
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Child Health Details"
      size="full"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase">
              Name
            </div>
            <div className="font-medium text-gray-900">
              {selectedChild.firstName} {selectedChild.lastName}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase">
              Student ID
            </div>
            <div className="font-medium text-gray-900">
              {selectedChild.studentId || "N/A"}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase">
              Blood Type
            </div>
            <div className="font-medium text-gray-900">
              {selectedChild.healthMetrics?.[0]?.bloodType || "N/A"}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase">
              Allergies
            </div>
            <div className="font-medium text-gray-900">
              {selectedChild.healthMetrics?.[0]?.allergies || "None"}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-bold text-gray-900 mb-3">
            Visit History
          </h4>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Symptoms
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Blood Pressure
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Temp
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Pulse
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Diagnosis
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Treatment
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Emergency
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Referred
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Hospital
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedVisits.length === 0 ? (
                  <tr>
                    <td
                      colSpan="10"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No visits recorded
                    </td>
                  </tr>
                ) : (
                  sortedVisits.map((v) => (
                    <tr
                      key={v.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(v.visitDateTime || v.date)}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {v.symptoms || "N/A"}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {v.bloodPressure || "N/A"}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {v.temperature ? `${v.temperature}°C` : "N/A"}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {v.pulseRate ? `${v.pulseRate} bpm` : "N/A"}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {v.diagnosis || "N/A"}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {v.treatment || "N/A"}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${v.isEmergency ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}
                        >
                          {v.isEmergency ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {v.isReferredToHospital ? "Yes" : "No"}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {v.hospitalName || "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="px-8">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ChildHealthModal;
