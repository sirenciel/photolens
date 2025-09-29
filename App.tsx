import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import BookingsPage from './components/bookings/BookingsPage';
import ClientsPage from './components/clients/ClientsPage';
import InvoicesPage from './components/invoices/InvoicesPage';
import ExpensesPage from './components/expenses/ExpensesPage';
import EditingWorkflowPage from './components/editing/EditingWorkflowPage';
import ReportsPage from './components/reports/ReportsPage';
import StaffPage from './components/staff/StaffPage';
import SettingsPage from './components/settings/SettingsPage';
import ClientProfilePage from './components/clients/ClientProfilePage';
import InvoicePreviewModal from './components/invoices/InvoicePreviewModal';
import InitialSetupWizard from './components/setup/InitialSetupWizard';
import { NotificationProvider } from './components/shared/NotificationProvider';
import AuthPage from './components/auth/AuthPage';
import { authService } from './services/authService';
import { AuthSession } from '@supabase/supabase-js';
// Mock visuals for charts/activities kept minimal locally; core entities pulled from Supabase.
// Removed heavy mock data usage.
import { dataManager, SaveInvoicePayload } from './services/dataManager';
import { checkDatabaseConnection, seedDatabase } from './services/seedData';
import { appSettingsService } from './services/dataService';
import { Client, Booking, StaffMember, Invoice, SessionCategory, SessionPackage, EditingJob, Permission, UserRole, EditingStatus, PhotoSelection, Activity, Payment, Expense, InvoiceItem, PaymentAccount, ClientFinancialStatus, AppSettings } from './types';
import { hasPermission, PAGE_PERMISSIONS } from './services/permissions';

// Fallback user so the app can render even if the staff table is empty
const DEFAULT_CURRENT_USER: StaffMember = {
  id: '00000000-0000-0000-0000-000000000000',
  name: 'Admin (local)',
  email: '',
  avatarUrl: '',
  role: UserRole.Owner,
  status: 'Active',
  lastLogin: new Date()
};

const createDefaultAppSettings = (): AppSettings => ({
    companyProfile: { name: '', address: '', email: '', logoUrl: '' },
    invoiceSettings: { prefix: 'INV', defaultDueDays: 14, footerNotes: '' },
    automatedReminders: { enabled: true, frequencyDays: 7 }
});

const deriveStaffFromSession = (session: AuthSession): StaffMember => {
    const metadata = session.user.user_metadata ?? {};
    const email = session.user.email ?? '';
    const roleValue = metadata.role;
    const resolvedRole = roleValue && Object.values(UserRole).includes(roleValue)
        ? roleValue as UserRole
        : UserRole.Owner;

    return {
        id: session.user.id,
        name: metadata.full_name || metadata.name || email || 'Pengguna PhotoLens',
        email,
        avatarUrl: metadata.avatar_url ?? '',
        role: resolvedRole,
        status: 'Active',
        lastLogin: new Date()
    };
};

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('Dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pageFilters, setPageFilters] = useState<Record<string, any>>({});
  
  // Data states - now managed by Supabase
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [sessionTypes, setSessionTypes] = useState<SessionCategory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  
  // Local-only UI datasets (charts/activity placeholders) until reports backend exists
  const [editingJobs, setEditingJobs] = useState<EditingJob[]>([]);
  const [editingStatuses, setEditingStatuses] = useState<EditingStatus[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number; }[]>([]);
  const [pandLData, setPandLData] = useState<{ month: string; revenue: number; expenses: number; }[]>([]);
  const [sessionRevenue, setSessionRevenue] = useState<{ name: string; value: number; id: string; }[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>(() => createDefaultAppSettings());
  
  // Current user - will be the first staff member from database
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);

  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  // Global Invoice Preview Modal State
  const [previewData, setPreviewData] = useState<{ invoice: Invoice | null; client: Client | null; type: 'invoice' | 'receipt' }>({ invoice: null, client: null, type: 'invoice' });

  const resetAppState = useCallback(() => {
    setClients([]);
    setBookings([]);
    setInvoices([]);
    setStaff([]);
    setSessionTypes([]);
    setExpenses([]);
    setPaymentAccounts([]);
    setEditingJobs([]);
    setEditingStatuses([]);
    setActivities([]);
    setRevenueData([]);
    setPandLData([]);
    setSessionRevenue([]);
    setAppSettings(createDefaultAppSettings());
    setPreviewData({ invoice: null, client: null, type: 'invoice' });
    setCurrentUser(null);
    setNeedsSetup(false);
    setShowSetupWizard(false);
    setSelectedClientId(null);
    setPageFilters({});
    setActivePage('Dashboard');
    setIsSidebarOpen(false);
    setDbConnected(false);
    setIsLoading(false);
  }, []);

  const loadAppData = useCallback(async (forceReload = false, activeSession?: AuthSession | null) => {
    const sessionToUse = activeSession ?? session;

    console.log('[App] loadAppData started', { forceReload, hasSession: !!sessionToUse });

    try {
      setIsLoading(true);

      const connected = await checkDatabaseConnection();
      setDbConnected(connected);

      if (!connected) {
        console.error('[App] Database connection failed – falling back to default user.');
        setCurrentUser(DEFAULT_CURRENT_USER);
        return;
      }

      console.log('[App] Seeding database if necessary');
      await seedDatabase();

      console.log('[App] Fetching core datasets from Supabase');
      const [
        staffData,
        clientsData,
        bookingsData,
        sessionTypesData,
        invoicesData,
        expensesData,
        paymentAccountsData
      ] = await Promise.all([
        dataManager.getStaff(forceReload),
        dataManager.getClients(forceReload),
        dataManager.getBookings(forceReload),
        dataManager.getSessionTypes(forceReload),
        dataManager.getInvoices(forceReload),
        dataManager.getExpenses(forceReload),
        dataManager.getPaymentAccounts(forceReload)
      ]);

      console.log('[App] Core datasets loaded', {
        staff: staffData.length,
        clients: clientsData.length,
        bookings: bookingsData.length,
        sessionTypes: sessionTypesData.length,
        invoices: invoicesData.length,
        expenses: expensesData.length,
        accounts: paymentAccountsData.length
      });

      let nextStaff = staffData;
      const sessionEmail = sessionToUse?.user?.email?.toLowerCase();
      let resolvedCurrentUser: StaffMember | null = null;

      if (sessionEmail) {
        resolvedCurrentUser = nextStaff.find(member => member.email.toLowerCase() === sessionEmail) ?? null;
      }

      if (!resolvedCurrentUser && nextStaff.length > 0) {
        resolvedCurrentUser = nextStaff[0];
      }

      if (!resolvedCurrentUser && sessionToUse) {
        const fallbackUser = deriveStaffFromSession(sessionToUse);
        const fallbackEmail = fallbackUser.email.toLowerCase();
        const alreadyExists = fallbackEmail
          ? nextStaff.some(member => member.email.toLowerCase() === fallbackEmail)
          : false;

        if (!alreadyExists) {
          nextStaff = fallbackEmail ? [fallbackUser, ...nextStaff] : nextStaff;
        }

        resolvedCurrentUser = fallbackUser;
      }

      if (!resolvedCurrentUser) {
        resolvedCurrentUser = DEFAULT_CURRENT_USER;
      }

      setStaff(nextStaff);
      setClients(clientsData);
      setBookings(bookingsData);
      setSessionTypes(sessionTypesData);
      setInvoices(invoicesData);
      setExpenses(expensesData);
      setPaymentAccounts(paymentAccountsData);

      const isEmpty = nextStaff.length === 0 &&
        clientsData.length === 0 &&
        sessionTypesData.length === 0;

      if (isEmpty) {
        setNeedsSetup(true);
        setShowSetupWizard(true);
      } else {
        setNeedsSetup(false);
        setShowSetupWizard(false);
      }

      setCurrentUser(resolvedCurrentUser);

      try {
        console.log('[App] Fetching optional datasets');
        const [settings, statuses, jobs] = await Promise.all([
          appSettingsService.get(),
          dataManager.getEditingStatuses(forceReload),
          dataManager.getEditingJobs(forceReload)
        ]);

        if (settings) {
          setAppSettings(settings);
        }

        setEditingStatuses(statuses);
        setEditingJobs(jobs);
        console.log('[App] Optional datasets fetched', { statuses: statuses.length, jobs: jobs.length, hasSettings: !!settings });
      } catch (optionalError) {
        console.warn('[App] Optional settings/statuses load failed:', optionalError);
      }
    } catch (error) {
      console.error('[App] Error initializing data:', error);
      setDbConnected(false);
    } finally {
      setIsLoading(false);
      console.log('[App] loadAppData finished');
    }
  }, [session]);

  const handleAuthSuccess = useCallback((authSession?: AuthSession | null) => {
    const resolvedSession = authSession ?? null;
    setSession(resolvedSession);

    if (!resolvedSession) {
      resetAppState();
      setIsCheckingAuth(false);
      return;
    }

    setIsCheckingAuth(false);
    void loadAppData(true, resolvedSession);
  }, [loadAppData, resetAppState]);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      try {
        const currentSession = await authService.getSession();

        if (!isMounted) {
          return;
        }

        setSession(currentSession);

        if (!currentSession) {
          resetAppState();
          setIsCheckingAuth(false);
          return;
        }

        setIsCheckingAuth(false);
        await loadAppData(true, currentSession);
      } catch (error) {
        console.error('Error checking authentication state:', error);
        resetAppState();
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    bootstrapAuth();

    const subscription = authService.onAuthStateChange(async (event, authSession) => {
      if (!isMounted) {
        return;
      }

      if (event === 'SIGNED_OUT') {
        resetAppState();
        setSession(null);
        setIsCheckingAuth(false);
        return;
      }

      setSession(authSession);
      setIsCheckingAuth(false);

      if (authSession && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        await loadAppData(true, authSession);
      }
    });

    return () => {
      isMounted = false;
      subscription.data.subscription.unsubscribe();
    };
  }, [loadAppData, resetAppState]);

  // Handler for completing setup wizard
  const handleSetupComplete = async () => {
    setShowSetupWizard(false);
    await loadAppData(true);
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Event handlers with Supabase integration
  const handleSaveClient = async (clientToSave: any) => {
    try {
      const savedClient = await dataManager.saveClient(clientToSave);
      // Get fresh client list from dataManager instead of manually updating state
      // This prevents double-adding since dataManager already handles the update
      const updatedClients = await dataManager.getClients(true);
      setClients(updatedClients);
      return savedClient;
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      await dataManager.deleteClient(clientId);
      setClients(prev => prev.filter(c => c.id !== clientId));
      const updatedBookings = await dataManager.getBookings(true);
      const updatedInvoices = await dataManager.getInvoices(true);
      setBookings(updatedBookings);
      setInvoices(updatedInvoices);
      setSelectedClientId(null);
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const handleSaveBooking = async (bookingToSave: any) => {
    try {
      const savedBooking = await dataManager.saveBooking(bookingToSave);
      // Use consistent pattern: refresh from dataManager instead of manual state update
      const updatedBookings = await dataManager.getBookings(true);
      const updatedClients = await dataManager.getClients(true);
      setBookings(updatedBookings);
      setClients(updatedClients);
      return savedBooking;
    } catch (error) {
      console.error('Error saving booking:', error);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      await dataManager.deleteBooking(bookingId);
      setBookings(prev => prev.filter(b => b.id !== bookingId));
      const updatedClients = await dataManager.getClients(true);
      setClients(updatedClients);
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const handleSaveStaff = async (staffToSave: any) => {
    try {
      const savedStaff = await dataManager.saveStaff(staffToSave);
      // Use consistent pattern: refresh from dataManager instead of manual state update
      const updatedStaff = await dataManager.getStaff(true);
      setStaff(updatedStaff);
      return savedStaff;
    } catch (error) {
      console.error('Error saving staff:', error);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    try {
      await dataManager.deleteStaff(staffId);
      setStaff(prev => prev.filter(s => s.id !== staffId));
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  const handleSaveExpense = async (expenseToSave: any) => {
    try {
      const savedExpense = await dataManager.saveExpense(expenseToSave);
      if (expenseToSave.id) {
        setExpenses(prev => prev.map(e => e.id === expenseToSave.id ? savedExpense : e));
      } else {
        setExpenses(prev => [savedExpense, ...prev]);
      }
      return savedExpense;
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await dataManager.deleteExpense(expenseId);
      setExpenses(prev => prev.filter(e => e.id !== expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleSaveSessionCategory = async (categoryToSave: any) => {
    try {
      const savedCategory = await dataManager.saveSessionCategory(categoryToSave);
      if (categoryToSave.id) {
        setSessionTypes(prev => prev.map(st => st.id === categoryToSave.id ? savedCategory : st));
      } else {
        setSessionTypes(prev => [...prev, savedCategory]);
      }
      return savedCategory;
    } catch (error) {
      console.error('Error saving session category:', error);
    }
  };

  const handleDeleteSessionCategory = async (categoryId: string) => {
    if (bookings.some(b => b.sessionCategoryId === categoryId)) {
      alert("Cannot delete category. It is currently used in one or more bookings.");
      return;
    }
    try {
      await dataManager.deleteSessionCategory(categoryId);
      setSessionTypes(prev => prev.filter(st => st.id !== categoryId));
    } catch (error) {
      console.error('Error deleting session category:', error);
    }
  };

  const handleSavePaymentAccount = async (accountToSave: any) => {
    try {
      const savedAccount = await dataManager.savePaymentAccount(accountToSave);
      if (accountToSave.id) {
        setPaymentAccounts(prev => prev.map(acc => acc.id === accountToSave.id ? savedAccount : acc));
      } else {
        setPaymentAccounts(prev => [...prev, savedAccount]);
      }
      return savedAccount;
    } catch (error) {
      console.error('Error saving payment account:', error);
    }
  };

  const handleDeletePaymentAccount = async (accountId: string) => {
    if (expenses.some(exp => exp.accountId === accountId)) {
      alert("Cannot delete an account that has expenses recorded from it.");
      return;
    }
    try {
      await dataManager.deletePaymentAccount(accountId);
      setPaymentAccounts(prev => prev.filter(acc => acc.id !== accountId));
    } catch (error) {
      console.error('Error deleting payment account:', error);
    }
  };

  const generateInvoiceNumber = () => {
    const prefix = appSettings.invoiceSettings?.prefix || 'INV';
    const uniqueSegment = Date.now().toString(36).toUpperCase();
    return `${prefix}-${uniqueSegment}`;
  };

  const handleSaveClientNotes = async (clientId: string, notes: string) => {
    try {
      const existingClient = clients.find(c => c.id === clientId);
      if (!existingClient) return;

      const savedClient = await dataManager.saveClient({
        id: clientId,
        name: existingClient.name,
        email: existingClient.email,
        phone: existingClient.phone,
        avatarUrl: existingClient.avatarUrl,
        notes,
        financialStatus: existingClient.financialStatus
      });

      setClients(prev => prev.map(client => client.id === clientId ? savedClient : client));
    } catch (error) {
      console.error('Error saving client notes:', error);
    }
  };

  const handleSaveInvoice = async (invoiceData: Omit<Invoice, 'id' | 'clientName' | 'clientAvatarUrl' | 'amount' | 'amountPaid' | 'payments' | 'lastReminderSent'> & { id?: string }) => {
    try {
      const existingInvoice = invoiceData.id ? invoices.find(inv => inv.id === invoiceData.id) : null;
      const invoiceNumber = existingInvoice?.invoiceNumber || generateInvoiceNumber();
      const issueDate = existingInvoice?.date || new Date();

      const subtotal = invoiceData.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
      const tax = 0; // Extend with tax rules when available
      const total = subtotal + tax;

      const payload: SaveInvoicePayload = {
        id: invoiceData.id,
        clientId: invoiceData.clientId,
        bookingId: invoiceData.bookingId ?? null,
        invoiceNumber,
        date: issueDate,
        dueDate: invoiceData.dueDate,
        status: invoiceData.status,
        subtotal,
        tax,
        total,
        notes: invoiceData.notes,
        items: invoiceData.items
      };

      const savedInvoice = await dataManager.saveInvoice(payload);

      setInvoices(prev => {
        const exists = prev.some(inv => inv.id === savedInvoice.id);
        return exists
          ? prev.map(inv => inv.id === savedInvoice.id ? savedInvoice : inv)
          : [savedInvoice, ...prev];
      });

      if (existingInvoice?.bookingId && existingInvoice.bookingId !== payload.bookingId) {
        setBookings(prev => prev.map(booking => booking.id === existingInvoice.bookingId ? { ...booking, invoiceId: null } : booking));
      }

      if (payload.bookingId) {
        setBookings(prev => prev.map(booking => booking.id === payload.bookingId ? { ...booking, invoiceId: savedInvoice.id } : booking));
      }

      return savedInvoice;
    } catch (error) {
      console.error('Error saving invoice:', error);
      throw error;
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      const existingInvoice = invoices.find(inv => inv.id === invoiceId);
      await dataManager.deleteInvoice(invoiceId);
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));

      if (existingInvoice?.bookingId) {
        setBookings(prev => prev.map(booking => booking.id === existingInvoice.bookingId ? { ...booking, invoiceId: null } : booking));
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const handleCreateInvoiceFromBooking = async (bookingId: string) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      const category = sessionTypes.find(cat => cat.id === booking.sessionCategoryId);
      const pkg = category?.packages.find(p => p.id === booking.sessionPackageId);

      const items = [{
        id: undefined,
        description: booking.sessionType,
        quantity: 1,
        price: pkg?.price || 0
      }];

      const issueDate = new Date();
      const dueDate = new Date(issueDate);
      dueDate.setDate(issueDate.getDate() + (appSettings.invoiceSettings.defaultDueDays || 14));

      const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
      const tax = 0;
      const total = subtotal + tax;

      const payload: SaveInvoicePayload = {
        clientId: booking.clientId,
        bookingId: booking.id,
        invoiceNumber: generateInvoiceNumber(),
        date: issueDate,
        dueDate,
        status: 'Sent',
        subtotal,
        tax,
        total,
        items
      };

      const savedInvoice = await dataManager.saveInvoice(payload);

      setInvoices(prev => [savedInvoice, ...prev.filter(inv => inv.id !== savedInvoice.id)]);
      setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, invoiceId: savedInvoice.id } : b));

      return savedInvoice;
    } catch (error) {
      console.error('Error creating invoice from booking:', error);
      throw error;
    }
  };

  const handleRecordPayment = async (invoiceId: string, paymentData: Omit<Payment, 'id' | 'recordedBy'>) => {
    try {
      const updatedInvoice = await dataManager.recordPayment(invoiceId, {
        amount: paymentData.amount,
        date: paymentData.date,
        accountId: paymentData.accountId,
        methodNotes: paymentData.methodNotes
      });

      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? updatedInvoice : inv));
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  };

  const handleSavePhotographerNotes = async (bookingId: string, notes: string) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      const savedBooking = await dataManager.saveBooking({
        id: booking.id,
        clientId: booking.clientId,
        sessionCategoryId: booking.sessionCategoryId,
        sessionPackageId: booking.sessionPackageId,
        photographerId: booking.photographerId,
        date: booking.date,
        status: booking.status,
        notes,
        location: booking.location
      });

      setBookings(prev => prev.map(b => b.id === bookingId ? savedBooking : b));
    } catch (error) {
      console.error('Error saving photographer notes:', error);
    }
  };

  const handleSaveEditingJob = async (jobData: Omit<EditingJob, 'id' | 'clientName' | 'editorName' | 'editorAvatarUrl' | 'uploadDate' | 'revisionCount' | 'revisionNotes'> & { id?: string }) => {
    try {
      const savedJob = await dataManager.saveEditingJob(jobData);
      setEditingJobs(prev => {
        const exists = prev.some(job => job.id === savedJob.id);
        return exists ? prev.map(job => job.id === savedJob.id ? savedJob : job) : [savedJob, ...prev];
      });
    } catch (error) {
      console.error('Error saving editing job:', error);
    }
  };

  const handleDeleteEditingJob = async (jobId: string) => {
    try {
      await dataManager.deleteEditingJob(jobId);
      setEditingJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Error deleting editing job:', error);
    }
  };

  const handleUpdateEditingJobStatus = async (jobId: string, newStatusId: string) => {
    try {
      const updatedJob = await dataManager.updateEditingJobStatus(jobId, newStatusId);
      setEditingJobs(prev => prev.map(job => job.id === jobId ? updatedJob : job));
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const handleRequestRevision = async (jobId: string, notes: string) => {
    try {
      const updatedJob = await dataManager.addRevisionNote(jobId, notes);
      setEditingJobs(prev => prev.map(job => job.id === jobId ? updatedJob : job));
    } catch (error) {
      console.error('Error adding revision note:', error);
    }
  };

  const handleNotifyClientForReview = async (jobId: string) => {
    try {
      const updatedJob = await dataManager.addRevisionNote(jobId, 'Client notified for review');
      setEditingJobs(prev => prev.map(job => job.id === jobId ? updatedJob : job));
    } catch (error) {
      console.error('Error notifying client for review:', error);
    }
  };

  const handleSaveEditingStatus = async (status: Omit<EditingStatus, 'id'> & { id?: string }) => {
    try {
      const saved = await dataManager.saveEditingStatus(status);
      setEditingStatuses(prev => {
        const exists = prev.some(s => s.id === saved.id);
        return exists ? prev.map(s => s.id === saved.id ? saved : s) : [...prev, saved];
      });
      return saved;
    } catch (error) {
      console.error('Error saving editing status:', error);
    }
  };

  const handleDeleteEditingStatus = async (statusId: string) => {
    try {
      await dataManager.deleteEditingStatus(statusId);
      setEditingStatuses(prev => prev.filter(status => status.id !== statusId));
    } catch (error) {
      console.error('Error deleting editing status:', error);
    }
  };

  const handleSaveSessionPackage = async (categoryId: string, pkg: Omit<SessionPackage, 'id'> & { id?: string }) => {
    try {
      await dataManager.saveSessionPackage(categoryId, pkg);
      const refreshed = await dataManager.getSessionTypes(true);
      setSessionTypes(refreshed);
    } catch (error) {
      console.error('Error saving session package:', error);
    }
  };

  const handleDeleteSessionPackage = async (_categoryId: string, packageId: string) => {
    try {
      await dataManager.deleteSessionPackage(packageId);
      const refreshed = await dataManager.getSessionTypes(true);
      setSessionTypes(refreshed);
    } catch (error) {
      console.error('Error deleting session package:', error);
    }
  };

  const updateBookingSelections = async (bookingId: string, transform: (selections: PhotoSelection[]) => PhotoSelection[]) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const updatedSelections = transform(booking.photoSelections || []);

    try {
      const savedBooking = await dataManager.saveBooking({
        id: booking.id,
        clientId: booking.clientId,
        sessionCategoryId: booking.sessionCategoryId,
        sessionPackageId: booking.sessionPackageId,
        photographerId: booking.photographerId,
        date: booking.date,
        status: booking.status,
        notes: booking.notes,
        location: booking.location,
        photoSelections: updatedSelections
      });

      setBookings(prev => prev.map(b => b.id === bookingId ? savedBooking : b));
    } catch (error) {
      console.error('Error updating photo selections:', error);
    }
  };

  const handleAddPhotoSelection = async (bookingId: string, selectionName: string) => {
    await updateBookingSelections(bookingId, selections => {
      if (selections.some(selection => selection.name === selectionName)) {
        return selections;
      }
      return [...selections, { name: selectionName, edited: false }];
    });
  };

  const handleRemovePhotoSelection = async (bookingId: string, selectionName: string) => {
    await updateBookingSelections(bookingId, selections => selections.filter(selection => selection.name !== selectionName));
  };

  const handleTogglePhotoSelectionEdited = async (bookingId: string, selectionName: string) => {
    await updateBookingSelections(bookingId, selections => selections.map(selection =>
      selection.name === selectionName ? { ...selection, edited: !selection.edited } : selection
    ));
  };

  const handleFinalizeSelections = async (bookingId: string) => {
    await updateBookingSelections(bookingId, selections => selections.map(selection => ({ ...selection, edited: true })));
  };

  const handleBillExpense = async (expenseId: string) => {
    try {
      const expense = expenses.find(exp => exp.id === expenseId);
      if (!expense) return;

      const updatedExpense = await dataManager.saveExpense({
        id: expense.id,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        accountId: expense.accountId,
        bookingId: expense.bookingId,
        isBilled: true
      });

      setExpenses(prev => prev.map(exp => exp.id === expenseId ? updatedExpense : exp));
    } catch (error) {
      console.error('Error billing expense:', error);
    }
  };
  const handleSaveSettings = async (settings: AppSettings) => {
    try {
      const saved = await appSettingsService.upsert(settings);
      setAppSettings(saved);
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  };

  // UI handlers
  const handlePreviewInvoice = (invoiceId: string, type: 'invoice' | 'receipt' = 'invoice') => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (invoice) {
      const client = clients.find(c => c.id === invoice.clientId);
      setPreviewData({ invoice, client: client || null, type });
    }
  };

  const handleCloseInvoicePreview = () => {
    setPreviewData({ invoice: null, client: null, type: 'invoice' });
  };

  const handleUserChange = (staffId: string) => {
    const newCurrentUser = staff.find(s => s.id === staffId);
    if (newCurrentUser) {
      setCurrentUser(newCurrentUser);
      setActivePage('Dashboard');
      setSelectedClientId(null);
    }
  };

  const handlePageChange = (page: string) => {
    setActivePage(page);
    setSelectedClientId(null);
    setPageFilters({});
  };

  const navigateAndFilter = (page: string, filters: any) => {
    setActivePage(page);
    setSelectedClientId(null);
    setPageFilters({ [page]: filters });
  };

  const handleViewClient = (clientId: string) => {
    const user = currentUser ?? DEFAULT_CURRENT_USER;
    if (hasPermission(user.role, Permission.VIEW_CLIENTS)) {
      setActivePage('Clients');
      setSelectedClientId(clientId);
    }
  };

  // Helper and memo that must be declared before any conditional returns to preserve hook order
  const calculateClientFinancialStatus = (client: Client, clientInvoices: Invoice[]): ClientFinancialStatus => {
    const hasOverdue = clientInvoices.some(inv => inv.status === 'Overdue');
    if (hasOverdue) return 'Overdue';
    if (client.totalSpent > 5000) return 'High Value';
    return 'Good Standing';
  };

  const clientsWithFinancialStatus = useMemo(() => {
    return clients.map(client => {
      const clientInvoices = invoices.filter(inv => inv.clientId === client.id);
      return {
        ...client,
        financialStatus: calculateClientFinancialStatus(client, clientInvoices)
      };
    });
  }, [clients, invoices]);

  const safeCurrentUser = currentUser ?? DEFAULT_CURRENT_USER;

  // Filter data based on user role
  const visibleBookings = hasPermission(safeCurrentUser.role, Permission.VIEW_BOOKINGS_ALL)
    ? bookings
    : bookings.filter(b => b.photographerId === safeCurrentUser.id);

  const visibleEditingJobs = hasPermission(safeCurrentUser.role, Permission.VIEW_EDITING_ALL)
    ? editingJobs
    : editingJobs.filter(m => m.editorId === safeCurrentUser.id);


  const renderContent = () => {
    const requiredPermission = PAGE_PERMISSIONS[activePage];
    if (requiredPermission && !hasPermission(safeCurrentUser.role, requiredPermission)) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <h2 className="mt-4 text-2xl font-bold text-white">Access Denied</h2>
          <p className="mt-2 text-slate-400">You do not have permission to view the {activePage} page.</p>
        </div>
      );
    }

    if (selectedClientId && hasPermission(safeCurrentUser.role, Permission.VIEW_CLIENTS)) {
      const client = clientsWithFinancialStatus.find(c => c.id === selectedClientId);
      if (client) {
        return <ClientProfilePage
          client={client}
          bookings={bookings.filter(b => b.clientId === selectedClientId)}
          invoices={invoices.filter(i => i.clientId === selectedClientId)}
          editingJobs={editingJobs.filter(j => j.clientId === selectedClientId)}
          editingStatuses={editingStatuses}
          expenses={expenses}
          activities={activities}
          currentUser={safeCurrentUser}
          onBack={() => setSelectedClientId(null)}
          onSaveClient={handleSaveClient}
          onDeleteClient={handleDeleteClient}
          onSaveNotes={handleSaveClientNotes}
          onAddPhotoSelection={handleAddPhotoSelection}
          onRemovePhotoSelection={handleRemovePhotoSelection}
          onTogglePhotoSelectionEdited={handleTogglePhotoSelectionEdited}
          onPreviewInvoice={handlePreviewInvoice}
          onFinalizeSelections={handleFinalizeSelections}
          navigateAndFilter={navigateAndFilter}
        />
      }
    }

    switch (activePage) {
      case 'Dashboard':
        return <Dashboard 
          bookings={bookings} 
          invoices={invoices} 
          editingJobs={editingJobs}
          activities={activities} 
          revenueData={revenueData} 
          currentUser={safeCurrentUser}
          setActivePage={handlePageChange}
          navigateAndFilter={navigateAndFilter}
        />;
      case 'Bookings':
        return <BookingsPage 
          bookings={visibleBookings}
          clients={clientsWithFinancialStatus}
          staff={staff}
          sessionTypes={sessionTypes}
          paymentAccounts={paymentAccounts}
          invoices={invoices}
          currentUser={safeCurrentUser}
          onSaveBooking={handleSaveBooking}
          onDeleteBooking={handleDeleteBooking}
          onSaveClient={handleSaveClient}
          onViewClient={handleViewClient}
          onPreviewInvoice={handlePreviewInvoice}
          onCreateInvoiceFromBooking={handleCreateInvoiceFromBooking}
          onRecordPayment={handleRecordPayment}
          onSavePhotographerNotes={handleSavePhotographerNotes}
          initialFilters={pageFilters['Bookings']}
        />;
      case 'Clients':
        return <ClientsPage 
          clients={clientsWithFinancialStatus} 
          currentUser={safeCurrentUser}
          onSaveClient={handleSaveClient} 
          onDeleteClient={handleDeleteClient}
          onViewProfile={setSelectedClientId}
        />;
      case 'Invoices':
        return <InvoicesPage 
          invoices={invoices} 
          bookings={bookings}
          clients={clients}
          sessionTypes={sessionTypes}
          paymentAccounts={paymentAccounts}
          currentUser={safeCurrentUser}
          onSaveInvoice={handleSaveInvoice}
          onDeleteInvoice={handleDeleteInvoice}
          onRecordPayment={handleRecordPayment}
          onViewClient={handleViewClient}
          onPreviewInvoice={handlePreviewInvoice}
          initialFilters={pageFilters['Invoices']}
        />;
      case 'Expenses':
        return <ExpensesPage
          expenses={expenses}
          bookings={bookings}
          paymentAccounts={paymentAccounts}
          currentUser={safeCurrentUser}
          onSaveExpense={handleSaveExpense}
          onDeleteExpense={handleDeleteExpense}
          onBillExpense={handleBillExpense}
        />;
      case 'Editing':
        return <EditingWorkflowPage 
          jobs={visibleEditingJobs} 
          bookings={bookings}
          staff={staff}
          clients={clients}
          editingStatuses={editingStatuses}
          currentUser={safeCurrentUser}
          onSaveJob={handleSaveEditingJob}
          onDeleteJob={handleDeleteEditingJob}
          onUpdateJobStatus={handleUpdateEditingJobStatus}
          onViewClient={handleViewClient}
          onNotifyClientForReview={handleNotifyClientForReview}
          onRequestRevision={handleRequestRevision}
          initialFilters={pageFilters['Editing']}
        />;
      case 'Reports':
        return <ReportsPage 
          invoices={invoices} 
          expenses={expenses} 
          sessionTypes={sessionTypes}
          bookings={bookings}
          clients={clients}
          staff={staff}
          editingJobs={editingJobs}
          editingStatuses={editingStatuses}
          currentUser={safeCurrentUser}
          navigateAndFilter={navigateAndFilter}
        />;
      case 'Staff':
        return <StaffPage 
          staff={staff}
          currentUser={safeCurrentUser}
          onSaveStaff={handleSaveStaff}
          onDeleteStaff={handleDeleteStaff}
        />;
      case 'Settings':
        return <SettingsPage 
          sessionCategories={sessionTypes}
          editingStatuses={editingStatuses}
          paymentAccounts={paymentAccounts}
          appSettings={appSettings}
          bookings={bookings}
          editingJobs={editingJobs}
          currentUser={safeCurrentUser}
          onSaveCategory={handleSaveSessionCategory}
          onDeleteCategory={handleDeleteSessionCategory}
          onSavePackage={handleSaveSessionPackage}
          onDeletePackage={handleDeleteSessionPackage}
          onSaveStatus={handleSaveEditingStatus}
          onDeleteStatus={handleDeleteEditingStatus}
          onSavePaymentAccount={handleSavePaymentAccount}
          onDeletePaymentAccount={handleDeletePaymentAccount}
          onSaveSettings={handleSaveSettings}
        />;
      default:
        return <Dashboard 
          bookings={bookings} 
          invoices={invoices} 
          editingJobs={editingJobs}
          activities={activities} 
          revenueData={revenueData} 
          currentUser={safeCurrentUser}
          setActivePage={handlePageChange}
          navigateAndFilter={navigateAndFilter}
        />;
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen bg-slate-900 text-slate-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-cyan-500 mb-4 mx-auto"></div>
          <h2 className="text-xl font-semibold mb-2">Menyiapkan PhotoLens...</h2>
          <p className="text-slate-400">Memeriksa sesi pengguna yang aktif.</p>
        </div>
      </div>
    );
  }

  return (
    <NotificationProvider>
      {!session ? (
        <AuthPage onAuthSuccess={handleAuthSuccess} />
      ) : showSetupWizard ? (
        <InitialSetupWizard onComplete={handleSetupComplete} />
      ) : isLoading ? (
        <div className="flex h-screen bg-slate-900 text-slate-100 items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-cyan-500 mb-4 mx-auto"></div>
            <h2 className="text-xl font-semibold mb-2">Memuat data PhotoLens...</h2>
            <p className="text-slate-400">
              {!dbConnected ? 'Menghubungkan ke database...' : 'Mengambil data terbaru dari Supabase.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
          <Sidebar
            activePage={activePage}
            setActivePage={handlePageChange}
            currentUser={safeCurrentUser}
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header
              currentUser={safeCurrentUser}
              allStaff={staff}
              onUserChange={handleUserChange}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              onSignOut={handleSignOut}
            />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900 p-4 sm:p-8">
              {renderContent()}
            </main>
          </div>
          {previewData.invoice && previewData.client && (
            <InvoicePreviewModal
              invoice={previewData.invoice}
              client={previewData.client}
              type={previewData.type}
              onClose={handleCloseInvoicePreview}
              paymentAccounts={paymentAccounts}
              appSettings={appSettings}
            />
          )}
        </div>
      )}
    </NotificationProvider>
  );
};

export default App;
