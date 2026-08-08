import { browser } from '$app/environment';
import { API_BASE_URL } from './config';
import {
  getToken,
  getRefreshToken,
  clearAuth,
  setTokens,
} from './auth';
import type { AuthResponse } from './auth';

/**
 * Core API client for the AjoGuard backend.
 *
 * Conventions agreed with the backend (see PRODUCTION_READINESS_AUDIT.md):
 *   - Money on the wire is integer NAIRA; every money field also has a raw
 *     `...InKobo` companion. Keep arithmetic in kobo.
 *   - Errors come back in a single envelope from `AllExceptionsFilter`:
 *     `{ success, statusCode, message, requestId, timestamp }`.
 *   - List endpoints are paginated with `?page=&limit=` and respond with
 *     `{ data, page, limit, total, totalPages }`.
 */

export class ApiError extends Error {
  statusCode: number;
  requestId?: string;

  constructor(statusCode: number, message: string, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.requestId = requestId;
  }
}

// ─── Shared response shapes ─────────────────────────────

export interface Paginated<T> {
  data:       T[];
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
}

export interface PublicMember {
  id:          string;
  name:        string;
  phoneNumber: string | null;
  email:       string | null;
  role:        string;
  status:      string;
  payoutOrder: number | null;
  groupId:     string;
  createdAt:   string;
  updatedAt:   string;
}

export interface PublicGroup {
  id:               string;
  name:             string;
  description:      string | null;
  isActive:         boolean;
  cycleAmount:      number; // naira
  cycleAmountInKobo: number;
  cycleInterval:    string;
  totalMembers:     number;
  currentPosition:  number;
  createdAt:        string;
  updatedAt:        string;
}

export interface PublicContribution {
  id:           string;
  amount:       number; // naira
  amountInKobo: number;
  channel:      string;
  status:       string;
  memberId:     string;
  collectorId:  string;
  groupId:      string;
  receivedAt:   string;
  processedAt:  string | null;
}

export interface GroupSummary {
  groupName:              string;
  cycleInterval:          string;
  cycleAmount:            number; // naira
  cycleAmountInKobo:      number;
  totalMembers:           number;
  currentPosition:        number;
  totalCollectedEver:     number; // naira
  totalCollectedEverInKobo: number;
  totalPaidOut:           number; // naira
  totalPaidOutInKobo:     number;
  balance:                number; // naira
  balanceInKobo:          number;
  members: Array<{
    id:                      string;
    name:                    string;
    role:                    string;
    payoutOrder:             number | null;
    contributionCount:       number;
    totalContributed:        number; // naira
    totalContributedInKobo:  number;
    hasReceivedPayout:       boolean;
  }>;
}

export interface AuditEntry {
  sequenceNum: number;
  eventId:     string;
  entryData:   Record<string, unknown>;
  entryHash:   string;
  createdAt:   string;
}

export interface ChainVerification {
  valid:        boolean;
  totalEntries: number;
  brokenAt?:    number;
  reason?:      string;
}

export interface IngestWebResult {
  message:       string;
  eventId:       string;
  memberId:      string;
  groupId:       string;
  amount:        number; // naira
  amountInKobo:  number;
  channel:       string;
  receivedAt:    string;
}

export interface PayoutResult {
  message:         string;
  payoutId:        string;
  amount:          number; // naira
  amountInKobo:    number;
  cycleIdentifier: string;
  payoutDate:      string;
  nextPosition:    number;
}

// ─── Error handling helpers ─────────────────────────────

interface ErrorEnvelope {
  success?:    boolean;
  statusCode?: number;
  message?:    string | string[];
  error?:      string;
  requestId?:  string;
  timestamp?:  string;
}

function extractMessage(body: ErrorEnvelope): string {
  const message = Array.isArray(body.message)
    ? body.message.join(', ')
    : body.message;
  return message || 'Something went wrong';
}

// ─── Silent token refresh ───────────────────────────────

let refreshing: Promise<boolean> | null = null;

/**
 * Exchange the stored refresh token for a fresh pair. Rotates the token,
 * so the old refresh token stops working immediately (one-time use).
 */
async function attemptRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  // Deduplicate concurrent 401s — only one refresh request at a time.
  if (refreshing) return refreshing;

  refreshing = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        clearAuth();
        return false;
      }

      const data = (await res.json()) as AuthResponse;
      setTokens(data.accessToken, data.refreshToken);
      return true;
    } catch {
      clearAuth();
      return false;
    } finally {
      refreshing = null;
    }
  })();

  return refreshing;
}

function handleAuthFailure(): void {
  clearAuth();
  if (browser) window.location.assign('/login');
}

// ─── Core fetch wrapper ─────────────────────────────────

/**
 * JSON request wrapper. Automatically:
 *   - Adds Authorization: Bearer <access> header when logged in
 *   - Refreshes once on a 401, then retries the original request
 *   - Parses the AllExceptionsFilter error envelope into an ApiError
 */
async function request<T>(
  path: string,
  options: RequestInit = {},
  retried = false,
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...((options.headers as Record<string, string>) || {}),
    },
  });

  // Access token expired — try a silent refresh, then retry once.
  if (
    response.status === 401 &&
    token &&
    !retried &&
    !path.startsWith('/auth/refresh')
  ) {
    const refreshed = await attemptRefresh();
    if (refreshed) return request<T>(path, options, true);
    handleAuthFailure();
    throw new ApiError(401, 'UNAUTHORIZED');
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message =
      data && typeof data === 'object'
        ? extractMessage(data as ErrorEnvelope)
        : `Request failed (${response.status})`;
    throw new ApiError(
      response.status,
      message,
      (data as ErrorEnvelope | null)?.requestId,
    );
  }

  return data as T;
}

/**
 * Download a file from the API (JSON/PDF/CSV exports).
 * Uses a blob so the browser saves the file instead of navigating to it.
 */
export async function download(
  path: string,
  filename: string,
  retried = false,
): Promise<void> {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (response.status === 401 && token && !retried) {
    const refreshed = await attemptRefresh();
    if (refreshed) return download(path, filename, true);
    handleAuthFailure();
    throw new ApiError(401, 'UNAUTHORIZED');
  }

  if (!response.ok) {
    let message = 'Download failed';
    try {
      message = extractMessage((await response.json()) as ErrorEnvelope);
    } catch {
      // body wasn't JSON
    }
    throw new ApiError(response.status, message);
  }

  const blob = await response.blob();
  const url  = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Auth endpoints ─────────────────────────────────────

export const auth = {
  /** Preferred SPA flow — verify a Google ID token for an existing account. */
  googleLogin: (idToken: string) =>
    request<AuthResponse>('/auth/google/login', {
      method: 'POST',
      body:   JSON.stringify({ idToken }),
    }),

  /** Register a new collector+group, or join an existing group by code. */
  googleRegister: (data: {
    idToken:       string;
    name?:         string;
    phoneNumber:   string;
    groupName?:    string;
    cycleAmount?:  number; // integer naira
    cycleInterval?: 'weekly' | 'monthly';
    joinCode?:     string;
  }) =>
    request<AuthResponse>('/auth/google/register', {
      method: 'POST',
      body:   JSON.stringify(data),
    }),

  refresh: (refreshToken: string) =>
    request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body:   JSON.stringify({ refreshToken }),
    }),
};

// ─── Groups endpoints ───────────────────────────────────

export const groups = {
  list: (page = 1, limit = 50) =>
    request<Paginated<PublicGroup>>(`/groups?page=${page}&limit=${limit}`),

  findOne: (groupId: string) =>
    request<PublicGroup>(`/groups/${groupId}`),

  summary: (groupId: string) =>
    request<GroupSummary>(`/groups/${groupId}/summary`),

  joinCode: (groupId: string) =>
    request<{ joinCode: string }>(`/groups/${groupId}/join-code`),

  deactivate: (groupId: string) =>
    request<PublicGroup>(`/groups/${groupId}/deactivate`, {
      method: 'PATCH',
    }),

  recordPayout: (groupId: string, recipientId: string) =>
    request<PayoutResult>(`/groups/${groupId}/payout`, {
      method: 'POST',
      body:   JSON.stringify({ recipientId }),
    }),

  auditHistory: (groupId: string, page = 1, limit = 50) =>
    request<Paginated<AuditEntry>>(
      `/groups/${groupId}/audit?page=${page}&limit=${limit}`,
    ),

  verifyChain: (groupId: string) =>
    request<ChainVerification>(`/groups/${groupId}/audit/verify`),
};

// ─── Members endpoints ──────────────────────────────────

export const members = {
  byGroup: (groupId: string, page = 1, limit = 50) =>
    request<Paginated<PublicMember>>(
      `/members/group/${groupId}?page=${page}&limit=${limit}`,
    ),

  findOne: (id: string) =>
    request<PublicMember>(`/members/${id}`),

  create: (data: {
    name:         string;
    phoneNumber?: string;
    email?:       string;
    groupId:      string;
    role:         'MEMBER' | 'COLLECTOR';
  }) =>
    request<PublicMember>('/members', {
      method: 'POST',
      body:   JSON.stringify(data),
    }),

  deactivate: (id: string) =>
    request<PublicMember>(`/members/${id}/deactivate`, {
      method: 'PATCH',
    }),
};

// ─── Contributions endpoints ────────────────────────────

export const contributions = {
  byGroup: (groupId: string, page = 1, limit = 50) =>
    request<Paginated<PublicContribution>>(
      `/contributions/group/${groupId}?page=${page}&limit=${limit}`,
    ),

  byMember: (memberId: string, page = 1, limit = 50) =>
    request<Paginated<PublicContribution>>(
      `/contributions/member/${memberId}?page=${page}&limit=${limit}`,
    ),

  findOne: (id: string) =>
    request<PublicContribution>(`/contributions/${id}`),

  ingestWeb: (data: {
    groupId:  string;
    memberId: string;
    amount:   number; // integer naira
    channel:  'WEB';
  }) =>
    request<IngestWebResult>('/ingest/web', {
      method: 'POST',
      body:   JSON.stringify(data),
    }),
};

// ─── Export endpoints ───────────────────────────────────

export const exports = {
  groupJson: (groupId: string) =>
    download(`/export/group/${groupId}`, `ajoguard-group-${groupId.slice(0, 8)}.json`),

  groupPdf: (groupId: string) =>
    download(`/export/group/${groupId}/pdf`, `ajoguard-group-${groupId.slice(0, 8)}.pdf`),

  groupCsv: (groupId: string) =>
    download(`/export/group/${groupId}/csv`, `ajoguard-group-${groupId.slice(0, 8)}.csv`),

  memberJson: (memberId: string) =>
    download(`/export/member/${memberId}`, `ajoguard-member-${memberId.slice(0, 8)}.json`),

  memberPdf: (memberId: string) =>
    download(`/export/member/${memberId}/pdf`, `ajoguard-member-${memberId.slice(0, 8)}.pdf`),

  memberCsv: (memberId: string) =>
    download(`/export/member/${memberId}/csv`, `ajoguard-member-${memberId.slice(0, 8)}.csv`),
};