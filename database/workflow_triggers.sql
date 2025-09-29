-- PhotoLens Workflow Automation Triggers

-- Create sequence for invoice numbering
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1000;

-- Function to handle booking status changes
CREATE OR REPLACE FUNCTION handle_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-create editing job when booking completed
    IF NEW.status = 'Completed' AND (OLD.status IS NULL OR OLD.status != 'Completed') THEN
        INSERT INTO editing_jobs (
            booking_id, 
            client_id, 
            status_id,
            upload_date,
            priority
        )
        VALUES (
            NEW.id, 
            NEW.client_id, 
            (SELECT id FROM editing_statuses WHERE name = 'Queue' LIMIT 1),
            NOW(),
            'Normal'
        )
        ON CONFLICT (booking_id) DO NOTHING;
    END IF;
    
    -- Auto-cancel invoice when booking cancelled
    IF NEW.status = 'Cancelled' AND (OLD.status IS NULL OR OLD.status != 'Cancelled') THEN
        UPDATE invoices 
        SET status = 'Cancelled' 
        WHERE booking_id = NEW.id AND status NOT IN ('Paid', 'Cancelled');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate invoice when booking confirmed
CREATE OR REPLACE FUNCTION auto_generate_invoice()
RETURNS TRIGGER AS $$
DECLARE
    invoice_num TEXT;
    package_price DECIMAL(10,2);
    tax_rate DECIMAL(5,4) := 0.10; -- 10% tax
BEGIN
    -- Only create invoice for confirmed bookings that don't have one
    IF NEW.status = 'Confirmed' AND (OLD.status IS NULL OR OLD.status != 'Confirmed') 
       AND NEW.invoice_id IS NULL THEN
        
        -- Generate invoice number
        invoice_num := 'INV-' || EXTRACT(year FROM NOW()) || '-' || 
                      LPAD(nextval('invoice_seq')::text, 4, '0');
        
        -- Get package price
        SELECT price INTO package_price
        FROM session_packages
        WHERE id = NEW.session_package_id;
        
        -- Create invoice
        INSERT INTO invoices (
            client_id,
            booking_id,
            invoice_number,
            date,
            due_date,
            status,
            subtotal,
            tax,
            total
        )
        VALUES (
            NEW.client_id,
            NEW.id,
            invoice_num,
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '14 days',
            'Draft',
            COALESCE(package_price, 0),
            COALESCE(package_price * tax_rate, 0),
            COALESCE(package_price * (1 + tax_rate), 0)
        )
        RETURNING id INTO NEW.invoice_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update invoice when payment recorded
CREATE OR REPLACE FUNCTION update_invoice_on_payment()
RETURNS TRIGGER AS $$
DECLARE
    total_paid DECIMAL(10,2);
    invoice_total DECIMAL(10,2);
BEGIN
    -- Calculate total payments for this invoice
    SELECT COALESCE(SUM(amount), 0) INTO total_paid
    FROM payments
    WHERE invoice_id = NEW.invoice_id;
    
    -- Get invoice total
    SELECT total INTO invoice_total
    FROM invoices
    WHERE id = NEW.invoice_id;
    
    -- Update invoice status based on payment
    UPDATE invoices
    SET status = CASE
        WHEN total_paid >= invoice_total THEN 'Paid'
        WHEN total_paid > 0 THEN 'Partially Paid'
        ELSE 'Sent'
    END
    WHERE id = NEW.invoice_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle overdue invoices
CREATE OR REPLACE FUNCTION mark_overdue_invoices()
RETURNS void AS $$
BEGIN
    UPDATE invoices
    SET status = 'Overdue'
    WHERE due_date < CURRENT_DATE
      AND status IN ('Draft', 'Sent')
      AND total > COALESCE((
          SELECT SUM(amount) 
          FROM payments 
          WHERE invoice_id = invoices.id
      ), 0);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS booking_status_workflow ON bookings;
CREATE TRIGGER booking_status_workflow
    AFTER UPDATE OF status ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION handle_booking_status_change();

DROP TRIGGER IF EXISTS auto_invoice_generation ON bookings;  
CREATE TRIGGER auto_invoice_generation
    BEFORE UPDATE OF status ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_invoice();

DROP TRIGGER IF EXISTS payment_invoice_update ON payments;
CREATE TRIGGER payment_invoice_update
    AFTER INSERT ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_on_payment();

-- Create function to run overdue check (to be called by cron job)
CREATE OR REPLACE FUNCTION daily_workflow_maintenance()
RETURNS void AS $$
BEGIN
    -- Mark overdue invoices
    PERFORM mark_overdue_invoices();
    
    -- Update client financial status based on overdue invoices
    UPDATE clients
    SET financial_status = CASE
        WHEN EXISTS (
            SELECT 1 FROM invoices 
            WHERE client_id = clients.id 
              AND status = 'Overdue'
        ) THEN 'Overdue'
        WHEN total_spent > 10000 THEN 'High Value'
        ELSE 'Good Standing'
    END;
    
    -- Log maintenance run
    INSERT INTO activities (
        type,
        description,
        related_type,
        created_at
    ) VALUES (
        'system_maintenance',
        'Daily workflow maintenance completed',
        'system',
        NOW()
    );
END;
$$ LANGUAGE plpgsql;