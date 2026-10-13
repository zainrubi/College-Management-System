export const STUDENT_TOKEN_STORAGE_KEY = "cms_student_jwt_token";
const AUTH_USER_STORAGE_KEY = "cms_demo_auth_user";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "") ||
  (process.env.NODE_ENV === "development" ? "http://localhost:5000" : "");

function getApiUrl(path: string): string {
  if (!API_BASE_URL) {
    throw new Error("Backend API URL is not configured. Set NEXT_PUBLIC_API_URL.");
  }
  return `${API_BASE_URL}${path}`;
}

function getStorage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function getStudentToken(): string | null {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const directToken = storage.getItem(STUDENT_TOKEN_STORAGE_KEY);
    if (directToken) return directToken;

    const rawUser = storage.getItem(AUTH_USER_STORAGE_KEY);
    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (user?.role === "student" && user?.token) {
        return user.token;
      }
    }
  } catch {
    // Ignore parse errors
  }

  return null;
}

export function setStudentToken(token: string | null): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    if (token) {
      storage.setItem(STUDENT_TOKEN_STORAGE_KEY, token);
    } else {
      storage.removeItem(STUDENT_TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota / access errors
  }
}

export function removeStudentToken(): void {
  setStudentToken(null);
  const storage = getStorage();
  if (!storage) return;

  try {
    const rawUser = storage.getItem(AUTH_USER_STORAGE_KEY);
    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (user?.role === "student" && user?.token) {
        delete user.token;
        storage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
      }
    }
  } catch {
    // Ignore parse errors
  }
}

export interface StudentProgramInfo {
  name: string;
  code?: string;
  shift?: string;
  campus?: string;
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
  guardian?: {
    name?: string;
    relation?: string;
    phone?: string;
  };
  address?: string;
  program?: StudentProgramInfo;
  status: string;
  admissionDate?: string;
  isActivated?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentLoginResult {
  token: string;
  student: {
    id: string;
    studentIdNumber: string;
    rollNumber: string;
    fullName: string;
    phone?: string;
    email?: string;
    program?: StudentProgramInfo;
    status: string;
    admissionDate?: string;
  };
}

export interface StudentAuthError extends Error {
  code?: string;
  status?: number;
}

/**
 * Logs in an enrolled student via POST /api/students/login.
 */
export async function loginStudent(
  identifier: string,
  password: string
): Promise<StudentLoginResult> {
  const trimmedIdentifier = identifier?.trim();
  if (!trimmedIdentifier) {
    const err: StudentAuthError = new Error("Please enter your Student ID or Roll Number.");
    err.code = "MISSING_IDENTIFIER";
    throw err;
  }

  if (!password || !password.trim()) {
    const err: StudentAuthError = new Error("Please enter your password.");
    err.code = "MISSING_PASSWORD";
    throw err;
  }

  let response: Response;
  try {
    response = await fetch(getApiUrl("/api/students/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: trimmedIdentifier,
        password,
      }),
    });
  } catch (error) {
    const err: StudentAuthError = new Error(
      "Unable to connect to college server. Please check your network connection and try again."
    );
    err.code = "NETWORK_ERROR";
    throw err;
  }

  const data = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    code?: string;
    message?: string;
    token?: string;
    student?: StudentLoginResult["student"];
  };

  if (!response.ok) {
    const err: StudentAuthError = new Error(data.message || "Failed to sign in");
    err.status = response.status;
    err.code = data.code || (response.status === 401 ? "INVALID_CREDENTIALS" : undefined);

    if (response.status === 429 || data.code === "TOO_MANY_REQUESTS") {
      err.code = "TOO_MANY_REQUESTS";
      err.message = data.message || "Too many login attempts from this IP address. Please try again after 15 minutes.";
    } else if (data.code === "ACCOUNT_NOT_ACTIVATED" || (response.status === 401 && data.message?.toLowerCase().includes("not been activated"))) {
      err.code = "ACCOUNT_NOT_ACTIVATED";
      err.message = data.message || "Student account has not been activated. Please complete initial password setup before logging in.";
    } else if (response.status === 401) {
      err.code = "INVALID_CREDENTIALS";
      err.message = "Invalid Student ID, Roll Number, or password. Please verify your credentials.";
    } else if (response.status === 403) {
      err.code = "ACCOUNT_SUSPENDED";
      err.message = data.message || "Student account is suspended. Login not permitted.";
    } else if (response.status >= 500) {
      err.code = "SERVER_ERROR";
      err.message = "College authentication service is temporarily unavailable. Please try again later.";
    }

    throw err;
  }

  if (!data.token || !data.student?.id) {
    const err: StudentAuthError = new Error(
      "Login succeeded but the authentication token or student profile was missing from the server response."
    );
    err.code = "MALFORMED_RESPONSE";
    throw err;
  }

  setStudentToken(data.token);

  return {
    token: data.token,
    student: data.student,
  };
}

/**
 * Fetches the authenticated student's profile via GET /api/students/profile.
 */
export async function getStudentProfile(
  customToken?: string
): Promise<StudentProfileData> {
  const token = customToken || getStudentToken();
  if (!token) {
    const err: StudentAuthError = new Error("No active student authentication token found.");
    err.code = "UNAUTHORIZED";
    throw err;
  }

  let response: Response;
  try {
    response = await fetch(getApiUrl("/api/students/profile"), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    const err: StudentAuthError = new Error(
      "Unable to connect to college server to load profile."
    );
    err.code = "NETWORK_ERROR";
    throw err;
  }

  const data = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
    student?: StudentProfileData;
  };

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      removeStudentToken();
      const err: StudentAuthError = new Error(
        data.message || "Student session expired or unauthorized. Please sign in again."
      );
      err.code = "SESSION_EXPIRED";
      err.status = response.status;
      throw err;
    }

    const err: StudentAuthError = new Error(data.message || "Failed to load student profile");
    err.status = response.status;
    throw err;
  }

  if (!data.student || !data.student.id) {
    const err: StudentAuthError = new Error("Invalid profile response from server.");
    err.code = "MALFORMED_RESPONSE";
    throw err;
  }

  return data.student;
}

export const APPLICANT_TOKEN_STORAGE_KEY = "cms_applicant_jwt_token";

/**
 * Retrieves stored applicant token if user has an active applicant session.
 */
export function getApplicantToken(): string | null {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const directToken = storage.getItem(APPLICANT_TOKEN_STORAGE_KEY);
    if (directToken) return directToken;

    const rawUser = storage.getItem(AUTH_USER_STORAGE_KEY);
    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (user?.role === "applicant" && user?.token) {
        return user.token;
      }
    }
  } catch {
    // Ignore parse errors
  }

  return null;
}

export interface RequestActivationParams {
  identifier: string;
  phone?: string;
  applicantPassword?: string;
  applicantToken?: string;
}

export interface RequestActivationResult {
  success: boolean;
  message: string;
  activationToken: string;
  expiresInMinutes: number;
  student: {
    id: string;
    studentIdNumber: string;
    rollNumber: string;
    fullName: string;
  };
}

export interface ActivateAccountParams {
  activationToken: string;
  password: string;
  confirmPassword?: string;
}

export interface ActivateAccountResult {
  success: boolean;
  message: string;
  student: {
    id: string;
    studentIdNumber: string;
    rollNumber: string;
    fullName: string;
    isActivated: boolean;
  };
}

/**
 * Initiates student account activation via POST /api/students/request-activation.
 * Verifies identity via active applicant session or applicant credentials (phone + password).
 */
export async function requestStudentActivation(
  params: RequestActivationParams
): Promise<RequestActivationResult> {
  const trimmedIdentifier = params.identifier?.trim();
  if (!trimmedIdentifier) {
    const err: StudentAuthError = new Error("Please enter your Student ID or Roll Number.");
    err.code = "MISSING_IDENTIFIER";
    throw err;
  }

  const token = params.applicantToken || getApplicantToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const body: { identifier: string; phone?: string; applicantPassword?: string } = {
    identifier: trimmedIdentifier,
  };

  if (!token) {
    const trimmedPhone = params.phone?.trim();
    if (!trimmedPhone || !params.applicantPassword) {
      const err: StudentAuthError = new Error(
        "Please provide your registered mobile number and Applicant account password to verify identity."
      );
      err.code = "MISSING_APPLICANT_CREDENTIALS";
      throw err;
    }
    body.phone = trimmedPhone;
    body.applicantPassword = params.applicantPassword;
  }

  let response: Response;
  try {
    response = await fetch(getApiUrl("/api/students/request-activation"), {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch {
    const err: StudentAuthError = new Error(
      "Unable to connect to college server. Please check your network connection and try again."
    );
    err.code = "NETWORK_ERROR";
    throw err;
  }

  const data = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    code?: string;
    message?: string;
    activationToken?: string;
    expiresInMinutes?: number;
    student?: RequestActivationResult["student"];
  };

  if (!response.ok) {
    const err: StudentAuthError = new Error(data.message || "Failed to initiate student activation.");
    err.status = response.status;
    err.code = data.code;

    if (response.status === 429 || data.code === "TOO_MANY_REQUESTS") {
      err.code = "TOO_MANY_REQUESTS";
      err.message = data.message || "Too many activation requests from this IP address. Please try again after 15 minutes.";
    } else if (data.code === "ALREADY_ACTIVATED") {
      err.code = "ALREADY_ACTIVATED";
      err.message = data.message || "Student account is already activated. Please sign in directly.";
    } else if (response.status === 404) {
      err.code = "STUDENT_NOT_FOUND";
      err.message = data.message || "Enrolled student record not found.";
    } else if (response.status === 401) {
      err.code = "INVALID_APPLICANT_CREDENTIALS";
      err.message = data.message || "Verification failed: applicant credentials do not match student records.";
    } else if (response.status === 403) {
      err.code = "FORBIDDEN";
      err.message = data.message || "Forbidden: unable to activate this student account.";
    } else if (response.status >= 500) {
      err.code = "SERVER_ERROR";
      err.message = "College authentication service is temporarily unavailable. Please try again later.";
    }

    throw err;
  }

  if (!data.activationToken || !data.student?.id) {
    const err: StudentAuthError = new Error(
      "Activation request succeeded but response was missing required token or student data."
    );
    err.code = "MALFORMED_RESPONSE";
    throw err;
  }

  return {
    success: true,
    message: data.message || "Activation token generated successfully.",
    activationToken: data.activationToken,
    expiresInMinutes: data.expiresInMinutes || 15,
    student: data.student,
  };
}

/**
 * Completes student account activation and sets the initial password via POST /api/students/activate.
 */
export async function activateStudentAccount(
  params: ActivateAccountParams
): Promise<ActivateAccountResult> {
  const token = params.activationToken?.trim();
  if (!token) {
    const err: StudentAuthError = new Error("Activation token is required.");
    err.code = "MISSING_TOKEN";
    throw err;
  }

  const password = params.password;
  if (!password || password.length < 6) {
    const err: StudentAuthError = new Error("Password must be at least 6 characters.");
    err.code = "INVALID_PASSWORD";
    throw err;
  }

  if (params.confirmPassword && password !== params.confirmPassword) {
    const err: StudentAuthError = new Error("Passwords do not match.");
    err.code = "PASSWORD_MISMATCH";
    throw err;
  }

  let response: Response;
  try {
    response = await fetch(getApiUrl("/api/students/activate"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activationToken: token,
        password,
        confirmPassword: params.confirmPassword || password,
      }),
    });
  } catch {
    const err: StudentAuthError = new Error(
      "Unable to connect to college server. Please check your network connection and try again."
    );
    err.code = "NETWORK_ERROR";
    throw err;
  }

  const data = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    code?: string;
    message?: string;
    student?: ActivateAccountResult["student"];
  };

  if (!response.ok) {
    const err: StudentAuthError = new Error(data.message || "Failed to activate student account.");
    err.status = response.status;
    err.code = data.code;

    if (response.status === 429 || data.code === "TOO_MANY_REQUESTS") {
      err.code = "TOO_MANY_REQUESTS";
      err.message = data.message || "Too many password setup attempts from this IP address. Please try again after 15 minutes.";
    } else if (data.code === "ALREADY_ACTIVATED") {
      err.code = "ALREADY_ACTIVATED";
      err.message = data.message || "Student account is already activated. Please sign in directly.";
    } else if (response.status >= 500) {
      err.code = "SERVER_ERROR";
      err.message = "College authentication service is temporarily unavailable. Please try again later.";
    }

    throw err;
  }

  if (!data.student?.id) {
    const err: StudentAuthError = new Error(
      "Activation succeeded but student profile was missing in response."
    );
    err.code = "MALFORMED_RESPONSE";
    throw err;
  }

  return {
    success: true,
    message: data.message || "Student account activated successfully.",
    student: data.student,
  };
}

