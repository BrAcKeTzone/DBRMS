// Dummy Data Service for Clinic Management System
// Simulates API calls using local JSON data for demonstration purposes

import usersData from "../data/users.json";
import * as XLSX from "xlsx";
import studentsData from "../data/students.json";
// Memory store for courses (dummy)
let courses = [
  {
    id: "1",
    code: "BSIT",
    name: "Bachelor of Science in Information Technology",
    description: "IT program",
  },
  {
    id: "2",
    code: "BSED",
    name: "Bachelor of Secondary Education",
    description: "Education program",
  },
];

// Simulate network delay
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to simulate API response
const createResponse = (data, success = true, message = "") => ({
  success,
  data,
  message,
  timestamp: new Date().toISOString(),
});

export const dummyDataService = {
  // Authentication
  async login(email, password) {
    await delay(800);

    const user = usersData.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Generate fake token
    const token = `fake-jwt-token-${user.id}-${Date.now()}`;

    return createResponse({
      user: userWithoutPassword,
      token,
      expiresIn: "24h",
    });
  },

  async getParentsByBalance(params = {}) {
    await delay(300);

    const status = (params.status || "all").toLowerCase();
    const penaltyRate = 100; // default per-absence penalty in dummy data

    const parents = usersData.filter((u) => u.role === "PARENT_GUARDIAN");
    const results = parents.map((p) => {
      // children
      const children = (studentsData.students || []).filter(
        (s) => s.parentId === p.id
      );

      // contributions balance (data removed — default to empty)
      const parentContribs = [];
      const contributionBalance = 0;

      // penalties from attendance data removed — default to zero
      const parentAttendance = [];
      const absentCount = 0;
      const penaltyBalance = 0;

      const totalBalance = contributionBalance + penaltyBalance;

      return {
        parentId: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        phone: p.phone,
        children: (children || []).map((c) => `${c.firstName} ${c.lastName}`),
        penaltyBalance,
        contributionBalance,
        totalBalance,
      };
    });

    let filtered = results;
    if (status === "zero") {
      filtered = results.filter((r) => r.totalBalance === 0);
    } else if (status === "outstanding") {
      filtered = results.filter((r) => r.totalBalance > 0);
    }

    // Sort by last name
    filtered.sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(
        `${b.lastName} ${b.firstName}`
      )
    );

    return createResponse(filtered);
  },

  async register(userData) {
    await delay(600);

    // Check if email already exists
    const existingUser = usersData.find((u) => u.email === userData.email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    // Create new user
    const newUser = {
      id: (usersData.length + 1).toString(),
      ...userData,
      isActive: true,
      verified: false,
      isVerified: false,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passwordChangedAt: new Date().toISOString(),
    };

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return createResponse(userWithoutPassword);
  },

  // Users
  async getUsers(params = {}) {
    await delay();

    let filteredUsers = [...usersData];

    // Apply filters
    if (params.role) {
      filteredUsers = filteredUsers.filter((u) => u.role === params.role);
    }

    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (u) =>
          u.name?.toLowerCase().includes(searchTerm) ||
          u.email?.toLowerCase().includes(searchTerm) ||
          u.firstName?.toLowerCase().includes(searchTerm) ||
          u.lastName?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Remove passwords from all users
    const usersWithoutPasswords = paginatedUsers.map(
      ({ password, ...user }) => user
    );

    return createResponse({
      users: usersWithoutPasswords,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredUsers.length / limit),
        totalUsers: filteredUsers.length,
        hasNext: endIndex < filteredUsers.length,
        hasPrev: page > 1,
      },
    });
  },

  async getUserById(userId) {
    await delay();

    const user = usersData.find((u) => u.id === userId);
    if (!user) {
      throw new Error("User not found");
    }

    const { password: _, ...userWithoutPassword } = user;
    return createResponse(userWithoutPassword);
  },

  // Students
  async getStudents(params = {}) {
    await delay();

    let filteredStudents = [...studentsData.students];

    if (params.parentId) {
      filteredStudents = filteredStudents.filter(
        (s) => s.parentId === params.parentId
      );
    }

    if (params.gradeLevel) {
      filteredStudents = filteredStudents.filter(
        (s) => s.gradeLevel === params.gradeLevel
      );
    }

    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredStudents = filteredStudents.filter(
        (s) =>
          s.firstName?.toLowerCase().includes(searchTerm) ||
          s.lastName?.toLowerCase().includes(searchTerm) ||
          s.studentId?.toLowerCase().includes(searchTerm)
      );
    }

    return createResponse(filteredStudents);
  },

  async getMyChildren(parentId = "3") {
    await delay();

    // Simulate children for demo parent (id: "3") or passed parentId
    const children = studentsData.students.filter(
      (s) => s.parentId === "3" || s.parentId === parentId
    );

    return createResponse(children);
  },

  async getAllStudents(params = {}) {
    await delay();

    let filteredStudents = [...studentsData.students];

    // Apply filters
    if (params.gradeLevel) {
      filteredStudents = filteredStudents.filter(
        (s) => s.gradeLevel === params.gradeLevel
      );
    }

    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredStudents = filteredStudents.filter(
        (s) =>
          s.firstName?.toLowerCase().includes(searchTerm) ||
          s.lastName?.toLowerCase().includes(searchTerm) ||
          s.studentId?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

    return createResponse({
      students: paginatedStudents,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredStudents.length / limit),
        totalStudents: filteredStudents.length,
        hasNext: endIndex < filteredStudents.length,
        hasPrev: page > 1,
      },
    });
  },

  // Courses (dummy list for demonstration)
  async getCourses() {
    await delay(300);
    return createResponse(courses);
  },

  async createCourse(courseData) {
    await delay(300);
    const newCourse = { id: `${Date.now()}`, ...courseData };
    courses.push(newCourse);
    return createResponse(newCourse);
  },

  async updateCourse(courseId, courseData) {
    await delay(300);
    const idx = courses.findIndex((c) => c.id === String(courseId));
    if (idx === -1) throw new Error("Course not found");
    courses[idx] = { ...courses[idx], ...courseData };
    return createResponse(courses[idx]);
  },

  async deleteCourse(courseId) {
    await delay(300);
    courses = courses.filter((c) => c.id !== String(courseId));
    return createResponse({ success: true });
  },

  // Attendance
  async getMeetings(params = {}) {
    await delay();

    // attendance data removed — return empty meetings list
    let meetings = [];

    if (params.status) {
      meetings = meetings.filter((m) => m.status === params.status);
    }

    return createResponse(meetings);
  },

  async getAttendance(params = {}) {
    await delay();

    // attendance data removed — return empty attendance array
    let attendance = [];

    if (params.meetingId) {
      attendance = attendance.filter((a) => a.meetingId === params.meetingId);
    }

    if (params.parentId) {
      attendance = attendance.filter((a) => a.parentId === params.parentId);
    }

    return createResponse(attendance);
  },

  async getMyAttendance(parentId = "3") {
    await delay();

    // Attendance data removed; return empty summary
    const userAttendance = [];

    // Calculate summary
    const total = userAttendance.length;
    const attended = userAttendance.filter((a) => a.isPresent).length;
    const rate = total > 0 ? Math.round((attended / total) * 100) : 0;
    const recentMeetings = Math.min(3, total);

    return createResponse({
      attendance: userAttendance,
      total,
      attended,
      rate,
      recentMeetings,
    });
  },

  async getMyPenalties(parentId = "3") {
    await delay();

    // Simulate penalties for demo parent (id: "3") or passed parentId
    const penalties = [
      {
        id: "pen1",
        meetingId: "meeting1",
        meetingTitle: "Monthly Clinic Meeting - September 2025",
        meetingDate: "2025-09-15T09:00:00Z",
        reason: "Absence from meeting",
        amount: 100,
        isPaid: false,
        dueDate: "2025-10-15T23:59:59Z",
      },
    ];

    const totalAmount = penalties.reduce((sum, p) => sum + p.amount, 0);

    return createResponse({ penalties, totalAmount });
  },

  async getUpcomingMeetings(params = {}) {
    await delay();

    const now = new Date();
    // attendance data removed — no upcoming meetings
    let upcomingMeetings = [];

    // Apply limit if provided
    if (params.limit) {
      upcomingMeetings = upcomingMeetings.slice(0, params.limit);
    }

    return createResponse(upcomingMeetings);
  },

  async markAttendance(meetingId, parentId, studentId, status) {
    await delay();

    const newAttendance = {
      id: `att${Date.now()}`,
      meetingId,
      parentId,
      studentId,
      status,
      timeIn: status === "present" ? new Date().toISOString() : null,
      notes: "",
    };

    return createResponse(newAttendance);
  },

  async bulkRecordAttendance(bulkData) {
    await delay();

    const { meetingId, attendances } = bulkData;
    const results = [];

    for (const attendance of attendances) {
      const newAttendance = {
        id: `att${Date.now()}_${attendance.parentId}`,
        meetingId,
        parentId: attendance.parentId,
        status: attendance.status,
        timeIn:
          attendance.status === "PRESENT" ? new Date().toISOString() : null,
        notes: attendance.remarks || "",
        isLate: attendance.isLate || false,
        createdAt: new Date().toISOString(),
      };
      results.push(newAttendance);
    }

    return createResponse({
      count: results.length,
      attendances: results,
      message: `Successfully recorded ${results.length} attendance records`,
    });
  },

  // Contributions
  async getContributions(params = {}) {
    await delay();

    let contributions = [...contributionsData.contributions];

    if (params.parentId) {
      contributions = contributions.filter(
        (c) => c.parentId === params.parentId
      );
    }

    if (params.status) {
      contributions = contributions.filter((c) => c.status === params.status);
    }

    if (params.title) {
      contributions = contributions.filter((c) => c.title === params.title);
    }

    return createResponse(contributions);
  },

  async getMyContributions(parentId = "3") {
    await delay();

    // contributions data removed — return empty list for demo parent
    const contributions = [];

    return createResponse(contributions);
  },

  async getMyBalance(parentId = "3") {
    await delay();

    // contributions data removed — totals default to zero
    const contributions = [];

    const totalPaid = 0;

    const pendingVerification = 0;

    const baseAmount = 2500; // Base contribution amount
    const totalRequired = baseAmount;
    const outstanding = Math.max(0, totalRequired - totalPaid);

    const balance = {
      totalPaid,
      outstanding,
      pendingVerification,
      totalRequired,
      children: [{ name: "Juan Santos", requiredAmount: baseAmount }],
    };

    return createResponse(balance);
  },

  async getPaymentBasis() {
    await delay();

    const paymentBasis = {
      isPerStudent: false,
      baseAmount: 2500,
      multipleChildrenDiscount: 10,
      description: "Annual clinic contribution",
    };

    return createResponse(paymentBasis);
  },

  async recordPayment(paymentData) {
    await delay();

    // Simulate payment processing
    const newPayment = {
      id: `pay${Date.now()}`,
      ...paymentData,
      parentId: "3",
      isVerified: false,
      createdAt: new Date().toISOString(),
      receiptNumber:
        paymentData.receiptNumber ||
        `CLINIC-2025-${String(Date.now()).slice(-6)}`,
    };

    return createResponse(newPayment);
  },

  async getContributionTypes() {
    await delay();
    return createResponse([]);
  },

  async getAllContributions(params = {}) {
    await delay();

    // contributions data removed
    let filteredContributions = [];

    // Apply filters
    if (params.status) {
      filteredContributions = filteredContributions.filter(
        (c) => c.status === params.status
      );
    }

    if (params.title) {
      filteredContributions = filteredContributions.filter(
        (c) => c.title === params.title
      );
    }

    if (params.parentId) {
      filteredContributions = filteredContributions.filter(
        (c) => c.parentId === params.parentId
      );
    }

    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredContributions = filteredContributions.filter(
        (c) =>
          c.parentName?.toLowerCase().includes(searchTerm) ||
          c.title?.toLowerCase().includes(searchTerm) ||
          c.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedContributions = filteredContributions.slice(
      startIndex,
      endIndex
    );

    return createResponse({
      contributions: paginatedContributions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredContributions.length / limit),
        totalContributions: filteredContributions.length,
        hasNext: endIndex < filteredContributions.length,
        hasPrev: page > 1,
      },
    });
  },

  // Announcements
  async getAnnouncements(params = {}) {
    await delay();

    let announcements = [...announcementsData.announcements];

    if (params.category) {
      announcements = announcements.filter(
        (a) => a.category === params.category
      );
    }

    if (params.featured) {
      announcements = announcements.filter((a) => a.isFeatured);
    }

    if (params.active) {
      const now = new Date();
      announcements = announcements.filter((a) => {
        const publishDate = new Date(a.publishDate);
        const expiryDate = new Date(a.expiryDate);
        return (
          publishDate <= now && expiryDate >= now && a.status === "published"
        );
      });
    }

    // Sort by publish date (newest first)
    announcements.sort(
      (a, b) => new Date(b.publishDate) - new Date(a.publishDate)
    );

    return createResponse(announcements);
  },

  async getActiveAnnouncements(params = {}) {
    await delay();

    // announcements data removed — return empty active list
    let announcements = [];

    // Filter only active announcements
    const now = new Date();
    announcements = announcements.filter((a) => {
      if (a.expiryDate) {
        const expiryDate = new Date(a.expiryDate);
        return expiryDate >= now && a.status === "published";
      }
      return a.status === "published";
    });

    // Apply limit if provided
    if (params.limit) {
      announcements = announcements.slice(0, params.limit);
    }

    // Sort by priority and date
    announcements.sort((a, b) => {
      const priorityOrder = { urgent: 3, high: 2, normal: 1 };
      const aPriority = priorityOrder[a.priority] || 1;
      const bPriority = priorityOrder[b.priority] || 1;

      if (aPriority !== bPriority) return bPriority - aPriority;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return createResponse(announcements);
  },

  async getUnreadCount(parentId = "current") {
    await delay();

    // Simulate unread count for current user
    const unreadCount = Math.floor(Math.random() * 5) + 1; // Random 1-5

    return createResponse({ count: unreadCount });
  },

  async markAnnouncementAsRead(announcementId, parentId = "current") {
    await delay();

    // Simulate marking as read
    return createResponse({
      success: true,
      message: "Announcement marked as read",
    });
  },

  async getMyReadStatus(parentId = "current") {
    await delay();

    // Announcements removed — return empty read status
    const readStatus = [];

    return createResponse(readStatus);
  },

  async getAnnouncementById(id) {
    await delay();

    // Announcements removed — always return not found
    throw new Error("Announcement not found");
  },

  async createAnnouncement(announcementData) {
    await delay();

    const newAnnouncement = {
      id: `ann${Date.now()}`,
      ...announcementData,
      authorId: "1", // Assume admin user
      authorName: "Maria Santos",
      publishDate: new Date().toISOString(),
      status: "published",
      views: 0,
      attachments: announcementData.attachments || [],
    };

    return createResponse(newAnnouncement);
  },

  // Projects
  async getProjects(params = {}) {
    await delay();

    // projects data removed — return empty list
    let projects = [];

    if (params.status) {
      projects = projects.filter((p) => p.status === params.status);
    }

    if (params.category) {
      projects = projects.filter((p) => p.category === params.category);
    }

    if (params.organizer) {
      projects = projects.filter((p) => p.organizer === params.organizer);
    }

    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.title?.toLowerCase().includes(searchTerm) ||
          p.description?.toLowerCase().includes(searchTerm)
      );
    }

    return createResponse(projects);
  },

  async getActiveProjects(params = {}) {
    await delay();

    // projects data removed — return empty active projects list
    let projects = [];

    // Filter only active projects
    projects = projects.filter(
      (p) =>
        p.status === "active" ||
        p.status === "in_progress" ||
        p.status === "planning"
    );

    // Apply limit if provided
    if (params.limit) {
      projects = projects.slice(0, params.limit);
    }

    return createResponse(projects);
  },

  async getPublicDocuments(params = {}) {
    await delay();

    // Simulate public documents
    const documents = [
      {
        id: "doc1",
        title: "PTA Meeting Minutes - October 2025",
        description: "Minutes from the monthly PTA meeting",
        category: "meeting_minutes",
        fileName: "pta-minutes-oct-2025.pdf",
        fileSize: 1024000,
        createdAt: "2025-10-01T09:00:00Z",
        projectTitle: null,
      },
      {
        id: "doc2",
        title: "School Building Fund Resolution",
        description: "Resolution approved for school building improvements",
        category: "resolution",
        fileName: "building-fund-resolution.pdf",
        fileSize: 512000,
        createdAt: "2025-09-15T14:00:00Z",
        projectTitle: "School Building Fund",
      },
      {
        id: "doc3",
        title: "Financial Report Q3 2025",
        description: "Quarterly financial report for PTA activities",
        category: "financial_report",
        fileName: "financial-report-q3-2025.pdf",
        fileSize: 2048000,
        createdAt: "2025-09-30T16:00:00Z",
        projectTitle: null,
      },
    ];

    return createResponse(documents);
  },

  async downloadDocument(documentId) {
    await delay();

    // Simulate file download
    const fileContent = `Document content for ${documentId}`;
    return new Blob([fileContent], { type: "application/pdf" });
  },

  async getProjectById(projectId) {
    await delay();

    // Projects removed in dummy data — always not found
    throw new Error("Project not found");
  },

  async createProject(projectData) {
    await delay();

    const newProject = {
      id: `proj${Date.now()}`,
      ...projectData,
      organizer: "1", // Assume admin user
      organizerName: "Maria Santos",
      currentAmount: 0,
      status: "planning",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      participants: [],
      milestones: [],
      documents: [],
      updates: [],
    };
    // If resolution file provided, store its name and create a dummy URL
    if (projectData && projectData.resolution) {
      newProject.resolutionFileName =
        projectData.resolution.name || "resolution.pdf";
      newProject.resolutionFileUrl = `https://example.com/dummy-resolutions/${newProject.resolutionFileName}`;
      // Default to a single page PDF for dummy data (can be randomized if needed)
      newProject.resolutionPages = projectData.resolutionPages || 1;
    }

    return createResponse(newProject);
  },

  async updateProject(projectId, projectData) {
    await delay();

    const project = projectsData.projects.find((p) => p.id === projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const updatedProject = {
      ...project,
      ...projectData,
      updatedAt: new Date().toISOString(),
    };

    return createResponse(updatedProject);
  },

  async joinProject(projectId, parentId) {
    await delay();

    const project = projectsData.projects.find((p) => p.id === projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (!project.participants.includes(parentId)) {
      project.participants.push(parentId);
    }

    return createResponse({
      success: true,
      message: "Successfully joined project",
    });
  },

  async addProjectUpdate(projectId, updateData) {
    await delay();

    const newUpdate = {
      id: `up${Date.now()}`,
      ...updateData,
      date: new Date().toISOString(),
      author: "1",
      authorName: "Maria Santos",
    };

    return createResponse(newUpdate);
  },

  async getProjectCategories() {
    await delay();
    return createResponse([]);
  },

  // Clearance
  async getClearanceRequests(params = {}) {
    await delay();

    let clearanceRequests = [...clearanceData.clearanceRequests];

    if (params.parentId) {
      clearanceRequests = clearanceRequests.filter(
        (c) => c.parentId === params.parentId
      );
    }

    if (params.studentId) {
      clearanceRequests = clearanceRequests.filter(
        (c) => c.studentId === params.studentId
      );
    }

    if (params.status) {
      clearanceRequests = clearanceRequests.filter(
        (c) => c.status === params.status
      );
    }

    if (params.clearanceType) {
      clearanceRequests = clearanceRequests.filter(
        (c) => c.clearanceType === params.clearanceType
      );
    }

    return createResponse(clearanceRequests);
  },

  async getMyClearanceStatus(parentId = "current") {
    await delay();

    // Simulate clearance status for current user
    const status = {
      isCleared: false,
      isEligible: true,
      message:
        "You need to complete all requirements before requesting clearance",
      attendance: {
        rate: 75, // 75% attendance rate
        attended: 3,
        total: 4,
        met: false, // Needs 80% minimum
      },
      financial: {
        outstanding: 500,
        met: false, // Still has outstanding balance
      },
      additionalRequirements: [],
    };

    return createResponse(status);
  },

  async getMyClearanceRequests(parentId = "current") {
    await delay();

    // clearance data removed — return empty list
    const requests = [];

    return createResponse(requests);
  },

  async requestClearance(purpose, studentId = null) {
    await delay();

    const newRequest = {
      id: `clear${Date.now()}`,
      parentId: "3",
      studentId,
      studentName: studentId ? "Juan Santos" : null,
      purpose,
      status: "pending",
      createdAt: new Date().toISOString(),
      processedAt: null,
      processedBy: null,
    };

    return createResponse(newRequest);
  },

  async downloadMyClearance(requestId) {
    await delay();

    // Simulate PDF generation
    const pdfContent = `Clearance Certificate - Request ID: ${requestId}`;
    return new Blob([pdfContent], { type: "application/pdf" });
  },

  async getClearanceRequestById(requestId) {
    await delay();

    // Clearance data removed — always not found
    throw new Error("Clearance request not found");
  },

  async submitClearanceRequest(requestData) {
    await delay();

    const newRequest = {
      id: `clear${Date.now()}`,
      ...requestData,
      status: "pending",
      submittedAt: new Date().toISOString(),
      processedAt: null,
      processedBy: null,
      requirements: [],
      documents: [],
    };

    return createResponse(newRequest);
  },

  async updateClearanceRequest(requestId, updateData) {
    await delay();

    // Clearance data removed — cannot update
    throw new Error("Clearance request not found");
  },

  async approveClearanceRequest(requestId, approvalData = {}) {
    await delay();

    return await this.updateClearanceRequest(requestId, {
      status: "approved",
      notes: approvalData.notes || "All requirements completed successfully",
    });
  },

  async rejectClearanceRequest(requestId, rejectionData) {
    await delay();

    return await this.updateClearanceRequest(requestId, {
      status: "rejected",
      rejectionReason: rejectionData.reason,
      notes: rejectionData.notes,
    });
  },

  async getClearanceTypes() {
    await delay();
    return createResponse([]);
  },

  async getClearanceRequirements() {
    await delay();
    return createResponse([]);
  },

  async uploadClearanceDocument(requestId, documentData) {
    await delay();

    const newDocument = {
      id: `cdoc${Date.now()}`,
      ...documentData,
      uploadedAt: new Date().toISOString(),
      size: "1.2 MB", // Simulated size
    };

    return createResponse(newDocument);
  },

  async downloadClearanceCertificate(requestId) {
    await delay();

    // Simulate PDF generation
    const pdfData = `Clearance Certificate for Request ${requestId}`;
    return new Blob([pdfData], { type: "application/pdf" });
  },

  // Statistics
  async getStats() {
    await delay();

    const stats = {
      users: {
        total: usersData.length,
        admin: usersData.filter(
          (u) => u.role === "CLINIC_ADMIN" || u.role === "CLINIC_STAFF"
        ).length,
        parents: usersData.filter((u) => u.role === "PARENT_GUARDIAN").length,
        active: usersData.filter((u) => u.isActive).length,
      },
      students: {
        total: studentsData.students.length,
        active: studentsData.students.filter((s) => s.status === "active")
          .length,
      },
      contributions: {
        total: 0,
        paid: 0,
        pending: 0,
        totalAmount: 0,
      },
      meetings: {
        total: 0,
        upcoming: 0,
        completed: 0,
      },
    };

    return createResponse(stats);
  },

  // Projects
  async getAllProjects(params = {}) {
    await delay();

    let filteredProjects = [];

    // Apply filters
    if (params.status) {
      filteredProjects = filteredProjects.filter(
        (p) => p.status === params.status
      );
    }

    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredProjects = filteredProjects.filter(
        (p) =>
          p.title?.toLowerCase().includes(searchTerm) ||
          p.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

    return createResponse({
      projects: paginatedProjects,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredProjects.length / limit),
        totalProjects: filteredProjects.length,
        hasNext: endIndex < filteredProjects.length,
        hasPrev: page > 1,
      },
    });
  },

  async getAllMeetingDocuments(params = {}) {
    await delay();

    // Mock meeting documents data
    const documents = [
      {
        id: "doc1",
        title: "PTA General Assembly Minutes - October 2025",
        type: "minutes",
        fileName: "PTA_Minutes_Oct2025.pdf",
        fileSize: "2.4 MB",
        uploadedBy: "Admin",
        uploadedAt: "2025-10-01T10:00:00Z",
        meetingId: "meeting1",
        downloadUrl: "/documents/pta-minutes-oct2025.pdf",
      },
      {
        id: "doc2",
        title: "Budget Proposal 2025-2026",
        type: "proposal",
        fileName: "Budget_Proposal_2025-2026.pdf",
        fileSize: "1.8 MB",
        uploadedBy: "Admin",
        uploadedAt: "2025-09-15T14:30:00Z",
        meetingId: "meeting2",
        downloadUrl: "/documents/budget-proposal-2025-2026.pdf",
      },
      {
        id: "doc3",
        title: "School Activity Guidelines",
        type: "guidelines",
        fileName: "Activity_Guidelines.pdf",
        fileSize: "950 KB",
        uploadedBy: "Admin",
        uploadedAt: "2025-09-20T09:15:00Z",
        meetingId: "meeting1",
        downloadUrl: "/documents/activity-guidelines.pdf",
      },
    ];

    let filteredDocuments = [...documents];

    // Apply filters
    if (params.type) {
      filteredDocuments = filteredDocuments.filter(
        (d) => d.type === params.type
      );
    }

    if (params.meetingId) {
      filteredDocuments = filteredDocuments.filter(
        (d) => d.meetingId === params.meetingId
      );
    }

    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredDocuments = filteredDocuments.filter(
        (d) =>
          d.title?.toLowerCase().includes(searchTerm) ||
          d.fileName?.toLowerCase().includes(searchTerm)
      );
    }

    return createResponse(filteredDocuments);
  },

  // Announcements
  async getAllAnnouncements(params = {}) {
    await delay();

    let filteredAnnouncements = [...announcementsData.announcements];

    // Apply filters
    if (params.priority) {
      filteredAnnouncements = filteredAnnouncements.filter(
        (a) => a.priority === params.priority
      );
    }

    if (params.status) {
      filteredAnnouncements = filteredAnnouncements.filter(
        (a) => a.status === params.status
      );
    }

    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredAnnouncements = filteredAnnouncements.filter(
        (a) =>
          a.title?.toLowerCase().includes(searchTerm) ||
          a.content?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedAnnouncements = filteredAnnouncements.slice(
      startIndex,
      endIndex
    );

    return createResponse({
      announcements: paginatedAnnouncements,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredAnnouncements.length / limit),
        totalAnnouncements: filteredAnnouncements.length,
        hasNext: endIndex < filteredAnnouncements.length,
        hasPrev: page > 1,
      },
    });
  },

  // Export students as XLSX (returns Blob-like response similar to axios)
  async exportStudents(params = {}) {
    await delay(300);
    const students = studentsData.students || [];
    // Deduplicate by studentId before export
    const seen = new Set();
    const uniqueStudents = [];
    for (const s of students) {
      if (!seen.has(s.studentId)) {
        seen.add(s.studentId);
        uniqueStudents.push(s);
      }
    }
    // Build XLSX workbook header and rows
    const headers = [
      "studentId",
      "firstName",
      "middleName",
      "lastName",
      "birthDate",
      "yearEnrolled",
      "status",
    ];

    const aoa = [headers];
    uniqueStudents.forEach((s) => {
      aoa.push([
        s.studentId || "",
        s.firstName || "",
        s.middleName || "",
        s.lastName || "",
        s.birthDate || "",
        s.yearEnrolled ||
          (s.enrollmentDate ? new Date(s.enrollmentDate).getFullYear() : ""),
        (s.status || "").toUpperCase(),
      ]);
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoa, { dateNF: "yyyy-mm-dd" });
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    return { data: blob };
  },

  // Bulk import students from XLSX file (simulate server-side behavior)
  async bulkImportStudents(xlsxFile) {
    await delay(600);

    // Helper to parse XLSX using SheetJS
    const parseXlsx = async (file) => {
      return new Promise((resolve, reject) => {
        if (typeof file === "string") return resolve([]);
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target.result;
            const wb = XLSX.read(data, { type: "array", cellDates: true });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            const sheetRows = XLSX.utils.sheet_to_json(sheet, {
              defval: "",
              raw: false,
              dateNF: "yyyy-mm-dd",
            });
            resolve(sheetRows);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = (e) => reject(e);
        reader.readAsArrayBuffer(file);
      });
    };

    // No CSV fallback: only XLSX allowed

    try {
      if (typeof xlsxFile === "string") {
        return createResponse(
          {
            created: 0,
            skipped: 0,
            errors: [{ message: "Only file uploads are allowed" }],
          },
          false,
          "Invalid input"
        );
      }
      const lcName = xlsxFile.name?.toLowerCase?.() || "";
      if (!lcName.endsWith(".xlsx") && !lcName.endsWith(".xls")) {
        return createResponse(
          {
            created: 0,
            skipped: 0,
            errors: [
              { message: "Only XLS/XLSX files supported in dummy mode" },
            ],
          },
          false,
          "Invalid file type"
        );
      }
      const rows = await parseXlsx(xlsxFile);
      const existingIds = new Set(
        (studentsData.students || []).map((s) => s.studentId)
      );
      const requiredFields = [
        "studentId",
        "firstName",
        "lastName",
        "yearEnrolled",
      ];
      let created = 0;
      let skipped = 0;
      const errors = [];
      const invalidRows = [];
      const availableUserIds = new Set((usersData || []).map((u) => u.id));

      const seenIds = new Set();
      for (const [idx, row] of rows.entries()) {
        const rowNum = idx + 2; // account for header row
        // Ensure required fields are present
        const missing = requiredFields.filter(
          (f) => !row[f] || String(row[f]).trim() === ""
        );
        if (missing.length > 0) {
          skipped++;
          errors.push({
            row: rowNum,
            message: `Missing fields: ${missing.join(", ")}`,
          });
          continue;
        }
        if (existingIds.has(row.studentId)) {
          skipped++;
          continue;
        }
        // Check for duplicate studentId within this CSV
        if (seenIds.has(row.studentId)) {
          skipped++;
          const msg = `Duplicate studentId in CSV: ${row.studentId}`;
          errors.push({ row: rowNum, message: msg });
          invalidRows.push({ row: rowNum, values: row, error: msg });
          continue;
        }
        seenIds.add(row.studentId);
        // Validate yearEnrolled (must be 4-digit year)
        const yearPattern = /^[0-9]{4}$/;
        if (!yearPattern.test(String(row.yearEnrolled))) {
          skipped++;
          const msg = `Invalid yearEnrolled value: ${row.yearEnrolled}`;
          errors.push({ row: rowNum, message: msg });
          invalidRows.push({ row: rowNum, values: row, error: msg });
          continue;
        }
        // do not process parentId from CSV — linking must happen through the app
        // Create new student entry (simulation)
        const newStudent = {
          id: `student_local_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          studentId: row.studentId,
          firstName: row.firstName,
          middleName: row.middleName || null,
          lastName: row.lastName,
          birthDate: row.birthDate || null,
          yearEnrolled: row.yearEnrolled ? String(row.yearEnrolled) : null,
          status: (row.status || "ACTIVE").toUpperCase(),
          // do not accept enrollmentDate or parentId via CSV
        };
        studentsData.students.push(newStudent);
        existingIds.add(newStudent.studentId);
        created++;
      }

      return createResponse({ created, skipped, errors, invalidRows });
    } catch (e) {
      return createResponse(
        { created: 0, skipped: 0, errors: [{ message: e.message }] },
        false,
        e.message
      );
    }
  },

  // Search students by name or ID (used by various pages)
  async searchStudents(searchTerm = "") {
    await delay(300);
    const normalized = (searchTerm || "").trim().toLowerCase();
    if (!normalized) return createResponse([]);
    const results = (studentsData.students || []).filter((s) => {
      const fullName = `${s.firstName || ""} ${s.middleName || ""} ${
        s.lastName || ""
      }`.toLowerCase();
      return (
        fullName.includes(normalized) ||
        (s.studentId || "").toLowerCase().includes(normalized)
      );
    });
    return createResponse(results);
  },

  async unlinkStudent(studentId) {
    await delay(400);
    const idx = studentsData.students.findIndex((s) => s.id === studentId);
    if (idx === -1) {
      throw new Error("Student not found");
    }
    // Simulate unlink by setting linkStatus back to PENDING
    studentsData.students[idx].linkStatus = "PENDING";
    return createResponse({
      message: "Student unlinked (status set to PENDING)",
    });
  },

  // Get pending/approved/rejected parent-student link requests (Admin view)
  async getPendingParentLinks(params = {}) {
    await delay(300);

    let filtered = [...(studentsData.students || [])];

    // Only include students that have a parent assigned (link requests)
    filtered = filtered.filter(
      (s) => s.parentId !== null && s.parentId !== undefined
    );

    if (params.status) {
      const statusUpper = String(params.status).toUpperCase();
      filtered = filtered.filter(
        (s) => String(s.linkStatus).toUpperCase() === statusUpper
      );
    }

    // Pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = filtered.slice(startIndex, endIndex);

    // Return shape similar to backend: students, totalCount, totalPages, currentPage
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;

    return createResponse({
      students: paginated,
      totalCount,
      totalPages,
      currentPage: page,
    });
  },

  // Clearance
  async getAllClearanceRequests(params = {}) {
    await delay();

    // clearance data removed — return empty list
    let filteredRequests = [];

    // Apply filters
    if (params.status) {
      filteredRequests = filteredRequests.filter(
        (r) => r.status === params.status
      );
    }

    if (params.parentId) {
      filteredRequests = filteredRequests.filter(
        (r) => r.parentId === params.parentId
      );
    }

    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredRequests = filteredRequests.filter(
        (r) =>
          r.parentName?.toLowerCase().includes(searchTerm) ||
          r.reason?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

    return createResponse({
      requests: paginatedRequests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredRequests.length / limit),
        totalRequests: filteredRequests.length,
        hasNext: endIndex < filteredRequests.length,
        hasPrev: page > 1,
      },
    });
  },

  async searchParentStudent(searchTerm = "") {
    await delay();

    const normalized = (searchTerm || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/,/g, "");
    const tokens = normalized.length > 0 ? normalized.split(" ") : [];

    // find parent users
    let parents = usersData.filter((u) => u.role === "PARENT_GUARDIAN");
    if (normalized) {
      parents = parents.filter((p) => {
        const fullName = `${p.firstName || ""} ${p.middleName || ""} ${
          p.lastName || ""
        }`.toLowerCase();
        const email = (p.email || "").toLowerCase();
        if (fullName.includes(normalized) || email.includes(normalized))
          return true;
        // first last match
        if (tokens.length >= 2) {
          const firstToken = tokens[0];
          const lastToken = tokens[tokens.length - 1];
          if (
            (p.firstName || "").toLowerCase().includes(firstToken) &&
            (p.lastName || "").toLowerCase().includes(lastToken)
          )
            return true;
          // reversed order: 'Last First'
          if (
            (p.lastName || "").toLowerCase().includes(firstToken) &&
            (p.firstName || "").toLowerCase().includes(lastToken)
          )
            return true;
          const middleToken =
            tokens.length >= 3
              ? tokens.slice(1, tokens.length - 1).join(" ")
              : "";
          if (
            middleToken &&
            (p.firstName || "").toLowerCase().includes(firstToken) &&
            (p.middleName || "").toLowerCase().includes(middleToken) &&
            (p.lastName || "").toLowerCase().includes(lastToken)
          )
            return true;
        }
        return false;
      });
    }

    // Map students and include student names
    const results = parents.map((p) => {
      const students = studentsData.students.filter((s) => s.parentId === p.id);
      return {
        parentId: p.id,
        firstName: p.firstName,
        middleName: p.middleName,
        lastName: p.lastName,
        email: p.email,
        phone: p.phone,
        students: students.map((s) => ({
          id: s.id,
          name: `${s.firstName} ${s.lastName}`,
        })),
      };
    });

    return createResponse(results);
  },
};
