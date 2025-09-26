// FIX: Import React to provide the React namespace for React.ReactNode.
import React from 'react';

export enum UserRole {
  Owner = 'Owner',
  Admin = 'Admin',
  Photographer = 'Photographer',
  Editor = 'Editor',
  Finance = 'Finance',
}

export enum Permission {
    VIEW_DASHBOARD = 'VIEW_DASHBOARD',
    VIEW_BOOKINGS_ALL = 'VIEW_BOOKINGS_ALL',
    VIEW_BOOKINGS_SELF = 'VIEW_BOOKINGS_SELF',
    MANAGE_BOOKINGS = 'MANAGE_BOOKINGS',
    VIEW_CLIENTS = 'VIEW_CLIENTS',
    MANAGE_CLIENTS = 'MANAGE_CLIENTS',
    VIEW_INVOICES = 'VIEW_INVOICES',
    MANAGE_INVOICES = 'MANAGE_INVOICES',
    VIEW_EDITING_ALL = 'VIEW_EDITING_ALL',
    VIEW_EDITING_SELF = 'VIEW_EDITING_SELF',
    MANAGE_EDITING = 'MANAGE_EDITING',
    VIEW_REPORTS = 'VIEW_REPORTS',
    VIEW_STAFF = 'VIEW_STAFF',
    MANAGE_STAFF = 'MANAGE_STAFF',
    VIEW_SETTINGS = 'VIEW_SETTINGS',
    MANAGE_SETTINGS = 'MANAGE_SETTINGS',
    MANAGE_EXPENSES = 'MANAGE_EXPENSES',
}

export interface User {
  name: string;
  role: UserRole;
  avatarUrl: string;
}

export interface StaffMember {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    role: UserRole;
    status: 'Active' | 'Invited' | 'Inactive';
    lastLogin: Date;
}

export interface PhotoSelection {
    name: string;
    edited: boolean;
}

export type ClientFinancialStatus = 'Good Standing' | 'Overdue' | 'High Value';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  joinDate: Date;
  totalBookings: number;
  totalSpent: number;
  notes?: string;
  financialStatus?: ClientFinancialStatus;
}

export interface SessionPackage {
    id: string;
    name: string;
    price: number;
    inclusions?: string[];
}

export interface SessionCategory {
    id: string;
    name: string;
    packages: SessionPackage[];
}

export interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatarUrl: string;
  sessionCategoryId: string;
  sessionPackageId: string;
  sessionType: string; // Denormalized for display
  photographerId: string;
  photographer: string;
  date: Date;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
  invoiceId: string;
  photoSelections?: PhotoSelection[];
  notes?: string;
  location?: string;
}

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    price: number;
}

export interface PaymentAccount {
    id: string;
    name: string;
    type: 'Bank' | 'Cash' | 'Digital Wallet' | 'Other';
    details?: string; // e.g., account number
}

export interface Payment {
    id: string;
    date: Date;
    amount: number;
    accountId: string;
    methodNotes?: string; // e.g., QRIS, EDC BCA, etc.
    recordedBy: string;
}

export interface Invoice {
    id:string;
    bookingId: string;
    clientId: string;
    clientName: string;
    clientAvatarUrl: string;
    items: InvoiceItem[];
    amount: number; // This will be calculated from items
    amountPaid: number;
    dueDate: Date;
    issueDate?: Date; // Added for invoice/receipt display
    status: 'Paid' | 'Overdue' | 'Sent';
    payments?: Payment[];
    lastReminderSent?: Date | null;
}

export interface Activity {
    id: string;
    user: string;
    userAvatarUrl: string;
    action: string;
    target: string;
    timestamp: Date;
}

export interface EditingStatus {
    id: string;
    name: string;
    color: 'yellow' | 'blue' | 'purple' | 'green' | 'slate';
}

export interface EditingJob {
    id: string;
    bookingId: string;
    clientId: string;
    clientName: string;
    editorId: string | null;
    editorName: string;
    editorAvatarUrl: string;
    statusId: string;
    uploadDate: Date;
    driveFolderUrl?: string;
    photographerNotes?: string;
    priority?: 'Normal' | 'High' | 'Urgent';
    revisionCount?: number;
    revisionNotes?: { note: string; date: Date }[];
}

export interface KPI {
    title: string;
    value: string;
    change: string;
    changeType: 'increase' | 'decrease';
    icon: React.ReactNode;
    onClick?: () => void;
}

export interface RevenueData {
    month: string;
    revenue: number;
}

export interface Expense {
    id: string;
    category: 'Software' | 'Studio' | 'Marketing' | 'Gear' | 'Travel' | 'Other';
    description: string;
    amount: number;
    date: Date;
    accountId: string;
    bookingId?: string;
    isBilled?: boolean;
}

export interface PandLData {
    month: string;
    revenue: number;
    expenses: number;
}

export interface SessionRevenue {
    name: string;
    value: number;
    id: string; // Session Category ID
}

export interface AppSettings {
    companyProfile: {
        name: string;
        address: string;
        email: string;
        logoUrl: string;
    };
    invoiceSettings: {
        prefix: string;
        defaultDueDays: number;
        footerNotes: string;
    };
    automatedReminders: {
        enabled: boolean;
        frequencyDays: number;
    };
}


// Prop Types
export interface DashboardProps {
    bookings: Booking[];
    invoices: Invoice[];
    editingJobs: EditingJob[];
    activities: Activity[];
    revenueData: RevenueData[];
    currentUser: StaffMember;
    setActivePage: (page: string) => void;
    navigateAndFilter: (page: string, filters: any) => void;
}

export interface BookingsPageProps {
    bookings: Booking[];
    clients: Client[];
    staff: StaffMember[];
    sessionTypes: SessionCategory[];
    paymentAccounts: PaymentAccount[];
    invoices: Invoice[];
    currentUser: StaffMember;
    onSaveBooking: (booking: Omit<Booking, 'id' | 'clientName' | 'clientAvatarUrl' | 'photographer' | 'invoiceId' | 'sessionType' | 'photoSelections'> & { id?: string }) => Promise<Booking | void>;
    onDeleteBooking: (bookingId: string) => Promise<void> | void;
    onSaveClient: (client: Omit<Client, 'id' | 'joinDate' | 'totalBookings' | 'totalSpent'> & { id?: string }) => Promise<Client | void>;
    onViewClient: (clientId: string) => void;
    onPreviewInvoice: (invoiceId: string, type?: 'invoice' | 'receipt') => void;
    onCreateInvoiceFromBooking: (bookingId: string) => Promise<Invoice | void>;
    onRecordPayment: (invoiceId: string, paymentData: Omit<Payment, 'id' | 'recordedBy'>) => Promise<void>;
    onSavePhotographerNotes: (bookingId: string, notes: string) => Promise<void>;
    initialFilters?: { status?: string, sessionCategoryId?: string, clientId?: string };
}

export interface BookingFormProps {
    booking?: Booking | null;
    clients: Client[];
    staff: StaffMember[];
    sessionTypes: SessionCategory[];
    invoices: Invoice[];
    bookings: Booking[];
    onSave: (booking: Omit<Booking, 'id' | 'clientName' | 'clientAvatarUrl' | 'photographer' | 'invoiceId' | 'sessionType' | 'photoSelections'> & { id?: string }) => Promise<void>;
    onCancel: () => void;
    onSaveClient: (client: Omit<Client, 'id' | 'joinDate' | 'totalBookings' | 'totalSpent'> & { id?: string }) => Promise<Client | void>;
}

export interface ClientsPageProps {
    clients: Client[];
    currentUser: StaffMember;
    onSaveClient: (client: Omit<Client, 'id' | 'joinDate' | 'totalBookings' | 'totalSpent'> & { id?: string }) => Promise<Client | void>;
    onDeleteClient: (clientId: string) => Promise<void>;
    onViewProfile: (clientId: string) => void;
}

export interface ClientCardProps {
    client: Client;
    currentUser: StaffMember;
    onViewProfile: (clientId: string) => void;
    onDelete: (clientId: string) => Promise<void> | void;
}

export interface ClientFormProps {
    client?: Client | null;
    onSave: (client: Omit<Client, 'id' | 'joinDate' | 'totalBookings' | 'totalSpent'> & { id?: string }) => Promise<Client | void>;
    onCancel: () => void;
}

export interface ClientProfilePageProps {
    client: Client;
    bookings: Booking[];
    invoices: Invoice[];
    editingJobs: EditingJob[];
    editingStatuses: EditingStatus[];
    expenses: Expense[];
    activities: Activity[];
    currentUser: StaffMember;
    onBack: () => void;
    onSaveClient: (client: Omit<Client, 'id' | 'joinDate' | 'totalBookings' | 'totalSpent'> & { id?: string }) => Promise<Client | void>;
    onDeleteClient: (clientId: string) => Promise<void>;
    onSaveNotes: (clientId: string, notes: string) => Promise<void>;
    onAddPhotoSelection: (bookingId: string, selectionName: string) => Promise<void>;
    onRemovePhotoSelection: (bookingId: string, selectionName: string) => Promise<void>;
    onTogglePhotoSelectionEdited: (bookingId: string, selectionName: string) => Promise<void>;
    onPreviewInvoice: (invoiceId: string, type?: 'invoice' | 'receipt') => void;
    onFinalizeSelections: (bookingId: string) => Promise<void>;
    navigateAndFilter: (page: string, filters: any) => void;
}

export interface InvoicesPageProps {
    invoices: Invoice[];
    bookings: Booking[];
    clients: Client[];
    sessionTypes: SessionCategory[];
    paymentAccounts: PaymentAccount[];
    currentUser: StaffMember;
    onSaveInvoice: (invoice: Omit<Invoice, 'id' | 'clientName' | 'clientAvatarUrl' | 'amount' | 'amountPaid' | 'payments' | 'lastReminderSent'> & { id?: string }) => Promise<void>;
    onDeleteInvoice: (invoiceId: string) => Promise<void>;
    onRecordPayment: (invoiceId: string, paymentData: Omit<Payment, 'id' | 'recordedBy'>) => Promise<void>;
    onViewClient: (clientId: string) => void;
    onPreviewInvoice: (invoiceId: string, type?: 'invoice' | 'receipt') => void;
    initialFilters?: { status?: string, dateRange?: { start: Date, end: Date }, clientId?: string };
}

export interface InvoiceFormProps {
    invoice?: Invoice | null;
    bookings: Booking[];
    clients: Client[];
    sessionTypes: SessionCategory[];
    onSave: (invoice: Omit<Invoice, 'id' | 'clientName' | 'clientAvatarUrl' | 'amount' | 'amountPaid' | 'payments' | 'lastReminderSent'> & { id?: string }) => Promise<void>;
    onCancel: () => void;
}

export interface RecordPaymentFormProps {
    invoice: Invoice;
    paymentAccounts: PaymentAccount[];
    onSave: (paymentData: Omit<Payment, 'id' | 'recordedBy'>) => Promise<void>;
    onCancel: () => void;
}

export interface EditingWorkflowPageProps {
    jobs: EditingJob[];
    bookings: Booking[];
    staff: StaffMember[];
    clients: Client[];
    editingStatuses: EditingStatus[];
    currentUser: StaffMember;
    onSaveJob: (job: Omit<EditingJob, 'id' | 'clientName' | 'editorName' | 'editorAvatarUrl' | 'uploadDate'> & { id?: string }) => Promise<void>;
    onDeleteJob: (jobId: string) => Promise<void>;
    onUpdateJobStatus: (jobId: string, newStatusId: string) => Promise<void>;
    onViewClient: (clientId: string) => void;
    onNotifyClientForReview: (jobId: string) => Promise<void>;
    onRequestRevision: (jobId: string, notes: string) => Promise<void>;
    initialFilters?: { status?: string, clientId?: string };
}

export interface JobCardProps {
    job: EditingJob;
    statuses: EditingStatus[];
    currentUser: StaffMember;
    onEdit: (job: EditingJob) => void;
    onDelete: (jobId: string) => Promise<void>;
    onViewClient: (clientId: string) => void;
}

export interface JobFormProps {
    job?: EditingJob | null;
    bookings: Booking[];
    staff: StaffMember[];
    clients: Client[];
    statuses: EditingStatus[];
    onSave: (job: Omit<EditingJob, 'id' | 'clientName' | 'editorName' | 'editorAvatarUrl' | 'uploadDate'> & { id?: string }) => Promise<void>;
    onCancel: () => void;
}

export interface KanbanViewProps {
    jobs: EditingJob[];
    statuses: EditingStatus[];
    onUpdateStatus: (jobId: string, newStatusId: string) => Promise<void>;
    onViewJob: (job: EditingJob) => void;
    onViewClient: (clientId: string) => void;
    onNotifyClient: (jobId: string) => Promise<void>;
    onRequestRevision: (job: EditingJob) => Promise<void>;
}

export interface TableViewProps {
    jobs: EditingJob[];
    statuses: EditingStatus[];
    currentUser: StaffMember;
    onEdit: (job: EditingJob) => void;
    onDelete: (jobId: string) => Promise<void>;
    onViewClient: (clientId: string) => void;
    onNotifyClient: (jobId: string) => Promise<void>;
    onRequestRevision: (job: EditingJob) => Promise<void>;
}

export interface ReportsPageProps {
    invoices: Invoice[];
    expenses: Expense[];
    sessionTypes: SessionCategory[];
    bookings: Booking[];
    currentUser: StaffMember;
    navigateAndFilter: (page: string, filters: any) => void;
    clients: Client[];
    staff: StaffMember[];
    editingJobs: EditingJob[];
    editingStatuses: EditingStatus[];
}

export interface StaffPageProps {
    staff: StaffMember[];
    currentUser: StaffMember;
    onSaveStaff: (staffMember: Omit<StaffMember, 'id' | 'status' | 'lastLogin' | 'avatarUrl'> & { id?: string }) => Promise<void>;
    onDeleteStaff: (staffId: string) => Promise<void>;
}

export interface StaffFormProps {
    staffMember?: StaffMember | null;
    onSave: (staffMember: Omit<StaffMember, 'id' | 'status' | 'lastLogin' | 'avatarUrl'> & { id?: string }) => Promise<void>;
    onCancel: () => void;
}

export interface ExpensesPageProps {
    expenses: Expense[];
    bookings: Booking[];
    paymentAccounts: PaymentAccount[];
    currentUser: StaffMember;
    onSaveExpense: (expense: Omit<Expense, 'id'> & { id?: string }) => Promise<void>;
    onDeleteExpense: (expenseId: string) => Promise<void>;
    onBillExpense: (expenseId: string) => Promise<void>;
}

export interface ExpenseFormProps {
    expense?: Expense | null;
    bookings: Booking[];
    paymentAccounts: PaymentAccount[];
    onSave: (expense: Omit<Expense, 'id'> & { id?: string }) => Promise<void>;
    onCancel: () => void;
}

export interface SettingsPageProps {
    sessionCategories: SessionCategory[];
    editingStatuses: EditingStatus[];
    paymentAccounts: PaymentAccount[];
    appSettings: AppSettings;
    bookings: Booking[];
    editingJobs: EditingJob[];
    currentUser: StaffMember;
    onSaveCategory: (category: Omit<SessionCategory, 'packages'> & { id?: string }) => Promise<void>;
    onDeleteCategory: (categoryId: string) => Promise<void>;
    onSavePackage: (categoryId: string, pkg: Omit<SessionPackage, 'id'> & { id?: string }) => Promise<void>;
    onDeletePackage: (categoryId: string, packageId: string) => Promise<void>;
    onSaveStatus: (status: Omit<EditingStatus, 'id'> & {id?: string}) => Promise<void>;
    onDeleteStatus: (statusId: string) => Promise<void>;
    onSavePaymentAccount: (account: Omit<PaymentAccount, 'id'> & { id?: string }) => Promise<void>;
    onDeletePaymentAccount: (accountId: string) => Promise<void>;
    onSaveSettings: (settings: AppSettings) => Promise<void>;
}

export interface SessionCategoryFormProps {
    category?: SessionCategory | null;
    onSave: (category: Omit<SessionCategory, 'packages'> & { id?: string }) => Promise<void>;
    onCancel: () => void;
}

export interface SessionPackageFormProps {
    pkg?: SessionPackage | null;
    onSave: (pkg: Omit<SessionPackage, 'id'> & { id?: string }) => Promise<void>;
    onCancel: () => void;
}
