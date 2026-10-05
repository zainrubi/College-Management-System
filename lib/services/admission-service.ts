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
const AUTH_USER_STORAGE_KEY = "cms_demo_auth_user";
const APPLICANT_ACCOUNTS_STORAGE_KEY = "cms_applicant_accounts";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "") ||
  (process.env.NODE_ENV === "development" ? "http://localhost:5000" : "");

function getApiUrl(path: string): string {
  if (!API_BASE_URL) {
    throw new Error("Backend API URL is not configured. Set NEXT_PUBLIC_API_URL and redeploy.");
  }
  return `${API_BASE_URL}${path}`;
}

interface StoredApplicantAccount {
  phone: string;
  password: string;
  fullName: string;
  email?: string;
}

export interface ApplicantApplicationData {
  appId?: string;
  backendApplicationId?: string;
  applicantId?: string;
  backendUpdatedAt?: string;
  localUpdatedAt?: number;
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
  return /^[0-9]{11}$/.test(phone);
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

export async function registerApplicant(input: ApplicantRegistrationInput): Promise<{ id: string }> {
  const phone = input.phone?.trim();
  if (!isValidApplicantPhone(phone)) throw new Error("INVALID_PHONE");
  if (input.password.length < 6) throw new Error("INVALID_PASSWORD");
  const trimmedEmail = input.email?.trim();
  if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    throw new Error("INVALID_EMAIL");
  }

  const response = await fetch(getApiUrl("/api/applicants/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: input.fullName.trim(),
      phone,
      email: trimmedEmail || undefined,
      password: input.password,
    }),
  });

  const result = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    code?: string;
    message?: string;
    applicant?: { id?: string };
  };
  if (!response.ok) {
    if (
      response.status === 409 &&
      (result.code === "PHONE_ALREADY_REGISTERED" ||
        result.message === "This phone number is already registered. Please sign in instead." ||
        result.message?.toLowerCase().includes("phone"))
    ) {
      const err = new Error(result.message || "This phone number is already registered. Please sign in instead.");
      (err as { code?: string }).code = "PHONE_ALREADY_REGISTERED";
      throw err;
    }
    throw new Error(result.message || "REGISTRATION_FAILED");
  }

  if (!result.applicant?.id) {
    throw new Error("Registration succeeded but the applicant ID was missing from the server response");
  }
  return { id: result.applicant.id };
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

const APPLICANT_ID_PATTERN = /^[a-f\d]{24}$/i;
const APPLICANT_STATUSES: ApplicantApplicationData["status"][] = [
  "Draft", "Submitted", "Under Review", "More Information Required", "On Hold",
  "Merit Qualified", "Accepted", "Admitted", "Rejected",
];
const INTER_STATUSES: ApplicantApplicationData["interStatus"][] = [
  "Awaiting Result", "Passed", "Not Applicable (Applying for Inter)",
];
const ACADEMIC_LEVELS: ApplicantApplicationData["academicLevel"][] = ["Intermediate", "Undergraduate"];
const ID_TYPES: ApplicantApplicationData["idType"][] = ["CNIC", "B-Form / Juvenile Card"];

function getLocalApplication(): ApplicantApplicationData | null {
  return readJson<ApplicantApplicationData | null>(APPLICANT_APPLICATION_STORAGE_KEY, null);
}

function getApplicationHeaders(applicantId: string): Record<string, string> {
  if (!APPLICANT_ID_PATTERN.test(applicantId)) {
    throw new Error("Your applicant session is missing a valid server applicant ID. Please sign in again.");
  }
  return { "x-applicant-id": applicantId };
}

async function readApiResponse(response: Response): Promise<Record<string, unknown>> {
  return (await response.json().catch(() => ({}))) as Record<string, unknown>;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function readString(
  source: Record<string, unknown>,
  key: string,
  fallback = "",
): string {
  const value = source[key];
  return typeof value === "string" ? value : fallback;
}

function fromBackendApplication(value: unknown): ApplicantApplicationData {
  if (!value || typeof value !== "object") {
    throw new Error("The server returned an invalid application");
  }

  const application = asRecord(value);
  const personal = asRecord(application.personal);
  const contactAddress = asRecord(application.contactAddress);
  const guardian = asRecord(application.guardian);
  const academic = asRecord(application.academic);
  const programCampus = asRecord(application.programCampus);
  const documents = asRecord(application.documents);
  const reviewSubmission = asRecord(application.reviewSubmission);
  const status = application.status;
  const idType = readString(personal, "idType");
  const interStatus = readString(academic, "interStatus");
  const academicLevel = readString(programCampus, "academicLevel");
  const formData: ApplicantApplicationData = {
    ...DEFAULT_APPLICANT_APPLICATION,
    appId: readString(application, "applicationNumber") || undefined,
    backendApplicationId: readString(application, "_id") || undefined,
    applicantId: readString(application, "applicantId") || undefined,
    backendUpdatedAt: readString(application, "updatedAt") || undefined,
    status: APPLICANT_STATUSES.find((value) => value === status) || "Draft",
    submittedAt: readString(reviewSubmission, "submittedAt") || undefined,
    fullName: readString(personal, "fullName"),
    fatherName: readString(guardian, "fatherName"),
    motherName: readString(guardian, "motherName"),
    dob: readString(personal, "dob"),
    gender: readString(personal, "gender", DEFAULT_APPLICANT_APPLICATION.gender),
    idType: ID_TYPES.find((value) => value === idType) || DEFAULT_APPLICANT_APPLICATION.idType,
    idNumber: readString(personal, "idNumber"),
    phone: readString(contactAddress, "phone"),
    altPhone: readString(guardian, "altPhone"),
    email: readString(contactAddress, "email"),
    nationality: readString(personal, "nationality", DEFAULT_APPLICANT_APPLICATION.nationality),
    religion: readString(personal, "religion", DEFAULT_APPLICANT_APPLICATION.religion),
    bloodGroup: readString(personal, "bloodGroup"),
    domicile: readString(contactAddress, "domicile", DEFAULT_APPLICANT_APPLICATION.domicile),
    address: readString(contactAddress, "address"),
    matricBoard: readString(academic, "matricBoard", DEFAULT_APPLICANT_APPLICATION.matricBoard),
    matricRollNo: readString(academic, "matricRollNo"),
    matricYear: readString(academic, "matricYear", DEFAULT_APPLICANT_APPLICATION.matricYear),
    matricGroup: readString(academic, "matricGroup", DEFAULT_APPLICANT_APPLICATION.matricGroup),
    matricTotalMarks: readString(academic, "matricTotalMarks", DEFAULT_APPLICANT_APPLICATION.matricTotalMarks),
    matricObtainedMarks: readString(academic, "matricObtainedMarks"),
    interStatus: INTER_STATUSES.find((value) => value === interStatus) || DEFAULT_APPLICANT_APPLICATION.interStatus,
    interBoard: readString(academic, "interBoard"),
    interRollNo: readString(academic, "interRollNo"),
    interYear: readString(academic, "interYear"),
    interTotalMarks: readString(academic, "interTotalMarks"),
    interObtainedMarks: readString(academic, "interObtainedMarks"),
    academicLevel: ACADEMIC_LEVELS.find((value) => value === academicLevel) || DEFAULT_APPLICANT_APPLICATION.academicLevel,
    primaryProgram: readString(programCampus, "primaryProgram"),
    secondaryProgram: readString(programCampus, "secondaryProgram"),
    preferredShift: readString(programCampus, "preferredShift", DEFAULT_APPLICANT_APPLICATION.preferredShift),
    documents: {
      ...DEFAULT_APPLICANT_APPLICATION.documents,
      matricResultCard: readString(documents, "matricResultCard") || undefined,
      cnicOrBForm: readString(documents, "cnicOrBForm") || undefined,
      guardianCnic: readString(documents, "guardianCnic") || undefined,
      photo: readString(documents, "photo") || undefined,
    },
    undertakingAgreed: reviewSubmission.undertakingAgreed === true,
  };
  return formData;
}

export async function getApplication(applicantId?: string): Promise<ApplicantApplicationData | null> {
  let localApplication = getLocalApplication();
  if (!applicantId || !APPLICANT_ID_PATTERN.test(applicantId)) return localApplication;
  if (localApplication?.applicantId && localApplication.applicantId !== applicantId) {
    localApplication = null;
  }

  try {
    const response = await fetch(getApiUrl("/api/applications/me"), {
      headers: getApplicationHeaders(applicantId),
      cache: "no-store",
    });
    if (response.status === 404) return localApplication;

    const result = await readApiResponse(response);
    if (!response.ok) {
      throw new Error(typeof result.message === "string" ? result.message : "Unable to load your application");
    }

    const application = fromBackendApplication(result.application);
    if (
      localApplication &&
      localApplication.backendApplicationId &&
      application.backendApplicationId &&
      localApplication.backendApplicationId === application.backendApplicationId &&
      localApplication.localUpdatedAt &&
      application.backendUpdatedAt &&
      localApplication.localUpdatedAt > Date.parse(application.backendUpdatedAt)
    ) {
      return localApplication;
    }
    writeJson(APPLICANT_APPLICATION_STORAGE_KEY, application);
    return application;
  } catch (error) {
    console.error("Failed to load applicant application:", error);
    return localApplication;
  }
}

export async function saveApplication(
  changes: Partial<ApplicantApplicationData>,
  current: ApplicantApplicationData = DEFAULT_APPLICANT_APPLICATION,
): Promise<ApplicantApplicationData> {
  const updated = { ...current, ...changes, localUpdatedAt: Date.now() };
  writeJson(APPLICANT_APPLICATION_STORAGE_KEY, updated);
  return updated;
}

export async function saveAdmissionDraft(
  application: ApplicantApplicationData,
  applicantId: string,
): Promise<ApplicantApplicationData> {
  const headers = {
    ...getApplicationHeaders(applicantId),
    "Content-Type": "application/json",
  };
  const existingResponse = await fetch(getApiUrl("/api/applications/me"), {
    headers,
    cache: "no-store",
  });

  let response: Response;
  if (existingResponse.status === 404) {
    response = await fetch(getApiUrl("/api/applications/draft"), {
      method: "POST",
      headers,
      body: JSON.stringify(toBackendApplication(application)),
    });
  } else {
    const existingResult = await readApiResponse(existingResponse);
    if (!existingResponse.ok) {
      throw new Error(typeof existingResult.message === "string"
        ? existingResult.message
        : "Unable to check for an existing application");
    }
    response = await fetch(getApiUrl("/api/applications/draft"), {
      method: "PUT",
      headers,
      body: JSON.stringify(toBackendApplication(application)),
    });
  }

  const result = await readApiResponse(response);
  if (!response.ok) {
    throw new Error(typeof result.message === "string" ? result.message : "Unable to save your draft");
  }

  const savedApplication = fromBackendApplication(result.application);
  writeJson(APPLICANT_APPLICATION_STORAGE_KEY, savedApplication);
  return savedApplication;
}

function toBackendApplication(application: ApplicantApplicationData) {
  return {
    personal: {
      fullName: application.fullName,
      dob: application.dob,
      gender: application.gender,
      idType: application.idType,
      idNumber: application.idNumber,
      nationality: application.nationality,
      religion: application.religion,
      bloodGroup: application.bloodGroup,
    },
    contactAddress: {
      phone: application.phone,
      email: application.email,
      domicile: application.domicile,
      address: application.address,
    },
    guardian: {
      fatherName: application.fatherName,
      motherName: application.motherName,
      altPhone: application.altPhone,
    },
    academic: {
      matricBoard: application.matricBoard,
      matricRollNo: application.matricRollNo,
      matricYear: application.matricYear,
      matricGroup: application.matricGroup,
      matricTotalMarks: application.matricTotalMarks,
      matricObtainedMarks: application.matricObtainedMarks,
      interStatus: application.interStatus,
      interBoard: application.interBoard,
      interRollNo: application.interRollNo,
      interYear: application.interYear,
      interTotalMarks: application.interTotalMarks,
      interObtainedMarks: application.interObtainedMarks,
    },
    programCampus: {
      academicLevel: application.academicLevel,
      primaryProgram: application.primaryProgram,
      secondaryProgram: application.secondaryProgram,
      preferredShift: application.preferredShift,
    },
    documents: application.documents,
    reviewSubmission: {
      undertakingAgreed: application.undertakingAgreed,
    },
  };
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


