import React, { useState, useEffect } from "react";
import { studentsApi } from "../../api/studentsApi";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { formatDate, formatDateOnly } from "../../utils/formatDate";
import StatusBadge from "../../components/ui/StatusBadge";
import { useAuthStore } from "../../store/authStore";

const MyChildren = () => {
  const user = useAuthStore((s) => s.user);
  const [myChildren, setMyChildren] = useState([]);
  const [linkRequests, setLinkRequests] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [relationship, setRelationship] = useState("PARENT");
  const [requestFilter, setRequestFilter] = useState("pending"); // pending or rejected

  useEffect(() => {
    fetchMyChildren();
    fetchLinkRequests();
  }, []);

  // Function to get user's last name from their profile
  const getUserLastName = () => {
    if (!user || !user.lastName) return "";
    return user.lastName.trim();
  };

  // Function to open modal with default last name search
  const handleOpenLinkModal = async () => {
    const lastName = getUserLastName();
    setSearchTerm(lastName);
    setShowLinkModal(true);

    // Automatically search if last name exists
    if (lastName.trim()) {
      try {
        setSearching(true);
        const response = await studentsApi.searchStudents(lastName);
        const studentsData =
          response.data?.data?.students || response.data?.students || [];
        setAvailableStudents(studentsData);
      } catch (error) {
        console.error("Error searching students:", error);
        alert("Failed to search students. Please try again.");
      } finally {
        setSearching(false);
      }
    }
  };

  const fetchMyChildren = async () => {
    try {
      setLoading(true);
      const response = await studentsApi.getMyChildren();
      // Backend returns: response.data.data (array of students directly)
      const childrenData = response.data?.data || [];
      setMyChildren(childrenData);
    } catch (error) {
      console.error("Error fetching children:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLinkRequests = async () => {
    try {
      const response = await studentsApi.getMyLinkRequests();
      // Backend returns: response.data.data (array of pending requests directly)
      const requestsData = response.data?.data || [];
      setLinkRequests(requestsData);
    } catch (error) {
      console.error("Error fetching link requests:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      alert("Please enter a search term");
      return;
    }

    try {
      setSearching(true);
      const response = await studentsApi.searchStudents(searchTerm);
      const studentsData =
        response.data?.data?.students || response.data?.students || [];
      setAvailableStudents(studentsData);
    } catch (error) {
      console.error("Error searching students:", error);
      alert("Failed to search students. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleRequestLink = async () => {
    if (!selectedStudent) {
      alert("Please select a student");
      return;
    }

    if (!relationship || !relationship.trim()) {
      alert("Please specify your relationship to the student");
      return;
    }

    try {
      await studentsApi.requestStudentLink({
        studentId: selectedStudent.studentId, // Use the string student ID, not the database ID
        relationship: relationship,
      });

      await fetchLinkRequests();
      setShowLinkModal(false);
      setSelectedStudent(null);
      setSearchTerm("");
      setAvailableStudents([]);
      alert(
        "Link request submitted successfully! Please wait for admin approval.",
      );
    } catch (error) {
      console.error("Error requesting link:", error);
      alert("Failed to submit link request. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { variant: "warning", label: "Pending" },
      approved: { variant: "success", label: "Approved" },
      rejected: { variant: "danger", label: "Rejected" },
    };

    const config = statusMap[status?.toLowerCase()] || statusMap.pending;
    return <StatusBadge variant={config.variant}>{config.label}</StatusBadge>;
  };

  const getRelationshipBadge = (rel) => {
    const colors = {
      PARENT: "bg-blue-100 text-blue-800",
      GUARDIAN: "bg-purple-100 text-purple-800",
      OTHER: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          colors[rel] || colors.OTHER
        }`}
      >
        {rel}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
          <p className="text-gray-600 mt-1">
            View linked students and request new links
          </p>
        </div>
        <Button onClick={handleOpenLinkModal}>Link New Student</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-900">
          <h3 className="text-sm font-medium text-gray-500">Linked Students</h3>
          <p className="text-2xl font-bold text-blue-600">
            {myChildren.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-900">
          <h3 className="text-sm font-medium text-gray-500">
            Pending Requests
          </h3>
          <p className="text-2xl font-bold text-yellow-600">
            {linkRequests.filter((r) => r.status === "PENDING").length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-900">
          <h3 className="text-sm font-medium text-gray-500">Total Requests</h3>
          <p className="text-2xl font-bold text-gray-600">
            {linkRequests.length}
          </p>
        </div>
      </div>

      {/* Linked Children */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-900">
        <div className="p-6 border-b border-gray-900">
          <h2 className="text-lg font-semibold text-gray-900">
            My Linked Students
          </h2>
        </div>
        <div className="p-6">
          {myChildren.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myChildren.map((child) => (
                <div
                  key={child.id}
                  className="border border-gray-300 rounded-lg p-4"
                >
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {child.firstName}
                      {child.middleName && ` ${child.middleName}`}{" "}
                      {child.lastName}
                    </h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">
                          Student ID
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {child.studentId}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">
                          Year Level
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {child.yearLevel || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">
                          Birth Date
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {child.birthDate
                            ? formatDateOnly(child.birthDate)
                            : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">
                          Course
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {child.course?.code || "N/A"}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">
                          Relationship
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {child.relationship || "Parent"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
              <p className="text-gray-500 mb-4">No students linked yet</p>
              <Button onClick={handleOpenLinkModal}>
                Link Your First Student
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Link Requests */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-900">
        <div className="p-6 border-b border-gray-900">
          <h2 className="text-lg font-semibold text-gray-900">
            Link Requests Status
          </h2>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-2">
            <button
              onClick={() => setRequestFilter("pending")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                requestFilter === "pending"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setRequestFilter("rejected")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                requestFilter === "rejected"
                  ? "bg-red-100 text-red-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Rejected
            </button>
          </div>
        </div>

        <div className="p-6">
          {linkRequests.filter(
            (req) =>
              req.linkStatus?.toUpperCase() === requestFilter.toUpperCase(),
          ).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {linkRequests
                .filter(
                  (req) =>
                    req.linkStatus?.toUpperCase() ===
                    requestFilter.toUpperCase(),
                )
                .map((request) => (
                  <div
                    key={request.id}
                    className="p-4 border border-gray-300 rounded-lg"
                  >
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          {request.firstName}
                          {request.middleName && ` ${request.middleName}`}{" "}
                          {request.lastName}
                        </h4>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            <strong>Student ID:</strong> {request.studentId}
                          </p>
                          {request.yearEnrolled && (
                            <p className="text-sm text-gray-600">
                              <strong>Year Enrolled:</strong>{" "}
                              {request.yearEnrolled}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            <strong>Relationship:</strong>{" "}
                            {request.relationship || "Parent"}
                          </p>
                          <p className="text-sm text-gray-500">
                            <strong>Date:</strong>{" "}
                            {formatDate(request.createdAt)}
                          </p>
                        </div>
                      </div>
                      {/* Status badge removed as requested */}
                      {request.linkStatus === "REJECTED" &&
                        request.rejectionReason && (
                          <div className="p-2 bg-red-50 border border-red-200 rounded">
                            <p className="text-sm text-red-800">
                              <strong>Reason:</strong> {request.rejectionReason}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No {requestFilter} link requests
            </p>
          )}
        </div>
      </div>

      {/* Link Student Modal */}
      <Modal
        isOpen={showLinkModal}
        onClose={() => {
          setShowLinkModal(false);
          setSelectedStudent(null);
          setSearchTerm("");
          setAvailableStudents([]);
        }}
        title="Link Student to Your Account"
        size="lg"
      >
        <div className="space-y-6">
          {/* Search Section */}
          <div>
            <label
              htmlFor="link-search"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Search for Student
            </label>
            <div className="flex space-x-2">
              <Input
                id="link-search"
                placeholder="Enter student name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? "Searching..." : "Search"}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Search by student name, student ID, or year level
            </p>
          </div>

          {/* Search Results */}
          {availableStudents.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Search Results:
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableStudents.map((student) => (
                  <div
                    key={student.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedStudent?.id === student.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-blue-300"
                    }`}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {student.lastName}, {student.firstName}
                          {student.middleName && ` ${student.middleName}`}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Student ID: {student.studentId}
                        </p>
                        {student.birthDate && (
                          <p className="text-sm text-gray-600">
                            Birthday: {formatDateOnly(student.birthDate)}
                          </p>
                        )}
                        {student.yearEnrolled && (
                          <p className="text-sm text-gray-600">
                            Year Enrolled: {student.yearEnrolled}
                          </p>
                        )}
                      </div>
                      {selectedStudent?.id === student.id && (
                        <span className="text-blue-600">✓ Selected</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Relationship Selection */}
          {selectedStudent && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship to Student *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={
                    ["PARENT", "GUARDIAN"].includes(relationship)
                      ? relationship
                      : "OTHER"
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "OTHER") {
                      setRelationship("");
                    } else {
                      setRelationship(val);
                    }
                  }}
                >
                  <option value="PARENT">Parent</option>
                  <option value="GUARDIAN">Guardian</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {!["PARENT", "GUARDIAN"].includes(relationship) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specify Relationship *
                  </label>
                  <Input
                    placeholder="Enter relationship (e.g. UNCLE, AUNT, etc.)"
                    value={relationship}
                    onChange={(e) =>
                      setRelationship(e.target.value.toUpperCase())
                    }
                    autoFocus
                  />
                </div>
              )}
            </div>
          )}

          {/* Selected Student Info */}
          {selectedStudent && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">
                Selected Student:
              </h3>
              <p className="text-sm text-blue-800">
                <strong>Name:</strong> {selectedStudent.lastName},{" "}
                {selectedStudent.firstName}
                {selectedStudent.middleName && ` ${selectedStudent.middleName}`}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Student ID:</strong> {selectedStudent.studentId}
              </p>
              {selectedStudent.birthDate && (
                <p className="text-sm text-blue-800">
                  <strong>Birthday:</strong>{" "}
                  {formatDateOnly(selectedStudent.birthDate)}
                </p>
              )}
              {selectedStudent.yearEnrolled && (
                <p className="text-sm text-blue-800">
                  <strong>Year Enrolled:</strong> {selectedStudent.yearEnrolled}
                </p>
              )}
              <p className="text-sm text-blue-800">
                <strong>Relationship:</strong> {relationship}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowLinkModal(false);
                setSelectedStudent(null);
                setSearchTerm("");
                setAvailableStudents([]);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleRequestLink} disabled={!selectedStudent}>
              Submit Link Request
            </Button>
          </div>

          {/* Info Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Your link request will be sent to the
              administrator for approval. You will be notified once your request
              is reviewed.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyChildren;
