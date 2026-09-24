/**
 * ANNASETU API Client
 * Connects frontend to the authoritative FastAPI backend.
 * Provides automatic fallback data if the API is offline or warming up.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errorData.detail || `Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    console.warn(`[AnnaSetu API] Warning for ${endpoint}:`, err.message);
    throw err;
  }
}

// -------------------------------------------------------------
// CORE API METHODS
// -------------------------------------------------------------

export const AnnaSetuApi = {
  // Health & System
  getHealth: () => apiFetch<any>('/api/health'),
  resetSeedData: () => apiFetch<{ message: string }>('/api/demo/reset', { method: 'POST' }),
  getConfig: () => apiFetch<any>('/api/config'),
  updateConfig: (updates: any) =>
    apiFetch<any>('/api/config', { method: 'PUT', body: JSON.stringify(updates) }),
  getAuditLogs: () => apiFetch<any[]>('/api/audit-logs'),

  // Users & Verification
  listUsers: (role?: string) => apiFetch<any[]>(`/api/users${role ? `?role=${role}` : ''}`),
  registerUser: (data: any) =>
    apiFetch<any>('/api/users/register', { method: 'POST', body: JSON.stringify(data) }),
  getVerificationQueue: () => apiFetch<any[]>('/api/verification/queue'),
  reviewVerification: (caseId: string, action: 'APPROVE' | 'REJECT', notes: string) =>
    apiFetch<any>('/api/verification/review', {
      method: 'POST',
      body: JSON.stringify({ case_id: caseId, action, notes }),
    }),
  lookupGovPortal: (docType: string, identifier: string, secondary?: string) =>
    apiFetch<any>(
      `/api/verification/lookup?doc_type=${encodeURIComponent(docType)}&identifier=${encodeURIComponent(identifier)}${secondary ? `&secondary=${encodeURIComponent(secondary)}` : ''}`
    ),

  // Needs (NGO)
  listNeeds: (ngoId?: string, statusFilter?: string) => {
    const params = new URLSearchParams();
    if (ngoId) params.append('ngo_id', ngoId);
    if (statusFilter) params.append('status_filter', statusFilter);
    return apiFetch<any[]>(`/api/needs?${params.toString()}`);
  },
  createNeed: (data: any) =>
    apiFetch<any>('/api/needs', { method: 'POST', body: JSON.stringify(data) }),

  // Donations (Donor)
  listDonations: (donorId?: string, statusFilter?: string) => {
    const params = new URLSearchParams();
    if (donorId) params.append('donor_id', donorId);
    if (statusFilter) params.append('status_filter', statusFilter);
    return apiFetch<any[]>(`/api/donations?${params.toString()}`);
  },
  createDonation: (data: any) =>
    apiFetch<any>('/api/donations', { method: 'POST', body: JSON.stringify(data) }),
  analyzeFoodImage: (imageUrl: string, category: string) =>
    apiFetch<any>('/api/donations/ai-analyze', {
      method: 'POST',
      body: JSON.stringify({ image_url: imageUrl, category }),
    }),

  // Matching & Allocation
  getMatchProposals: (donationId?: string, needId?: string) => {
    const params = new URLSearchParams();
    if (donationId) params.append('donation_id', donationId);
    if (needId) params.append('need_id', needId);
    return apiFetch<any[]>(`/api/matching/proposals?${params.toString()}`);
  },
  reserveFood: (donationId: string, needId: string, requestedKg: number) =>
    apiFetch<any>('/api/matching/reserve', {
      method: 'POST',
      body: JSON.stringify({
        donation_id: donationId,
        need_id: needId,
        requested_quantity_kg: requestedKg,
      }),
    }),
  confirmAllocation: (donationId: string, needId: string, reservationId: string) =>
    apiFetch<any>('/api/matching/confirm-allocation', {
      method: 'POST',
      body: JSON.stringify({
        donation_id: donationId,
        need_id: needId,
        reservation_id: reservationId,
      }),
    }),

  // Delivery Marketplace
  listDeliveryJobs: (driverId?: string, statusFilter?: string) => {
    const params = new URLSearchParams();
    if (driverId) params.append('driver_id', driverId);
    if (statusFilter) params.append('status_filter', statusFilter);
    return apiFetch<any[]>(`/api/delivery/jobs?${params.toString()}`);
  },
  acceptJob: (jobId: string, driverId: string) =>
    apiFetch<any>(`/api/delivery/jobs/${jobId}/accept`, {
      method: 'POST',
      body: JSON.stringify({ driver_id: driverId }),
    }),
  pickupHandoff: (jobId: string, data: {
    driver_id: string;
    driver_lat: number;
    driver_lon: number;
    entered_otp: string;
    seal_id: string;
    photo_url: string;
  }) =>
    apiFetch<any>(`/api/delivery/jobs/${jobId}/pickup-handoff`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deliveryHandoff: (jobId: string, data: {
    driver_id: string;
    driver_lat: number;
    driver_lon: number;
    entered_otp: string;
    seal_id: string;
    photo_url: string;
  }) =>
    apiFetch<any>(`/api/delivery/jobs/${jobId}/delivery-handoff`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Finance & Ledger
  getWallets: () => apiFetch<any[]>('/api/finance/wallets'),
  getWallet: (ownerId: string) => apiFetch<any>(`/api/finance/wallets/${ownerId}`),
  getLedger: (walletId?: string) =>
    apiFetch<any[]>(`/api/finance/ledger${walletId ? `?wallet_id=${walletId}` : ''}`),
  topupWallet: (ownerId: string, amount: number) =>
    apiFetch<any>('/api/finance/wallet/topup', {
      method: 'POST',
      body: JSON.stringify({ owner_id: ownerId, amount }),
    }),

  // Impact & Certificates
  getImpactSummary: () => apiFetch<any>('/api/impact/summary'),
  listImpactRecords: (donorId?: string, ngoId?: string) => {
    const params = new URLSearchParams();
    if (donorId) params.append('donor_id', donorId);
    if (ngoId) params.append('ngo_id', ngoId);
    return apiFetch<any[]>(`/api/impact/records?${params.toString()}`);
  },
  getCertificate: (jobId: string) => apiFetch<any>(`/api/impact/certificate/${jobId}`),

  // Copilot
  queryCopilot: (query: string, role: string) =>
    apiFetch<{ query: string; answer: string }>('/api/copilot/query', {
      method: 'POST',
      body: JSON.stringify({ query, role }),
    }),
};
