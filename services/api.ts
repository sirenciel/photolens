import { Activity, AppSettings, Booking, Client, EditingJob, EditingStatus, Expense, Invoice, Payment, PaymentAccount, SessionCategory, SessionPackage, StaffMember, RevenueData, PandLData, SessionRevenue } from '../types';

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  public readonly status: number;
  public readonly details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
};

const buildUrl = (path: string) => {
  if (/^https?:/i.test(path)) {
    return path;
  }
  const base = API_BASE_URL || '';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};

export async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = (data && (data.message || data.error)) || response.statusText;
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

const get = <T>(path: string) => fetchJson<T>(path);
const post = <T>(path: string, body?: unknown) =>
  fetchJson<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined });
const put = <T>(path: string, body?: unknown) =>
  fetchJson<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined });
const patch = <T>(path: string, body?: unknown) =>
  fetchJson<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined });
const del = <T>(path: string) => fetchJson<T>(path, { method: 'DELETE' });

// Client Endpoints
export const getClients = () => get<Client[]>('/clients');
export const createClient = (payload: Partial<Client>) => post<Client>('/clients', payload);
export const updateClient = (id: string, payload: Partial<Client>) => put<Client>(`/clients/${id}`, payload);
export const updateClientNotes = (id: string, notes: string) => patch<Client>(`/clients/${id}/notes`, { notes });
export const deleteClient = (id: string) => del<void>(`/clients/${id}`);

// Booking Endpoints
export const getBookings = () => get<Booking[]>('/bookings');
export const createBooking = (payload: Partial<Booking>) => post<Booking>('/bookings', payload);
export const updateBooking = (id: string, payload: Partial<Booking>) => put<Booking>(`/bookings/${id}`, payload);
export const deleteBooking = (id: string) => del<void>(`/bookings/${id}`);
export const updatePhotographerNotes = (bookingId: string, notes: string) => patch<Booking>(`/bookings/${bookingId}/photographer-notes`, { notes });
export const addPhotoSelection = (bookingId: string, selectionName: string) => post<Booking>(`/bookings/${bookingId}/photo-selections`, { name: selectionName });
export const removePhotoSelection = (bookingId: string, selectionName: string) => del<Booking>(`/bookings/${bookingId}/photo-selections/${encodeURIComponent(selectionName)}`);
export const togglePhotoSelection = (bookingId: string, selectionName: string) => patch<Booking>(`/bookings/${bookingId}/photo-selections/${encodeURIComponent(selectionName)}`);
export const finalizeSelections = (bookingId: string) => post<EditingJob>(`/bookings/${bookingId}/finalize-selections`);

// Staff Endpoints
export const getStaff = () => get<StaffMember[]>('/staff');
export const createStaff = (payload: Partial<StaffMember>) => post<StaffMember>('/staff', payload);
export const updateStaff = (id: string, payload: Partial<StaffMember>) => put<StaffMember>(`/staff/${id}`, payload);
export const deleteStaff = (id: string) => del<void>(`/staff/${id}`);

// Invoice Endpoints
export const getInvoices = () => get<Invoice[]>('/invoices');
export const createInvoice = (payload: Partial<Invoice>) => post<Invoice>('/invoices', payload);
export const updateInvoice = (id: string, payload: Partial<Invoice>) => put<Invoice>(`/invoices/${id}`, payload);
export const deleteInvoice = (id: string) => del<void>(`/invoices/${id}`);
export const recordPayment = (id: string, payload: Partial<Payment>) => post<Invoice>(`/invoices/${id}/payments`, payload);
export const createInvoiceFromBooking = (bookingId: string) => post<Invoice>(`/bookings/${bookingId}/invoice`);

// Expense Endpoints
export const getExpenses = () => get<Expense[]>('/expenses');
export const createExpense = (payload: Partial<Expense>) => post<Expense>('/expenses', payload);
export const updateExpense = (id: string, payload: Partial<Expense>) => put<Expense>(`/expenses/${id}`, payload);
export const deleteExpense = (id: string) => del<void>(`/expenses/${id}`);
export const billExpense = (id: string) => post<{ expense: Expense; invoice?: Invoice }>(`/expenses/${id}/bill`);

// Editing Workflow Endpoints
export const getEditingJobs = () => get<EditingJob[]>('/editing-jobs');
export const createEditingJob = (payload: Partial<EditingJob>) => post<EditingJob>('/editing-jobs', payload);
export const updateEditingJob = (id: string, payload: Partial<EditingJob>) => put<EditingJob>(`/editing-jobs/${id}`, payload);
export const deleteEditingJob = (id: string) => del<void>(`/editing-jobs/${id}`);
export const updateEditingJobStatus = (id: string, statusId: string) => patch<EditingJob>(`/editing-jobs/${id}/status`, { statusId });
export const requestRevision = (id: string, notes: string) => post<EditingJob>(`/editing-jobs/${id}/revision`, { notes });

// Metadata & Settings
export const getActivities = () => get<Activity[]>('/activities');
export const getRevenueData = () => get<RevenueData[]>('/reports/revenue');
export const getPandLData = () => get<PandLData[]>('/reports/pandl');
export const getSessionRevenue = () => get<SessionRevenue[]>('/reports/session-revenue');

export const getSessionCategories = () => get<SessionCategory[]>('/session-categories');
export const createSessionCategory = (payload: Partial<SessionCategory>) => post<SessionCategory>('/session-categories', payload);
export const updateSessionCategory = (id: string, payload: Partial<SessionCategory>) => put<SessionCategory>(`/session-categories/${id}`, payload);
export const deleteSessionCategory = (id: string) => del<void>(`/session-categories/${id}`);
export const createSessionPackage = (categoryId: string, payload: Partial<SessionPackage>) => post<SessionPackage>(`/session-categories/${categoryId}/packages`, payload);
export const updateSessionPackage = (categoryId: string, packageId: string, payload: Partial<SessionPackage>) => put<SessionPackage>(`/session-categories/${categoryId}/packages/${packageId}`, payload);
export const deleteSessionPackage = (categoryId: string, packageId: string) => del<void>(`/session-categories/${categoryId}/packages/${packageId}`);

export const getEditingStatuses = () => get<EditingStatus[]>('/editing-statuses');
export const createEditingStatus = (payload: Partial<EditingStatus>) => post<EditingStatus>('/editing-statuses', payload);
export const updateEditingStatus = (id: string, payload: Partial<EditingStatus>) => put<EditingStatus>(`/editing-statuses/${id}`, payload);
export const deleteEditingStatus = (id: string) => del<void>(`/editing-statuses/${id}`);

export const getPaymentAccounts = () => get<PaymentAccount[]>('/payment-accounts');
export const createPaymentAccount = (payload: Partial<PaymentAccount>) => post<PaymentAccount>('/payment-accounts', payload);
export const updatePaymentAccount = (id: string, payload: Partial<PaymentAccount>) => put<PaymentAccount>(`/payment-accounts/${id}`, payload);
export const deletePaymentAccount = (id: string) => del<void>(`/payment-accounts/${id}`);

export const getAppSettings = () => get<AppSettings>('/settings/app');
export const updateAppSettings = (payload: Partial<AppSettings>) => put<AppSettings>('/settings/app', payload);

// Automations
export const triggerAutomations = () => post<void>('/automations/run');
export const triggerEditingAutomation = (bookingId: string) => post<void>(`/bookings/${bookingId}/automations`);
