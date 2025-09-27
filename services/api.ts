import { AppSettings, Booking, Client, EditingJob, EditingStatus, Expense, Invoice, Payment, PaymentAccount, SessionCategory, SessionPackage, StaffMember, Activity, RevenueData, PandLData, SessionRevenue } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

interface BootstrapResponse {
    clients?: any[];
    bookings?: any[];
    invoices?: any[];
    editingJobs?: any[];
    staff?: any[];
    sessionTypes?: any[];
    editingStatuses?: any[];
    activities?: any[];
    expenses?: any[];
    revenue?: any[];
    profitAndLoss?: any[];
    sessionRevenue?: any[];
    paymentAccounts?: any[];
    settings?: any;
}

const parseDate = (value: string | number | Date | null | undefined): Date | null => {
    if (!value) {
        return null;
    }
    if (value instanceof Date) {
        return value;
    }
    return new Date(value);
};

const mapClient = (client: any): Client => ({
    ...client,
    joinDate: parseDate(client.joinDate) || new Date(),
});

const mapBooking = (booking: any): Booking => ({
    ...booking,
    date: parseDate(booking.date) || new Date(),
    photoSelections: booking.photoSelections || [],
});

const mapInvoice = (invoice: any): Invoice => ({
    ...invoice,
    dueDate: parseDate(invoice.dueDate) || new Date(),
    issueDate: parseDate(invoice.issueDate) || undefined,
    payments: (invoice.payments || []).map((payment: any) => ({
        ...payment,
        date: parseDate(payment.date) || new Date(),
    })),
    lastReminderSent: parseDate(invoice.lastReminderSent) || null,
});

const mapEditingJob = (job: any): EditingJob => ({
    ...job,
    uploadDate: parseDate(job.uploadDate) || new Date(),
    revisionNotes: (job.revisionNotes || []).map((note: any) => ({
        ...note,
        date: parseDate(note.date) || new Date(),
    })),
});

const mapActivity = (activity: any): Activity => ({
    ...activity,
    timestamp: parseDate(activity.timestamp) || new Date(),
});

const mapExpense = (expense: any): Expense => ({
    ...expense,
    date: parseDate(expense.date) || new Date(),
});

const mapStaff = (staff: any): StaffMember => ({
    ...staff,
    lastLogin: parseDate(staff.lastLogin) || new Date(),
});

const mapSessionTypes = (category: any): SessionCategory => ({
    ...category,
    packages: category.packages || [],
});

const mapEditingStatus = (status: any): EditingStatus => ({
    ...status,
});

const mapPaymentAccount = (account: any): PaymentAccount => ({
    ...account,
});

const mapSettings = (settings: any): AppSettings => ({
    ...settings,
});

const mapRevenue = (entry: any): RevenueData => ({
    ...entry,
});

const mapPandL = (entry: any): PandLData => ({
    ...entry,
});

const mapSessionRevenue = (entry: any): SessionRevenue => ({
    ...entry,
});

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers || {}),
        },
        credentials: 'include',
        ...init,
    });

    if (!response.ok) {
        const message = await response.text();
        throw new ApiError(message || `Request failed with status ${response.status}`, response.status);
    }

    if (response.status === 204) {
        return undefined as unknown as T;
    }

    const data = await response.json();
    return data as T;
}

export async function fetchBootstrapData(): Promise<{
    clients: Client[];
    bookings: Booking[];
    invoices: Invoice[];
    editingJobs: EditingJob[];
    staff: StaffMember[];
    sessionTypes: SessionCategory[];
    editingStatuses: EditingStatus[];
    activities: Activity[];
    expenses: Expense[];
    revenueData: RevenueData[];
    pandLData: PandLData[];
    sessionRevenue: SessionRevenue[];
    paymentAccounts: PaymentAccount[];
    settings: AppSettings | null;
}> {
    const bootstrap = await apiRequest<BootstrapResponse>('/bootstrap');

    return {
        clients: (bootstrap.clients || []).map(mapClient),
        bookings: (bootstrap.bookings || []).map(mapBooking),
        invoices: (bootstrap.invoices || []).map(mapInvoice),
        editingJobs: (bootstrap.editingJobs || []).map(mapEditingJob),
        staff: (bootstrap.staff || []).map(mapStaff),
        sessionTypes: (bootstrap.sessionTypes || []).map(mapSessionTypes),
        editingStatuses: (bootstrap.editingStatuses || []).map(mapEditingStatus),
        activities: (bootstrap.activities || []).map(mapActivity),
        expenses: (bootstrap.expenses || []).map(mapExpense),
        revenueData: (bootstrap.revenue || []).map(mapRevenue),
        pandLData: (bootstrap.profitAndLoss || []).map(mapPandL),
        sessionRevenue: (bootstrap.sessionRevenue || []).map(mapSessionRevenue),
        paymentAccounts: (bootstrap.paymentAccounts || []).map(mapPaymentAccount),
        settings: bootstrap.settings ? mapSettings(bootstrap.settings) : null,
    };
}

export async function createClient(client: Omit<Client, 'id' | 'joinDate' | 'totalBookings' | 'totalSpent'>): Promise<Client> {
    const created = await apiRequest<any>('/clients', {
        method: 'POST',
        body: JSON.stringify(client),
    });
    return mapClient(created);
}

export async function updateClient(clientId: string, updates: Partial<Client>): Promise<Client> {
    const updated = await apiRequest<any>(`/clients/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    });
    return mapClient(updated);
}

export async function deleteClient(clientId: string): Promise<void> {
    await apiRequest(`/clients/${clientId}`, { method: 'DELETE' });
}

export async function updateClientNotes(clientId: string, notes: string): Promise<Client> {
    const updated = await apiRequest<any>(`/clients/${clientId}/notes`, {
        method: 'PATCH',
        body: JSON.stringify({ notes }),
    });
    return mapClient(updated);
}

export async function createBooking(payload: Partial<Booking>): Promise<Booking> {
    const created = await apiRequest<any>('/bookings', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return mapBooking(created);
}

export async function updateBooking(bookingId: string, payload: Partial<Booking>): Promise<Booking> {
    const updated = await apiRequest<any>(`/bookings/${bookingId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    return mapBooking(updated);
}

export async function deleteBooking(bookingId: string): Promise<void> {
    await apiRequest(`/bookings/${bookingId}`, { method: 'DELETE' });
}

export async function createInvoice(payload: Partial<Invoice>): Promise<Invoice> {
    const created = await apiRequest<any>('/invoices', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return mapInvoice(created);
}

export async function updateInvoice(invoiceId: string, payload: Partial<Invoice>): Promise<Invoice> {
    const updated = await apiRequest<any>(`/invoices/${invoiceId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    return mapInvoice(updated);
}

export async function deleteInvoice(invoiceId: string): Promise<void> {
    await apiRequest(`/invoices/${invoiceId}`, { method: 'DELETE' });
}

export async function recordInvoicePayment(invoiceId: string, payload: Omit<Payment, 'id' | 'recordedBy'>): Promise<Invoice> {
    const updated = await apiRequest<any>(`/invoices/${invoiceId}/payments`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return mapInvoice(updated);
}

export async function createExpense(payload: Omit<Expense, 'id'>): Promise<Expense> {
    const created = await apiRequest<any>('/expenses', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return mapExpense(created);
}

export async function updateExpense(expenseId: string, payload: Partial<Expense>): Promise<Expense> {
    const updated = await apiRequest<any>(`/expenses/${expenseId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    return mapExpense(updated);
}

export async function deleteExpense(expenseId: string): Promise<void> {
    await apiRequest(`/expenses/${expenseId}`, { method: 'DELETE' });
}

export async function markExpenseAsBilled(expenseId: string, invoiceId: string): Promise<Expense> {
    const updated = await apiRequest<any>(`/expenses/${expenseId}/bill`, {
        method: 'POST',
        body: JSON.stringify({ invoiceId }),
    });
    return mapExpense(updated);
}

export async function createEditingJob(payload: Partial<EditingJob>): Promise<EditingJob> {
    const created = await apiRequest<any>('/editing-jobs', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return mapEditingJob(created);
}

export async function updateEditingJob(jobId: string, payload: Partial<EditingJob>): Promise<EditingJob> {
    const updated = await apiRequest<any>(`/editing-jobs/${jobId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    return mapEditingJob(updated);
}

export async function deleteEditingJob(jobId: string): Promise<void> {
    await apiRequest(`/editing-jobs/${jobId}`, { method: 'DELETE' });
}

export async function updateEditingJobStatus(jobId: string, statusId: string): Promise<EditingJob> {
    const updated = await apiRequest<any>(`/editing-jobs/${jobId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ statusId }),
    });
    return mapEditingJob(updated);
}

export async function logActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity> {
    const created = await apiRequest<any>('/activities', {
        method: 'POST',
        body: JSON.stringify(activity),
    });
    return mapActivity(created);
}

export async function createStaff(payload: Partial<StaffMember>): Promise<StaffMember> {
    const created = await apiRequest<any>('/staff', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return mapStaff(created);
}

export async function updateStaff(staffId: string, payload: Partial<StaffMember>): Promise<StaffMember> {
    const updated = await apiRequest<any>(`/staff/${staffId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    return mapStaff(updated);
}

export async function deleteStaff(staffId: string): Promise<void> {
    await apiRequest(`/staff/${staffId}`, { method: 'DELETE' });
}

export async function createSessionCategory(payload: Omit<SessionCategory, 'id'>): Promise<SessionCategory> {
    const created = await apiRequest<any>('/session-categories', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return mapSessionTypes(created);
}

export async function updateSessionCategory(categoryId: string, payload: Partial<SessionCategory>): Promise<SessionCategory> {
    const updated = await apiRequest<any>(`/session-categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    return mapSessionTypes(updated);
}

export async function deleteSessionCategory(categoryId: string): Promise<void> {
    await apiRequest(`/session-categories/${categoryId}`, { method: 'DELETE' });
}

export async function createSessionPackage(categoryId: string, payload: Omit<SessionPackage, 'id'>): Promise<SessionPackage> {
    const created = await apiRequest<any>(`/session-categories/${categoryId}/packages`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return created;
}

export async function updateSessionPackage(categoryId: string, packageId: string, payload: Partial<SessionPackage>): Promise<SessionPackage> {
    const updated = await apiRequest<any>(`/session-categories/${categoryId}/packages/${packageId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    return updated;
}

export async function deleteSessionPackage(categoryId: string, packageId: string): Promise<void> {
    await apiRequest(`/session-categories/${categoryId}/packages/${packageId}`, { method: 'DELETE' });
}

export async function createEditingStatus(payload: Omit<EditingStatus, 'id'>): Promise<EditingStatus> {
    const created = await apiRequest<any>('/editing-statuses', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return mapEditingStatus(created);
}

export async function updateEditingStatus(statusId: string, payload: Partial<EditingStatus>): Promise<EditingStatus> {
    const updated = await apiRequest<any>(`/editing-statuses/${statusId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    return mapEditingStatus(updated);
}

export async function deleteEditingStatus(statusId: string): Promise<void> {
    await apiRequest(`/editing-statuses/${statusId}`, { method: 'DELETE' });
}

export async function createPaymentAccount(payload: Omit<PaymentAccount, 'id'>): Promise<PaymentAccount> {
    const created = await apiRequest<any>('/payment-accounts', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return mapPaymentAccount(created);
}

export async function updatePaymentAccount(accountId: string, payload: Partial<PaymentAccount>): Promise<PaymentAccount> {
    const updated = await apiRequest<any>(`/payment-accounts/${accountId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    return mapPaymentAccount(updated);
}

export async function deletePaymentAccount(accountId: string): Promise<void> {
    await apiRequest(`/payment-accounts/${accountId}`, { method: 'DELETE' });
}

export async function saveSettings(settings: AppSettings): Promise<AppSettings> {
    const updated = await apiRequest<any>('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
    });
    return mapSettings(updated);
}
