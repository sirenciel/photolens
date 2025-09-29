import { supabase } from './supabase';
import { Booking, Invoice, Expense } from '../types';

export const bookingsService = {
  async getAll(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        clients:client_id (name, avatar_url),
        staff_members:photographer_id (name),
        session_categories:session_category_id (name),
        session_packages:session_package_id (name)
      `)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return data.map(booking => ({
      id: booking.id,
      clientId: booking.client_id,
      clientName: booking.clients?.name || '',
      clientAvatarUrl: booking.clients?.avatar_url || '',
      sessionCategoryId: booking.session_category_id,
      sessionPackageId: booking.session_package_id,
      sessionType: `${booking.session_categories?.name || ''} - ${booking.session_packages?.name || ''}`,
      photographerId: booking.photographer_id,
      photographer: booking.staff_members?.name || '',
      date: new Date(booking.date),
      status: booking.status as 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled',
      invoiceId: booking.invoice_id,
      photoSelections: booking.photo_selections || [],
      notes: booking.notes,
      location: booking.location
    }));
  },

  async getById(id: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        clients:client_id (name, avatar_url),
        staff_members:photographer_id (name),
        session_categories:session_category_id (name),
        session_packages:session_package_id (name)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    
    return {
      id: data.id,
      clientId: data.client_id,
      clientName: data.clients?.name || '',
      clientAvatarUrl: data.clients?.avatar_url || '',
      sessionCategoryId: data.session_category_id,
      sessionPackageId: data.session_package_id,
      sessionType: `${data.session_categories?.name || ''} - ${data.session_packages?.name || ''}`,
      photographerId: data.photographer_id,
      photographer: data.staff_members?.name || '',
      date: new Date(data.date),
      status: data.status as 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled',
      invoiceId: data.invoice_id,
      photoSelections: data.photo_selections || [],
      notes: data.notes,
      location: data.location
    };
  },

  async create(booking: Omit<Booking, 'id' | 'clientName' | 'clientAvatarUrl' | 'photographer' | 'sessionType' | 'photoSelections'>): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        client_id: booking.clientId,
        session_category_id: booking.sessionCategoryId,
        session_package_id: booking.sessionPackageId,
        photographer_id: booking.photographerId,
        date: booking.date.toISOString(),
        status: booking.status || 'Pending',
        invoice_id: booking.invoiceId,
        notes: booking.notes,
        location: booking.location
      })
      .select(`
        *,
        clients:client_id (name, avatar_url),
        staff_members:photographer_id (name),
        session_categories:session_category_id (name),
        session_packages:session_package_id (name)
      `)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      clientId: data.client_id,
      clientName: data.clients?.name || '',
      clientAvatarUrl: data.clients?.avatar_url || '',
      sessionCategoryId: data.session_category_id,
      sessionPackageId: data.session_package_id,
      sessionType: `${data.session_categories?.name || ''} - ${data.session_packages?.name || ''}`,
      photographerId: data.photographer_id,
      photographer: data.staff_members?.name || '',
      date: new Date(data.date),
      status: data.status as 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled',
      invoiceId: data.invoice_id,
      photoSelections: data.photo_selections || [],
      notes: data.notes,
      location: data.location
    };
  },

  async update(id: string, updates: Partial<Booking>): Promise<Booking> {
    const updateData: any = {};
    
    if (updates.clientId) updateData.client_id = updates.clientId;
    if (updates.sessionCategoryId) updateData.session_category_id = updates.sessionCategoryId;
    if (updates.sessionPackageId) updateData.session_package_id = updates.sessionPackageId;
    if (updates.photographerId) updateData.photographer_id = updates.photographerId;
    if (updates.date) updateData.date = updates.date.toISOString();
    if (updates.status) updateData.status = updates.status;
    if (updates.invoiceId !== undefined) updateData.invoice_id = updates.invoiceId;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.photoSelections !== undefined) updateData.photo_selections = updates.photoSelections;
    
    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        clients:client_id (name, avatar_url),
        staff_members:photographer_id (name),
        session_categories:session_category_id (name),
        session_packages:session_package_id (name)
      `)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      clientId: data.client_id,
      clientName: data.clients?.name || '',
      clientAvatarUrl: data.clients?.avatar_url || '',
      sessionCategoryId: data.session_category_id,
      sessionPackageId: data.session_package_id,
      sessionType: `${data.session_categories?.name || ''} - ${data.session_packages?.name || ''}`,
      photographerId: data.photographer_id,
      photographer: data.staff_members?.name || '',
      date: new Date(data.date),
      status: data.status as 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled',
      invoiceId: data.invoice_id,
      photoSelections: data.photo_selections || [],
      notes: data.notes,
      location: data.location
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getByClientId(clientId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        clients:client_id (name, avatar_url),
        staff_members:photographer_id (name),
        session_categories:session_category_id (name),
        session_packages:session_package_id (name)
      `)
      .eq('client_id', clientId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return data.map(booking => ({
      id: booking.id,
      clientId: booking.client_id,
      clientName: booking.clients?.name || '',
      clientAvatarUrl: booking.clients?.avatar_url || '',
      sessionCategoryId: booking.session_category_id,
      sessionPackageId: booking.session_package_id,
      sessionType: `${booking.session_categories?.name || ''} - ${booking.session_packages?.name || ''}`,
      photographerId: booking.photographer_id,
      photographer: booking.staff_members?.name || '',
      date: new Date(booking.date),
      status: booking.status as 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled',
      invoiceId: booking.invoice_id,
      photoSelections: booking.photo_selections || [],
      notes: booking.notes,
      location: booking.location
    }));
  }
};

const INVOICE_SELECT = `
  *,
  clients:client_id (name, avatar_url),
  bookings:booking_id (id),
  invoice_items (id, description, quantity, rate, amount),
  payments:payments (id, amount, date, method, account_id, notes)
`;

const mapInvoiceRow = (invoice: any): Invoice => {
  const items = (invoice.invoice_items || []).map((item: any) => ({
    id: item.id,
    description: item.description,
    quantity: Number(item.quantity || 0),
    price: Number(item.rate || 0)
  }));

  const payments = (invoice.payments || []).map((payment: any) => ({
    id: payment.id,
    amount: Number(payment.amount || 0),
    date: new Date(payment.date),
    accountId: payment.account_id,
    methodNotes: payment.notes || payment.method || '',
    recordedBy: 'System'
  }));

  const amountPaid = payments.reduce((sum: number, payment: any) => sum + Number(payment.amount || 0), 0);

  return {
    id: invoice.id,
    clientId: invoice.client_id,
    clientName: invoice.clients?.name || '',
    clientAvatarUrl: invoice.clients?.avatar_url || '',
    bookingId: invoice.booking_id,
    invoiceNumber: invoice.invoice_number,
    date: new Date(invoice.date),
    dueDate: new Date(invoice.due_date),
    status: invoice.status as 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled',
    subtotal: Number(invoice.subtotal || 0),
    tax: Number(invoice.tax || 0),
    total: Number(invoice.total || 0),
    notes: invoice.notes,
    items,
    amount: Number(invoice.total || 0),
    amountPaid,
    payments,
    lastReminderSent: invoice.last_reminder_sent ? new Date(invoice.last_reminder_sent) : undefined
  };
};

type InvoiceSaveInput = {
  id?: string;
  clientId: string;
  bookingId?: string | null;
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  status: Invoice['status'];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  items: { id?: string; description: string; quantity: number; price: number }[];
};

type PaymentSaveInput = {
  amount: number;
  date: Date;
  accountId?: string;
  methodNotes?: string;
};

// Invoices Service
export const invoicesService = {
  async getAll(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select(INVOICE_SELECT)
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map(mapInvoiceRow);
  },

  async getById(id: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select(INVOICE_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    if (!data) return null;
    return mapInvoiceRow(data);
  },

  async create(invoice: InvoiceSaveInput): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        client_id: invoice.clientId,
        booking_id: invoice.bookingId || null,
        invoice_number: invoice.invoiceNumber,
        date: invoice.date.toISOString().split('T')[0],
        due_date: invoice.dueDate.toISOString().split('T')[0],
        status: invoice.status,
        subtotal: invoice.subtotal,
        tax: invoice.tax,
        total: invoice.total,
        notes: invoice.notes
      })
      .select('id, booking_id')
      .single();

    if (error) throw error;

    const invoiceId = data.id;

    if (invoice.items.length) {
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoice.items.map(item => ({
          invoice_id: invoiceId,
          description: item.description,
          quantity: item.quantity,
          rate: item.price,
          amount: item.quantity * item.price
        })));

      if (itemsError) throw itemsError;
    }

    if (invoice.bookingId) {
      await supabase
        .from('bookings')
        .update({ invoice_id: invoiceId })
        .eq('id', invoice.bookingId);
    }

    const saved = await this.getById(invoiceId);
    if (!saved) throw new Error('Failed to load invoice after creation');
    return saved;
  },

  async update(id: string, updates: InvoiceSaveInput): Promise<Invoice> {
    const existing = await this.getById(id);

    const { error } = await supabase
      .from('invoices')
      .update({
        client_id: updates.clientId,
        booking_id: updates.bookingId || null,
        invoice_number: updates.invoiceNumber,
        date: updates.date.toISOString().split('T')[0],
        due_date: updates.dueDate.toISOString().split('T')[0],
        status: updates.status,
        subtotal: updates.subtotal,
        tax: updates.tax,
        total: updates.total,
        notes: updates.notes
      })
      .eq('id', id);

    if (error) throw error;

    // Replace invoice items
    await supabase.from('invoice_items').delete().eq('invoice_id', id);

    if (updates.items.length) {
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(updates.items.map(item => ({
          invoice_id: id,
          description: item.description,
          quantity: item.quantity,
          rate: item.price,
          amount: item.quantity * item.price
        })));

      if (itemsError) throw itemsError;
    }

    if (existing?.bookingId && existing.bookingId !== updates.bookingId) {
      await supabase
        .from('bookings')
        .update({ invoice_id: null })
        .eq('id', existing.bookingId);
    }

    if (updates.bookingId) {
      await supabase
        .from('bookings')
        .update({ invoice_id: id })
        .eq('id', updates.bookingId);
    }

    const saved = await this.getById(id);
    if (!saved) throw new Error('Failed to load invoice after update');
    return saved;
  },

  async delete(id: string): Promise<void> {
    const existing = await this.getById(id);

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) throw error;

    if (existing?.bookingId) {
      await supabase
        .from('bookings')
        .update({ invoice_id: null })
        .eq('id', existing.bookingId);
    }
  },

  async getByClientId(clientId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select(INVOICE_SELECT)
      .eq('client_id', clientId)
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map(mapInvoiceRow);
  },

  async recordPayment(invoiceId: string, payment: PaymentSaveInput): Promise<Invoice> {
    const { error } = await supabase
      .from('payments')
      .insert({
        invoice_id: invoiceId,
        amount: payment.amount,
        date: payment.date.toISOString().split('T')[0],
        account_id: payment.accountId || null,
        notes: payment.methodNotes || null,
        method: null
      });

    if (error) throw error;

    let updated = await this.getById(invoiceId);
    if (!updated) throw new Error('Invoice not found after recording payment');

    if (updated.amountPaid >= updated.total && updated.status !== 'Paid') {
      await supabase
        .from('invoices')
        .update({ status: 'Paid' })
        .eq('id', invoiceId);
      updated = (await this.getById(invoiceId))!;
    }

    return updated;
  }
};

// Expenses Service
export const expensesService = {
  async getAll(): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return data.map(expense => ({
      id: expense.id,
      category: expense.category as 'Software' | 'Studio' | 'Marketing' | 'Gear' | 'Travel' | 'Other',
      description: expense.description,
      amount: expense.amount,
      date: new Date(expense.date),
      accountId: expense.account_id,
      bookingId: expense.booking_id,
      isBilled: expense.is_billed
    }));
  },

  async create(expense: Omit<Expense, 'id'>): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        date: expense.date.toISOString().split('T')[0],
        account_id: expense.accountId,
        booking_id: expense.bookingId,
        is_billed: expense.isBilled || false
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      category: data.category as 'Software' | 'Studio' | 'Marketing' | 'Gear' | 'Travel' | 'Other',
      description: data.description,
      amount: data.amount,
      date: new Date(data.date),
      accountId: data.account_id,
      bookingId: data.booking_id,
      isBilled: data.is_billed
    };
  },

  async update(id: string, updates: Partial<Expense>): Promise<Expense> {
    const updateData: any = {};
    
    if (updates.category) updateData.category = updates.category;
    if (updates.description) updateData.description = updates.description;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.date) updateData.date = updates.date.toISOString().split('T')[0];
    if (updates.accountId) updateData.account_id = updates.accountId;
    if (updates.bookingId !== undefined) updateData.booking_id = updates.bookingId;
    if (updates.isBilled !== undefined) updateData.is_billed = updates.isBilled;
    
    const { data, error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      category: data.category as 'Software' | 'Studio' | 'Marketing' | 'Gear' | 'Travel' | 'Other',
      description: data.description,
      amount: data.amount,
      date: new Date(data.date),
      accountId: data.account_id,
      bookingId: data.booking_id,
      isBilled: data.is_billed
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
