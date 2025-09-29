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
import { mockEditingJobs, mockActivities, mockRevenueData, mockPandLData, mockSessionRevenue, mockEditingStatuses, mockSettings } from './services/mockData';
import { dataManager } from './services/dataManager';
import { seedDatabase, checkDatabaseConnection } from './services/seedData';
import { Client, Booking, StaffMember, Invoice, SessionCategory, SessionPackage, EditingJob, Permission, UserRole, EditingStatus, PhotoSelection, Activity, Payment, Expense, InvoiceItem, PaymentAccount, ClientFinancialStatus, AppSettings } from './types';
import { hasPermission, PAGE_PERMISSIONS } from './services/permissions';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('Dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pageFilters, setPageFilters] = useState<Record<string, any>>({});
  
  // Data states - now managed by Supabase
  const [clients, setClients] = useState<Client[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [sessionTypes, setSessionTypes] = useState<SessionCategory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  
  // Mock data that doesn't need database yet
  const [editingJobs, setEditingJobs] = useState(mockEditingJobs);
  const [editingStatuses, setEditingStatuses] = useState(mockEditingStatuses);
  const [activities, setActivities] = useState(mockActivities);
  const [revenueData, setRevenueData] = useState(mockRevenueData);
  const [pandLData, setPandLData] = useState(mockPandLData);
  const [sessionRevenue, setSessionRevenue] = useState(mockSessionRevenue);
  const [appSettings, setAppSettings] = useState<AppSettings>(mockSettings);
  
  // Current user - will be the first staff member from database
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);

  // Global Invoice Preview Modal State
  const [previewData, setPreviewData] = useState<{ invoice: Invoice | null; client: Client | null; type: 'invoice' | 'receipt' }>({ invoice: null, client: null, type: 'invoice' });

  // Initialize data from Supabase
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        
        const connected = await checkDatabaseConnection();
        setDbConnected(connected);
        
        if (!connected) {
          console.error('Could not connect to database. Using mock data as fallback.');
          setIsLoading(false);
          return;
        }

        // Try to seed database with initial data if empty
        try {
          const staffData = await dataManager.getStaff();
          if (staffData.length === 0) {
            console.log('Database appears empty, seeding with initial data...');
            await seedDatabase();
          }
        } catch (error) {
          console.error('Error checking/seeding database:', error);
        }

        // Load all data from Supabase
        const [
          staffData,
          clientsData,
          bookingsData,
          sessionTypesData,
          invoicesData,
          expensesData,
          paymentAccountsData
        ] = await Promise.all([
          dataManager.getStaff(),
          dataManager.getClients(),
          dataManager.getBookings(),
          dataManager.getSessionTypes(),
          dataManager.getInvoices(),
          dataManager.getExpenses(),
          dataManager.getPaymentAccounts()
        ]);

        setStaff(staffData);
        setClients(clientsData);
        setBookings(bookingsData);
        setSessionTypes(sessionTypesData);
        setInvoices(invoicesData);
        setExpenses(expensesData);
        setPaymentAccounts(paymentAccountsData);

        if (staffData.length > 0) {
          setCurrentUser(staffData[0]);
        }

      } catch (error) {
        console.error('Error initializing data:', error);
        setDbConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Event handlers with Supabase integration
  const handleSaveClient = async (clientToSave: any) => {
    try {
      const savedClient = await dataManager.saveClient(clientToSave);
      if (clientToSave.id) {
        setClients(clients.map(c => c.id === clientToSave.id ? savedClient : c));
      } else {
        setClients([savedClient, ...clients]);
      }
      return savedClient;
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      await dataManager.deleteClient(clientId);
      setClients(clients.filter(c => c.id !== clientId));
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
      if (bookingToSave.id) {
        setBookings(bookings.map(b => b.id === bookingToSave.id ? savedBooking : b));
      } else {
        setBookings([savedBooking, ...bookings]);
      }
      const updatedClients = await dataManager.getClients(true);
      setClients(updatedClients);
      return savedBooking;
    } catch (error) {
      console.error('Error saving booking:', error);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      await dataManager.deleteBooking(bookingId);
      setBookings(bookings.filter(b => b.id !== bookingId));
      const updatedClients = await dataManager.getClients(true);
      setClients(updatedClients);
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const handleSaveStaff = async (staffToSave: any) => {
    try {
      const savedStaff = await dataManager.saveStaff(staffToSave);
      if (staffToSave.id) {
        setStaff(staff.map(s => s.id === staffToSave.id ? savedStaff : s));
      } else {
        setStaff([savedStaff, ...staff]);
      }
      return savedStaff;
    } catch (error) {
      console.error('Error saving staff:', error);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    try {
      await dataManager.deleteStaff(staffId);
      setStaff(staff.filter(s => s.id !== staffId));
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  const handleSaveExpense = async (expenseToSave: any) => {
    try {
      const savedExpense = await dataManager.saveExpense(expenseToSave);
      if (expenseToSave.id) {
        setExpenses(expenses.map(e => e.id === expenseToSave.id ? savedExpense : e));
      } else {
        setExpenses([savedExpense, ...expenses]);
      }
      return savedExpense;
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await dataManager.deleteExpense(expenseId);
      setExpenses(expenses.filter(e => e.id !== expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleSaveSessionCategory = async (categoryToSave: any) => {
    try {
      const savedCategory = await dataManager.saveSessionCategory(categoryToSave);
      if (categoryToSave.id) {
        setSessionTypes(sessionTypes.map(st => st.id === categoryToSave.id ? savedCategory : st));
      } else {
        setSessionTypes([...sessionTypes, savedCategory]);
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
      setSessionTypes(sessionTypes.filter(st => st.id !== categoryId));
    } catch (error) {
      console.error('Error deleting session category:', error);
    }
  };

  const handleSavePaymentAccount = async (accountToSave: any) => {
    try {
      const savedAccount = await dataManager.savePaymentAccount(accountToSave);
      if (accountToSave.id) {
        setPaymentAccounts(paymentAccounts.map(acc => acc.id === accountToSave.id ? savedAccount : acc));
      } else {
        setPaymentAccounts([...paymentAccounts, savedAccount]);
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
      setPaymentAccounts(paymentAccounts.filter(acc => acc.id !== accountId));
    } catch (error) {
      console.error('Error deleting payment account:', error);
    }
  };

  // Placeholder handlers for features not yet implemented with Supabase
  const placeholderHandler = (name: string) => (...args: any[]) => {
    console.log(`${name} - not yet implemented with Supabase:`, ...args);
  };

  const handleSaveClientNotes = placeholderHandler('Save client notes');
  const handleSaveInvoice = placeholderHandler('Save invoice');
  const handleDeleteInvoice = placeholderHandler('Delete invoice');
  const handleCreateInvoiceFromBooking = placeholderHandler('Create invoice from booking');
  const handleRecordPayment = placeholderHandler('Record payment');
  const handleSavePhotographerNotes = placeholderHandler('Save photographer notes');
  const handleSaveEditingJob = placeholderHandler('Save editing job');
  const handleDeleteEditingJob = placeholderHandler('Delete editing job');
  const handleUpdateEditingJobStatus = placeholderHandler('Update editing job status');
  const handleRequestRevision = placeholderHandler('Request revision');
  const handleNotifyClientForReview = placeholderHandler('Notify client for review');
  const handleSaveEditingStatus = placeholderHandler('Save editing status');
  const handleDeleteEditingStatus = placeholderHandler('Delete editing status');
  const handleAddPhotoSelection = placeholderHandler('Add photo selection');
  const handleRemovePhotoSelection = placeholderHandler('Remove photo selection');
  const handleTogglePhotoSelectionEdited = placeholderHandler('Toggle photo selection edited');
  const handleFinalizeSelections = placeholderHandler('Finalize selections');
  const handleSaveSessionPackage = placeholderHandler('Save session package');
  const handleDeleteSessionPackage = placeholderHandler('Delete session package');
  const handleBillExpense = placeholderHandler('Bill expense');
  const handleSaveSettings = (settings: any) => {
    setAppSettings(settings);
    console.log('Settings saved (locally only):', settings);
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
    if (currentUser && hasPermission(currentUser.role, Permission.VIEW_CLIENTS)) {
      setActivePage('Clients');
      setSelectedClientId(clientId);
    }
  };

  // Show loading screen while initializing
  if (isLoading || !currentUser) {
    return (
      <div className="flex h-screen bg-slate-900 text-slate-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500 mb-4 mx-auto"></div>
          <h2 className="text-xl font-semibold mb-2">Loading PhotoLens...</h2>
          <p className="text-slate-400">
            {!dbConnected ? 'Connecting to database...' : 'Loading your data...'}
          </p>
          {!dbConnected && (
            <p className="text-yellow-400 mt-2 text-sm">
              Make sure your Supabase connection is configured in .env.local
            </p>
          )}
        </div>
      </div>
    );
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