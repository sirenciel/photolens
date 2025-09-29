import { supabase } from './supabase';
import {
  Client,
  StaffMember,
  Booking,
  SessionCategory,
  SessionPackage,
  Invoice,
  Expense,
  PaymentAccount,
  EditingJob,
  EditingStatus,
  Activity,
  AppSettings,
  UserRole
} from '../types';

// Helper function to convert database row to frontend model
const convertDates = (obj: any) => {
  const converted = { ...obj };
  Object.keys(converted).forEach(key => {
    if (typeof converted[key] === 'string' && converted[key].match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      converted[key] = new Date(converted[key]);
    }
  });
  return converted;
};

// Staff Members Service
export const staffService = {
  async getAll(): Promise<StaffMember[]> {
    const { data, error } = await supabase
      .from('staff_members')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(staff => ({
      id: staff.id,
      name: staff.name,
      email: staff.email,
      avatarUrl: staff.avatar_url,
      role: staff.role as UserRole,
      status: staff.status as 'Active' | 'Invited' | 'Inactive',
      lastLogin: new Date(staff.last_login),
    }));
  },

  async create(staff: Omit<StaffMember, 'id' | 'status' | 'lastLogin'> & { status?: StaffMember['status'] }): Promise<StaffMember> {
    const { data, error } = await supabase
      .from('staff_members')
      .insert({
        name: staff.name,
        email: staff.email,
        avatar_url: staff.avatarUrl,
        role: staff.role,
        status: staff.status ?? 'Invited',
        last_login: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatarUrl: data.avatar_url,
      role: data.role as UserRole,
      status: data.status as 'Active' | 'Invited' | 'Inactive',
      lastLogin: new Date(data.last_login),
    };
  },

  async findByEmail(email: string): Promise<StaffMember | null> {
    const { data, error } = await supabase
      .from('staff_members')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatarUrl: data.avatar_url,
      role: data.role as UserRole,
      status: data.status as 'Active' | 'Invited' | 'Inactive',
      lastLogin: new Date(data.last_login),
    };
  },

  async update(id: string, updates: Partial<StaffMember>): Promise<StaffMember> {
    const { data, error } = await supabase
      .from('staff_members')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.email && { email: updates.email }),
        ...(updates.avatarUrl && { avatar_url: updates.avatarUrl }),
        ...(updates.role && { role: updates.role }),
        ...(updates.status && { status: updates.status }),
        ...(updates.lastLogin && { last_login: updates.lastLogin.toISOString() })
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatarUrl: data.avatar_url,
      role: data.role as UserRole,
      status: data.status as 'Active' | 'Invited' | 'Inactive',
      lastLogin: new Date(data.last_login),
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('staff_members')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Clients Service
export const clientsService = {
  async getAll(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      avatarUrl: client.avatar_url,
      joinDate: new Date(client.join_date),
      totalBookings: client.total_bookings,
      totalSpent: client.total_spent,
      notes: client.notes,
      financialStatus: client.financial_status,
    }));
  },

  async create(client: Omit<Client, 'id' | 'joinDate' | 'totalBookings' | 'totalSpent'>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: client.name,
        email: client.email,
        phone: client.phone,
        avatar_url: client.avatarUrl,
        notes: client.notes,
        financial_status: client.financialStatus
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      avatarUrl: data.avatar_url,
      joinDate: new Date(data.join_date),
      totalBookings: data.total_bookings,
      totalSpent: data.total_spent,
      notes: data.notes,
      financialStatus: data.financial_status,
    };
  },

  async update(id: string, updates: Partial<Client>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.email && { email: updates.email }),
        ...(updates.phone && { phone: updates.phone }),
        ...(updates.avatarUrl && { avatar_url: updates.avatarUrl }),
        ...(updates.notes !== undefined && { notes: updates.notes }),
        ...(updates.financialStatus && { financial_status: updates.financialStatus })
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      avatarUrl: data.avatar_url,
      joinDate: new Date(data.join_date),
      totalBookings: data.total_bookings,
      totalSpent: data.total_spent,
      notes: data.notes,
      financialStatus: data.financial_status,
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Session Categories Service
export const sessionCategoriesService = {
  async getAll(): Promise<SessionCategory[]> {
    const { data: categories, error: categoriesError } = await supabase
      .from('session_categories')
      .select('*')
      .order('name');
    
    if (categoriesError) throw categoriesError;
    
    const { data: packages, error: packagesError } = await supabase
      .from('session_packages')
      .select('*')
      .order('price');
    
    if (packagesError) throw packagesError;
    
    return categories.map(category => ({
      id: category.id,
      name: category.name,
      packages: packages
        .filter(pkg => pkg.session_category_id === category.id)
        .map(pkg => ({
          id: pkg.id,
          name: pkg.name,
          price: pkg.price,
          inclusions: pkg.inclusions
        }))
    }));
  },

  async create(category: Omit<SessionCategory, 'id'>): Promise<SessionCategory> {
    const { data, error } = await supabase
      .from('session_categories')
      .insert({
        name: category.name
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      packages: []
    };
  },

  async update(id: string, updates: Partial<SessionCategory>): Promise<SessionCategory> {
    const { data, error } = await supabase
      .from('session_categories')
      .update({
        ...(updates.name && { name: updates.name })
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Fetch packages for this category
    const { data: packages } = await supabase
      .from('session_packages')
      .select('*')
      .eq('session_category_id', id);
    
    return {
      id: data.id,
      name: data.name,
      packages: packages?.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        inclusions: pkg.inclusions
      })) || []
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('session_categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Session Packages Service
export const sessionPackagesService = {
  async create(categoryId: string, pkg: Omit<SessionPackage, 'id'>): Promise<SessionPackage> {
    const { data, error } = await supabase
      .from('session_packages')
      .insert({
        session_category_id: categoryId,
        name: pkg.name,
        price: pkg.price,
        inclusions: pkg.inclusions
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      price: data.price,
      inclusions: data.inclusions
    };
  },

  async update(id: string, updates: Partial<SessionPackage>): Promise<SessionPackage> {
    const { data, error } = await supabase
      .from('session_packages')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.price !== undefined && { price: updates.price }),
        ...(updates.inclusions && { inclusions: updates.inclusions })
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      price: data.price,
      inclusions: data.inclusions
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('session_packages')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Payment Accounts Service
export const paymentAccountsService = {
  async getAll(): Promise<PaymentAccount[]> {
    const { data, error } = await supabase
      .from('payment_accounts')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return data.map(account => ({
      id: account.id,
      name: account.name,
      type: account.type as 'Bank' | 'Cash' | 'Digital Wallet',
      details: account.details
    }));
  },

  async create(account: Omit<PaymentAccount, 'id'>): Promise<PaymentAccount> {
    const { data, error } = await supabase
      .from('payment_accounts')
      .insert({
        name: account.name,
        type: account.type,
        details: account.details
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      type: data.type as 'Bank' | 'Cash' | 'Digital Wallet',
      details: data.details
    };
  },

  async update(id: string, updates: Partial<PaymentAccount>): Promise<PaymentAccount> {
    const { data, error } = await supabase
      .from('payment_accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      type: data.type as 'Bank' | 'Cash' | 'Digital Wallet',
      details: data.details
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('payment_accounts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// App Settings Service
export const appSettingsService = {
  async get(): Promise<AppSettings | null> {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // no rows
      throw error;
    }

    return {
      companyProfile: {
        name: data.company_name || '',
        address: data.company_address || '',
        email: data.company_email || '',
        logoUrl: data.logo_url || ''
      },
      invoiceSettings: {
        prefix: data.invoice_prefix || 'INV',
        defaultDueDays: data.default_due_days || 14,
        footerNotes: data.footer_notes || ''
      },
      automatedReminders: {
        enabled: data.automated_reminders_enabled ?? true,
        frequencyDays: data.reminder_frequency_days || 7
      }
    };
  },

  async upsert(settings: AppSettings): Promise<AppSettings> {
    const { data, error } = await supabase
      .from('app_settings')
      .upsert({
        id: '00000000-0000-0000-0000-000000000001',
        company_name: settings.companyProfile.name,
        company_address: settings.companyProfile.address,
        company_email: settings.companyProfile.email,
        logo_url: settings.companyProfile.logoUrl,
        invoice_prefix: settings.invoiceSettings.prefix,
        default_due_days: settings.invoiceSettings.defaultDueDays,
        footer_notes: settings.invoiceSettings.footerNotes,
        automated_reminders_enabled: settings.automatedReminders.enabled,
        reminder_frequency_days: settings.automatedReminders.frequencyDays
      })
      .select()
      .single();

    if (error) throw error;

    return this.get().then(r => r!);
  }
};

// Editing Statuses Service (static list stored in DB table)
export const editingStatusesService = {
  async getAll(): Promise<EditingStatus[]> {
    const { data, error } = await supabase
      .from('editing_statuses')
      .select('*')
      .order('name');

    if (error) throw error;

    return (data || []).map(s => ({ id: s.id, name: s.name, color: s.color || 'slate' }));
  },
  async create(status: Omit<EditingStatus, 'id'>): Promise<EditingStatus> {
    const { data, error } = await supabase
      .from('editing_statuses')
      .insert({
        name: status.name,
        color: status.color
      })
      .select()
      .single();

    if (error) throw error;

    return { id: data.id, name: data.name, color: data.color || 'slate' };
  },
  async update(id: string, updates: Partial<Omit<EditingStatus, 'id'>>): Promise<EditingStatus> {
    const { data, error } = await supabase
      .from('editing_statuses')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.color && { color: updates.color })
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { id: data.id, name: data.name, color: data.color || 'slate' };
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('editing_statuses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Editing Jobs Service (optional future DB integration)
const EDITING_JOB_SELECT = `
  *,
  bookings:booking_id (id, date, notes, photo_selections),
  clients:client_id (name),
  staff_members:editor_id (name, avatar_url)
`;

const mapEditingJob = (job: any): EditingJob => {
  const revisionNotesRaw = Array.isArray(job.revision_notes) ? job.revision_notes : [];
  const revisionNotes = revisionNotesRaw.map((entry: any) => ({
    note: entry.note,
    date: new Date(entry.date)
  }));

  return {
    id: job.id,
    bookingId: job.booking_id,
    clientId: job.client_id,
    clientName: job.clients?.name || '',
    editorId: job.editor_id,
    editorName: job.staff_members?.name || 'Unassigned',
    editorAvatarUrl: job.staff_members?.avatar_url || '',
    statusId: job.status_id,
    uploadDate: new Date(job.upload_date),
    driveFolderUrl: job.drive_folder_url || '',
    photographerNotes: job.photographer_notes || '',
    priority: (job.priority as EditingJob['priority']) || 'Normal',
    revisionCount: job.revision_count || revisionNotes.length,
    revisionNotes
  };
};

export const editingJobsService = {
  async getAll(): Promise<EditingJob[]> {
    const { data, error } = await supabase
      .from('editing_jobs')
      .select(EDITING_JOB_SELECT)
      .order('upload_date', { ascending: false });

    if (error) throw error;

    return (data || []).map(mapEditingJob);
  },

  async create(job: Omit<EditingJob, 'id' | 'clientName' | 'editorName' | 'editorAvatarUrl' | 'uploadDate' | 'revisionCount' | 'revisionNotes'> & { revisionNotes?: { note: string; date: Date }[] }): Promise<EditingJob> {
    const revisionNotes = job.revisionNotes || [];

    const { data, error } = await supabase
      .from('editing_jobs')
      .insert({
        booking_id: job.bookingId,
        client_id: job.clientId,
        editor_id: job.editorId,
        status_id: job.statusId,
        priority: job.priority || 'Normal',
        drive_folder_url: job.driveFolderUrl || null,
        photographer_notes: job.photographerNotes || null,
        revision_notes: revisionNotes.map(entry => ({ note: entry.note, date: entry.date.toISOString() })),
        revision_count: revisionNotes.length
      })
      .select(EDITING_JOB_SELECT)
      .single();

    if (error) throw error;

    return mapEditingJob(data);
  },

  async update(id: string, updates: Partial<Omit<EditingJob, 'id' | 'clientName' | 'editorName' | 'editorAvatarUrl' | 'uploadDate' | 'revisionCount' | 'revisionNotes'>> & { revisionNotes?: { note: string; date: Date }[] }): Promise<EditingJob> {
    const revisionNotes = updates.revisionNotes || [];

    const updateData: Record<string, any> = {
      ...(updates.bookingId && { booking_id: updates.bookingId }),
      ...(updates.clientId && { client_id: updates.clientId }),
      ...(updates.editorId !== undefined && { editor_id: updates.editorId }),
      ...(updates.statusId && { status_id: updates.statusId }),
      ...(updates.priority && { priority: updates.priority }),
      ...(updates.driveFolderUrl !== undefined && { drive_folder_url: updates.driveFolderUrl }),
      ...(updates.photographerNotes !== undefined && { photographer_notes: updates.photographerNotes }),
    };

    if (updates.revisionNotes) {
      updateData.revision_notes = revisionNotes.map(entry => ({ note: entry.note, date: entry.date.toISOString() }));
      updateData.revision_count = revisionNotes.length;
    }

    const { data, error } = await supabase
      .from('editing_jobs')
      .update(updateData)
      .eq('id', id)
      .select(EDITING_JOB_SELECT)
      .single();

    if (error) throw error;

    return mapEditingJob(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('editing_jobs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Error handler for services
export const handleServiceError = (error: any) => {
  console.error('Service Error:', error);
  throw new Error(error.message || 'An unexpected error occurred');
};
