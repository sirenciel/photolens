# PhotoLens Database Setup Guide

## Issue Identification

Your PhotoLens application is successfully connecting to Supabase, but you cannot input any data because:

1. **Empty Database**: All tables are empty with no seed data
2. **RLS Policies**: Row Level Security policies prevent anonymous users from inserting data
3. **No Authentication**: The application uses the anonymous key, which has limited permissions

## ✅ SOLUTION: Manual Database Setup

Since the RLS policies are preventing automatic seeding, follow these steps to get your application working:

### Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project: `ksxrwruqhkxklvwtlsyy`

### Step 2: Add Essential Data

Navigate to **Table Editor** and add the following data:

#### 2.1 Staff Members (Required for app to work)

Go to `staff_members` table and insert:

```
name: Admin User
email: admin@lensledger.com  
avatar_url: https://picsum.photos/100
role: Owner
status: Active
last_login: (current timestamp)
```

#### 2.2 Session Categories

Go to `session_categories` table and insert:

```
Row 1: name: Wedding
Row 2: name: Portrait  
Row 3: name: Corporate
```

#### 2.3 Session Packages

Go to `session_packages` table and insert (use the category IDs from above):

```
Row 1: 
  session_category_id: [Wedding category ID]
  name: Wedding Basic
  price: 2500
  inclusions: ["4 Hours Coverage", "1 Photographer", "100 Edited Photos"]

Row 2:
  session_category_id: [Portrait category ID]  
  name: Portrait Session
  price: 750
  inclusions: ["1 Hour Studio Session", "15 Edited Photos"]
```

#### 2.4 Payment Accounts

Go to `payment_accounts` table and insert:

```
Row 1:
  name: Main Account
  type: Bank
  details: Business checking account

Row 2:
  name: Cash Register  
  type: Cash
  details: Studio cash payments
```

#### 2.5 App Settings

Go to `app_settings` table and insert:

```
company_name: LensLedger Photography
company_address: Your Business Address
company_email: contact@lensledger.com
invoice_prefix: INV
default_due_days: 14
footer_notes: Thank you for your business!
automated_reminders_enabled: true
reminder_frequency_days: 7
```

### Step 3: Verify Application Works

1. Refresh your application at `http://localhost:3003`
2. You should now see:
   - Staff members in the staff page
   - Session types for bookings
   - Payment accounts for transactions
   - Company settings configured

### Step 4: Add Sample Clients (Optional)

Go to `clients` table and add some test clients:

```
Row 1:
  name: Test Client 1
  email: client1@example.com
  phone: 555-0101
  avatar_url: https://picsum.photos/100

Row 2:
  name: Test Client 2  
  email: client2@example.com
  phone: 555-0102
  avatar_url: https://picsum.photos/101
```

## Alternative Solution: Disable RLS Temporarily

If you have admin access to the Supabase project:

1. Go to **Authentication** > **Policies**
2. Temporarily disable RLS policies on tables
3. Run the seeding script again
4. Re-enable RLS policies after seeding

## ⚠️ Important Notes

- **Why RLS Blocks Seeding**: The anonymous API key has limited permissions for security
- **Production Consideration**: This setup is normal for production security
- **Service Role Key**: You could use the service role key for seeding, but it should be kept secret

## 🎉 Success Indicators

After adding the data manually, your application should:

1. ✅ Display staff members on the dashboard
2. ✅ Allow creating new bookings with session types
3. ✅ Show clients and allow adding new ones
4. ✅ Enable invoice creation and management
5. ✅ Show financial data and reports

## Support

If you continue to have issues:

1. Check the browser console for specific errors
2. Verify all required tables have at least one row of data
3. Ensure the Supabase connection is working (you should see API calls in Network tab)
4. Check that the environment variables in `.env.local` are correct

Your application is properly configured - it just needs initial data to work with!