import React, { useState, useMemo, useEffect } from 'react';
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
import { mockBookings, mockClients, mockInvoices, mockEditingJobs, mockStaff, mockActivities, mockRevenueData, mockPandLData, mockSessionRevenue, mockSessionTypes, mockEditingStatuses, mockExpenses, mockPaymentAccounts, mockSettings } from './services/mockData';
import { Client, Booking, StaffMember, Invoice, SessionCategory, SessionPackage, EditingJob, Permission, UserRole, EditingStatus, PhotoSelection, Activity, Payment, Expense, InvoiceItem, PaymentAccount, ClientFinancialStatus, AppSettings } from './types';
import { hasPermission, PAGE_PERMISSIONS } from './services/permissions';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('Dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pageFilters, setPageFilters] = useState<Record<string, any>>({});
  
  // Simulate logged-in user state
  const [currentUser, setCurrentUser] = useState<StaffMember>(mockStaff[0]); // Default to Owner

  // Centralized state management
  const [clients, setClients] = useState(mockClients);
  const [bookings, setBookings] = useState(mockBookings);
  const [invoices, setInvoices] = useState(mockInvoices);
  const [editingJobs, setEditingJobs] = useState(mockEditingJobs);
  const [staff, setStaff] = useState(mockStaff);
  const [sessionTypes, setSessionTypes] = useState(mockSessionTypes);
  const [editingStatuses, setEditingStatuses] = useState(mockEditingStatuses);
  const [activities, setActivities] = useState(mockActivities);
  const [expenses, setExpenses] = useState(mockExpenses);
  const [revenueData, setRevenueData] = useState(mockRevenueData);
  const [pandLData, setPandLData] = useState(mockPandLData);
  const [sessionRevenue, setSessionRevenue] = useState(mockSessionRevenue);
  const [paymentAccounts, setPaymentAccounts] = useState(mockPaymentAccounts);
  const [appSettings, setAppSettings] = useState<AppSettings>(mockSettings);

  // Global Invoice Preview Modal State
  const [previewData, setPreviewData] = useState<{ invoice: Invoice | null; client: Client | null; type: 'invoice' | 'receipt' }>({ invoice: null, client: null, type: 'invoice' });

    // Automated Invoice Reminder Logic
    useEffect(() => {
        if (!appSettings.automatedReminders.enabled) return;

        const checkAndSendReminders = () => {
            const today = new Date();
            const remindersToSend: { invoice: Invoice, client: Client }[] = [];
            const updatedInvoices = [...invoices];
            
            invoices.forEach(inv => {
                if (inv.status === 'Overdue') {
                    const shouldSend = !inv.lastReminderSent || 
                        (today.getTime() - new Date(inv.lastReminderSent).getTime()) / (1000 * 3600 * 24) >= appSettings.automatedReminders.frequencyDays;
                    
                    if (shouldSend) {
                        const client = clients.find(c => c.id === inv.clientId);
                        if (client) {
                            remindersToSend.push({ invoice: inv, client });
                            // Update the invoice in our temporary array
                            const invIndex = updatedInvoices.findIndex(i => i.id === inv.id);
                            if(invIndex !== -1) {
                                updatedInvoices[invIndex] = { ...updatedInvoices[invIndex], lastReminderSent: today };
                            }
                        }
                    }
                }
            });

            if (remindersToSend.length > 0) {
                const newActivities = remindersToSend.map(({ invoice, client }) => ({
                    id: `A${Date.now()}-${invoice.id}`,
                    user: 'System',
                    userAvatarUrl: 'https://picsum.photos/seed/system/100/100',
                    action: 'sent an automated invoice reminder for',
                    target: `${invoice.id} to ${client.name}`,
                    timestamp: today,
                }));
                
                console.log(`Sending ${remindersToSend.length} automated reminders...`);

                setActivities(prev => [...newActivities, ...prev]);
                setInvoices(updatedInvoices);
            }
        };

        // In a real app, this might be a background task or triggered by a server event.
        // Here, we'll run it once on load and then every hour for simulation.
        checkAndSendReminders();
        const intervalId = setInterval(checkAndSendReminders, 3600 * 1000); // Check every hour
        
        return () => clearInterval(intervalId);
    }, [appSettings, invoices, clients]);

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

  const handleSaveClient = (clientToSave: Omit<Client, 'id' | 'joinDate' | 'totalBookings' | 'totalSpent'> & { id?: string }): Client | void => {
    if (clientToSave.id) {
      // Update existing client
      setClients(clients.map(c => c.id === clientToSave.id ? { ...c, ...clientToSave } : c));
    } else {
      // Add new client
      const newClient: Client = {
        ...clientToSave,
        id: `C${String(clients.length + 1).padStart(3, '0')}`,
        joinDate: new Date(),
        totalBookings: 0,
        totalSpent: 0,
        avatarUrl: `https://picsum.photos/seed/new-client-${clients.length + 1}/100/100`
      };
      setClients([newClient, ...clients]);
      return newClient;
    }
  };
  
  const handleSaveClientNotes = (clientId: string, notes: string) => {
    setClients(clients.map(c => c.id === clientId ? { ...c, notes } : c));
  };

  const handleDeleteClient = (clientId: string) => {
    const updatedBookings = bookings.filter(b => b.clientId !== clientId);
    const updatedInvoices = invoices.filter(i => i.clientId !== clientId);
    const updatedEditingJobs = editingJobs.filter(job => !bookings.some(b => b.clientId === clientId && b.id === job.bookingId));
    
    setBookings(updatedBookings);
    setInvoices(updatedInvoices);
    setEditingJobs(updatedEditingJobs);
    setClients(clients.filter(c => c.id !== clientId));

    setSelectedClientId(null); // Go back to the list view after deleting
  };

  const handleSaveBooking = (bookingToSave: Omit<Booking, 'id' | 'clientName' | 'clientAvatarUrl' | 'photographer' | 'invoiceId' | 'sessionType' | 'photoSelections'> & { id?: string }): Booking | void => {
    const getSessionTypeName = () => {
        const category = sessionTypes.find(st => st.id === bookingToSave.sessionCategoryId);
        const pkg = category?.packages.find(p => p.id === bookingToSave.sessionPackageId);
        return pkg ? `${category?.name} - ${pkg.name}` : 'Unknown Session';
    }

    let savedBooking: Booking | undefined;
    let updatedBookings: Booking[];
    const wasCompleted = bookingToSave.id ? bookings.find(b => b.id === bookingToSave.id)?.status === 'Completed' : false;

    if (bookingToSave.id) {
        // Update existing booking
        updatedBookings = bookings.map(b => {
            if (b.id === bookingToSave.id) {
                const client = clients.find(c => c.id === bookingToSave.clientId);
                const photographer = staff.find(s => s.id === bookingToSave.photographerId);
                const updatedBooking = { 
                    ...b, 
                    ...bookingToSave,
                    clientName: client?.name || 'N/A',
                    clientAvatarUrl: client?.avatarUrl || '',
                    photographer: photographer?.name || 'N/A',
                    sessionType: getSessionTypeName(),
                };
                 savedBooking = updatedBooking;
                 return updatedBooking;
            }
            return b;
        });
        setBookings(updatedBookings);
    } else {
        // Add new booking
        const client = clients.find(c => c.id === bookingToSave.clientId);
        const photographer = staff.find(s => s.id === bookingToSave.photographerId);
        const newBooking: Booking = {
            ...bookingToSave,
            id: `B${String(bookings.length + 1).padStart(3, '0')}`,
            clientName: client?.name || 'N/A',
            clientAvatarUrl: client?.avatarUrl || `https://picsum.photos/seed/${bookingToSave.clientId}/100/100`,
            photographer: photographer?.name || 'N/A',
            invoiceId: '-',
            sessionType: getSessionTypeName(),
            photoSelections: [],
        };
        updatedBookings = [newBooking, ...bookings];
        setBookings(updatedBookings);
        savedBooking = newBooking;
    }
        
    // INTEGRATION: Auto-create editing job when booking is completed
    if (savedBooking && savedBooking.status === 'Completed' && !wasCompleted) {
        const jobExists = editingJobs.some(job => job.bookingId === savedBooking!.id);
        if (!jobExists) {
            const firstStatus = editingStatuses.find(s => s.name === 'Awaiting Selection') || editingStatuses[0];
            if(firstStatus) {
                const newJob: Omit<EditingJob, 'id' | 'editorName' | 'editorAvatarUrl' | 'uploadDate'> = {
                    bookingId: savedBooking.id,
                    clientId: savedBooking.clientId,
                    clientName: savedBooking.clientName,
                    editorId: null,
                    statusId: firstStatus.id,
                };
                handleSaveEditingJob(newJob);

                const newActivity: Activity = {
                    id: `A${Date.now()}`,
                    user: 'System',
                    userAvatarUrl: 'https://picsum.photos/seed/system/100/100',
                    action: 'created editing job for',
                    target: `${savedBooking.clientName} (${savedBooking.id})`,
                    timestamp: new Date(),
                };
                setActivities([newActivity, ...activities]);
            }
        }
    }


    // Update client stats
    if (savedBooking) {
        updateClientStats(savedBooking.clientId, updatedBookings, invoices);
        return savedBooking;
    }
  };

  const handleSavePhotographerNotes = (bookingId: string, notes: string) => {
    setEditingJobs(prevJobs => {
        const jobsForBooking = prevJobs.filter(j => j.bookingId === bookingId).sort((a,b) => b.uploadDate.getTime() - a.uploadDate.getTime());
        if (jobsForBooking.length === 0) {
            console.warn(`No editing job found for booking ${bookingId} to save photographer notes.`);
            return prevJobs;
        }
        const jobToUpdateId = jobsForBooking[0].id;

        return prevJobs.map(job => 
            job.id === jobToUpdateId ? { ...job, photographerNotes: notes } : job
        );
    });
};


  const handleDeleteBooking = (bookingId: string) => {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      const { clientId } = booking;
      let updatedInvoices = invoices;
      
      // Also unlink from any invoice
      if (booking.invoiceId !== '-') {
          updatedInvoices = invoices.filter(i => i.id !== booking.invoiceId);
          setInvoices(updatedInvoices);
      }
      const updatedBookings = bookings.filter(b => b.id !== bookingId);
      setBookings(updatedBookings);
      
      // Update client stats after booking deletion
      updateClientStats(clientId, updatedBookings, updatedInvoices);
  };

  const handleSaveStaff = (staffToSave: Omit<StaffMember, 'id' | 'status' | 'lastLogin' | 'avatarUrl'> & { id?: string }) => {
    if (staffToSave.id) {
        // Update existing staff
        setStaff(staff.map(s => s.id === staffToSave.id ? { ...s, ...staffToSave } : s));
    } else {
        // Add new staff
        const newStaff: StaffMember = {
            ...staffToSave,
            id: `S${String(staff.length + 1).padStart(3, '0')}`,
            status: 'Invited',
            lastLogin: new Date(), // This would be null in a real app until first login
            avatarUrl: `https://picsum.photos/seed/new-staff-${staff.length + 1}/100/100`,
        };
        setStaff([newStaff, ...staff]);
    }
  };

  const handleDeleteStaff = (staffId: string) => {
      // Un-assign from any bookings
      setBookings(prev => prev.map(b => b.photographerId === staffId ? { ...b, photographerId: '', photographer: 'Unassigned' } : b));
      // Un-assign from any editing jobs
      setEditingJobs(prev => prev.map(job => job.editorId === staffId ? { ...job, editorId: null, editorName: 'Unassigned', editorAvatarUrl: 'https://picsum.photos/seed/user-unassigned/100/100' } : job));
      
      setStaff(staff.filter(s => s.id !== staffId));
  };

  const handleSaveInvoice = (invoiceToSave: Omit<Invoice, 'id' | 'clientName' | 'clientAvatarUrl' | 'amount' | 'amountPaid' | 'payments' | 'lastReminderSent'> & { id?: string }) => {
    const client = clients.find(c => c.id === invoiceToSave.clientId);
    if (!client) return;
    
    // Calculate total amount from items
    const totalAmount = invoiceToSave.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    let updatedInvoices: Invoice[];

    if (invoiceToSave.id) {
        // Update existing invoice
        const existingInvoice = invoices.find(i => i.id === invoiceToSave.id);
        updatedInvoices = invoices.map(i => i.id === invoiceToSave.id ? { 
            ...i, 
            ...invoiceToSave,
            amount: totalAmount,
            clientName: client.name,
            clientAvatarUrl: client.avatarUrl,
            amountPaid: existingInvoice?.amountPaid || 0,
            payments: existingInvoice?.payments || [],
            lastReminderSent: existingInvoice?.lastReminderSent,
        } : i);
        setInvoices(updatedInvoices);
    } else {
        // Add new invoice
        const newInvoiceId = `${appSettings.invoiceSettings.prefix}${String(invoices.length + 1).padStart(3, '0')}`;
        const newInvoice: Invoice = {
            ...invoiceToSave,
            id: newInvoiceId,
            amount: totalAmount,
            clientName: client.name,
            clientAvatarUrl: client.avatarUrl,
            amountPaid: 0,
            payments: [],
            lastReminderSent: null,
        };
        updatedInvoices = [newInvoice, ...invoices];
        setInvoices(updatedInvoices);
        // Link invoice to booking
        setBookings(bookings.map(b => b.id === invoiceToSave.bookingId ? { ...b, invoiceId: newInvoiceId } : b));
    }
     // Update client stats
     updateClientStats(invoiceToSave.clientId, bookings, updatedInvoices);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    const invoiceToDelete = invoices.find(i => i.id === invoiceId);
    if (!invoiceToDelete) return;

    // Unlink invoice from booking
    setBookings(bookings.map(b => b.id === invoiceToDelete.bookingId ? { ...b, invoiceId: '-' } : b));
    // Delete invoice
    const updatedInvoices = invoices.filter(i => i.id !== invoiceId);
    setInvoices(updatedInvoices);
    
    // Update client stats
    updateClientStats(invoiceToDelete.clientId, bookings, updatedInvoices);
  };

  const handleCreateInvoiceFromBooking = (bookingId: string): Invoice | void => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking || booking.invoiceId !== '-') {
        alert("This booking is not eligible for invoice creation.");
        return;
    }

    const client = clients.find(c => c.id === booking.clientId);
    if (!client) {
        alert("Could not find the client for this booking.");
        return;
    }

    let packagePrice = 0;
    const category = sessionTypes.find(st => st.id === booking.sessionCategoryId);
    const pkg = category?.packages.find(p => p.id === booking.sessionPackageId);
    if (pkg) {
        packagePrice = pkg.price;
    }
    
    const newItem: InvoiceItem = {
        id: `item-${Date.now()}`,
        description: booking.sessionType,
        quantity: 1,
        price: packagePrice
    };

    const newInvoiceId = `${appSettings.invoiceSettings.prefix}${String(invoices.length + 1).padStart(3, '0')}`;
    const issueDate = new Date();
    const dueDate = new Date(issueDate);
    dueDate.setDate(issueDate.getDate() + appSettings.invoiceSettings.defaultDueDays);

    const newInvoice: Invoice = {
        id: newInvoiceId,
        bookingId: booking.id,
        clientId: booking.clientId,
        clientName: client.name,
        clientAvatarUrl: client.avatarUrl,
        items: [newItem],
        amount: packagePrice,
        amountPaid: 0,
        issueDate: issueDate,
        dueDate: dueDate,
        status: 'Sent',
        payments: [],
        lastReminderSent: null,
    };

    const updatedInvoices = [newInvoice, ...invoices];
    setInvoices(updatedInvoices);
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, invoiceId: newInvoiceId } : b));
    
    const newActivity: Activity = {
        id: `A${Date.now()}`,
        user: currentUser.name,
        userAvatarUrl: currentUser.avatarUrl,
        action: 'created invoice',
        target: `${newInvoiceId} for ${client.name}`,
        timestamp: new Date(),
    };
    setActivities([newActivity, ...activities]);

    // Update client stats
    updateClientStats(newInvoice.clientId, bookings, updatedInvoices);

    return newInvoice;
  };

  const handleRecordPayment = (invoiceId: string, paymentData: Omit<Payment, 'id' | 'recordedBy'>) => {
    const invoiceToUpdate = invoices.find(inv => inv.id === invoiceId);
    if (!invoiceToUpdate) return;
    
    const newPayment: Payment = {
        ...paymentData,
        id: `PAY${Date.now()}`,
        recordedBy: currentUser.name,
    };

    const updatedInvoices = invoices.map(inv => {
        if (inv.id === invoiceId) {
            const updatedPayments = [...(inv.payments || []), newPayment];
            const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
            const newStatus = totalPaid >= inv.amount ? 'Paid' : inv.status;

            return {
                ...inv,
                payments: updatedPayments,
                amountPaid: totalPaid,
                status: newStatus,
            };
        }
        return inv;
    });

    setInvoices(updatedInvoices);

    const newActivity: Activity = {
        id: `A${Date.now()}`,
        user: currentUser.name,
        userAvatarUrl: currentUser.avatarUrl,
        action: 'recorded a payment for',
        target: `invoice ${invoiceId} for ${invoiceToUpdate.clientName}`,
        timestamp: new Date(),
    };
    setActivities([newActivity, ...activities]);

    // Update client stats
    updateClientStats(invoiceToUpdate.clientId, bookings, updatedInvoices);
  };

    const handleSaveExpense = (expenseToSave: Omit<Expense, 'id'> & { id?: string }) => {
        if (expenseToSave.id) {
            setExpenses(expenses.map(e => e.id === expenseToSave.id ? { ...e, ...expenseToSave } : e));
        } else {
            const newExpense: Expense = {
                ...expenseToSave,
                id: `E${Date.now()}`,
            };
            setExpenses([newExpense, ...expenses]);
        }
    };

    const handleDeleteExpense = (expenseId: string) => {
        setExpenses(expenses.filter(e => e.id !== expenseId));
    };

    const handleBillExpense = (expenseId: string) => {
        const expense = expenses.find(e => e.id === expenseId);
        if (!expense || expense.isBilled) {
            alert("This expense cannot be billed or has already been billed.");
            return;
        }
    
        if (!expense.bookingId) {
            alert("This expense is not associated with any booking.");
            return;
        }
    
        const booking = bookings.find(b => b.id === expense.bookingId);
        if (!booking) {
            alert("Could not find the booking associated with this expense.");
            return;
        }
    
        if (booking.invoiceId === '-') {
            alert(`Booking ${booking.id} does not have an invoice yet. Please create an invoice for this booking first.`);
            return;
        }
    
        const invoice = invoices.find(i => i.id === booking.invoiceId);
        if (!invoice) {
            alert(`Could not find the invoice ${booking.invoiceId}.`);
            return;
        }
        
        if (invoice.items.some(item => item.id === `exp-${expense.id}`)) {
            alert("This expense item has already been added to the invoice.");
            return;
        }
    
        const newInvoiceItem: InvoiceItem = {
            id: `exp-${expense.id}`,
            description: `Reimbursable Expense: ${expense.description}`,
            quantity: 1,
            price: expense.amount
        };
    
        const updatedInvoices = invoices.map(inv => {
            if (inv.id === invoice.id) {
                const updatedItems = [...inv.items, newInvoiceItem];
                const newTotalAmount = updatedItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
                return {
                    ...inv,
                    items: updatedItems,
                    amount: newTotalAmount
                };
            }
            return inv;
        });
    
        const updatedExpenses = expenses.map(exp => {
            if (exp.id === expenseId) {
                return { ...exp, isBilled: true };
            }
            return exp;
        });
    
        setInvoices(updatedInvoices);
        setExpenses(updatedExpenses);
    
        const newActivity: Activity = {
            id: `A${Date.now()}`,
            user: currentUser.name,
            userAvatarUrl: currentUser.avatarUrl,
            action: 'billed an expense to invoice',
            target: `${invoice.id} for ${invoice.clientName}`,
            timestamp: new Date(),
        };
        setActivities([newActivity, ...activities]);
        
        updateClientStats(invoice.clientId, bookings, updatedInvoices);
    
        alert(`Expense "${expense.description}" has been added to invoice ${invoice.id}.`);
    };

  const handleSaveSessionCategory = (categoryToSave: Omit<SessionCategory, 'packages'> & { id?: string }) => {
    if (categoryToSave.id) {
        setSessionTypes(sessionTypes.map(st => st.id === categoryToSave.id ? { ...st, name: categoryToSave.name } : st));
    } else {
        const newCategory: SessionCategory = {
            id: `SC${Date.now()}`,
            name: categoryToSave.name,
            packages: [],
        };
        setSessionTypes([...sessionTypes, newCategory]);
    }
  };
  
  const handleDeleteSessionCategory = (categoryId: string) => {
    if (bookings.some(b => b.sessionCategoryId === categoryId)) {
        alert("Cannot delete category. It is currently used in one or more bookings.");
        return;
    }
    setSessionTypes(sessionTypes.filter(st => st.id !== categoryId));
  };

  const handleSaveSessionPackage = (categoryId: string, packageToSave: Omit<SessionPackage, 'id'> & { id?: string }) => {
    setSessionTypes(sessionTypes.map(st => {
        if (st.id === categoryId) {
            if (packageToSave.id) {
                // Update existing package
                const updatedPackages = st.packages.map(p => p.id === packageToSave.id ? { ...p, ...packageToSave } : p);
                return { ...st, packages: updatedPackages };
            } else {
                // Add new package
                const newPackage: SessionPackage = {
                    ...packageToSave,
                    id: `SP${Date.now()}`,
                };
                return { ...st, packages: [...st.packages, newPackage] };
            }
        }
        return st;
    }));
  };

  const handleDeleteSessionPackage = (categoryId: string, packageId: string) => {
    if (bookings.some(b => b.sessionPackageId === packageId)) {
        alert("Cannot delete package. It is currently used in one or more bookings.");
        return;
    }
    setSessionTypes(sessionTypes.map(st => {
        if (st.id === categoryId) {
            const updatedPackages = st.packages.filter(p => p.id !== packageId);
            return { ...st, packages: updatedPackages };
        }
        return st;
    }));
  };
  
    const handleSaveEditingJob = (jobToSave: Omit<EditingJob, 'id' | 'clientName' | 'editorName' | 'editorAvatarUrl' | 'uploadDate'> & { id?: string }) => {
        const getEditorInfo = (editorId: string | null) => {
            const editor = staff.find(s => s.id === editorId);
            return editor ? { name: editor.name, avatarUrl: editor.avatarUrl } : { name: 'Unassigned', avatarUrl: 'https://picsum.photos/seed/user-unassigned/100/100' };
        }
        
        const getClientInfo = (bookingId: string) => {
            const booking = bookings.find(b => b.id === bookingId);
            return booking ? { clientName: booking.clientName, clientId: booking.clientId } : { clientName: 'N/A', clientId: '' };
        }

        if (jobToSave.id) {
            // Update existing asset
            setEditingJobs(editingJobs.map(job => {
                if (job.id === jobToSave.id) {
                    const editorInfo = getEditorInfo(jobToSave.editorId);
                    const clientInfo = getClientInfo(jobToSave.bookingId);
                    return {
                        ...job,
                        ...jobToSave,
                        editorName: editorInfo.name,
                        editorAvatarUrl: editorInfo.avatarUrl,
                        clientName: clientInfo.clientName,
                        clientId: clientInfo.clientId,
                    }
                }
                return job;
            }));
        } else {
            // Add new asset
            const editorInfo = getEditorInfo(jobToSave.editorId);
            const clientInfo = getClientInfo(jobToSave.bookingId);
            const newJob: EditingJob = {
                ...jobToSave,
                id: `M${String(editingJobs.length + 1).padStart(3, '0')}`,
                clientName: clientInfo.clientName,
                clientId: clientInfo.clientId,
                editorName: editorInfo.name,
                editorAvatarUrl: editorInfo.avatarUrl,
                uploadDate: new Date(),
                revisionCount: 0,
                revisionNotes: [],
            };
            setEditingJobs([newJob, ...editingJobs]);
        }
    };

    const handleDeleteEditingJob = (jobId: string) => {
        setEditingJobs(editingJobs.filter(job => job.id !== jobId));
    };

    const handleUpdateEditingJobStatus = (jobId: string, newStatusId: string) => {
        setEditingJobs(editingJobs.map(job => job.id === jobId ? { ...job, statusId: newStatusId } : job));
    };

    const handleRequestRevision = (jobId: string, notes: string) => {
        const inProgressStatus = editingStatuses.find(s => s.name === 'In Progress');
        if (!inProgressStatus) {
            console.error("Critical: 'In Progress' status is not defined.");
            alert("Configuration error: 'In Progress' status is missing.");
            return;
        }

        setEditingJobs(prevJobs => prevJobs.map(job => {
            if (job.id === jobId) {
                const newRevisionNotes = [
                    ...(job.revisionNotes || []),
                    { note: notes, date: new Date() }
                ];
                const newRevisionCount = (job.revisionCount || 0) + 1;
                return {
                    ...job,
                    statusId: inProgressStatus.id,
                    revisionCount: newRevisionCount,
                    revisionNotes: newRevisionNotes,
                };
            }
            return job;
        }));

        const job = editingJobs.find(j => j.id === jobId);
        const newActivity: Activity = {
            id: `A${Date.now()}`,
            user: currentUser.name,
            userAvatarUrl: currentUser.avatarUrl,
            action: 'requested a revision on job',
            target: `${job?.clientName || 'N/A'} (${job?.bookingId || ''})`,
            timestamp: new Date(),
        };
        setActivities(prev => [newActivity, ...prev]);
    };

    const handleNotifyClientForReview = (jobId: string) => {
        const job = editingJobs.find(j => j.id === jobId);
        if (job) {
             const client = clients.find(c => c.id === job.clientId);
             const booking = bookings.find(b => b.id === job.bookingId);

             if (client && client.phone) {
                 let phoneNumber = client.phone.replace(/[^0-9]/g, '');
                 if (phoneNumber.startsWith('0')) {
                     phoneNumber = '62' + phoneNumber.substring(1);
                 } else if (!phoneNumber.startsWith('62')) {
                     // This is a simple guess for mock data, not robust for real-world numbers
                     phoneNumber = '62' + phoneNumber; 
                 }
                 
                 const sessionInfo = booking ? `dari sesi foto '${booking.sessionType}'` : '';
                 const reviewLink = `https://lensledger.app/review/${job.id}/${client.id}`; // Simulated link
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

    const handleSaveEditingStatus = (statusToSave: Omit<EditingStatus, 'id'> & {id?: string}) => {
        if (statusToSave.id) {
            setEditingStatuses(editingStatuses.map(s => s.id === statusToSave.id ? { ...s, ...statusToSave } : s));
        } else {
            const newStatus: EditingStatus = {
                ...statusToSave,
                id: `status-${Date.now()}`,
            };
            setEditingStatuses([...editingStatuses, newStatus]);
        }
    };
    
    const handleDeleteEditingStatus = (statusId: string) => {
        // You might want to add logic here to prevent deleting a status that's in use
        if (editingJobs.some(job => job.statusId === statusId)) {
            alert("Cannot delete a status that is currently in use by an editing job.");
            return;
        }
        setEditingStatuses(editingStatuses.filter(s => s.id !== statusId));
    };

    const handleAddPhotoSelection = (bookingId: string, selectionName: string) => {
        setBookings(bookings.map(b => {
            if (b.id === bookingId) {
                const newSelection: PhotoSelection = { name: selectionName, edited: false };
                const updatedSelections = [...(b.photoSelections || []), newSelection];
                return { ...b, photoSelections: updatedSelections };
            }
            return b;
        }));
    };
    
    const handleRemovePhotoSelection = (bookingId: string, selectionNameToRemove: string) => {
        setBookings(bookings.map(b => {
            if (b.id === bookingId) {
                const updatedSelections = (b.photoSelections || []).filter(s => s.name !== selectionNameToRemove);
                return { ...b, photoSelections: updatedSelections };
            }
            return b;
        }));
    };

    const handleTogglePhotoSelectionEdited = (bookingId: string, selectionName: string) => {
        setBookings(bookings.map(b => {
            if (b.id === bookingId) {
                const updatedSelections = (b.photoSelections || []).map(s => 
                    s.name === selectionName ? { ...s, edited: !s.edited } : s
                );
                return { ...b, photoSelections: updatedSelections };
            }
            return b;
        }));
    };

    const handleFinalizeSelections = (bookingId: string) => {
        const booking = bookings.find(b => b.id === bookingId);
        if (!booking) {
            alert("Booking not found.");
            return;
        }

        if (!booking.photoSelections || booking.photoSelections.length === 0) {
            alert("Please add photo selections before finalizing.");
            return;
        }

        const readyForEditStatus = editingStatuses.find(s => s.name === 'Ready for Edit');
        if (!readyForEditStatus) {
            console.error("Critical: 'Ready for Edit' status is not defined in settings.");
            alert("Configuration error: 'Ready for Edit' status is missing.");
            return;
        }
        
        const awaitingSelectionStatus = editingStatuses.find(s => s.name === 'Awaiting Selection');
        if (!awaitingSelectionStatus) {
            console.error("Critical: 'Awaiting Selection' status is not defined.");
            // Less critical, but we can still proceed
        }

        const jobToUpdate = editingJobs.find(job => 
            job.bookingId === bookingId && 
            (!awaitingSelectionStatus || job.statusId === awaitingSelectionStatus.id)
        );

        if (jobToUpdate) {
            setEditingJobs(prevJobs => prevJobs.map(job => 
                job.id === jobToUpdate.id ? { ...job, statusId: readyForEditStatus.id } : job
            ));

            const client = clients.find(c => c.id === booking.clientId);
            const newActivity: Activity = {
                id: `A${Date.now()}`,
                user: 'System',
                userAvatarUrl: 'https://picsum.photos/seed/system/100/100',
                action: `marked job for booking ${jobToUpdate.bookingId} as ready for editing`,
                target: `${client?.name || 'N/A'}`,
                timestamp: new Date(),
            };
            setActivities(prev => [newActivity, ...prev]);

            alert(`Editing job ${jobToUpdate.id} for ${client?.name} is now marked as 'Ready for Edit'.`);
        } else {
            alert("No editing jobs for this booking are currently awaiting photo selection.");
        }
    };

    const handleSavePaymentAccount = (accountToSave: Omit<PaymentAccount, 'id'> & { id?: string }) => {
        if (accountToSave.id) {
            setPaymentAccounts(paymentAccounts.map(acc => acc.id === accountToSave.id ? { ...acc, ...accountToSave } : acc));
        } else {
            const newAccount: PaymentAccount = {
                ...accountToSave,
                id: `PA${Date.now()}`,
            };
            setPaymentAccounts([...paymentAccounts, newAccount]);
        }
    };

    const handleDeletePaymentAccount = (accountId: string) => {
        if (invoices.some(inv => inv.payments?.some(p => p.accountId === accountId))) {
            alert("Cannot delete an account that has payments recorded to it in invoices.");
            return;
        }
        if (expenses.some(exp => exp.accountId === accountId)) {
            alert("Cannot delete an account that has expenses recorded from it.");
            return;
        }
        setPaymentAccounts(paymentAccounts.filter(acc => acc.id !== accountId));
    };

    const handleSaveSettings = (settings: AppSettings) => {
        setAppSettings(settings);
        // Here you would typically also make an API call to save settings to a backend.
    };


    const handleViewClient = (clientId: string) => {
        if (hasPermission(currentUser.role, Permission.VIEW_CLIENTS)) {
            setActivePage('Clients');
            setSelectedClientId(clientId);
        }
    }
    
    // Filter data based on user role
    const visibleBookings = hasPermission(currentUser.role, Permission.VIEW_BOOKINGS_ALL)
        ? bookings
        : bookings.filter(b => b.photographerId === currentUser.id);

    const visibleEditingJobs = hasPermission(currentUser.role, Permission.VIEW_EDITING_ALL)
        ? editingJobs
        : editingJobs.filter(m => m.editorId === currentUser.id);

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
  );
};

export default App;