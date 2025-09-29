// Workflow Engine for PhotoLens
import { supabase } from './supabase';
import { Booking, Invoice, EditingJob } from '../types';

export enum WorkflowStates {
  BOOKING_PENDING = 'Pending',
  BOOKING_CONFIRMED = 'Confirmed',
  BOOKING_COMPLETED = 'Completed',
  BOOKING_CANCELLED = 'Cancelled',
  
  INVOICE_DRAFT = 'Draft',
  INVOICE_SENT = 'Sent',
  INVOICE_PAID = 'Paid',
  INVOICE_OVERDUE = 'Overdue',
  
  EDITING_QUEUE = 'Queue',
  EDITING_IN_PROGRESS = 'In Progress',
  EDITING_REVIEW = 'Client Review',
  EDITING_REVISIONS = 'Revisions Needed',
  EDITING_COMPLETED = 'Completed'
}

export interface WorkflowTransition {
  from: WorkflowStates[];
  to: WorkflowStates;
  validation?: (entity: any) => Promise<boolean>;
  sideEffects?: (entity: any) => Promise<void>;
}

export class WorkflowEngine {
  private static transitions: { [key: string]: WorkflowTransition[] } = {
    booking: [
      {
        from: [WorkflowStates.BOOKING_PENDING],
        to: WorkflowStates.BOOKING_CONFIRMED,
        validation: async (booking: Booking) => {
          // Check if photographer is available
          const conflicts = await this.checkPhotographerAvailability(
            booking.photographerId,
            booking.date
          );
          return conflicts.length === 0;
        },
        sideEffects: async (booking: Booking) => {
          // Auto-generate invoice
          await this.generateInvoiceForBooking(booking.id);
          // Send confirmation notification
          await this.sendBookingConfirmation(booking.id);
        }
      },
      {
        from: [WorkflowStates.BOOKING_CONFIRMED],
        to: WorkflowStates.BOOKING_COMPLETED,
        validation: async (booking: Booking) => {
          // Ensure booking date has passed
          return new Date() > booking.date;
        },
        sideEffects: async (booking: Booking) => {
          // Auto-create editing job
          await this.createEditingJob(booking.id);
          // Update invoice to sent status
          await this.updateInvoiceStatus(booking.id, WorkflowStates.INVOICE_SENT);
        }
      }
    ],
    
    invoice: [
      {
        from: [WorkflowStates.INVOICE_DRAFT],
        to: WorkflowStates.INVOICE_SENT,
        sideEffects: async (invoice: Invoice) => {
          // Send invoice email
          await this.sendInvoiceEmail(invoice.id);
          // Schedule payment reminders
          await this.schedulePaymentReminders(invoice.id);
        }
      }
    ]
  };

  static async executeTransition<T extends { id: string; status?: string }>(
    entityType: 'booking' | 'invoice' | 'editing',
    entity: T,
    newStatus: WorkflowStates
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const transitions = this.transitions[entityType] || [];
      const validTransition = transitions.find(t => 
        t.to === newStatus && 
        t.from.includes(entity.status as WorkflowStates)
      );

      if (!validTransition) {
        return {
          success: false,
          error: `Invalid transition from ${entity.status} to ${newStatus}`
        };
      }

      // Run validation if exists
      if (validTransition.validation) {
        const isValid = await validTransition.validation(entity);
        if (!isValid) {
          return {
            success: false,
            error: 'Validation failed for this transition'
          };
        }
      }

      // Update entity status in database
      await this.updateEntityStatus(entityType, entity.id, newStatus);

      // Execute side effects
      if (validTransition.sideEffects) {
        await validTransition.sideEffects(entity);
      }

      return { success: true };
    } catch (error) {
      console.error('Workflow transition error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async updateEntityStatus(
    entityType: string,
    id: string,
    status: WorkflowStates
  ): Promise<void> {
    const table = entityType === 'booking' ? 'bookings' : 
                  entityType === 'invoice' ? 'invoices' : 'editing_jobs';
    
    const { error } = await supabase
      .from(table)
      .update({ status: status })
      .eq('id', id);

    if (error) throw error;
  }

  private static async checkPhotographerAvailability(
    photographerId: string,
    date: Date
  ): Promise<Booking[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: conflicts } = await supabase
      .from('bookings')
      .select('*')
      .eq('photographer_id', photographerId)
      .gte('date', startOfDay.toISOString())
      .lte('date', endOfDay.toISOString())
      .in('status', ['Confirmed', 'Pending']);

    return conflicts || [];
  }

  private static async generateInvoiceForBooking(bookingId: string): Promise<void> {
    // This will be handled by database trigger
    // But we can add additional frontend logic here
    console.log(`Invoice auto-generated for booking ${bookingId}`);
  }

  private static async createEditingJob(bookingId: string): Promise<void> {
    // This will be handled by database trigger  
    // But we can add additional frontend logic here
    console.log(`Editing job created for booking ${bookingId}`);
  }

  private static async sendBookingConfirmation(bookingId: string): Promise<void> {
    // TODO: Implement email service integration
    console.log(`Booking confirmation sent for ${bookingId}`);
  }

  private static async sendInvoiceEmail(invoiceId: string): Promise<void> {
    // TODO: Implement email service integration
    console.log(`Invoice email sent for ${invoiceId}`);
  }

  private static async updateInvoiceStatus(
    bookingId: string,
    status: WorkflowStates
  ): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .update({ status: status })
      .eq('booking_id', bookingId);

    if (error) throw error;
  }

  private static async schedulePaymentReminders(invoiceId: string): Promise<void> {
    // TODO: Implement reminder scheduling
    console.log(`Payment reminders scheduled for invoice ${invoiceId}`);
  }

  // Utility method to get valid transitions for current state
  static getValidTransitions(
    entityType: 'booking' | 'invoice' | 'editing',
    currentStatus: WorkflowStates
  ): WorkflowStates[] {
    const transitions = this.transitions[entityType] || [];
    return transitions
      .filter(t => t.from.includes(currentStatus))
      .map(t => t.to);
  }

  // Method to check if transition is valid
  static isValidTransition(
    entityType: 'booking' | 'invoice' | 'editing',
    from: WorkflowStates,
    to: WorkflowStates
  ): boolean {
    const validTransitions = this.getValidTransitions(entityType, from);
    return validTransitions.includes(to);
  }
}