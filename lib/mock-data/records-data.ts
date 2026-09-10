import { AttendanceRecord, Handout, Notification } from "@/types";

export const MOCK_HANDOUTS: Handout[] = [
  {
    id: "hnd-001",
    title: "CS-101 Lecture 04: Control Structures & Loops",
    courseId: "crs-cs101",
    courseTitle: "Programming Fundamentals",
    teacherId: "tch-101",
    teacherName: "Dr. Muhammad Shahbaz",
    fileUrl: "/downloads/handouts/cs101-lec04.pdf",
    fileType: "pdf",
    fileSizeBytes: 2450000,
    uploadedAt: "2026-08-18",
    description: "Detailed slide notes on while loops, for loops, and nested branching in C++.",
  },
  {
    id: "hnd-002",
    title: "MGT-201 Case Study: Leadership Styles in Asian Corporations",
    courseId: "crs-mgt201",
    courseTitle: "Principles of Management",
    teacherId: "tch-102",
    teacherName: "Prof. Saima Malik",
    fileUrl: "/downloads/handouts/mgt201-casestudy.docx",
    fileType: "docx",
    fileSizeBytes: 1120000,
    uploadedAt: "2026-08-20",
    description: "Mandatory reading for upcoming group presentation in Week 3.",
  },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  {
    id: "att-001",
    studentId: "std-2026-001",
    studentName: "Ali Hasan Siddiqui",
    rollNumber: "BCS-F24-014",
    courseId: "crs-cs101",
    courseTitle: "Programming Fundamentals",
    date: "2026-08-21",
    status: "present",
  },
  {
    id: "att-002",
    studentId: "std-2026-002",
    studentName: "Mahnoor Tariq",
    rollNumber: "BBA-F25-045",
    courseId: "crs-mgt201",
    courseTitle: "Principles of Management",
    date: "2026-08-21",
    status: "present",
  },
  {
    id: "att-003",
    studentId: "std-2026-003",
    studentName: "Usman Ghani",
    rollNumber: "FSC-A25-102",
    courseId: "crs-phy101",
    courseTitle: "Physics Part-I",
    date: "2026-08-21",
    status: "absent",
    remarks: "Medical leave application pending",
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-001",
    title: "Fall 2026 Semester Registration Notice",
    message: "Course registration for Fall 2026 is open until August 28, 2026. Please settle pending fee vouchers before registering.",
    targetRole: "students",
    category: "academic",
    createdAt: "2026-08-20T09:00:00Z",
    isRead: false,
  },
  {
    id: "notif-002",
    title: "Fee Voucher Due Date Extension Request Process",
    message: "Students seeking fee installment extensions must apply via the Student Portal by August 24, 2026.",
    targetRole: "all",
    category: "fee",
    createdAt: "2026-08-19T14:30:00Z",
    isRead: true,
  },
  {
    id: "notif-003",
    title: "Admissions Open Fall 2026 - Merit List Announcement",
    message: "First Merit List for BSCS and BBA programs will be published on August 26, 2026 at 10:00 AM.",
    targetRole: "applicants",
    category: "event",
    createdAt: "2026-08-15T08:00:00Z",
    isRead: false,
  },
];
