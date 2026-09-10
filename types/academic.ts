export interface College {
  id: string;
  name: string;
  code: string;
  tagline: string;
  logoUrl?: string;
  address: string;
  city: string;
  province: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  establishedYear: number;
}

export interface AcademicSession {
  id: string;
  name: string; // e.g. "Fall 2026", "2025-2029"
  code: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export type ProgramLevel =
  | "intermediate" // FSc, ICS, FA, ICom
  | "undergraduate" // BS CS, BBA, etc.
  | "postgraduate"; // MS, MPhil

export interface Program {
  id: string;
  departmentId: string;
  name: string;
  code: string; // e.g. "BS-CS", "FSC-ENG"
  level: ProgramLevel;
  durationYears: number;
  totalSemestersOrYears: number;
  description: string;
  eligibilityCriteria: string;
  annualFeePKR: number;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headOfDepartment: string; // Teacher name / ID
  description: string;
  programsCount: number;
}

export interface Course {
  id: string;
  departmentId: string;
  programId: string;
  code: string; // e.g. "CS-101"
  title: string;
  creditHours: number;
  semester: number;
  description: string;
  teacherId?: string;
}
