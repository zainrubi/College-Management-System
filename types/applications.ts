export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "more_info_required"
  | "on_hold"
  | "interview_scheduled"
  | "accepted"
  | "rejected"
  | "enrolled";

export interface AcademicRecord {
  id: string;
  level: "Matric / O-Levels / SSC" | "Intermediate / A-Levels / HSSC" | "Graduation / Bachelor" | "Other";
  institution: string;
  qualification: string;
  boardOrUniversity: string;
  rollNumber: string;
  passingYear: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  majorSubjects: string[];
  status?: "Completed" | "Result Awaiting";
}

export interface SubmittedDocument {
  id: string;
  type: string;
  title: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  fileUrl?: string;
  status: "verified" | "pending" | "rejected" | "reupload_requested";
  rejectionReason?: string;
}

export interface ApplicationAuditEvent {
  id: string;
  action: string;
  timestamp: string;
  performedBy: string;
  role: string;
  previousStatus?: ApplicationStatus;
  newStatus?: ApplicationStatus;
  note?: string;
}

export interface CompleteApplication {
  id: string;
  applicationNumber: string;
  createdAt: string;
  updatedAt?: string;
  status: ApplicationStatus;
  academicSession: string;
  admissionCycle: string;
  assignedReviewer?: string;

  // Section B: Personal Information
  personal: {
    fullName: string;
    photoUrl?: string;
    dob: string;
    gender: "Male" | "Female" | "Other";
    cnicBForm: string;
    nationality: string;
    religion?: string;
    bloodGroup?: string;
    domicile?: string;
    maritalStatus?: string;
    fatherName: string;
    motherName?: string;
  };

  // Section C: Contact Information
  contact: {
    phone: string;
    email: string;
    altPhone?: string;
    currentAddress: string;
    permanentAddress: string;
    city: string;
    district: string;
    province: string;
    postalCode?: string;
  };

  // Section D: Parent / Guardian Information
  guardian: {
    guardianName: string;
    relationship: "Father" | "Mother" | "Brother" | "Uncle" | "Guardian" | "Other";
    guardianCnic: string;
    guardianPhone: string;
    guardianOccupation: string;
    guardianMonthlyIncome?: string;
    guardianAddress?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
  };

  // Section E: Academic History
  academicHistory: AcademicRecord[];

  // Section F: Program & Preferences
  preferences: {
    selectedProgram: string;
    academicLevel: "Intermediate" | "Undergraduate" | "Postgraduate";
    firstPreference: string;
    secondPreference?: string;
    campusPreference: string;
    admissionSession: string;
    admissionCategory: "Open Merit" | "Self Finance" | "Quota" | "Sports" | "Reserved";
    shiftPreference?: "Morning" | "Evening" | "Weekend";
  };

  // Section G: Transport Information
  transport: {
    transportRequired: boolean;
    route?: string;
    pickupLocation?: string;
    notes?: string;
  };

  // Section H: Documents
  documents: SubmittedDocument[];

  // Section I: Declaration & Additional Notes
  declaration: {
    applicantDeclarationAgreed: boolean;
    declarationDate: string;
    specialCircumstances?: string;
    disabilityStatus?: string;
    extracurricularActivities?: string;
    notes?: string;
    customAnswers?: { question: string; answer: string }[];
  };

  // Section J: Audit Trail / History
  history: ApplicationAuditEvent[];
}
