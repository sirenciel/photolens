-- PhotoLens Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Staff Members Table
CREATE TABLE staff_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Owner', 'Admin', 'Photographer', 'Editor', 'Finance')),
    status VARCHAR(20) DEFAULT 'Invited' CHECK (status IN ('Active', 'Invited', 'Inactive')),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients Table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_bookings INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    financial_status VARCHAR(50) CHECK (financial_status IN ('Good Standing', 'Overdue', 'High Value')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session Categories Table
CREATE TABLE session_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session Packages Table
CREATE TABLE session_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_category_id UUID NOT NULL REFERENCES session_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    inclusions TEXT[], -- Array of strings for inclusions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Accounts Table
CREATE TABLE payment_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Bank', 'Cash', 'Digital Wallet')),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices Table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    booking_id UUID, -- Will be linked after bookings table is created
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled')),
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    session_category_id UUID NOT NULL REFERENCES session_categories(id),
    session_package_id UUID NOT NULL REFERENCES session_packages(id),
    photographer_id UUID NOT NULL REFERENCES staff_members(id),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Confirmed', 'Pending', 'Completed', 'Cancelled')),
    invoice_id UUID REFERENCES invoices(id),
    notes TEXT,
    location TEXT,
    photo_selections JSONB, -- Store photo selections as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for booking_id in invoices table
ALTER TABLE invoices ADD CONSTRAINT fk_invoices_booking_id 
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;

-- Expenses Table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL CHECK (category IN ('Software', 'Studio', 'Marketing', 'Gear', 'Travel', 'Other')),
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    account_id UUID NOT NULL REFERENCES payment_accounts(id),
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    is_billed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- App Settings Table (singleton table for application settings)
CREATE TABLE app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    company_address TEXT,
    company_email VARCHAR(255),
    logo_url TEXT,
    invoice_prefix VARCHAR(10) DEFAULT 'INV',
    default_due_days INTEGER DEFAULT 14,
    footer_notes TEXT,
    automated_reminders_enabled BOOLEAN DEFAULT TRUE,
    reminder_frequency_days INTEGER DEFAULT 7,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Editing Jobs Table (for photo editing workflow)
CREATE TABLE editing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id),
    editor_id UUID REFERENCES staff_members(id),
    status_id VARCHAR(50),
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    priority VARCHAR(20) DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
    drive_folder_url TEXT,
    photographer_notes TEXT,
    revision_notes JSONB,
    revision_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Editing Statuses Table
CREATE TABLE editing_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7), -- Hex color code
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice Items Table
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    rate DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    method VARCHAR(50),
    account_id UUID REFERENCES payment_accounts(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities Table (for activity tracking)
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    user_id UUID REFERENCES staff_members(id),
    related_id UUID, -- Generic ID for related entities
    related_type VARCHAR(50), -- Type of related entity (booking, client, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_bookings_client_id ON bookings(client_id);
CREATE INDEX idx_bookings_photographer_id ON bookings(photographer_id);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_booking_id ON expenses(booking_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies (basic policies - can be refined based on requirements)
CREATE POLICY "Allow all operations for authenticated users" ON staff_members
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON clients
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON bookings
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON invoices
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON expenses
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON activities
    FOR ALL USING (auth.role() = 'authenticated');

-- Functions to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for app_settings
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update client statistics
CREATE OR REPLACE FUNCTION update_client_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total_bookings and total_spent for the client
    UPDATE clients 
    SET 
        total_bookings = (
            SELECT COUNT(*) 
            FROM bookings 
            WHERE client_id = COALESCE(NEW.client_id, OLD.client_id)
        ),
        total_spent = (
            SELECT COALESCE(SUM(sp.price), 0)
            FROM bookings b
            JOIN session_packages sp ON b.session_package_id = sp.id
            WHERE b.client_id = COALESCE(NEW.client_id, OLD.client_id)
                AND b.status != 'Cancelled'
        )
    WHERE id = COALESCE(NEW.client_id, OLD.client_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers to update client statistics
CREATE TRIGGER update_client_stats_on_booking_insert
    AFTER INSERT ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_client_stats();

CREATE TRIGGER update_client_stats_on_booking_update
    AFTER UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_client_stats();

CREATE TRIGGER update_client_stats_on_booking_delete
    AFTER DELETE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_client_stats();
