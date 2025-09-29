import { supabase } from './supabase';
import { UserRole } from '../types';

// Mock data for seeding the database
const mockStaff = [
  { name: 'Alex Wolfe', email: 'alex.wolfe@lensledger.com', avatar_url: 'https://picsum.photos/seed/user-alex/100/100', role: 'Owner', status: 'Active', last_login: new Date().toISOString() },
  { name: 'Jane Doe', email: 'jane.doe@lensledger.com', avatar_url: 'https://picsum.photos/seed/user-jane/100/100', role: 'Admin', status: 'Active', last_login: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { name: 'John Smith', email: 'john.smith@lensledger.com', avatar_url: 'https://picsum.photos/seed/user-john/100/100', role: 'Photographer', status: 'Active', last_login: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
];

const mockClients = [
  { name: 'Olivia Chen', email: 'olivia.chen@example.com', phone: '555-0101', avatar_url: 'https://picsum.photos/seed/client-olivia/100/100', notes: 'Prefers morning light for shoots.' },
  { name: 'Benjamin Carter', email: 'ben.carter@example.com', phone: '555-0102', avatar_url: 'https://picsum.photos/seed/client-ben/100/100', notes: 'Headshot specialist client.' },
  { name: 'Sophia Rodriguez', email: 'sophia.r@example.com', phone: '555-0103', avatar_url: 'https://picsum.photos/seed/client-sophia/100/100' },
];

const mockSessionCategories = [
  { name: 'Wedding' },
  { name: 'Portrait' },
  { name: 'Corporate' },
];

const mockPaymentAccounts = [
  { name: 'Main Business Account', type: 'Bank', details: 'Business checking account' },
  { name: 'Cash Register', type: 'Cash', details: 'Studio cash payments' },
  { name: 'PayPal Business', type: 'Digital Wallet' },
];

const mockEditingStatuses = [
  { name: 'Uploaded', color: '#3B82F6' },
  { name: 'In Progress', color: '#F59E0B' },
  { name: 'Completed', color: '#10B981' },
];

const mockAppSettings = {
  company_name: 'LensLedger Photography',
  company_address: '123 Photography St, Studio City, CA',
  company_email: 'contact@lensledger.com',
  logo_url: '',
  invoice_prefix: 'INV',
  default_due_days: 14,
  footer_notes: 'Thank you for choosing LensLedger Photography!',
  automated_reminders_enabled: true,
  reminder_frequency_days: 7
};

export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Check if database is already seeded
    const { data: existingStaff } = await supabase
      .from('staff_members')
      .select('id')
      .limit(1);

    if (existingStaff && existingStaff.length > 0) {
      console.log('Database already has data. Skipping seed.');
      return true;
    }

    console.log('Database is empty, attempting to seed...');

    // Temporarily disable RLS by using a direct insert approach
    // Note: This may require service role key in production
    
    try {
      // Seed staff members
      console.log('Seeding staff members...');
      const { data: staffData, error: staffError } = await supabase
        .from('staff_members')
        .insert(mockStaff)
        .select();
      
      if (staffError) {
        console.warn('Could not seed staff members:', staffError.message);
      } else {
        console.log('✅ Staff members seeded successfully');
      }

      // Seed clients
      console.log('Seeding clients...');
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .insert(mockClients)
        .select();
      
      if (clientsError) {
        console.warn('Could not seed clients:', clientsError.message);
      } else {
        console.log('✅ Clients seeded successfully');
      }

      // Seed session categories
      console.log('Seeding session categories...');
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('session_categories')
        .insert(mockSessionCategories)
        .select();
      
      if (categoriesError) {
        console.warn('Could not seed session categories:', categoriesError.message);
      } else {
        console.log('✅ Session categories seeded successfully');

        // Only seed packages if categories were successful
        if (categoriesData && categoriesData.length > 0) {
          const mockSessionPackages = [
            { session_category_id: categoriesData[0].id, name: 'Wedding Basic', price: 2500, inclusions: ['4 Hours Coverage', '1 Photographer', '100 Edited Photos'] },
            { session_category_id: categoriesData[1].id, name: 'Portrait Session', price: 750, inclusions: ['1 Hour Studio Session', '15 Edited Photos'] },
            { session_category_id: categoriesData[2].id, name: 'Corporate Headshots', price: 1200, inclusions: ['2 Hour Session', '25 Edited Photos'] },
          ];

          console.log('Seeding session packages...');
          const { error: packagesError } = await supabase
            .from('session_packages')
            .insert(mockSessionPackages);
          
          if (packagesError) {
            console.warn('Could not seed session packages:', packagesError.message);
          } else {
            console.log('✅ Session packages seeded successfully');
          }
        }
      }

      // Seed payment accounts
      console.log('Seeding payment accounts...');
      const { error: accountsError } = await supabase
        .from('payment_accounts')
        .insert(mockPaymentAccounts);
      
      if (accountsError) {
        console.warn('Could not seed payment accounts:', accountsError.message);
      } else {
        console.log('✅ Payment accounts seeded successfully');
      }

      // Seed editing statuses
      console.log('Seeding editing statuses...');
      const { error: statusesError } = await supabase
        .from('editing_statuses')
        .insert(mockEditingStatuses);
      
      if (statusesError) {
        console.warn('Could not seed editing statuses:', statusesError.message);
      } else {
        console.log('✅ Editing statuses seeded successfully');
      }

      // Seed app settings
      console.log('Seeding app settings...');
      const { error: settingsError } = await supabase
        .from('app_settings')
        .insert(mockAppSettings);
      
      if (settingsError) {
        console.warn('Could not seed app settings:', settingsError.message);
      } else {
        console.log('✅ App settings seeded successfully');
      }

      console.log('Database seeding completed!');
      return true;

    } catch (seedError) {
      console.error('Error during seeding:', seedError);
      console.log('📝 Note: If you see RLS policy errors, you may need to:');
      console.log('1. Temporarily disable RLS policies in Supabase');
      console.log('2. Or use the service role key instead of anon key');
      console.log('3. Or add data manually through the Supabase dashboard');
      return false;
    }

  } catch (error) {
    console.error('Error during database seeding:', error);
    return false;
  }
};

export const checkDatabaseConnection = async () => {
  try {
    console.log('[Seed] Checking database connectivity...');
    const { error } = await supabase
      .from('staff_members')
      .select('id', { count: 'exact', head: true });

    if (error) throw error;

    console.log('[Seed] Database connection successful');
    return true;
  } catch (error) {
    console.error('[Seed] Database connection failed:', error);
    return false;
  }
};
