import {
  APPLICATIONS_STORAGE_KEY,
  executeApplicationAction,
  findApplicationById,
  getStoredApplications,
  saveStoredApplications,
} from "@/lib/mock-data/applications-data";
import type {
  CompleteApplication,
  ApplicationStatus,
  ApplicationAuditEvent,
} from "@/types/applications";

export const APPLICANT_APPLICATION_STORAGE_KEY = "cms_applicant_admission_data";
const REGISTERED_PHONES_STORAGE_KEY = "cms_registered_phones";
const AUTH_USER_STORAGE_KEY = "cms_demo_auth_user";
const APPLICANT_ACCOUNTS_STORAGE_KEY = "cms_applicant_accounts";

interface StoredApplicantAccount {
  phone: string;
  password: string;
  fullName: string;
  email?: string;
}

export interface ApplicantApplicationData {
  appId?: string;
  status:
    | "Draft"
    | "Submitted"
    | "Under Review"
    | "More Information Required"
    | "On Hold"
    | "Merit Qualified"
    | "Accepted"
    | "Admitted"
    | "Rejected";
  submittedAt?: string;
  fullName: string;
  fatherName: string;
  motherName: string;
  dob: string;
  gender: string;
  idType: "CNIC" | "B-Form / Juvenile Card";
  idNumber: string;
  phone: string;
  altPhone: string;
  email: string;
  nationality: string;
  religion: string;
  bloodGroup: string;
  domicile: string;
  address: string;
  matricBoard: string;
  matricRollNo: string;
  matricYear: string;
  matricGroup: string;
  matricTotalMarks: string;
  matricObtainedMarks: string;
  interStatus: "Awaiting Result" | "Passed" | "Not Applicable (Applying for Inter)";
  interBoard?: string;
  interRollNo?: string;
  interYear?: string;
  interTotalMarks?: string;
  interObtainedMarks?: string;
  academicLevel: "Intermediate" | "Undergraduate";
  primaryProgram: string;
  secondaryProgram: string;
  preferredShift: string;
  documents: {
    matricResultCard?: string;
    cnicOrBForm?: string;
    guardianCnic?: string;
    photo?: string;
  };
  undertakingAgreed: boolean;
}

export interface ApplicantRegistrationInput {
  fullName: string;
  phone: string;
  email?: string;
  password: string;
}

export interface ApplicantLoginResult {
  fullName: string;
  phone: string;
  email?: string;
  hasSubmittedApplication: boolean;
}

export interface DocumentUpload {
  key: keyof ApplicantApplicationData["documents"];
  fileName: string;
}

export type StudentStatus = "active" | "inactive" | "graduated" | "suspended";

function getStorage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const stored = getStorage()?.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  try {
    getStorage()?.setItem(key, JSON.stringify(value));
  } catch {
    // Browser storage is optional in the frontend prototype.
  }
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(0, 11);
}

function isValidApplicantPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return /^\d{11}$/.test(digits) && phone.trim() === digits;
}

export const DEFAULT_APPLICANT_APPLICATION: ApplicantApplicationData = {
  status: "Draft",
  fullName: "",
  fatherName: "",
  motherName: "",
  dob: "",
  gender: "Male",
  idType: "B-Form / Juvenile Card",
  idNumber: "",
  phone: "",
  altPhone: "",
  email: "",
  nationality: "Pakistani",
  religion: "Islam",
  bloodGroup: "",
  domicile: "Kasur",
  address: "",
  matricBoard: "BISE Lahore",
  matricRollNo: "",
  matricYear: "2024",
  matricGroup: "Science (Biology)",
  matricTotalMarks: "1100",
  matricObtainedMarks: "",
  interStatus: "Not Applicable (Applying for Inter)",
  academicLevel: "Intermediate",
  primaryProgram: "ICS (Computer Science)",
  secondaryProgram: "FSc Pre-Engineering",
  preferredShift: "Morning",
  documents: {},
  undertakingAgreed: false,
};

export function getApplicantPortalDestination(_hasSubmittedApplication: boolean): string {
  return "/applicant";
}

export async function registerApplicant(input: ApplicantRegistrationInput): Promise<void> {
  const phone = normalizePhone(input.phone);
  if (!isValidApplicantPhone(input.phone)) throw new Error("INVALID_PHONE");
  if (input.password.length < 6) throw new Error("INVALID_PASSWORD");
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    throw new Error("INVALID_EMAIL");
  }
  const registeredPhones = readJson<string[]>(REGISTERED_PHONES_STORAGE_KEY, []);
  if (registeredPhones.includes(phone)) throw new Error("PHONE_ALREADY_REGISTERED");

  writeJson(REGISTERED_PHONES_STORAGE_KEY, [...registeredPhones, phone]);

  const accounts = readJson<StoredApplicantAccount[]>(APPLICANT_ACCOUNTS_STORAGE_KEY, []);
  writeJson(APPLICANT_ACCOUNTS_STORAGE_KEY, [
    ...accounts.filter((account) => account.phone !== phone),
    {
      phone,
      password: input.password,
      fullName: input.fullName.trim(),
      email: input.email || undefined,
    },
  ]);

  writeJson(AUTH_USER_STORAGE_KEY, {
    id: `usr-app-${Date.now()}`,
    name: input.fullName.trim(),
    email: input.email || "",
    phone,
    role: "applicant",
    createdAt: new Date().toISOString(),
  });
}

export async function loginApplicant(identifier: string, password: string): Promise<ApplicantLoginResult> {
  if (!isValidApplicantPhone(identifier)) throw new Error("INVALID_PHONE");
  const phone = normalizePhone(identifier);
  const accounts = readJson<StoredApplicantAccount[]>(APPLICANT_ACCOUNTS_STORAGE_KEY, []);
  const account = accounts.find((item) => item.phone === phone);

  if (!account) {
    throw new Error("ACCOUNT_NOT_FOUND");
  }
  if (account.password !== password) {
    throw new Error("INVALID_PASSWORD");
  }

  const application = await getApplication();
  const authUser = readJson<{ name?: string; email?: string; phone?: string } | null>(AUTH_USER_STORAGE_KEY, null);
  return {
    fullName: application?.fullName || account?.fullName || authUser?.name || `Applicant (${phone})`,
    phone,
    email: account?.email || authUser?.email,
    hasSubmittedApplication: Boolean(application?.status && application.status !== "Draft"),
  };
}

export async function getApplication(): Promise<ApplicantApplicationData | null> {
  return readJson<ApplicantApplicationData | null>(APPLICANT_APPLICATION_STORAGE_KEY, null);
}

export async function saveApplication(
  changes: Partial<ApplicantApplicationData>,
  current: ApplicantApplicationData = DEFAULT_APPLICANT_APPLICATION,
): Promise<ApplicantApplicationData> {
  const updated = { ...current, ...changes };
  writeJson(APPLICANT_APPLICATION_STORAGE_KEY, updated);
  return updated;
}

export async function submitApplication(
  application: ApplicantApplicationData,
): Promise<ApplicantApplicationData> {
  const submitted: ApplicantApplicationData = {
    ...application,
    appId: application.appId || `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    status: "Submitted",
    submittedAt: new Date().toLocaleDateString("en-PK", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };
  const saved = await saveApplication(submitted, application);
  upsertAdminReviewCopy(saved);
  return saved;
}

export async function syncApplicantStatusFromAdmin(
  application: ApplicantApplicationData | null,
): Promise<ApplicantApplicationData | null> {
  if (!application?.appId) return application;
  const adminCopy = findApplicationById(application.appId);
  if (!adminCopy) return application;

  const mapped = mapAdminStatusToApplicant(adminCopy.status);
  if (mapped === application.status) return application;
  return saveApplication({ status: mapped }, application);
}

function mapAdminStatusToApplicant(
  status: ApplicationStatus,
): ApplicantApplicationData["status"] {
  switch (status) {
    case "under_review":
    case "interview_scheduled":
      return "Under Review";
    case "more_info_required":
      return "More Information Required";
    case "on_hold":
      return "On Hold";
    case "accepted":
      return "Accepted";
    case "enrolled":
      return "Admitted";
    case "rejected":
      return "Rejected";
    case "draft":
      return "Draft";
    default:
      return "Submitted";
  }
}

function upsertAdminReviewCopy(application: ApplicantApplicationData): void {
  const now = new Date().toISOString();
  const applicationNumber = application.appId || `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const gender =
    application.gender === "Female" || application.gender === "Other" ? application.gender : "Male";
  const obtained = Number(application.matricObtainedMarks) || 0;
  const total = Number(application.matricTotalMarks) || 1100;
  const percentage = total > 0 ? Number(((obtained / total) * 100).toFixed(1)) : 0;

  const historyEvent: ApplicationAuditEvent = {
    id: `audit-${Date.now()}`,
    action: "Online Application Submitted",
    timestamp: now,
    performedBy: application.fullName || "Applicant",
    role: "Applicant",
    newStatus: "submitted",
    note: "Submitted through the Applicant Portal admission form.",
  };

  const complete: CompleteApplication = {
    id: applicationNumber,
    applicationNumber,
    createdAt: now,
    updatedAt: now,
    status: "submitted",
    academicSession: "Fall 2026",
    admissionCycle:
      application.academicLevel === "Undergraduate"
        ? "Undergraduate Regular Admission"
        : "Intermediate Regular Admission",
    assignedReviewer: "Admissions Desk",
    personal: {
      fullName: application.fullName,
      dob: application.dob,
      gender,
      cnicBForm: application.idNumber,
      nationality: application.nationality || "Pakistani",
      religion: application.religion,
      bloodGroup: application.bloodGroup || undefined,
      domicile: application.domicile,
      fatherName: application.fatherName,
      motherName: application.motherName,
    },
    contact: {
      phone: application.phone,
      email: application.email || "",
      altPhone: application.altPhone || undefined,
      currentAddress: application.address,
      permanentAddress: application.address,
      city: "Kanganpur",
      district: application.domicile || "Kasur",
      province: "Punjab",
    },
    guardian: {
      guardianName: application.fatherName,
      relationship: "Father",
      guardianCnic: "",
      guardianPhone: application.altPhone || application.phone,
      guardianOccupation: "",
    },
    academicHistory: [
      {
        id: `acad-${applicationNumber}-matric`,
        level: "Matric / O-Levels / SSC",
        institution: application.matricBoard,
        qualification: application.matricGroup,
        boardOrUniversity: application.matricBoard,
        rollNumber: application.matricRollNo,
        passingYear: application.matricYear,
        totalMarks: total,
        obtainedMarks: obtained,
        percentage,
        grade: percentage >= 80 ? "A+" : percentage >= 70 ? "A" : percentage >= 60 ? "B" : "C",
        majorSubjects: [application.matricGroup],
        status: "Completed",
      },
    ],
    preferences: {
      selectedProgram: application.primaryProgram,
      academicLevel: application.academicLevel,
      firstPreference: application.primaryProgram,
      secondPreference: application.secondaryProgram || undefined,
      campusPreference: "Kanganpur Campus",
      admissionSession: "Fall 2026",
      admissionCategory: "Open Merit",
      shiftPreference: application.preferredShift === "Evening" ? "Evening" : "Morning",
    },
    transport: { transportRequired: false },
    documents: Object.entries(application.documents)
      .filter(([, fileName]) => Boolean(fileName))
      .map(([type, fileName]) => ({
        id: `doc-${applicationNumber}-${type}`,
        type,
        title: type,
        fileName: fileName as string,
        fileSize: "—",
        uploadDate: now,
        status: "pending" as const,
      })),
    declaration: {
      applicantDeclarationAgreed: application.undertakingAgreed,
      declarationDate: now,
    },
    history: [historyEvent],
  };

  const all = getStoredApplications();
  const existingIndex = all.findIndex(
    (item) => item.id === applicationNumber || item.applicationNumber === applicationNumber,
  );
  if (existingIndex >= 0) {
    all[existingIndex] = {
      ...complete,
      createdAt: all[existingIndex].createdAt,
      history: [...all[existingIndex].history, historyEvent],
    };
  } else {
    all.unshift(complete);
  }
  saveStoredApplications(all);
}

export async function uploadDocument(
  application: ApplicantApplicationData,
  document: DocumentUpload,
): Promise<ApplicantApplicationData> {
  return saveApplication(
    { documents: { ...application.documents, [document.key]: document.fileName } },
    application,
  );
}

export async function getApplications(): Promise<CompleteApplication[]> {
  return getStoredApplications();
}

export async function acceptApplication(applicationId: string, note?: string): Promise<CompleteApplication | null> {
  return executeApplicationAction(applicationId, "accepted", "Admission Accepted", note || "Admission approved by Admin.");
}

export async function rejectApplication(applicationId: string, reason: string): Promise<CompleteApplication | null> {
  return executeApplicationAction(applicationId, "rejected", "Application Rejected", reason);
}

export async function updateStudentStatus(
  studentId: string,
  status: StudentStatus,
): Promise<{ studentId: string; status: StudentStatus }> {
  const key = `cms_student_status_${studentId}`;
  writeJson(key, status);
  return { studentId, status };
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  note?: string,
): Promise<CompleteApplication | null> {
  return executeApplicationAction(applicationId, status, "Application Updated", note);
}

export async function getApplicationById(applicationId: string): Promise<CompleteApplication | null> {
  return findApplicationById(applicationId);
}

export { APPLICATIONS_STORAGE_KEY };
