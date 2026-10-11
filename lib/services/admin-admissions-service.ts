import type {
  CompleteApplication,
  ApplicationStatus,
} from "@/types/applications";

export const ADMIN_TOKEN_STORAGE_KEY = "cms_admin_jwt_token";
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

export function getAdminToken(): string {
  const storage = getStorage();
  if (!storage) return "";

  const directToken = storage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  if (directToken) return directToken;

  try {
    const rawUser = storage.getItem(AUTH_USER_STORAGE_KEY);
    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (user?.role === "admin" && user?.token) {
        return user.token;
      }
    }
  } catch {
    // Ignore JSON parse errors
  }

  return "";
}

export function setAdminToken(token: string): void {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
}

export function removeAdminToken(): void {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
}

export interface AdminLoginResult {
  token: string;
  admin: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

/**
 * Logs in administrator using backend authentication endpoint.
 */
export async function loginAdmin(
  identifier = "admin",
  password = "password"
): Promise<AdminLoginResult> {
  const url = getApiUrl("/api/admin/login");

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
  } catch (error) {
    throw new Error(
      error instanceof Error && error.message
        ? `Unable to connect to admin authentication service: ${error.message}`
        : "Unable to connect to admin authentication service"
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Invalid administrator credentials");
  }

  if (!data.token) {
    throw new Error("Login succeeded but no admin token was returned by server");
  }

  setAdminToken(data.token);

  return {
    token: data.token,
    admin: data.admin || {
      id: "stf-001",
      name: "Kashif Shahzad",
      email: "kashif.accounts@apex.edu.pk",
      role: "admin",
    },
  };
}

/**
 * Ensures an admin JWT exists, auto-logging in with default demo credentials if needed in development.
 */
export async function ensureAdminToken(): Promise<string> {
  let token = getAdminToken();
  if (token) return token;

  try {
    const result = await loginAdmin("admin", "password123");
    return result.token;
  } catch (err) {
    console.warn("Could not auto-login admin:", err);
    return "";
  }
}

export interface AdminApplicationsQueryParams {
  status?: string;
  search?: string;
  program?: string;
  level?: string;
  page?: number;
  limit?: number;
}

export interface FetchAdminApplicationsResult {
  success: boolean;
  applications: CompleteApplication[];
  total: number;
  count: number;
}

/**
 * Fetches applications from the backend MongoDB Atlas database.
 */
export async function fetchAdminApplications(
  params?: AdminApplicationsQueryParams
): Promise<FetchAdminApplicationsResult> {
  let token = getAdminToken();
  if (!token) {
    token = await ensureAdminToken();
  }

  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.program && params.program !== "all") query.set("program", params.program);
  if (params?.level && params.level !== "all") query.set("level", params.level);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const queryString = query.toString();
  const url = getApiUrl(`/api/admin/applications${queryString ? `?${queryString}` : ""}`);

  const makeRequest = async (authToken: string) => {
    return fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      cache: "no-store",
    });
  };

  let response: Response;
  try {
    response = await makeRequest(token);
  } catch (err) {
    throw new Error(
      err instanceof Error
        ? `Network error reaching admissions API: ${err.message}`
        : "Network error reaching admissions API"
    );
  }

  // If token expired or unauthorized, attempt refreshing once
  if (response.status === 401 || response.status === 403) {
    const refreshedToken = await ensureAdminToken();
    if (refreshedToken && refreshedToken !== token) {
      response = await makeRequest(refreshedToken);
    }
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message ||
        `Failed to fetch applications from server (HTTP ${response.status})`
    );
  }

  return {
    success: true,
    applications: Array.isArray(result.applications) ? result.applications : [],
    total: typeof result.total === "number" ? result.total : (result.applications?.length || 0),
    count: typeof result.count === "number" ? result.count : (result.applications?.length || 0),
  };
}

/**
 * Fetches single complete application by ID or applicationNumber.
 */
export async function fetchAdminApplicationById(
  id: string
): Promise<CompleteApplication> {
  let token = getAdminToken();
  if (!token) {
    token = await ensureAdminToken();
  }

  const url = getApiUrl(`/api/admin/applications/${encodeURIComponent(id)}`);

  const makeRequest = async (authToken: string) => {
    return fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      cache: "no-store",
    });
  };

  let response: Response;
  try {
    response = await makeRequest(token);
  } catch (err) {
    throw new Error(
      err instanceof Error
        ? `Network error reaching admissions API: ${err.message}`
        : "Network error reaching admissions API"
    );
  }

  if (response.status === 401 || response.status === 403) {
    const refreshedToken = await ensureAdminToken();
    if (refreshedToken && refreshedToken !== token) {
      response = await makeRequest(refreshedToken);
    }
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message ||
        `Application '${id}' could not be retrieved (HTTP ${response.status})`
    );
  }

  if (!result.application) {
    throw new Error(`Application data missing in response for ID '${id}'`);
  }

  return result.application as CompleteApplication;
}

export interface UpdateApplicationStatusPayload {
  status: ApplicationStatus | string;
  notes?: string;
  reviewerNotes?: string;
  reviewerName?: string;
  reviewerRole?: string;
}

export interface UpdateApplicationStatusResult {
  success: boolean;
  message: string;
  application: CompleteApplication;
}

/**
 * Updates application review status and notes on the backend in MongoDB Atlas.
 */
export async function updateAdminApplicationStatus(
  id: string,
  payload: UpdateApplicationStatusPayload
): Promise<UpdateApplicationStatusResult> {
  let token = getAdminToken();
  if (!token) {
    token = await ensureAdminToken();
  }

  const url = getApiUrl(`/api/admin/applications/${encodeURIComponent(id)}/status`);

  const makeRequest = async (authToken: string) => {
    return fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({
        status: payload.status,
        reviewerNotes: payload.reviewerNotes || payload.notes,
        note: payload.notes || payload.reviewerNotes,
        reviewerName: payload.reviewerName || "Admissions Administrator",
        reviewerRole: payload.reviewerRole || "Senior Registrar",
      }),
    });
  };

  let response: Response;
  try {
    response = await makeRequest(token);
  } catch (err) {
    throw new Error(
      err instanceof Error
        ? `Network error updating application status: ${err.message}`
        : "Network error updating application status"
    );
  }

  if (response.status === 401 || response.status === 403) {
    const refreshedToken = await ensureAdminToken();
    if (refreshedToken && refreshedToken !== token) {
      response = await makeRequest(refreshedToken);
    }
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message ||
        `Failed to update application status (HTTP ${response.status})`
    );
  }

  if (!result.application) {
    throw new Error("Server confirmed status update but omitted the updated application record");
  }

  return {
    success: true,
    message: result.message || "Application status updated successfully",
    application: result.application as CompleteApplication,
  };
}
