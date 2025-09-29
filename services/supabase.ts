import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on our existing interfaces
export interface Database {
  public: {
    Tables: {
      staff_members: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar_url: string;
          role: string;
          status: string;
          last_login: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          avatar_url: string;
          role: string;
          status?: string;
          last_login?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          avatar_url?: string;
          role?: string;
          status?: string;
          last_login?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          avatar_url: string;
          join_date: string;
          total_bookings: number;
          total_spent: number;
          notes: string | null;
          financial_status: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          avatar_url: string;
          join_date?: string;
          total_bookings?: number;
          total_spent?: number;
          notes?: string | null;
          financial_status?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          avatar_url?: string;
          join_date?: string;
          total_bookings?: number;
          total_spent?: number;
          notes?: string | null;
          financial_status?: string | null;
        };
      };
      session_categories: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
      };
      session_packages: {
        Row: {
          id: string;
          session_category_id: string;
          name: string;
          price: number;
          inclusions: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_category_id: string;
          name: string;
          price: number;
          inclusions?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_category_id?: string;
          name?: string;
          price?: number;
          inclusions?: string[] | null;
        };
      };
      bookings: {
        Row: {
          id: string;
          client_id: string;
          session_category_id: string;
          session_package_id: string;
          photographer_id: string;
          date: string;
          status: string;
          invoice_id: string | null;
          notes: string | null;
          location: string | null;
          photo_selections: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          session_category_id: string;
          session_package_id: string;
          photographer_id: string;
          date: string;
          status?: string;
          invoice_id?: string | null;
          notes?: string | null;
          location?: string | null;
          photo_selections?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          session_category_id?: string;
          session_package_id?: string;
          photographer_id?: string;
          date?: string;
          status?: string;
          invoice_id?: string | null;
          notes?: string | null;
          location?: string | null;
          photo_selections?: any | null;
        };
      };
      payment_accounts: {
        Row: {
          id: string;
          name: string;
          type: string;
          details: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          details?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          details?: string | null;
        };
      };
      expenses: {
        Row: {
          id: string;
          category: string;
          description: string;
          amount: number;
          date: string;
          account_id: string;
          booking_id: string | null;
          is_billed: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          category: string;
          description: string;
          amount: number;
          date: string;
          account_id: string;
          booking_id?: string | null;
          is_billed?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          category?: string;
          description?: string;
          amount?: number;
          date?: string;
          account_id?: string;
          booking_id?: string | null;
          is_billed?: boolean | null;
        };
      };
      invoices: {
        Row: {
          id: string;
          client_id: string;
          booking_id: string | null;
          invoice_number: string;
          date: string;
          due_date: string;
          status: string;
          subtotal: number;
          tax: number;
          total: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          booking_id?: string | null;
          invoice_number: string;
          date: string;
          due_date: string;
          status?: string;
          subtotal: number;
          tax?: number;
          total: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          booking_id?: string | null;
          invoice_number?: string;
          date?: string;
          due_date?: string;
          status?: string;
          subtotal?: number;
          tax?: number;
          total?: number;
          notes?: string | null;
        };
      };
      app_settings: {
        Row: {
          id: string;
          company_name: string;
          company_address: string;
          company_email: string;
          logo_url: string;
          invoice_prefix: string;
          default_due_days: number;
          footer_notes: string;
          automated_reminders_enabled: boolean;
          reminder_frequency_days: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_name: string;
          company_address: string;
          company_email: string;
          logo_url?: string;
          invoice_prefix?: string;
          default_due_days?: number;
          footer_notes?: string;
          automated_reminders_enabled?: boolean;
          reminder_frequency_days?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_name?: string;
          company_address?: string;
          company_email?: string;
          logo_url?: string;
          invoice_prefix?: string;
          default_due_days?: number;
          footer_notes?: string;
          automated_reminders_enabled?: boolean;
          reminder_frequency_days?: number;
          updated_at?: string;
        };
      };
    };
  };
}