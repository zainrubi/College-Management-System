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

export type StudentStatus = "active" | "suspended" | "graduated" | "alumni" | "withdrawn";

export interface StudentProgramInfo {
  name?: string;
  programName?: string;
  code?: string;
  academicLevel?: string;
  shift?: string;
  campus?: string;
  session?: string;
  currentSemesterOrYear?: number;
}

export interface StudentGuardianInfo {
  fatherName?: string;
  motherName?: string;
  guardianPhone?: string;
  name?: string;
  relation?: string;
  phone?: string;
}

export interface StudentAddressInfo {
  domicile?: string;
  currentAddress?: string;
  permanentAddress?: string;
}

export interface StudentProfileData {
  id: string;
  applicantId?: string;
  applicationId?: string;
  studentIdNumber: string;
  rollNumber: string;
  fullName: string;
  dob?: string;
  gender?: string;
  cnicBForm?: string;
  bloodGroup?: string;
  nationality?: string;
  religion?: string;
  phone?: string;
  email?: string;
  guardian?: StudentGuardianInfo;
  address?: StudentAddressInfo | string;
  program?: StudentProgramInfo;
  status: StudentStatus | string;
  admissionDate?: string;
  isActivated?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id: string; // e.g. STD-2026-042
  studentIdNumber: string; // Registration number
  rollNumber: string;
  fullName: string;
  email: string;
  phone: string;
  cnicBForm: string;
  programId?: string;
  programName: string;
  departmentName?: string;
  currentSemesterOrYear: number;
  academicSessionId?: string;
  status: StudentStatus;
  guardianName?: string;
  guardianPhone?: string;
  admissionDate: string;
  avatarUrl?: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  nationality?: string;
  religion?: string;
  domicile?: string;
  address?: string;
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
