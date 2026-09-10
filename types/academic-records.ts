export type AttendanceStatus = "present" | "absent" | "late" | "leave";

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  courseId: string;
  courseTitle: string;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface Handout {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  teacherId: string;
  teacherName: string;
  fileUrl: string;
  fileType: "pdf" | "docx" | "ppt" | "zip";
  fileSizeBytes: number;
  uploadedAt: string;
  description?: string;
}

export type NotificationTarget = "all" | "students" | "teachers" | "applicants";

export interface Notification {
  id: string;
  title: string;
  message: string;
  targetRole: NotificationTarget;
  category: "academic" | "fee" | "event" | "general" | "urgent";
  createdAt: string;
  isRead?: boolean;
  actionUrl?: string;
}
