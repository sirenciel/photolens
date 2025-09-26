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
import { Client, Booking, StaffMember, Invoice, SessionCategory, SessionPackage, EditingJob, Permission, UserRole, EditingStatus, PhotoSelection, Activity, Payment, Expense, InvoiceItem, PaymentAccount, ClientFinancialStatus, AppSettings, RevenueData, PandLData, SessionRevenue } from './types';
import { hasPermission, PAGE_PERMISSIONS } from './services/permissions';
import * as api from './services/api';

const normalizeClient = (client: any): Client => ({
  ...client,
  joinDate: new Date(client.joinDate),
});

const normalizeStaff = (staffMember: any): StaffMember => ({
  ...staffMember,
  lastLogin: staffMember.lastLogin ? new Date(staffMember.lastLogin) : new Date(),
});

const normalizePayment = (payment: any): Payment => ({
  ...payment,
  date: new Date(payment.date),
});

const normalizeInvoice = (invoice: any): Invoice => ({
  ...invoice,
  dueDate: new Date(invoice.dueDate),
  issueDate: invoice.issueDate ? new Date(invoice.issueDate) : undefined,
  lastReminderSent: invoice.lastReminderSent ? new Date(invoice.lastReminderSent) : null,
  payments: (invoice.payments || []).map(normalizePayment),
});

const normalizeBooking = (booking: any): Booking => ({
  ...booking,
  date: new Date(booking.date),
  photoSelections: booking.photoSelections || [],
});

const normalizeEditingJob = (job: any): EditingJob => ({
  ...job,
  uploadDate: new Date(job.uploadDate),
  revisionNotes: (job.revisionNotes || []).map((note: any) => ({
    ...note,
    date: new Date(note.date),
  })),
});

const normalizeActivity = (activity: any): Activity => ({
  ...activity,
  timestamp: new Date(activity.timestamp),
});

const normalizeExpense = (expense: any): Expense => ({
  ...expense,
  date: new Date(expense.date),
});

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('Dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pageFilters, setPageFilters] = useState<Record<string, any>>({});

  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [editingJobs, setEditingJobs] = useState<EditingJob[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [sessionTypes, setSessionTypes] = useState<SessionCategory[]>([]);
  const [editingStatuses, setEditingStatuses] = useState<EditingStatus[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [pandLData, setPandLData] = useState<PandLData[]>([]);
  const [sessionRevenue, setSessionRevenue] = useState<SessionRevenue[]>([]);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [automationError, setAutomationError] = useState<string | null>(null);

  const [previewData, setPreviewData] = useState<{ invoice: Invoice | null; client: Client | null; type: 'invoice' | 'receipt' }>({ invoice: null, client: null, type: 'invoice' });

  const loadClients = useCallback(async () => {
    const response = await api.getClients();
    setClients(response.map(normalizeClient));
  }, []);

  const loadBookings = useCallback(async () => {
    const response = await api.getBookings();
    setBookings(response.map(normalizeBooking));
  }, []);

  const loadInvoices = useCallback(async () => {
    const response = await api.getInvoices();
    setInvoices(response.map(normalizeInvoice));
  }, []);

  const loadEditingJobs = useCallback(async () => {
    const response = await api.getEditingJobs();
    setEditingJobs(response.map(normalizeEditingJob));
  }, []);

  const loadStaff = useCallback(async () => {
    const response = await api.getStaff();
    const normalized = response.map(normalizeStaff);
    setStaff(normalized);
    setCurrentUser(prev => prev ?? (normalized.length > 0 ? normalized[0] : null));
  }, []);

  const loadSessionTypes = useCallback(async () => {
    const response = await api.getSessionCategories();
    setSessionTypes(response);
  }, []);

  const loadEditingStatuses = useCallback(async () => {
    const response = await api.getEditingStatuses();
    setEditingStatuses(response);
  }, []);

  const loadActivities = useCallback(async () => {
    const response = await api.getActivities();
    setActivities(response.map(normalizeActivity));
  }, []);

  const loadExpenses = useCallback(async () => {
    const response = await api.getExpenses();
    setExpenses(response.map(normalizeExpense));
  }, []);

  const loadFinancialReports = useCallback(async () => {
    const [revenueResponse, pandlResponse, sessionRevenueResponse] = await Promise.all([
      api.getRevenueData(),
      api.getPandLData(),
      api.getSessionRevenue(),
    ]);
    setRevenueData(revenueResponse);
    setPandLData(pandlResponse);
    setSessionRevenue(sessionRevenueResponse);
  }, []);

  const loadPaymentAccounts = useCallback(async () => {
    const response = await api.getPaymentAccounts();
    setPaymentAccounts(response);
  }, []);

  const loadSettings = useCallback(async () => {
    const response = await api.getAppSettings();
    setAppSettings(response);
  }, []);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setLoadingError(null);
    try {
      await Promise.all([
        loadClients(),
        loadBookings(),
        loadInvoices(),
        loadEditingJobs(),
        loadStaff(),
        loadSessionTypes(),
        loadEditingStatuses(),
        loadActivities(),
        loadExpenses(),
        loadFinancialReports(),
        loadPaymentAccounts(),
        loadSettings(),
      ]);
    } catch (error) {
      console.error('Failed to load initial data', error);
      setLoadingError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [
    loadClients,
    loadBookings,
    loadInvoices,
    loadEditingJobs,
    loadStaff,
    loadSessionTypes,
    loadEditingStatuses,
    loadActivities,
    loadExpenses,
    loadFinancialReports,
    loadPaymentAccounts,
    loadSettings,
  ]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (!appSettings?.automatedReminders?.enabled) {
      return;
    }

    let isCancelled = false;

    const runAutomations = async () => {
      try {
        setAutomationError(null);
        await api.triggerAutomations();
        if (isCancelled) {
          return;
        }
        await Promise.all([loadInvoices(), loadActivities()]);
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to trigger automations', error);
          setAutomationError(error instanceof Error ? error.message : 'Failed to trigger automations');
        }
      }
    };

    runAutomations();
    const intervalId = window.setInterval(runAutomations, 3600 * 1000);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [appSettings?.automatedReminders?.enabled, loadInvoices, loadActivities]);

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
        // Reset to dashboard page on user switch to avoid being on a page they don't have access to
        setActivePage('Dashboard');
        setSelectedClientId(null);
    }
  };
  
  const handlePageChange = (page: string) => {
    setActivePage(page);
    setSelectedClientId(null);
    setPageFilters({}); // Clear filters on direct navigation
  };

  const navigateAndFilter = (page: string, filters: any) => {
    setActivePage(page);
    setSelectedClientId(null); // Reset client view
    setPageFilters({ [page]: filters });
  };


  const updateClientStats = (clientId: string, updatedBookings: Booking[], updatedInvoices: Invoice[]) => {
    setClients(prevClients => prevClients.map(c => {
        if (c.id === clientId) {
            const clientBookings = updatedBookings.filter(b => b.clientId === clientId);
            const clientInvoices = updatedInvoices.filter(inv => inv.clientId === clientId);
            const totalSpent = clientInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
            return {
                ...c,
                totalBookings: clientBookings.length,
                totalSpent: totalSpent,
            };
        }
        return c;
    }));
  };

  const handleSaveClient = async (
    clientToSave: Omit<Client, 'id' | 'joinDate' | 'totalBookings' | 'totalSpent'> & { id?: string }
  ): Promise<Client | void> => {
    try {
      if (clientToSave.id) {
        const updated = await api.updateClient(clientToSave.id, clientToSave);
        const normalized = normalizeClient(updated);
        setClients(prev => prev.map(c => (c.id === normalized.id ? normalized : c)));
        return normalized;
      }

      const created = await api.createClient(clientToSave);
      const normalized = normalizeClient(created);
      setClients(prev => [normalized, ...prev]);
      return normalized;
    } catch (error) {
      console.error('Failed to save client', error);
      alert('Unable to save client. Please try again.');
    }
  };

  const handleSaveClientNotes = async (clientId: string, notes: string) => {
    try {
      const updated = await api.updateClientNotes(clientId, notes);
      const normalized = normalizeClient(updated);
      setClients(prev => prev.map(c => (c.id === normalized.id ? normalized : c)));
    } catch (error) {
      console.error('Failed to save client notes', error);
      alert('Unable to save client notes. Please try again.');
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      await api.deleteClient(clientId);
      await Promise.all([loadClients(), loadBookings(), loadInvoices(), loadEditingJobs()]);
      setSelectedClientId(null);
    } catch (error) {
      console.error('Failed to delete client', error);
      alert('Unable to delete client. Please try again.');
    }
  };

  const handleSaveBooking = async (
    bookingToSave: Omit<Booking, 'id' | 'clientName' | 'clientAvatarUrl' | 'photographer' | 'invoiceId' | 'sessionType' | 'photoSelections'> & { id?: string }
  ): Promise<Booking | void> => {
    try {
      const payload = {
        ...bookingToSave,
        date: bookingToSave.date instanceof Date ? bookingToSave.date.toISOString() : bookingToSave.date,
      };

      const saved = bookingToSave.id
        ? await api.updateBooking(bookingToSave.id, payload)
        : await api.createBooking(payload);

      const normalized = normalizeBooking(saved);
      await Promise.all([loadBookings(), loadClients()]);

      if (normalized.status === 'Completed') {
        await api.triggerEditingAutomation(normalized.id);
        await loadEditingJobs();
      }

      return normalized;
    } catch (error) {
      console.error('Failed to save booking', error);
      alert('Unable to save booking. Please try again.');
    }
  };

  const handleSavePhotographerNotes = async (bookingId: string, notes: string) => {
    try {
      await api.updatePhotographerNotes(bookingId, notes);
      await loadEditingJobs();
    } catch (error) {
      console.error('Failed to save photographer notes', error);
      alert('Unable to save photographer notes. Please try again.');
    }
  };


  const handleDeleteBooking = async (bookingId: string) => {
    try {
      await api.deleteBooking(bookingId);
      await Promise.all([loadBookings(), loadInvoices(), loadClients(), loadEditingJobs()]);
    } catch (error) {
      console.error('Failed to delete booking', error);
      alert('Unable to delete booking. Please try again.');
    }
  };

  const handleSaveStaff = async (
    staffToSave: Omit<StaffMember, 'id' | 'status' | 'lastLogin' | 'avatarUrl'> & { id?: string }
  ) => {
    try {
      const payload = {
        ...staffToSave,
      };
      if (staffToSave.id) {
        await api.updateStaff(staffToSave.id, payload);
      } else {
        await api.createStaff(payload);
      }
      await loadStaff();
    } catch (error) {
      console.error('Failed to save staff member', error);
      alert('Unable to save staff member. Please try again.');
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    try {
      await api.deleteStaff(staffId);
      await Promise.all([loadStaff(), loadBookings(), loadEditingJobs()]);
    } catch (error) {
      console.error('Failed to delete staff member', error);
      alert('Unable to delete staff member. Please try again.');
    }
  };

  const handleSaveInvoice = async (
    invoiceToSave: Omit<Invoice, 'id' | 'clientName' | 'clientAvatarUrl' | 'amount' | 'amountPaid' | 'payments' | 'lastReminderSent'> & { id?: string }
  ) => {
    try {
      const payload = {
        ...invoiceToSave,
        dueDate: invoiceToSave.dueDate instanceof Date ? invoiceToSave.dueDate.toISOString() : invoiceToSave.dueDate,
        issueDate:
          invoiceToSave.issueDate instanceof Date ? invoiceToSave.issueDate.toISOString() : invoiceToSave.issueDate,
      };

      if (invoiceToSave.id) {
        await api.updateInvoice(invoiceToSave.id, payload);
      } else {
        await api.createInvoice(payload);
      }

      await Promise.all([loadInvoices(), loadBookings(), loadClients()]);
    } catch (error) {
      console.error('Failed to save invoice', error);
      alert('Unable to save invoice. Please try again.');
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await api.deleteInvoice(invoiceId);
      await Promise.all([loadInvoices(), loadBookings(), loadClients()]);
    } catch (error) {
      console.error('Failed to delete invoice', error);
      alert('Unable to delete invoice. Please try again.');
    }
  };

  const handleCreateInvoiceFromBooking = async (bookingId: string): Promise<Invoice | void> => {
    try {
      const invoice = await api.createInvoiceFromBooking(bookingId);
      const normalized = normalizeInvoice(invoice);
      await Promise.all([loadInvoices(), loadBookings(), loadActivities()]);
      return normalized;
    } catch (error) {
      console.error('Failed to create invoice from booking', error);
      alert('Unable to create invoice. Please try again.');
    }
  };

  const handleRecordPayment = async (invoiceId: string, paymentData: Omit<Payment, 'id' | 'recordedBy'>) => {
    if (!currentUser) {
      return;
    }
    try {
      const payload = {
        ...paymentData,
        date: paymentData.date instanceof Date ? paymentData.date.toISOString() : paymentData.date,
        recordedBy: currentUser.name,
      };
      const updatedInvoice = await api.recordPayment(invoiceId, payload);
      const normalized = normalizeInvoice(updatedInvoice);
      setInvoices(prev => prev.map(inv => (inv.id === normalized.id ? normalized : inv)));
      await Promise.all([loadInvoices(), loadClients(), loadActivities()]);
    } catch (error) {
      console.error('Failed to record payment', error);
      alert('Unable to record payment. Please try again.');
    }
  };

    const handleSaveExpense = async (expenseToSave: Omit<Expense, 'id'> & { id?: string }) => {
        try {
            const payload = {
                ...expenseToSave,
                date: expenseToSave.date instanceof Date ? expenseToSave.date.toISOString() : expenseToSave.date,
            };
            if (expenseToSave.id) {
                await api.updateExpense(expenseToSave.id, payload);
            } else {
                await api.createExpense(payload);
            }
            await Promise.all([loadExpenses(), loadInvoices(), loadClients()]);
        } catch (error) {
            console.error('Failed to save expense', error);
            alert('Unable to save expense. Please try again.');
        }
    };

    const handleDeleteExpense = async (expenseId: string) => {
        try {
            await api.deleteExpense(expenseId);
            await Promise.all([loadExpenses(), loadInvoices(), loadClients()]);
        } catch (error) {
            console.error('Failed to delete expense', error);
            alert('Unable to delete expense. Please try again.');
        }
    };

    const handleBillExpense = async (expenseId: string) => {
        try {
            const result = await api.billExpense(expenseId);
            await Promise.all([loadExpenses(), loadInvoices(), loadClients(), loadActivities()]);
            if (result?.invoice) {
                alert(`Expense has been billed to invoice ${result.invoice.id}.`);
            }
        } catch (error) {
            console.error('Failed to bill expense', error);
            alert('Unable to bill expense. Please try again.');
        }
    };

  const handleSaveSessionCategory = async (categoryToSave: Omit<SessionCategory, 'packages'> & { id?: string }) => {
    try {
        if (categoryToSave.id) {
            await api.updateSessionCategory(categoryToSave.id, categoryToSave);
        } else {
            await api.createSessionCategory(categoryToSave);
        }
        await loadSessionTypes();
    } catch (error) {
        console.error('Failed to save session category', error);
        alert('Unable to save session category. Please try again.');
    }
  };

  const handleDeleteSessionCategory = async (categoryId: string) => {
    if (bookings.some(b => b.sessionCategoryId === categoryId)) {
        alert("Cannot delete category. It is currently used in one or more bookings.");
        return;
    }
    try {
        await api.deleteSessionCategory(categoryId);
        await loadSessionTypes();
    } catch (error) {
        console.error('Failed to delete session category', error);
        alert('Unable to delete session category. Please try again.');
    }
  };

  const handleSaveSessionPackage = async (categoryId: string, packageToSave: Omit<SessionPackage, 'id'> & { id?: string }) => {
    try {
        if (packageToSave.id) {
            await api.updateSessionPackage(categoryId, packageToSave.id, packageToSave);
        } else {
            await api.createSessionPackage(categoryId, packageToSave);
        }
        await loadSessionTypes();
    } catch (error) {
        console.error('Failed to save session package', error);
        alert('Unable to save session package. Please try again.');
    }
  };

  const handleDeleteSessionPackage = async (categoryId: string, packageId: string) => {
    if (bookings.some(b => b.sessionPackageId === packageId)) {
        alert("Cannot delete package. It is currently used in one or more bookings.");
        return;
    }
    try {
        await api.deleteSessionPackage(categoryId, packageId);
        await loadSessionTypes();
    } catch (error) {
        console.error('Failed to delete session package', error);
        alert('Unable to delete session package. Please try again.');
    }
  };
  
    const handleSaveEditingJob = async (jobToSave: Omit<EditingJob, 'id' | 'clientName' | 'editorName' | 'editorAvatarUrl' | 'uploadDate'> & { id?: string }) => {
        try {
            if (jobToSave.id) {
                await api.updateEditingJob(jobToSave.id, jobToSave);
            } else {
                await api.createEditingJob(jobToSave);
            }
            await loadEditingJobs();
        } catch (error) {
            console.error('Failed to save editing job', error);
            alert('Unable to save editing job. Please try again.');
        }
    };

    const handleDeleteEditingJob = async (jobId: string) => {
        try {
            await api.deleteEditingJob(jobId);
            await loadEditingJobs();
        } catch (error) {
            console.error('Failed to delete editing job', error);
            alert('Unable to delete editing job. Please try again.');
        }
    };

    const handleUpdateEditingJobStatus = async (jobId: string, newStatusId: string) => {
        try {
            await api.updateEditingJobStatus(jobId, newStatusId);
            await loadEditingJobs();
        } catch (error) {
            console.error('Failed to update editing job status', error);
            alert('Unable to update editing job status. Please try again.');
        }
    };

    const handleRequestRevision = async (jobId: string, notes: string) => {
        try {
            await api.requestRevision(jobId, notes);
            await Promise.all([loadEditingJobs(), loadActivities()]);
        } catch (error) {
            console.error('Failed to request revision', error);
            alert('Unable to request revision. Please try again.');
        }
    };

    const handleNotifyClientForReview = async (jobId: string) => {
        if (!appSettings || !currentUser) {
            alert('Unable to notify client without application settings or current user.');
            return;
        }

        const job = editingJobs.find(j => j.id === jobId);
        if (job) {
             const client = clients.find(c => c.id === job.clientId);
             const booking = bookings.find(b => b.id === job.bookingId);

             if (client && client.phone) {
                 let phoneNumber = client.phone.replace(/[^0-9]/g, '');
                 if (phoneNumber.startsWith('0')) {
                     phoneNumber = '62' + phoneNumber.substring(1);
                 } else if (!phoneNumber.startsWith('62')) {
                     phoneNumber = '62' + phoneNumber;
                 }

                 const sessionInfo = booking ? `dari sesi foto '${booking.sessionType}'` : '';
                 const reviewLink = `https://lensledger.app/review/${job.id}/${client.id}`;
                 const message = `Halo ${client.name}, foto Anda ${sessionInfo} sudah siap untuk direview. Silakan klik link berikut untuk melihat dan memberikan masukan:\n\n${reviewLink}\n\nTerima kasih,\n${appSettings.companyProfile.name}`;

                 const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                 window.open(whatsappUrl, '_blank');

                 const newActivity: Activity = {
                    id: `A${Date.now()}`,
                    user: currentUser.name,
                    userAvatarUrl: currentUser.avatarUrl,
                    action: 'notified client via WhatsApp for review on job',
                    target: `${job.clientName} (${job.bookingId})`,
                    timestamp: new Date(),
                };
                setActivities([newActivity, ...activities]);

             } else {
                 alert(`Could not send notification. Client ${client?.name || 'Unknown'} does not have a valid phone number registered.`);
             }
        }
    };

    const handleSaveEditingStatus = async (statusToSave: Omit<EditingStatus, 'id'> & {id?: string}) => {
        try {
            if (statusToSave.id) {
                await api.updateEditingStatus(statusToSave.id, statusToSave);
            } else {
                await api.createEditingStatus(statusToSave);
            }
            await loadEditingStatuses();
        } catch (error) {
            console.error('Failed to save editing status', error);
            alert('Unable to save editing status. Please try again.');
        }
    };

    const handleDeleteEditingStatus = async (statusId: string) => {
        if (editingJobs.some(job => job.statusId === statusId)) {
            alert("Cannot delete a status that is currently in use by an editing job.");
            return;
        }
        try {
            await api.deleteEditingStatus(statusId);
            await loadEditingStatuses();
        } catch (error) {
            console.error('Failed to delete editing status', error);
            alert('Unable to delete editing status. Please try again.');
        }
    };

    const handleAddPhotoSelection = async (bookingId: string, selectionName: string) => {
        try {
            await api.addPhotoSelection(bookingId, selectionName);
            await loadBookings();
        } catch (error) {
            console.error('Failed to add photo selection', error);
            alert('Unable to add photo selection. Please try again.');
        }
    };
    
    const handleRemovePhotoSelection = async (bookingId: string, selectionNameToRemove: string) => {
        try {
            await api.removePhotoSelection(bookingId, selectionNameToRemove);
            await loadBookings();
        } catch (error) {
            console.error('Failed to remove photo selection', error);
            alert('Unable to remove photo selection. Please try again.');
        }
    };

    const handleTogglePhotoSelectionEdited = async (bookingId: string, selectionName: string) => {
        try {
            await api.togglePhotoSelection(bookingId, selectionName);
            await loadBookings();
        } catch (error) {
            console.error('Failed to update photo selection', error);
            alert('Unable to update photo selection. Please try again.');
        }
    };

    const handleFinalizeSelections = async (bookingId: string) => {
        try {
            await api.finalizeSelections(bookingId);
            await Promise.all([loadBookings(), loadEditingJobs(), loadActivities()]);
            alert('Selections have been finalized and editing workflow updated.');
        } catch (error) {
            console.error('Failed to finalize selections', error);
            alert('Unable to finalize selections. Please try again.');
        }
    };

    const handleSavePaymentAccount = async (accountToSave: Omit<PaymentAccount, 'id'> & { id?: string }) => {
        try {
            if (accountToSave.id) {
                await api.updatePaymentAccount(accountToSave.id, accountToSave);
            } else {
                await api.createPaymentAccount(accountToSave);
            }
            await loadPaymentAccounts();
        } catch (error) {
            console.error('Failed to save payment account', error);
            alert('Unable to save payment account. Please try again.');
        }
    };

    const handleDeletePaymentAccount = async (accountId: string) => {
        if (invoices.some(inv => inv.payments?.some(p => p.accountId === accountId))) {
            alert("Cannot delete an account that has payments recorded to it in invoices.");
            return;
        }
        if (expenses.some(exp => exp.accountId === accountId)) {
            alert("Cannot delete an account that has expenses recorded from it.");
            return;
        }
        try {
            await api.deletePaymentAccount(accountId);
            await loadPaymentAccounts();
        } catch (error) {
            console.error('Failed to delete payment account', error);
            alert('Unable to delete payment account. Please try again.');
        }
    };

    const handleSaveSettings = async (settings: AppSettings) => {
        try {
            await api.updateAppSettings(settings);
            await loadSettings();
        } catch (error) {
            console.error('Failed to save application settings', error);
            alert('Unable to save application settings. Please try again.');
        }
    };


    const handleViewClient = (clientId: string) => {
        if (hasPermission(currentUser.role, Permission.VIEW_CLIENTS)) {
            setActivePage('Clients');
            setSelectedClientId(clientId);
        }
    }
    
    // Filter data based on user role
    const visibleBookings = useMemo(() => {
        if (!currentUser) {
            return [] as Booking[];
        }
        return hasPermission(currentUser.role, Permission.VIEW_BOOKINGS_ALL)
            ? bookings
            : bookings.filter(b => b.photographerId === currentUser.id);
    }, [currentUser, bookings]);

    const visibleEditingJobs = useMemo(() => {
        if (!currentUser) {
            return [] as EditingJob[];
        }
        return hasPermission(currentUser.role, Permission.VIEW_EDITING_ALL)
            ? editingJobs
            : editingJobs.filter(m => m.editorId === currentUser.id);
    }, [currentUser, editingJobs]);

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

    const renderContent = () => {
        if (!currentUser || !appSettings) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400"></div>
                    <p className="mt-4 text-slate-300">Preparing your workspace...</p>
                </div>
            );
        }

        const requiredPermission = PAGE_PERMISSIONS[activePage];
        if (requiredPermission && !hasPermission(currentUser.role, requiredPermission)) {
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

    if (selectedClientId && hasPermission(currentUser.role, Permission.VIEW_CLIENTS)) {
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
          currentUser={currentUser}
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
          currentUser={currentUser}
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
          currentUser={currentUser}
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
          currentUser={currentUser}
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
          currentUser={currentUser}
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
            currentUser={currentUser}
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
            currentUser={currentUser}
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
          currentUser={currentUser}
          navigateAndFilter={navigateAndFilter}
        />;
      case 'Staff':
        return <StaffPage 
          staff={staff}
          currentUser={currentUser}
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
            currentUser={currentUser}
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
          currentUser={currentUser}
          setActivePage={handlePageChange}
          navigateAndFilter={navigateAndFilter}
        />;
    }
  };

  if (!currentUser) {
    return (
      <div className="flex h-screen bg-slate-900 text-slate-100 items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="text-slate-300">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
      <Sidebar
        activePage={activePage}
        setActivePage={handlePageChange}
        currentUser={currentUser}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          currentUser={currentUser} 
          allStaff={staff} 
          onUserChange={handleUserChange}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900 p-4 sm:p-8 space-y-4">
          {automationError && (
            <div className="bg-red-500/20 border border-red-500/40 text-red-200 px-4 py-3 rounded-lg">
              Failed to run automated reminders: {automationError}
            </div>
          )}
          {loadingError ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <p className="text-lg text-slate-200">{loadingError}</p>
              <button
                onClick={loadInitialData}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md transition"
              >
                Retry Loading
              </button>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
              <p className="mt-4 text-slate-300">Loading data from server...</p>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>
       {previewData.invoice && previewData.client && appSettings && (
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
  );
};

export default App;