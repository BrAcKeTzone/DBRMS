import React from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { formatDate, formatDateOnly } from "../../utils/formatDate";

const ChildHealthModal = ({ isOpen, onClose, selectedChild }) => {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const sortedVisits = [...(selectedChild.clinicVisits || [])].sort(
      (a, b) =>
        new Date(b.visitDateTime || b.date) -
        new Date(a.visitDateTime || a.date),
    );

    const visitsHTML = sortedVisits
      .map(
        (v) => `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(v.visitDateTime || v.date)}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${v.symptoms || "N/A"}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${v.bloodPressure || "N/A"}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${v.temperature ? `${v.temperature}°C` : "N/A"}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${v.pulseRate ? `${v.pulseRate} bpm` : "N/A"}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${v.diagnosis || "N/A"}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${v.treatment || "N/A"}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${v.isEmergency ? "Yes" : "No"}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${v.isReferredToHospital ? "Yes" : "No"}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${v.hospitalName || "N/A"}</td>
        </tr>
      `,
      )
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Health Record - ${selectedChild.firstName} ${selectedChild.lastName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            h2 { color: #555; margin-top: 20px; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #f5f5f5; border: 1px solid #ddd; padding: 10px; text-align: left; font-weight: bold; }
            td { border: 1px solid #ddd; padding: 8px; }
            .info-section { margin: 20px 0; }
            .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 15px 0; }
            .info-box { border: 1px solid #ddd; padding: 10px; border-radius: 5px; }
            .info-label { font-size: 12px; color: #666; font-weight: bold; text-transform: uppercase; }
            .info-value { font-size: 14px; color: #333; font-weight: 500; margin-top: 5px; }
            @media print {
              body { margin: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Child Health Details</h1>
          <div class="info-section">
            <h2>Personal Information</h2>
            <div class="info-grid">
              <div class="info-box">
                <div class="info-label">Name</div>
                <div class="info-value">${selectedChild.firstName} ${selectedChild.middleName ? selectedChild.middleName + " " : ""}${selectedChild.lastName}</div>
              </div>
              <div class="info-box">
                <div class="info-label">Student ID</div>
                <div class="info-value">${selectedChild.studentId || "N/A"}</div>
              </div>
              <div class="info-box">
                <div class="info-label">Birth Date</div>
                <div class="info-value">${selectedChild.birthDate ? formatDate(selectedChild.birthDate) : "N/A"}</div>
              </div>
              <div class="info-box">
                <div class="info-label">Year Level</div>
                <div class="info-value">${selectedChild.yearLevel || "N/A"}</div>
              </div>
              <div class="info-box">
                <div class="info-label">Course</div>
                <div class="info-value">${selectedChild.course?.name || selectedChild.course?.code || "N/A"}</div>
              </div>
              <div class="info-box">
                <div class="info-label">Emergency Contact</div>
                <div class="info-value">${selectedChild.emergencyContactName || "N/A"}</div>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h2>Health Information</h2>
            <div class="info-grid">
              <div class="info-box">
                <div class="info-label">Blood Type</div>
                <div class="info-value">${selectedChild.bloodType || selectedChild.healthMetrics?.[0]?.bloodType || "N/A"}</div>
              </div>
              <div class="info-box">
                <div class="info-label">Allergies</div>
                <div class="info-value">${selectedChild.allergies || selectedChild.healthMetrics?.[0]?.allergies || "None"}</div>
              </div>
              <div class="info-box">
                <div class="info-label">Height</div>
                <div class="info-value">${selectedChild.height || selectedChild.healthMetrics?.[0]?.heightCm || "N/A"} ${selectedChild.height || selectedChild.healthMetrics?.[0]?.heightCm ? "cm" : ""}</div>
              </div>
              <div class="info-box">
                <div class="info-label">Weight</div>
                <div class="info-value">${selectedChild.weight || selectedChild.healthMetrics?.[0]?.weightKg || "N/A"} ${selectedChild.weight || selectedChild.healthMetrics?.[0]?.weightKg ? "kg" : ""}</div>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h2>Clinic Visit History</h2>
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Symptoms</th>
                  <th>Blood Pressure</th>
                  <th>Temp</th>
                  <th>Pulse</th>
                  <th>Diagnosis</th>
                  <th>Treatment</th>
                  <th>Emergency</th>
                  <th>Referred</th>
                  <th>Hospital</th>
                </tr>
              </thead>
              <tbody>
                ${sortedVisits.length === 0 ? '<tr><td colspan="10" style="text-align: center; padding: 20px;">No visits recorded</td></tr>' : visitsHTML}
              </tbody>
            </table>
          </div>

          <p style="margin-top: 40px; font-size: 12px; color: #999;">
            Printed on ${new Date().toLocaleString()}
          </p>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

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
      headerAction={
        <Button
          onClick={handlePrint}
          variant="outline"
          className="ml-2"
          size="sm"
        >
          🖨️ Print
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
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
              Birth Date
            </div>
            <div className="font-medium text-gray-900">
              {selectedChild.birthDate
                ? formatDateOnly(selectedChild.birthDate)
                : "N/A"}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase">
              Year Level
            </div>
            <div className="font-medium text-gray-900">
              {selectedChild.yearLevel || "N/A"}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase">
              Course
            </div>
            <div className="font-medium text-gray-900">
              {selectedChild.course?.code || "N/A"}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase">
              Emergency Contact
            </div>
            <div className="font-medium text-gray-900">
              {selectedChild.emergencyContactName || "N/A"}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase">
              Blood Type
            </div>
            <div className="font-medium text-gray-900">
              {selectedChild.bloodType ||
                selectedChild.healthMetrics?.[0]?.bloodType ||
                "N/A"}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase">
              Allergies
            </div>
            <div className="font-medium text-gray-900">
              {selectedChild.allergies ||
                selectedChild.healthMetrics?.[0]?.allergies ||
                "None"}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase">
              Height
            </div>
            <div className="font-medium text-gray-900">
              {selectedChild.height ||
                selectedChild.healthMetrics?.[0]?.heightCm ||
                "N/A"}{" "}
              {selectedChild.height ||
              selectedChild.healthMetrics?.[0]?.heightCm
                ? "cm"
                : ""}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase">
              Weight
            </div>
            <div className="font-medium text-gray-900">
              {selectedChild.weight ||
                selectedChild.healthMetrics?.[0]?.weightKg ||
                "N/A"}{" "}
              {selectedChild.weight ||
              selectedChild.healthMetrics?.[0]?.weightKg
                ? "kg"
                : ""}
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
