import { 
  staffService, 
  clientsService, 
  sessionCategoriesService, 
  sessionPackagesService, 
  paymentAccountsService 
} from './dataService';
import { bookingsService, invoicesService, expensesService } from './bookingsService';
import { 
  Client, 
  StaffMember, 
  Booking, 
  SessionCategory, 
  Invoice, 
  Expense, 
  PaymentAccount,
  AppSettings,
  EditingJob,
  EditingStatus,
  Activity,
  RevenueData,
  PandLData,
  SessionRevenue
} from '../types';

// DataManager class to centralize all data operations
export class DataManager {
  private static instance: DataManager;
  
  // Cached data
  private staff: StaffMember[] = [];
  private clients: Client[] = [];
  private bookings: Booking[] = [];
  private sessionTypes: SessionCategory[] = [];
  private invoices: Invoice[] = [];
  private expenses: Expense[] = [];
  private paymentAccounts: PaymentAccount[] = [];
  
  // Loading states
  private loading = {
    staff: false,
    clients: false,
    bookings: false,
    sessionTypes: false,
    invoices: false,
    expenses: false,
    paymentAccounts: false
  };

  public static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  // Staff Methods
  async getStaff(forceReload = false): Promise<StaffMember[]> {
    if (!forceReload && this.staff.length > 0) {
      return this.staff;
    }

    if (this.loading.staff) {
      // Wait for current loading to complete
      while (this.loading.staff) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.staff;
    }

    try {
      this.loading.staff = true;
      this.staff = await staffService.getAll();
      return this.staff;
    } finally {
      this.loading.staff = false;
    }
  }

  async saveStaff(staff: Omit<StaffMember, 'id' | 'status' | 'lastLogin'> & { id?: string }): Promise<StaffMember> {
    let savedStaff: StaffMember;
    
    if (staff.id) {
      savedStaff = await staffService.update(staff.id, staff);
      const index = this.staff.findIndex(s => s.id === staff.id);
      if (index >= 0) {
        this.staff[index] = savedStaff;
      }
    } else {
      savedStaff = await staffService.create(staff);
      this.staff.unshift(savedStaff);
    }
    
    return savedStaff;
  }

  async deleteStaff(id: string): Promise<void> {
    await staffService.delete(id);
    this.staff = this.staff.filter(s => s.id !== id);
  }

  // Clients Methods
  async getClients(forceReload = false): Promise<Client[]> {
    if (!forceReload && this.clients.length > 0) {
      return this.clients;
    }

    if (this.loading.clients) {
      while (this.loading.clients) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.clients;
    }

    try {
      this.loading.clients = true;
      this.clients = await clientsService.getAll();
      return this.clients;
    } finally {
      this.loading.clients = false;
    }
  }

  async saveClient(client: Omit<Client, 'id' | 'joinDate' | 'totalBookings' | 'totalSpent'> & { id?: string }): Promise<Client> {
    let savedClient: Client;
    
    if (client.id) {
      savedClient = await clientsService.update(client.id, client);
      const index = this.clients.findIndex(c => c.id === client.id);
      if (index >= 0) {
        this.clients[index] = savedClient;
      }
    } else {
      savedClient = await clientsService.create(client);
      this.clients.unshift(savedClient);
    }
    
    return savedClient;
  }

  async deleteClient(id: string): Promise<void> {
    await clientsService.delete(id);
    this.clients = this.clients.filter(c => c.id !== id);
  }

  // Bookings Methods
  async getBookings(forceReload = false): Promise<Booking[]> {
    if (!forceReload && this.bookings.length > 0) {
      return this.bookings;
    }

    if (this.loading.bookings) {
      while (this.loading.bookings) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.bookings;
    }

    try {
      this.loading.bookings = true;
      this.bookings = await bookingsService.getAll();
      return this.bookings;
    } finally {
      this.loading.bookings = false;
    }
  }

  async saveBooking(booking: Omit<Booking, 'id' | 'clientName' | 'clientAvatarUrl' | 'photographer' | 'sessionType' | 'photoSelections'> & { id?: string }): Promise<Booking> {
    let savedBooking: Booking;
    
    if (booking.id) {
      savedBooking = await bookingsService.update(booking.id, booking);
      const index = this.bookings.findIndex(b => b.id === booking.id);
      if (index >= 0) {
        this.bookings[index] = savedBooking;
      }
    } else {
      savedBooking = await bookingsService.create(booking);
      this.bookings.unshift(savedBooking);
    }
    
    // Update client statistics after booking changes
    await this.getClients(true);
    
    return savedBooking;
  }

  async deleteBooking(id: string): Promise<void> {
    await bookingsService.delete(id);
    this.bookings = this.bookings.filter(b => b.id !== id);
    
    // Update client statistics after booking deletion
    await this.getClients(true);
  }

  // Session Types Methods
  async getSessionTypes(forceReload = false): Promise<SessionCategory[]> {
    if (!forceReload && this.sessionTypes.length > 0) {
      return this.sessionTypes;
    }

    if (this.loading.sessionTypes) {
      while (this.loading.sessionTypes) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.sessionTypes;
    }

    try {
      this.loading.sessionTypes = true;
      this.sessionTypes = await sessionCategoriesService.getAll();
      return this.sessionTypes;
    } finally {
      this.loading.sessionTypes = false;
    }
  }

  async saveSessionCategory(category: Omit<SessionCategory, 'id'> & { id?: string }): Promise<SessionCategory> {
    let savedCategory: SessionCategory;
    
    if (category.id) {
      savedCategory = await sessionCategoriesService.update(category.id, category);
      const index = this.sessionTypes.findIndex(c => c.id === category.id);
      if (index >= 0) {
        this.sessionTypes[index] = savedCategory;
      }
    } else {
      savedCategory = await sessionCategoriesService.create(category);
      this.sessionTypes.unshift(savedCategory);
    }
    
    return savedCategory;
  }

  async deleteSessionCategory(id: string): Promise<void> {
    await sessionCategoriesService.delete(id);
    this.sessionTypes = this.sessionTypes.filter(c => c.id !== id);
  }

  // Payment Accounts Methods
  async getPaymentAccounts(forceReload = false): Promise<PaymentAccount[]> {
    if (!forceReload && this.paymentAccounts.length > 0) {
      return this.paymentAccounts;
    }

    if (this.loading.paymentAccounts) {
      while (this.loading.paymentAccounts) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.paymentAccounts;
    }

    try {
      this.loading.paymentAccounts = true;
      this.paymentAccounts = await paymentAccountsService.getAll();
      return this.paymentAccounts;
    } finally {
      this.loading.paymentAccounts = false;
    }
  }

  async savePaymentAccount(account: Omit<PaymentAccount, 'id'> & { id?: string }): Promise<PaymentAccount> {
    let savedAccount: PaymentAccount;
    
    if (account.id) {
      savedAccount = await paymentAccountsService.update(account.id, account);
      const index = this.paymentAccounts.findIndex(a => a.id === account.id);
      if (index >= 0) {
        this.paymentAccounts[index] = savedAccount;
      }
    } else {
      savedAccount = await paymentAccountsService.create(account);
      this.paymentAccounts.unshift(savedAccount);
    }
    
    return savedAccount;
  }

  async deletePaymentAccount(id: string): Promise<void> {
    await paymentAccountsService.delete(id);
    this.paymentAccounts = this.paymentAccounts.filter(a => a.id !== id);
  }

  // Invoices Methods
  async getInvoices(forceReload = false): Promise<Invoice[]> {
    if (!forceReload && this.invoices.length > 0) {
      return this.invoices;
    }

    if (this.loading.invoices) {
      while (this.loading.invoices) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.invoices;
    }

    try {
      this.loading.invoices = true;
      this.invoices = await invoicesService.getAll();
      return this.invoices;
    } finally {
      this.loading.invoices = false;
    }
  }

  // Expenses Methods
  async getExpenses(forceReload = false): Promise<Expense[]> {
    if (!forceReload && this.expenses.length > 0) {
      return this.expenses;
    }

    if (this.loading.expenses) {
      while (this.loading.expenses) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.expenses;
    }

    try {
      this.loading.expenses = true;
      this.expenses = await expensesService.getAll();
      return this.expenses;
    } finally {
      this.loading.expenses = false;
    }
  }

  async saveExpense(expense: Omit<Expense, 'id'> & { id?: string }): Promise<Expense> {
    let savedExpense: Expense;
    
    if (expense.id) {
      savedExpense = await expensesService.update(expense.id, expense);
      const index = this.expenses.findIndex(e => e.id === expense.id);
      if (index >= 0) {
        this.expenses[index] = savedExpense;
      }
    } else {
      savedExpense = await expensesService.create(expense);
      this.expenses.unshift(savedExpense);
    }
    
    return savedExpense;
  }

  async deleteExpense(id: string): Promise<void> {
    await expensesService.delete(id);
    this.expenses = this.expenses.filter(e => e.id !== id);
  }

  // Clear all cached data
  clearCache(): void {
    this.staff = [];
    this.clients = [];
    this.bookings = [];
    this.sessionTypes = [];
    this.invoices = [];
    this.expenses = [];
    this.paymentAccounts = [];
  }
}

// Export singleton instance
export const dataManager = DataManager.getInstance();