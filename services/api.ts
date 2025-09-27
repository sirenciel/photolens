import {
  Activity,
  AppSettings,
  Booking,
  Client,
  EditingJob,
  EditingStatus,
  Expense,
  Invoice,
  Payment,
  PaymentAccount,
  RevenueData,
  PandLData,
  SessionCategory,
  SessionRevenue,
  StaffMember,
} from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api').replace(/\/$/, '');

type IsoDate = string;

interface RawPayment extends Omit<Payment, 'date'> {
  date: IsoDate;
}

interface RawInvoice extends Omit<Invoice, 'dueDate' | 'issueDate' | 'payments' | 'lastReminderSent'> {
  dueDate: IsoDate;
  issueDate?: IsoDate | null;
  lastReminderSent?: IsoDate | null;
  payments?: RawPayment[];
}

interface RawBooking extends Omit<Booking, 'date'> {
  date: IsoDate;
}

interface RawClient extends Omit<Client, 'joinDate'> {
  joinDate: IsoDate;
}

interface RawStaffMember extends Omit<StaffMember, 'lastLogin'> {
  lastLogin: IsoDate;
}

interface RawActivity extends Omit<Activity, 'timestamp'> {
  timestamp: IsoDate;
}

interface RawExpense extends Omit<Expense, 'date'> {
  date: IsoDate;
}

interface RawRevisionNote {
  note: string;
  date: IsoDate;
}

interface RawEditingJob extends Omit<EditingJob, 'uploadDate' | 'revisionNotes'> {
  uploadDate: IsoDate;
  revisionNotes?: RawRevisionNote[];
}

interface RawAppState {
  clients: RawClient[];
  bookings: RawBooking[];
  invoices: RawInvoice[];
  editingJobs: RawEditingJob[];
  staff: RawStaffMember[];
  sessionTypes: SessionCategory[];
  editingStatuses: EditingStatus[];
  activities: RawActivity[];
  expenses: RawExpense[];
  revenueData: RevenueData[];
  pandLData: PandLData[];
  sessionRevenue: SessionRevenue[];
  paymentAccounts: PaymentAccount[];
  appSettings: AppSettings;
}

export interface AppStatePayload {
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
  appSettings: AppSettings;
}

const parseDate = (value?: IsoDate | null): Date | null => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
};

const deserializeInvoice = (invoice: RawInvoice): Invoice => ({
  ...invoice,
  dueDate: new Date(invoice.dueDate),
  issueDate: parseDate(invoice.issueDate) ?? undefined,
  lastReminderSent: parseDate(invoice.lastReminderSent),
  payments: invoice.payments?.map(payment => ({
    ...payment,
    date: new Date(payment.date),
  })),
});

const deserializeBooking = (booking: RawBooking): Booking => ({
  ...booking,
  date: new Date(booking.date),
});

const deserializeClient = (client: RawClient): Client => ({
  ...client,
  joinDate: new Date(client.joinDate),
});

const deserializeStaff = (staff: RawStaffMember): StaffMember => ({
  ...staff,
  lastLogin: new Date(staff.lastLogin),
});

const deserializeActivity = (activity: RawActivity): Activity => ({
  ...activity,
  timestamp: new Date(activity.timestamp),
});

const deserializeExpense = (expense: RawExpense): Expense => ({
  ...expense,
  date: new Date(expense.date),
});

const deserializeEditingJob = (job: RawEditingJob): EditingJob => ({
  ...job,
  uploadDate: new Date(job.uploadDate),
  revisionNotes: job.revisionNotes?.map(note => ({
    ...note,
    date: new Date(note.date),
  })),
});

const deserializeAppState = (raw: RawAppState): AppStatePayload => ({
  clients: raw.clients.map(deserializeClient),
  bookings: raw.bookings.map(deserializeBooking),
  invoices: raw.invoices.map(deserializeInvoice),
  editingJobs: raw.editingJobs.map(deserializeEditingJob),
  staff: raw.staff.map(deserializeStaff),
  sessionTypes: raw.sessionTypes,
  editingStatuses: raw.editingStatuses,
  activities: raw.activities.map(deserializeActivity),
  expenses: raw.expenses.map(deserializeExpense),
  revenueData: raw.revenueData,
  pandLData: raw.pandLData,
  sessionRevenue: raw.sessionRevenue,
  paymentAccounts: raw.paymentAccounts,
  appSettings: raw.appSettings,
});

const serializeAppState = (state: AppStatePayload): RawAppState => (
  JSON.parse(
    JSON.stringify(state, (_key, value) => (value instanceof Date ? value.toISOString() : value)),
  ) as RawAppState
);

export const fetchAppState = async (): Promise<AppStatePayload> => {
  const response = await fetch(`${API_BASE_URL}/state`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch application state: ${response.status}`);
  }

  const raw = (await response.json()) as RawAppState;
  return deserializeAppState(raw);
};

export const persistAppState = async (state: AppStatePayload): Promise<void> => {
  const payload = serializeAppState(state);
  const response = await fetch(`${API_BASE_URL}/state`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to persist application state: ${response.status}`);
  }
};
