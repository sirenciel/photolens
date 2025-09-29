import { supabase } from './supabase';
import { 
  mockStaff, 
  mockClients, 
  mockSessionTypes, 
  mockPaymentAccounts,
  mockBookings,
  mockExpenses,
  mockSettings
} from './mockData';

export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // 1. Seed Staff Members
    console.log('Seeding staff members...');
    for (const staff of mockStaff) {
      const { error } = await supabase
        .from('staff_members')
        .upsert({
          id: staff.id,
          name: staff.name,
          email: staff.email,
          avatar_url: staff.avatarUrl,
          role: staff.role,
          status: staff.status,
          last_login: staff.lastLogin.toISOString()
        });
      if (error && error.code !== '23505') { // Ignore unique constraint violations
        console.error('Error seeding staff:', error);
      }
    }

    // 2. Seed Clients
    console.log('Seeding clients...');
    for (const client of mockClients) {
      const { error } = await supabase
        .from('clients')
        .upsert({
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          avatar_url: client.avatarUrl,
          join_date: client.joinDate.toISOString(),
          total_bookings: client.totalBookings,
          total_spent: client.totalSpent,
          notes: client.notes
        });
      if (error && error.code !== '23505') {
        console.error('Error seeding client:', error);
      }
    }

    // 3. Seed Session Categories and Packages
    console.log('Seeding session categories and packages...');
    for (const category of mockSessionTypes) {
      // Insert category
      const { error: categoryError } = await supabase
        .from('session_categories')
        .upsert({
          id: category.id,
          name: category.name
        });
      if (categoryError && categoryError.code !== '23505') {
        console.error('Error seeding session category:', categoryError);
        continue;
      }

      // Insert packages for this category
      for (const pkg of category.packages) {
        const { error: packageError } = await supabase
          .from('session_packages')
          .upsert({
            id: pkg.id,
            session_category_id: category.id,
            name: pkg.name,
            price: pkg.price,
            inclusions: pkg.inclusions
          });
        if (packageError && packageError.code !== '23505') {
          console.error('Error seeding session package:', packageError);
        }
      }
    }

    // 4. Seed Payment Accounts
    console.log('Seeding payment accounts...');
    for (const account of mockPaymentAccounts) {
      const { error } = await supabase
        .from('payment_accounts')
        .upsert({
          id: account.id,
          name: account.name,
          type: account.type,
          details: account.details
        });
      if (error && error.code !== '23505') {
        console.error('Error seeding payment account:', error);
      }
    }

    // 5. Seed Bookings
    console.log('Seeding bookings...');
    for (const booking of mockBookings) {
      const { error } = await supabase
        .from('bookings')
        .upsert({
          id: booking.id,
          client_id: booking.clientId,
          session_category_id: booking.sessionCategoryId,
          session_package_id: booking.sessionPackageId,
          photographer_id: booking.photographerId,
          date: booking.date.toISOString(),
          status: booking.status,
          invoice_id: booking.invoiceId,
          notes: booking.notes,
          location: booking.location,
          photo_selections: booking.photoSelections ? JSON.stringify(booking.photoSelections) : null
        });
      if (error && error.code !== '23505') {
        console.error('Error seeding booking:', error);
      }
    }

    // 6. Seed Expenses
    console.log('Seeding expenses...');
    for (const expense of mockExpenses) {
      const { error } = await supabase
        .from('expenses')
        .upsert({
          id: expense.id,
          category: expense.category,
          description: expense.description,
          amount: expense.amount,
          date: expense.date.toISOString().split('T')[0],
          account_id: expense.accountId,
          booking_id: expense.bookingId,
          is_billed: expense.isBilled || false
        });
      if (error && error.code !== '23505') {
        console.error('Error seeding expense:', error);
      }
    }

    // 7. Seed App Settings
    console.log('Seeding app settings...');
    const { error: settingsError } = await supabase
      .from('app_settings')
      .upsert({
        id: '00000000-0000-0000-0000-000000000001', // Use a fixed UUID for settings
        company_name: mockSettings.companyProfile.name,
        company_address: mockSettings.companyProfile.address,
        company_email: mockSettings.companyProfile.email,
        logo_url: mockSettings.companyProfile.logoUrl,
        invoice_prefix: mockSettings.invoiceSettings.prefix,
        default_due_days: mockSettings.invoiceSettings.defaultDueDays,
        footer_notes: mockSettings.invoiceSettings.footerNotes,
        automated_reminders_enabled: mockSettings.automatedReminders.enabled,
        reminder_frequency_days: mockSettings.automatedReminders.frequencyDays
      });
    if (settingsError && settingsError.code !== '23505') {
      console.error('Error seeding app settings:', settingsError);
    }

    console.log('Database seeding completed successfully!');
    return true;
  } catch (error) {
    console.error('Error during database seeding:', error);
    return false;
  }
};

export const checkDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('staff_members')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};