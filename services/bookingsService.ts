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
    if (updates.photoSelections) updateData.photo_selections = updates.photoSelections;
    
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

// Invoices Service
export const invoicesService = {
  async getAll(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        clients:client_id (name),
        bookings:booking_id (id)
      `)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return data.map(invoice => ({
      id: invoice.id,
      clientId: invoice.client_id,
      clientName: invoice.clients?.name || '',
      bookingId: invoice.booking_id,
      invoiceNumber: invoice.invoice_number,
      date: new Date(invoice.date),
      dueDate: new Date(invoice.due_date),
      status: invoice.status as 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled',
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      notes: invoice.notes,
      items: [] // Will be populated by a separate call if needed
    }));
  },

  async create(invoice: Omit<Invoice, 'id' | 'clientName' | 'items'>): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        client_id: invoice.clientId,
        booking_id: invoice.bookingId,
        invoice_number: invoice.invoiceNumber,
        date: invoice.date.toISOString().split('T')[0],
        due_date: invoice.dueDate.toISOString().split('T')[0],
        status: invoice.status || 'Draft',
        subtotal: invoice.subtotal,
        tax: invoice.tax || 0,
        total: invoice.total,
        notes: invoice.notes
      })
      .select(`
        *,
        clients:client_id (name)
      `)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      clientId: data.client_id,
      clientName: data.clients?.name || '',
      bookingId: data.booking_id,
      invoiceNumber: data.invoice_number,
      date: new Date(data.date),
      dueDate: new Date(data.due_date),
      status: data.status as 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled',
      subtotal: data.subtotal,
      tax: data.tax,
      total: data.total,
      notes: data.notes,
      items: []
    };
  },

  async update(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    const updateData: any = {};
    
    if (updates.clientId) updateData.client_id = updates.clientId;
    if (updates.bookingId !== undefined) updateData.booking_id = updates.bookingId;
    if (updates.invoiceNumber) updateData.invoice_number = updates.invoiceNumber;
    if (updates.date) updateData.date = updates.date.toISOString().split('T')[0];
    if (updates.dueDate) updateData.due_date = updates.dueDate.toISOString().split('T')[0];
    if (updates.status) updateData.status = updates.status;
    if (updates.subtotal !== undefined) updateData.subtotal = updates.subtotal;
    if (updates.tax !== undefined) updateData.tax = updates.tax;
    if (updates.total !== undefined) updateData.total = updates.total;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    
    const { data, error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        clients:client_id (name)
      `)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      clientId: data.client_id,
      clientName: data.clients?.name || '',
      bookingId: data.booking_id,
      invoiceNumber: data.invoice_number,
      date: new Date(data.date),
      dueDate: new Date(data.due_date),
      status: data.status as 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled',
      subtotal: data.subtotal,
      tax: data.tax,
      total: data.total,
      notes: data.notes,
      items: []
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getByClientId(clientId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        clients:client_id (name)
      `)
      .eq('client_id', clientId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return data.map(invoice => ({
      id: invoice.id,
      clientId: invoice.client_id,
      clientName: invoice.clients?.name || '',
      bookingId: invoice.booking_id,
      invoiceNumber: invoice.invoice_number,
      date: new Date(invoice.date),
      dueDate: new Date(invoice.due_date),
      status: invoice.status as 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled',
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      notes: invoice.notes,
      items: []
    }));
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