import { getToken, clearAuth } from './auth';

const BASE_URL = 'https://ajoguard.onrender.com';

/**
 * The shape of error responses from your NestJS backend.
 * NestJS returns errors in this format:
 * { statusCode: 400, message: "Something went wrong" }
 */
interface ApiError {
  statusCode: number;
  message:    string | string[];
}

/**
 * Extract a readable error message from a NestJS error response.
 * message can be a string or an array of strings (from class-validator).
 */
function extractMessage(error: ApiError): string {
  if (Array.isArray(error.message)) {
    return error.message.join(', ');
  }
  return error.message;
}

/**
 * Core fetch wrapper used by all API functions.
 *
 * Automatically:
 *   - Adds Content-Type: application/json header
 *   - Adds Authorization: Bearer <token> header if logged in
 *   - Parses the JSON response
 *   - On 401: clears auth and redirects to login
 *   - On error: throws with a readable message
 *
 * @param path    - API path e.g. '/groups/uuid/summary'
 * @param options - Standard fetch options (method, body etc)
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add auth header if we have a token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      // Allow caller to override headers if needed
      ...(options.headers as Record<string, string> || {}),
    },
  });

  // Token expired or invalid — log out and redirect to login
  if (response.status === 401) {
    clearAuth();
    throw new Error('UNAUTHORIZED');
  }

  // Parse the response body
  const data = await response.json().catch(() => ({}));

  // Handle error responses
  if (!response.ok) {
    throw new Error(extractMessage(data as ApiError) || 'Something went wrong');
  }

  return data as T;
}

/**
 * Download a file from the API.
 * Used for JSON, PDF, and CSV exports.
 *
 * Different from request() because:
 *   - We get a blob (binary data) not JSON
 *   - We create a temporary download link and click it
 *   - The browser saves the file automatically
 *
 * @param path     - API path e.g. '/export/group/uuid/pdf'
 * @param filename - The name to save the file as
 */
export async function download(path: string, filename: string): Promise<void> {
  const token = getToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    clearAuth();
    throw new Error('UNAUTHORIZED');
  }

  if (!response.ok) {
    throw new Error('Download failed');
  }

  // Convert response to a blob (raw binary data)
  const blob = await response.blob();

  // Create a temporary URL pointing to the blob
  const url = URL.createObjectURL(blob);

  // Create a hidden anchor tag and click it to trigger download
  const a = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Auth endpoints ───────────────────────────────────────

export const auth = {
  requestOtp: (email: string) =>
    request<{ message: string }>('/auth/request-otp', {
      method: 'POST',
      body:   JSON.stringify({ email }),
    }),

  verifyOtp: (email: string, otp: string) =>
    request<{
      accessToken: string;
      expiresIn:   string;
      collector: {
        id:      string;
        name:    string;
        email:   string;
        groupId: string;
        role:    string;
      };
    }>('/auth/verify-otp', {
      method: 'POST',
      body:   JSON.stringify({ email, otp }),
    }),
    register: (data: {
      name:          string;
      email:         string;
      phoneNumber?:  string;
      groupName:     string;
      cycleAmount:   number;
      cycleInterval: string;
    }) =>
    request<{ message: string }>('/auth/register', {
      method: 'POST',
      body:   JSON.stringify(data),
    }),
};

// ─── Groups endpoints ─────────────────────────────────────

export const groups = {
  summary: (groupId: string) =>
    request<{
      groupName:              string;
      cycleInterval:          string;
      cycleAmount:            number;
      cycleAmountInNaira:     number;
      totalMembers:           number;
      currentPosition:        number;
      totalCollectedEver:     number;
      totalCollectedEverInNaira: number;
      totalPaidOut:           number;
      totalPaidOutInNaira:    number;
      balance:                number;
      balanceInNaira:         number;
      members: Array<{
        id:                    string;
        name:                  string;
        role:                  string;
        payoutOrder:           number | null;
        contributionCount:     number;
        totalContributed:      number;
        totalContributedInNaira: number;
        hasReceivedPayout:     boolean;
      }>;
    }>(`/groups/${groupId}/summary`),

  auditHistory: (groupId: string) =>
    request<Array<{
      sequenceNum: number;
      eventId:     string;
      entryData:   Record<string, unknown>;
      entryHash:   string;
      createdAt:   string;
    }>>(`/groups/${groupId}/audit`),

  verifyChain: (groupId: string) =>
    request<{
      valid:        boolean;
      totalEntries: number;
      brokenAt?:    number;
      reason?:      string;
    }>(`/groups/${groupId}/audit/verify`),
};

// ─── Members endpoints ────────────────────────────────────

export const members = {
  byGroup: (groupId: string) =>
    request<Array<{
      id:          string;
      name:        string;
      phoneNumber: string | null;
      email:       string | null;
      role:        string;
      status:      string;
      payoutOrder: number | null;
      groupId:     string;
    }>>(`/members/group/${groupId}`),

  create: (data: {
    name:         string;
    phoneNumber?: string;
    email?:       string;
    groupId:      string;
    role:         string;
    payoutOrder?: number;
  }) =>
    request<{ id: string; name: string }>('/members', {
      method: 'POST',
      body:   JSON.stringify(data),
    }),

  deactivate: (id: string) =>
    request<{ id: string; status: string }>(`/members/${id}/deactivate`, {
      method: 'PATCH',
    }),
};

// ─── Contributions endpoints ──────────────────────────────

export const contributions = {
  byGroup: (groupId: string) =>
    request<Array<{
      id:          string;
      amount:      number;
      channel:     string;
      status:      string;
      memberId:    string;
      collectorId: string;
      groupId:     string;
      receivedAt:  string;
      processedAt: string | null;
    }>>(`/contributions/group/${groupId}`),

  ingestWeb: (data: {
    groupId:  string;
    memberId: string;
    amount:   number;
    channel:  string;
  }) =>
    request<{
      message:       string;
      eventId:       string;
      memberId:      string;
      groupId:       string;
      amount:        number;
      amountInNaira: number;
      channel:       string;
      receivedAt:    string;
    }>('/ingest/web', {
      method: 'POST',
      body:   JSON.stringify(data),
    }),
};

// ─── Export endpoints ─────────────────────────────────────

export const exports = {
  groupJson: (groupId: string) =>
    download(`/export/group/${groupId}`, `ajoguard-group-${groupId.slice(0,8)}.json`),

  groupPdf: (groupId: string) =>
    download(`/export/group/${groupId}/pdf`, `ajoguard-group-${groupId.slice(0,8)}.pdf`),

  groupCsv: (groupId: string) =>
    download(`/export/group/${groupId}/csv`, `ajoguard-group-${groupId.slice(0,8)}.csv`),

  memberJson: (memberId: string) =>
    download(`/export/member/${memberId}`, `ajoguard-member-${memberId.slice(0,8)}.json`),

  memberPdf: (memberId: string) =>
    download(`/export/member/${memberId}/pdf`, `ajoguard-member-${memberId.slice(0,8)}.pdf`),

  memberCsv: (memberId: string) =>
    download(`/export/member/${memberId}/csv`, `ajoguard-member-${memberId.slice(0,8)}.csv`),
};