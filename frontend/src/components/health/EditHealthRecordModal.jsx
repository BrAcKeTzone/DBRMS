import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";

const EditHealthRecordModal = ({ isOpen, onClose, student, onSave }) => {
  const [editData, setEditData] = useState({
    bloodType: "",
    allergies: "",
    height: "",
    weight: "",
  });

  useEffect(() => {
    if (student) {
      setEditData({
        bloodType: student.bloodType || "",
        allergies: student.allergies || "",
        height: student.height || "",
        weight: student.weight || "",
      });
    }
  }, [student]);

  const handleAllergiesInputChange = (value) => {
    const previousValue = editData.allergies || "";

    // If it's a deletion, don't auto-add commas to allow user to edit
    if (value.length < previousValue.length) {
      setEditData({ ...editData, allergies: value });
      return;
    }

    const lines = value.split("\n");
    if (lines.length > 1) {
      const processedLines = lines.map((line, index) => {
        // Don't modify the very last line (it's the one being currently typed)
        if (index === lines.length - 1) return line;

        const trimmed = line.trim();
        // If line is not empty and doesn't end with a comma, add it
        if (trimmed && !trimmed.endsWith(",")) {
          return line + ",";
        }
        return line;
      });
      setEditData({ ...editData, allergies: processedLines.join("\n") });
    } else {
      setEditData({ ...editData, allergies: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editData);
  };

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Health Record"
      size="lg"
    >
      {student ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                value={editData.bloodType}
                onChange={(e) =>
                  setEditData({ ...editData, bloodType: e.target.value })
                }
              >
                <option value="">Select Blood Type</option>
                {bloodTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergies
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                rows="3"
                placeholder="List any allergies"
                value={editData.allergies}
                onChange={(e) => handleAllergiesInputChange(e.target.value)}
              ></textarea>
            </div>
            <Input
              label="Height (cm)"
              type="number"
              step="0.1"
              value={editData.height}
              onChange={(e) =>
                setEditData({ ...editData, height: e.target.value })
              }
            />
            <Input
              label="Weight (kg)"
              type="number"
              step="0.1"
              value={editData.weight}
              onChange={(e) =>
                setEditData({ ...editData, weight: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-6 text-center text-gray-500">No student selected</div>
      )}
    </Modal>
  );
};

export default EditHealthRecordModal;
