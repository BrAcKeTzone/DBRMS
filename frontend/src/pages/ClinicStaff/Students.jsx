"use strict";
import React, { useState, useEffect, useRef } from "react";
import { studentsApi } from "../../api/studentsApi";
import { coursesApi } from "../../api/coursesApi";
import * as XLSX from "xlsx";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import DashboardCard from "../../components/dashboard/DashboardCard";
import Pagination from "../../components/ui/Pagination";
import { formatDate, formatDateOnly } from "../../utils/formatDate";
import { capitalizeWords } from "../../utils/helpers";
import { FaEdit, FaTrash } from "react-icons/fa";

const StudentsManagement = () => {
  const [students, setStudents] = useState([]);
  const [paginatedStudents, setPaginatedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentLevel, setStudentLevel] = useState("High School"); // "High School" or "College"
  const [editStudentLevel, setEditStudentLevel] = useState("High School");
  const [newStudent, setNewStudent] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    studentId: "",
    yearLevel: "",
    birthDate: "",
    sex: "",
    courseCode: "",
    bloodType: "",
    allergies: "",
    height: "",
    weight: "",
  });
  const [studentStats, setStudentStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    noYearLevel: 0,
  });

  // Courses state
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({
    code: "",
    name: "",
  });
  const [editingCourse, setEditingCourse] = useState(null);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [activeTab, setActiveTab] = useState("students");
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // import states
  const fileInputRef = useRef(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // For import error view/modal
  const [showImportErrors, setShowImportErrors] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterYearLevel, setFilterYearLevel] = useState("");
  const [filterLinkStatus, setFilterLinkStatus] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);

  // Generate year options: 3 years before to 3 years after current year
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 3; i <= currentYear + 3; i++) {
      years.push(i);
    }
    return years;
  };

  const yearOptions = generateYearOptions();

  // Load initial data
  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  // Update paginated students when students or pagination state changes
  useEffect(() => {
    // Use filtered students if filters are applied, otherwise use all students
    const dataToDisplay = hasAppliedFilters ? filteredStudents : students;
    const totalPages = Math.ceil(dataToDisplay.length / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = dataToDisplay.slice(startIndex, endIndex);

    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
      return;
    }

    setPaginatedStudents(paginatedData);
  }, [page, limit, students, filteredStudents, hasAppliedFilters]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      const response = await studentsApi.getAllStudents(params);

      // Response structure: response.data.data.students
      let studentsArray = response.data?.data?.students || [];
      const noYearLevelCount = response.data?.data?.noYearLevelCount || 0;

      // Normalize status to uppercase for consistency across frontend
      studentsArray = studentsArray.map((s) => ({
        ...s,
        status: (s.status || "").toString().toUpperCase(),
      }));
      setStudents(studentsArray);
      calculateStats(studentsArray, noYearLevelCount);
    } catch (error) {
      console.error("Error fetching students:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await coursesApi.getAllCourses();
      const coursesArray = response.data?.data || response.data || [];
      setCourses(coursesArray);
    } catch (error) {
      console.error("Error fetching courses:", error);
      // Fail silently for now to avoid blocking other features
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.code || !newCourse.name) {
      alert("Course code and name are required");
      return;
    }

    try {
      await coursesApi.createCourse(newCourse);
      setNewCourse({ code: "", name: "" });
      setShowCreateCourseModal(false);
      fetchCourses();
      alert("Course created successfully");
    } catch (error) {
      console.error("Error creating course:", error);
      alert(
        error?.response?.data?.message ||
          error.message ||
          "Failed to create course",
      );
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse({ ...course });
    setShowEditCourseModal(true);
  };

  // Get unique years from students
  const getUniqueYears = () => {
    const years = students
      .map((s) => s.yearEnrolled)
      .filter((year) => year)
      .sort((a, b) => b - a);
    return [...new Set(years)];
  };

  // Get unique courses from students
  const getUniqueCourses = () => {
    const coursesMap = {};
    students.forEach((student) => {
      if (student.course && student.course.id) {
        if (!coursesMap[student.course.id]) {
          coursesMap[student.course.id] = student.course;
        }
      }
    });
    return Object.values(coursesMap).sort((a, b) => {
      return (a.code || "").localeCompare(b.code || "");
    });
  };

  // Handle search and filter
  const handleSearchAndFilter = () => {
    let result = [...students];

    // Apply search query (search in firstName, lastName, studentId, parent name/email)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((student) => {
        const fullName = `${student.firstName} ${student.middleName || ""} ${
          student.lastName
        }`.toLowerCase();
        const parentName = student.parent
          ? `${student.parent.firstName || ""} ${
              student.parent.lastName || ""
            }`.toLowerCase()
          : "";
        const parentEmail = student.parent?.email?.toLowerCase() || "";
        return (
          fullName.includes(query) ||
          student.studentId?.toLowerCase().includes(query) ||
          parentName.includes(query) ||
          parentEmail.includes(query)
        );
      });
    }

    // Apply status filter
    if (filterStatus) {
      result = result.filter(
        (student) => student.status === filterStatus.toUpperCase(),
      );
    }

    // Apply year level filter
    if (filterYearLevel) {
      result = result.filter(
        (student) => student.yearLevel === filterYearLevel,
      );
    }

    // Apply course filter
    if (filterCourse) {
      result = result.filter(
        (student) =>
          student.course && student.course.id === parseInt(filterCourse),
      );
    }

    // Apply link status filter
    if (filterLinkStatus) {
      if (filterLinkStatus === "APPROVED") {
        result = result.filter((student) => student.linkStatus === "APPROVED");
      } else if (filterLinkStatus === "NO_LINK") {
        result = result.filter((student) =>
          ["PENDING", "REJECTED"].includes(
            String(student.linkStatus).toUpperCase(),
          ),
        );
      }
    }

    setFilteredStudents(result);
    setHasAppliedFilters(true);
    setPage(1); // Reset to first page after filtering
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterStatus("");
    setFilterYearLevel("");
    setFilterLinkStatus("");
    setFilterCourse("");
    setFilteredStudents([]);
    setHasAppliedFilters(false);
    setPage(1);
  };

  const handleUpdateCourse = async (e) => {
    e?.preventDefault?.();
    if (!editingCourse) return;
    try {
      await coursesApi.updateCourse(editingCourse.id, {
        code: editingCourse.code,
        name: editingCourse.name,
      });
      setEditingCourse(null);
      setShowEditCourseModal(false);
      fetchCourses();
      alert("Course updated successfully");
    } catch (error) {
      console.error("Error updating course:", error);
      alert(
        error?.response?.data?.message ||
          error.message ||
          "Failed to update course",
      );
    }
  };

  const handleDeleteCourse = async (course) => {
    if (!window.confirm(`Delete course '${course.name}'?`)) return;
    try {
      await coursesApi.deleteCourse(course.id);
      fetchCourses();
      alert("Course deleted successfully");
    } catch (error) {
      console.error("Error deleting course:", error);
      alert(
        error?.response?.data?.message ||
          error.message ||
          "Failed to delete course",
      );
    }
  };

  const calculateStats = (studentsArray, noYearLevel = 0) => {
    const total = studentsArray.length;
    const active = studentsArray.filter((s) => s.status === "ACTIVE").length;
    const inactive = studentsArray.filter(
      (s) => s.status === "INACTIVE",
    ).length;
    setStudentStats({ total, active, inactive, noYearLevel });
  };

  const handlePageChange = (pageNum) => {
    setPage(pageNum);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();

    // Basic client-side validation to avoid roundtrips
    const studentIdPattern = /^[0-9]{4}-[0-9]{5}$/;
    const yearPattern = /^[0-9]{4}$/;
    if (!newStudent.firstName || newStudent.firstName.length < 2) {
      alert("First name must be at least 2 characters");
      return;
    }
    if (!newStudent.lastName || newStudent.lastName.length < 2) {
      alert("Last name must be at least 2 characters");
      return;
    }
    if (!studentIdPattern.test(newStudent.studentId)) {
      alert("Student ID must be in format YYYY-NNNNN (e.g., 2024-12345)");
      return;
    }
    if (!newStudent.yearLevel) {
      alert("Please select a year level");
      return;
    }
    if (!newStudent.sex) {
      alert("Please select a sex");
      return;
    }

    if (studentLevel === "College" && !newStudent.courseCode) {
      alert("Please select a course for college students");
      return;
    }

    try {
      setLoading(true);
      const resp = await studentsApi.createStudent(newStudent);
      // If API returns an error structure it will throw and be caught below
      setShowCreateModal(false);
      setNewStudent({
        firstName: "",
        lastName: "",
        middleName: "",
        studentId: "",
        yearLevel: "",
        birthDate: "",
        sex: "",
        courseCode: "",
        bloodType: "",
        allergies: "",
        height: "",
        weight: "",
      });
      await fetchStudents();
      alert("Student created successfully");
    } catch (error) {
      console.error("Error creating student:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create student";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();

    if (editStudentLevel === "College" && !selectedStudent.courseCode) {
      alert("Please select a course for college students");
      return;
    }

    try {
      const updatePayload = {
        ...selectedStudent,
        // Ensure course is nullified if High School
        courseCode:
          editStudentLevel === "High School" ? "" : selectedStudent.courseCode,
        courseId:
          editStudentLevel === "High School" ? null : selectedStudent.courseId,
        // Remove nested objects that might confuse the backend
        course: undefined,
        parent: undefined,
      };

      await studentsApi.updateStudent(selectedStudent.id, updatePayload);
      setShowEditModal(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (error) {
      console.error("Error updating student:", error);
      alert(`Error updating student: ${error.message || error}`);
    }
  };

  const handleDeleteStudent = async (student) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the student ${student.firstName} ${student.lastName}? This action cannot be undone.`,
    );

    if (confirmed) {
      try {
        await studentsApi.deleteStudent(student.id);
        await fetchStudents();
        alert("Student deleted successfully");
      } catch (error) {
        console.error("Error deleting student:", error);
        alert(`Error deleting student: ${error.message || error}`);
      }
    }
  };

  const handleAllergiesInputChange = (value, setter, state) => {
    const previousValue = state.allergies || "";

    // If it's a deletion, don't auto-add commas to allow user to edit
    if (value.length < previousValue.length) {
      setter({ ...state, allergies: value });
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
      setter({ ...state, allergies: processedLines.join("\n") });
    } else {
      setter({ ...state, allergies: value });
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLeftBorderClass = (status) => {
    switch (status) {
      case "ACTIVE":
        return "border-l-4 border-green-500";
      case "INACTIVE":
        return "border-l-4 border-red-500";
      default:
        return "border-l-4 border-gray-200";
    }
  };

  const studentColumns = [
    {
      header: "Student Name",
      accessor: "firstName",
      cell: (row) => (
        <div
          className={`${getStatusLeftBorderClass(row.status)} pl-3`}
          aria-label={`status: ${row.status}`}
        >
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900">
              {row.firstName} {row.middleName ? row.middleName + " " : ""}
              {row.lastName}
            </p>
          </div>
          <p className="text-sm text-gray-500">ID: {row.studentId}</p>
        </div>
      ),
    },
    {
      header: "Year Level",
      accessor: "yearLevel",
      cell: (row) => (
        <div className="text-sm text-gray-600">{row.yearLevel || "N/A"}</div>
      ),
    },
    // Status column removed in favor of left border indicator
    {
      header: "Birth Date",
      accessor: "birthDate",
      cell: (row) => (
        <div className="text-sm text-gray-600">
          {row.birthDate ? formatDateOnly(row.birthDate) : "N/A"}
        </div>
      ),
    },
    {
      header: "Parent",
      accessor: "parent",
      cell: (row) => (
        <div>
          {/* If the student's linkStatus is PENDING or REJECTED, display as no parent linked */}
          {row.linkStatus &&
          ["PENDING", "REJECTED"].includes(
            String(row.linkStatus).toUpperCase(),
          ) ? (
            <span className="text-gray-500">No parent linked</span>
          ) : row.parent ? (
            <>
              <div className="font-medium text-gray-900">
                {row.parent.firstName}{" "}
                {row.parent.middleName ? row.parent.middleName + " " : ""}
                {row.parent.lastName}
              </div>
              <div className="text-sm text-gray-600">{row.parent.email}</div>
            </>
          ) : (
            <span className="text-gray-500">No parent linked</span>
          )}
        </div>
      ),
    },
    {
      header: "Course",
      accessor: "course",
      cell: (row) => (
        <div>
          {row.course ? (
            <div className="text-sm text-gray-700">
              {row.course.code} - {row.course.name}
            </div>
          ) : (
            <span className="text-gray-500">No course</span>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <Button
            onClick={() => {
              const level =
                row.course || row.courseCode ? "College" : "High School";
              setEditStudentLevel(level);
              setSelectedStudent({
                ...row,
                courseCode: row.course?.code || "",
              });
              setShowEditModal(true);
            }}
            variant="outline"
            size="sm"
            title="Edit Student"
          >
            <FaEdit className="hidden md:block" />
            <span className="md:hidden">Edit</span>
          </Button>
          <Button
            onClick={() => handleDeleteStudent(row)}
            variant="outline"
            size="sm"
            className="text-red-600 border-red-300 hover:bg-red-50"
            title="Delete Student"
          >
            <FaTrash className="hidden md:block" />
            <span className="md:hidden">Delete</span>
          </Button>
        </div>
      ),
    },
  ];

  const courseColumns = [
    {
      header: "Code",
      accessor: "code",
      cell: (row) => (
        <div className="font-medium text-gray-900">{row.code}</div>
      ),
    },
    {
      header: "Course Name",
      accessor: "name",
      cell: (row) => <div className="text-gray-700">{row.name}</div>,
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditCourse(row)}
            title="Edit Course"
          >
            <FaEdit className="hidden md:block" />
            <span className="md:hidden">Edit</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600"
            onClick={() => handleDeleteCourse(row)}
            title="Delete Course"
          >
            <FaTrash className="hidden md:block" />
            <span className="md:hidden">Delete</span>
          </Button>
        </div>
      ),
    },
  ];

  if (loading && (!students || students.length === 0)) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    try {
      const resp = await studentsApi.bulkImportStudents(file);
      const data = resp?.data?.data || resp?.data || {};
      setImportResult(data);
      // Refresh students list
      await fetchStudents();
      const created = data.created || 0;
      const skipped = data.skipped || 0;
      alert(`Import successful - Created: ${created}, Skipped: ${skipped}`);

      // Show import errors if present
      if (data.invalidRows && data.invalidRows.length > 0) {
        setShowImportErrors(true);
      }
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message || err.message || "Import failed";
      alert(msg);
    } finally {
      setImportLoading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
  };

  // CSV import/export removed. Use XLSX export/import instead.

  const handleExportXlsx = async () => {
    try {
      setLoading(true);
      const resp = await studentsApi.exportStudents({});
      const blob = await resp.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `students_export_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to export students XLSX");
    } finally {
      setLoading(false);
    }
  };

  // CSV template removed - use the XLSX template (XLSX)

  const downloadXlsxTemplate = async () => {
    try {
      setLoading(true);
      const resp = await studentsApi.downloadStudentsTemplate();
      const blob = await resp.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `students_template.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download template");
    } finally {
      setLoading(false);
    }
  };

  const downloadImportErrorXlsx = () => {
    if (!importResult || !importResult.invalidRows) return;
    const invalidRows = importResult.invalidRows;
    // Build XLSX: include headers + error message
    const headers = Object.keys(invalidRows[0].values || {});
    const rowHeaders = [...headers, "error"];
    // Use invalidRows directly to build workbook
    // produce an XLSX file containing errors and row values
    try {
      const wb = XLSX.utils.book_new();
      const wsRows = [rowHeaders];
      invalidRows.forEach((r) => {
        const values = rowHeaders.map((h) => r.values[h] || "");
        values.push(r.error || "");
        wsRows.push(values);
      });
      const ws = XLSX.utils.aoa_to_sheet(wsRows);
      XLSX.utils.book_append_sheet(wb, ws, "Import Errors");
      const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `students_import_errors_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to generate import errors XLSX", e);
      alert("Failed to download import errors");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {activeTab === "students"
              ? "Students Management"
              : "Course Management"}
          </h1>
          <p className="text-gray-600">
            {activeTab === "students"
              ? "Manage student records and parent links"
              : "Manage offered course entries"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 ml-2">
          {importLoading ? (
            <div className="text-sm text-gray-500">Importing...</div>
          ) : importResult ? (
            <div className="text-sm text-gray-600">
              Created: <strong>{importResult.created || 0}</strong>, Skipped:{" "}
              <strong>{importResult.skipped || 0}</strong>
            </div>
          ) : null}
          {importResult &&
          importResult.invalidRows &&
          importResult.invalidRows.length > 0 ? (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowImportErrors(true)}
                variant="outline"
                size="sm"
              >
                View Errors
              </Button>
              <Button
                onClick={downloadImportErrorXlsx}
                variant="outline"
                size="sm"
              >
                Download Errors (XLSX)
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab("students")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "students"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Students
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "courses"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Courses
          </button>
        </div>
      </div>

      {/* Courses Tab */}
      {activeTab === "courses" && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Offered Courses
            </h2>
            <Button
              onClick={() => setShowCreateCourseModal(true)}
              variant="primary"
              className="whitespace-nowrap"
            >
              Add Course
            </Button>
          </div>
          <div>
            {loadingCourses ? (
              <div className="text-sm text-gray-500">Loading courses...</div>
            ) : courses.length === 0 ? (
              <div className="text-sm text-gray-500">
                No courses offered yet.
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <Table columns={courseColumns} data={courses} />
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      <div className="mb-3">
                        <div className="font-medium text-gray-900 wrap-break-words">
                          {course.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {course.code}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCourse(course)}
                        >
                          <FaEdit className="hidden md:block" />
                          <span className="md:hidden">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleDeleteCourse(course)}
                        >
                          <FaTrash className="hidden md:block" />
                          <span className="md:hidden">Delete</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === "students" && (
        <>
          {/* Search and Filter Section */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Search & Filter Students
            </h3>

            <div className="space-y-4">
              {/* Search Input */}
              <div>
                <label
                  htmlFor="students-search"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Search by Name, Student ID, or Parent Email
                </label>
                <Input
                  id="students-search"
                  type="text"
                  placeholder="e.g., John Doe, STU-001, parent@email.com"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <label
                    htmlFor="filter-status"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Status
                  </label>
                  <select
                    id="filter-status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                {/* Year Level Filter */}
                <div>
                  <label
                    htmlFor="filter-year-level"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Year Level
                  </label>
                  <select
                    id="filter-year-level"
                    value={filterYearLevel}
                    onChange={(e) => setFilterYearLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Year Levels</option>
                    {["1st", "2nd", "3rd", "4th", "5th"].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl} Year
                      </option>
                    ))}
                  </select>
                </div>

                {/* Link Status Filter */}
                <div>
                  <label
                    htmlFor="filter-link-status"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Parent Link Status
                  </label>
                  <select
                    id="filter-link-status"
                    value={filterLinkStatus}
                    onChange={(e) => setFilterLinkStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Link Statuses</option>
                    <option value="APPROVED">With Linked Parents</option>
                    <option value="NO_LINK">No Linked Parents</option>
                  </select>
                </div>

                {/* Course Filter */}
                <div>
                  <label
                    htmlFor="filter-course"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Course
                  </label>
                  <select
                    id="filter-course"
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Courses</option>
                    {getUniqueCourses().map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <Button
                  onClick={handleSearchAndFilter}
                  variant="primary"
                  className="w-full sm:w-auto whitespace-nowrap"
                >
                  🔍 Search & Filter
                </Button>
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  className="w-full sm:w-auto whitespace-nowrap"
                >
                  ✕ Clear Filters
                </Button>
              </div>

              {/* Filter Status Info */}
              {hasAppliedFilters && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    🔍 <strong>Filters Applied:</strong> Showing{" "}
                    <strong>{filteredStudents.length}</strong> result
                    {filteredStudents.length !== 1 ? "s" : ""} out of{" "}
                    <strong>{students.length}</strong> total students
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <DashboardCard title="Total Students" className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                {hasAppliedFilters
                  ? filteredStudents.length
                  : studentStats.total}
              </div>
            </DashboardCard>

            <DashboardCard title="Active Students" className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">
                {hasAppliedFilters
                  ? filteredStudents.filter((s) => s.status === "ACTIVE").length
                  : studentStats.active}
              </div>
            </DashboardCard>

            <DashboardCard title="No Link Parents" className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-orange-600">
                {hasAppliedFilters
                  ? filteredStudents.filter((s) =>
                      ["PENDING", "REJECTED"].includes(
                        String(s.linkStatus).toUpperCase(),
                      ),
                    ).length
                  : students.filter((s) =>
                      ["PENDING", "REJECTED"].includes(
                        String(s.linkStatus).toUpperCase(),
                      ),
                    ).length}
              </div>
            </DashboardCard>

            <DashboardCard title="Incomplete Profiles" className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-indigo-600">
                {hasAppliedFilters
                  ? filteredStudents.filter(
                      (s) => !s.yearLevel || s.yearLevel === "",
                    ).length
                  : studentStats.noYearLevel}
              </div>
            </DashboardCard>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch gap-2 mb-6">
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              className="w-full sm:w-auto whitespace-nowrap"
            >
              Add New Student
            </Button>
            <Button
              onClick={handleExportXlsx}
              variant="outline"
              className="w-full sm:w-auto whitespace-nowrap"
            >
              Export XLSX
            </Button>
            <Button
              onClick={downloadXlsxTemplate}
              variant="outline"
              className="w-full sm:w-auto whitespace-nowrap"
            >
              Download Template (XLSX)
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full sm:w-auto whitespace-nowrap"
            >
              Import XLSX
            </Button>
          </div>

          {/* Students Table */}
          <DashboardCard
            title={`Students (${students.length || 0})`}
            headerActions={
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700 font-medium">
                  Show:
                </label>
                <select
                  value={limit}
                  onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-700">entries</span>
              </div>
            }
          >
            {paginatedStudents && paginatedStudents.length > 0 ? (
              <div className="mt-4">
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <Table columns={studentColumns} data={paginatedStudents} />
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {paginatedStudents.map((student, index) => (
                    <div
                      key={index}
                      className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${getStatusLeftBorderClass(
                        student.status,
                      )}`}
                      role="article"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 wrap-break-words">
                            {student.firstName} {student.lastName}
                          </h3>
                          <p className="text-sm text-gray-500 break-all">
                            ID: {student.studentId}
                          </p>
                          <p className="text-sm text-gray-500">
                            Course:{" "}
                            {student.course
                              ? `${student.course.code} - ${student.course.name}`
                              : "N/A"}
                          </p>
                          <p className="text-sm text-gray-500">
                            Year Level: {student.yearLevel || "N/A"}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                              student.status,
                            )}`}
                            aria-hidden
                          >
                            {student.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center text-sm mb-3">
                        <span className="text-gray-500">
                          DOB:{" "}
                          {student.birthDate
                            ? formatDateOnly(student.birthDate)
                            : "N/A"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-sm mb-3">
                        <div>
                          {student.parent ? (
                            <div>
                              <p className="font-medium text-gray-900">
                                {student.parent.firstName}{" "}
                                {student.parent.middleName
                                  ? student.parent.middleName + " "
                                  : ""}
                                {student.parent.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {student.parent.email}
                              </p>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-xs">
                              No parent linked
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStudent({
                              ...student,
                              courseCode: student.course?.code || "",
                            });
                            setShowEditModal(true);
                          }}
                          className="flex-1"
                        >
                          <FaEdit className="hidden md:block" />
                          <span className="md:hidden">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteStudent(student)}
                          className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <FaTrash className="hidden md:block" />
                          <span className="md:hidden">Delete</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination and Entries Per Page */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                  {Math.ceil(students.length / limit) > 1 && (
                    <Pagination
                      currentPage={page}
                      totalPages={Math.ceil(students.length / limit)}
                      totalCount={students.length}
                      itemsPerPage={limit}
                      onPageChange={handlePageChange}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {loading ? "Loading students..." : "No students found."}
                </p>
              </div>
            )}
          </DashboardCard>

          {/* Create Student Modal */}
          <Modal
            isOpen={showCreateModal}
            onClose={() => {
              setShowCreateModal(false);
              setNewStudent({
                firstName: "",
                lastName: "",
                middleName: "",
                studentId: "",
                yearLevel: "",
                birthDate: "",
                sex: "",
                courseCode: "",
                bloodType: "",
                allergies: "",
              });
              setStudentLevel("High School");
            }}
            title="Add New Student"
            size="full"
          >
            <form
              onSubmit={handleCreateStudent}
              className="space-y-4 sm:space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="e.g., Juan"
                  value={newStudent.firstName}
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      firstName: capitalizeWords(e.target.value),
                    })
                  }
                  required
                />
                <Input
                  label="Last Name"
                  placeholder="e.g., Dela Cruz"
                  value={newStudent.lastName}
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      lastName: capitalizeWords(e.target.value),
                    })
                  }
                  required
                />
              </div>

              <Input
                label="Middle Name"
                placeholder="e.g., Santos (Optional)"
                value={newStudent.middleName}
                onChange={(e) =>
                  setNewStudent({
                    ...newStudent,
                    middleName: capitalizeWords(e.target.value),
                  })
                }
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sex <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  value={newStudent.sex}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, sex: e.target.value })
                  }
                  required
                >
                  <option value="">Select Sex</option>
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                </select>
              </div>

              <Input
                label="Student ID"
                placeholder="YYYY-NNNNN (e.g., 2024-12345)"
                value={newStudent.studentId}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, studentId: e.target.value })
                }
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Level <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      className="mr-2"
                      checked={studentLevel === "High School"}
                      onChange={() => {
                        setStudentLevel("High School");
                        setNewStudent((prev) => ({
                          ...prev,
                          yearLevel: "",
                          courseCode: "",
                        }));
                      }}
                    />
                    High School
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      className="mr-2"
                      checked={studentLevel === "College"}
                      onChange={() => {
                        setStudentLevel("College");
                        setNewStudent((prev) => ({
                          ...prev,
                          yearLevel: "",
                          courseCode: "",
                        }));
                      }}
                    />
                    College
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year Level <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  value={newStudent.yearLevel || ""}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, yearLevel: e.target.value })
                  }
                  required
                >
                  <option value="">Select Year Level</option>
                  {studentLevel === "High School" ? (
                    <>
                      <option value="Grade 7">Grade 7</option>
                      <option value="Grade 8">Grade 8</option>
                      <option value="Grade 9">Grade 9</option>
                      <option value="Grade 10">Grade 10</option>
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12</option>
                    </>
                  ) : (
                    <>
                      <option value="1st Year College">1st Year College</option>
                      <option value="2nd Year College">2nd Year College</option>
                      <option value="3rd Year College">3rd Year College</option>
                      <option value="4th Year College">4th Year College</option>
                      <option value="5th+ Year College">
                        5th+ Year College
                      </option>
                    </>
                  )}
                </select>
              </div>

              {studentLevel === "College" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    value={newStudent.courseCode}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        courseCode: e.target.value,
                      })
                    }
                    required={studentLevel === "College"}
                  >
                    <option value="">Select Course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.code}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Input
                label="Birth Date"
                type="date"
                placeholder="YYYY-MM-DD"
                value={newStudent.birthDate}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, birthDate: e.target.value })
                }
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  value={newStudent.bloodType}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, bloodType: e.target.value })
                  }
                >
                  <option value="">Select Blood Type</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  rows="3"
                  placeholder="List any allergies (e.g., Peanuts, Penicillin)"
                  value={newStudent.allergies}
                  onChange={(e) =>
                    handleAllergiesInputChange(
                      e.target.value,
                      setNewStudent,
                      newStudent,
                    )
                  }
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Height (cm)"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 170.5"
                  value={newStudent.height}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, height: e.target.value })
                  }
                />
                <Input
                  label="Weight (kg)"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 65.2"
                  value={newStudent.weight}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, weight: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewStudent({
                      firstName: "",
                      lastName: "",
                      middleName: "",
                      studentId: "",
                      yearLevel: "",
                      birthDate: "",
                      courseCode: "",
                      bloodType: "",
                      allergies: "",
                      height: "",
                      weight: "",
                    });
                    setStudentLevel("High School");
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? "Creating..." : "Create Student"}
                </Button>
              </div>
            </form>
          </Modal>

          {/* Edit Student Modal */}
          <Modal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedStudent(null);
            }}
            title="Edit Student"
            size="full"
          >
            {selectedStudent && (
              <form
                onSubmit={handleEditStudent}
                className="space-y-4 sm:space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    placeholder="e.g., Juan"
                    value={selectedStudent.firstName}
                    onChange={(e) =>
                      setSelectedStudent({
                        ...selectedStudent,
                        firstName: capitalizeWords(e.target.value),
                      })
                    }
                    required
                  />
                  <Input
                    label="Last Name"
                    placeholder="e.g., Dela Cruz"
                    value={selectedStudent.lastName}
                    onChange={(e) =>
                      setSelectedStudent({
                        ...selectedStudent,
                        lastName: capitalizeWords(e.target.value),
                      })
                    }
                    required
                  />
                </div>

                <Input
                  label="Middle Name"
                  placeholder="e.g., Santos (Optional)"
                  value={selectedStudent.middleName || ""}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      middleName: capitalizeWords(e.target.value),
                    })
                  }
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sex <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    value={selectedStudent.sex || ""}
                    onChange={(e) =>
                      setSelectedStudent({
                        ...selectedStudent,
                        sex: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Sex</option>
                    <option value="MALE">MALE</option>
                    <option value="FEMALE">FEMALE</option>
                  </select>
                </div>

                <Input
                  label="Student ID"
                  placeholder="YYYY-NNNNN (e.g., 2024-12345)"
                  value={selectedStudent.studentId}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      studentId: e.target.value,
                    })
                  }
                  required
                  disabled
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Level <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        className="mr-2"
                        checked={editStudentLevel === "High School"}
                        onChange={() => {
                          setEditStudentLevel("High School");
                          setSelectedStudent((prev) => ({
                            ...prev,
                            yearLevel: "",
                            courseCode: "",
                            course: null,
                            courseId: null,
                          }));
                        }}
                      />
                      High School
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        className="mr-2"
                        checked={editStudentLevel === "College"}
                        onChange={() => {
                          setEditStudentLevel("College");
                          setSelectedStudent((prev) => ({
                            ...prev,
                            yearLevel: "",
                            courseCode: "",
                          }));
                        }}
                      />
                      College
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    value={selectedStudent.yearLevel || ""}
                    onChange={(e) => {
                      const newYearLevel = e.target.value;
                      const isHighSchool =
                        newYearLevel.includes("Grade") ||
                        newYearLevel.startsWith("HS");
                      setSelectedStudent((prev) => ({
                        ...prev,
                        yearLevel: newYearLevel,
                        // If switching to a HS grade, ensure course is cleared
                        courseCode: isHighSchool ? "" : prev.courseCode,
                        course: isHighSchool ? null : prev.course,
                        courseId: isHighSchool ? null : prev.courseId,
                      }));
                    }}
                    required
                  >
                    <option value="">Select Year Level</option>
                    {editStudentLevel === "High School" ? (
                      <>
                        <option value="Grade 7">Grade 7</option>
                        <option value="Grade 8">Grade 8</option>
                        <option value="Grade 9">Grade 9</option>
                        <option value="Grade 10">Grade 10</option>
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12</option>
                      </>
                    ) : (
                      <>
                        <option value="1st Year College">
                          1st Year College
                        </option>
                        <option value="2nd Year College">
                          2nd Year College
                        </option>
                        <option value="3rd Year College">
                          3rd Year College
                        </option>
                        <option value="4th Year College">
                          4th Year College
                        </option>
                        <option value="5th+ Year College">
                          5th+ Year College
                        </option>
                      </>
                    )}
                  </select>
                </div>

                {editStudentLevel === "College" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      value={
                        selectedStudent.courseCode ||
                        selectedStudent.course?.code ||
                        ""
                      }
                      onChange={(e) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          courseCode: e.target.value,
                        })
                      }
                      required={editStudentLevel === "College"}
                    >
                      <option value="">Select Course</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.code}>
                          {c.code} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <Input
                  label="Birth Date"
                  type="date"
                  value={
                    selectedStudent.birthDate
                      ? selectedStudent.birthDate.split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      birthDate: e.target.value,
                    })
                  }
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    value={selectedStudent.bloodType || ""}
                    onChange={(e) =>
                      setSelectedStudent({
                        ...selectedStudent,
                        bloodType: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Blood Type</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                      (type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ),
                    )}
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
                    value={selectedStudent.allergies || ""}
                    onChange={(e) =>
                      handleAllergiesInputChange(
                        e.target.value,
                        setSelectedStudent,
                        selectedStudent,
                      )
                    }
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Height (cm)"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 170.5"
                    value={selectedStudent.height || ""}
                    onChange={(e) =>
                      setSelectedStudent({
                        ...selectedStudent,
                        height: e.target.value,
                      })
                    }
                  />
                  <Input
                    label="Weight (kg)"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 65.2"
                    value={selectedStudent.weight || ""}
                    onChange={(e) =>
                      setSelectedStudent({
                        ...selectedStudent,
                        weight: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Status
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStudent.status === "ACTIVE"}
                        onChange={(e) =>
                          setSelectedStudent({
                            ...selectedStudent,
                            status: e.target.checked ? "ACTIVE" : "INACTIVE",
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        {selectedStudent.status === "ACTIVE"
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </label>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                        selectedStudent.status,
                      )}`}
                    >
                      {selectedStudent.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {selectedStudent.status === "ACTIVE"
                      ? "This student is currently active in the system."
                      : "This student is currently inactive and will not appear in active student lists."}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedStudent(null);
                    }}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    {loading ? "Updating..." : "Update Student"}
                  </Button>
                </div>
              </form>
            )}
          </Modal>

          {/* Import Errors Modal */}
          <Modal
            isOpen={showImportErrors}
            onClose={() => setShowImportErrors(false)}
            title={`Import Errors (${
              (importResult?.invalidRows || []).length
            })`}
            size="large"
          >
            <div className="space-y-4">
              {importResult?.invalidRows &&
              importResult.invalidRows.length > 0 ? (
                <div className="overflow-auto max-h-96">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-3">Row</th>
                        <th className="py-2 px-3">Error</th>
                        <th className="py-2 px-3">Values</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.invalidRows.map((r, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-2 px-3 align-top">{r.row}</td>
                          <td className="py-2 px-3 align-top text-red-600">
                            {r.error}
                          </td>
                          <td className="py-2 px-3">
                            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                              {JSON.stringify(r.values, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  No import errors found.
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => setShowImportErrors(false)}
                  variant="outline"
                >
                  Close
                </Button>
                {importResult?.invalidRows &&
                  importResult.invalidRows.length > 0 && (
                    <Button onClick={downloadImportErrorXlsx} variant="primary">
                      Download Errors (XLSX)
                    </Button>
                  )}
              </div>
            </div>
          </Modal>

          {/* Create and Edit Course Modals */}
        </>
      )}
      {/* Create and Edit Course Modals */}
      <Modal
        isOpen={showCreateCourseModal}
        onClose={() => {
          setShowCreateCourseModal(false);
          setNewCourse({ code: "", name: "" });
        }}
        title="Add Course"
        size="md"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <Input
            label="Code"
            placeholder="e.g., BSIT"
            value={newCourse.code}
            onChange={(e) =>
              setNewCourse({ ...newCourse, code: e.target.value })
            }
            required
          />
          <Input
            label="Course Name"
            placeholder="e.g., Bachelor of Science in Information Technology"
            value={newCourse.name}
            onChange={(e) =>
              setNewCourse({ ...newCourse, name: e.target.value })
            }
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setShowCreateCourseModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Course
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showEditCourseModal}
        onClose={() => {
          setShowEditCourseModal(false);
          setEditingCourse(null);
        }}
        title="Edit Course"
        size="md"
      >
        {editingCourse && (
          <form onSubmit={handleUpdateCourse} className="space-y-4">
            <Input
              label="Code"
              value={editingCourse.code}
              onChange={(e) =>
                setEditingCourse({ ...editingCourse, code: e.target.value })
              }
              required
            />
            <Input
              label="Course Name"
              value={editingCourse.name}
              onChange={(e) =>
                setEditingCourse({ ...editingCourse, name: e.target.value })
              }
              required
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditCourseModal(false);
                  setEditingCourse(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default StudentsManagement;
