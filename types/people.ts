import { ApplicationStatus } from "./applications";

export interface Applicant {
  id: string; // Application ID e.g. APP-2026-104
  applicationNumber: string;
  fullName: string;
  email: string;
  phone: string;
  cnicBForm: string;
  desiredProgramId: string;
  desiredProgramName: string;
  academicSessionId: string;
  previousQualification: string;
  previousMarksPercentage: number;
  status: ApplicationStatus;
  submissionDate: string;
  applicantNotes?: string;
}

export type StudentStatus = "active" | "suspended" | "graduated" | "alumni";

export interface Student {
  id: string; // e.g. STD-2026-042
  studentIdNumber: string; // Registration number
  rollNumber: string;
  fullName: string;
  email: string;
  phone: string;
  cnicBForm: string;
  programId: string;
  programName: string;
  departmentName: string;
  currentSemesterOrYear: number;
  academicSessionId: string;
  status: StudentStatus;
  guardianName: string;
  guardianPhone: string;
  admissionDate: string;
  avatarUrl?: string;
}

export interface Teacher {
  id: string; // e.g. TCH-108
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  designation: string; // Lecturer, Assistant Professor, Associate Professor, etc.
  qualification: string;
  assignedCourseIds: string[];
  joiningDate: string;
  avatarUrl?: string;
}

export interface Staff {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  roleTitle: string; // Accounts Officer, Admissions Officer, Registrar, etc.
  department: string;
}
