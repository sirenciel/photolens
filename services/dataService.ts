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

  async create(staff: Omit<StaffMember, 'id' | 'status' | 'lastLogin'>): Promise<StaffMember> {
    const { data, error } = await supabase
      .from('staff_members')
      .insert({
        name: staff.name,
        email: staff.email,
        avatar_url: staff.avatarUrl,
        role: staff.role,
        status: 'Invited',
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

// Error handler for services
export const handleServiceError = (error: any) => {
  console.error('Service Error:', error);
  throw new Error(error.message || 'An unexpected error occurred');
};