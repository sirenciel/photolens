import React, { useState, useEffect } from 'react';
import { BookingFormProps, UserRole, Client, Invoice, Booking } from '../../types';
import Modal from '../shared/Modal';
import ClientForm from '../clients/ClientForm';
import { useWorkflow } from '../../hooks/useWorkflow';
import { WorkflowStates } from '../../services/workflowEngine';
import WorkflowStatusBadge from '../shared/WorkflowStatusBadge';

const BookingForm: React.FC<BookingFormProps> = ({ booking, clients, staff, sessionTypes, invoices, bookings, onSave, onCancel, onSaveClient }) => {
    const [clientId, setClientId] = useState('');
    const [sessionCategoryId, setSessionCategoryId] = useState('');
    const [sessionPackageId, setSessionPackageId] = useState('');
    const [photographerId, setPhotographerId] = useState('');
    const [date, setDate] = useState('');
    const [status, setStatus] = useState<'Confirmed' | 'Pending' | 'Completed' | 'Cancelled'>('Pending');
    const [notes, setNotes] = useState('');
    const [location, setLocation] = useState('');
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [conflicts, setConflicts] = useState<Booking[]>([]);

    // Workflow integration
    const { executeTransition, getValidTransitions, isTransitioning } = useWorkflow({
        onSuccess: (message) => {
            console.log('Workflow success:', message);
        },
        onError: (error) => {
            console.error('Workflow error:', error);
        }
    });

    // Contextual Client Info State
    const [clientContext, setClientContext] = useState<{outstanding: number, pastBookings: number} | null>(null);

    const photographers = staff.filter(s => s.role === UserRole.Photographer || s.role === UserRole.Owner || s.role === UserRole.Admin);

    const availablePackages = sessionTypes.find(st => st.id === sessionCategoryId)?.packages || [];

    useEffect(() => {
        if (booking) {
            setClientId(booking.clientId);
            setSessionCategoryId(booking.sessionCategoryId);
            setSessionPackageId(booking.sessionPackageId);
            setPhotographerId(booking.photographerId);
            // Format date for datetime-local input
            const localDate = new Date(booking.date.getTime() - (booking.date.getTimezoneOffset() * 60000));
            setDate(localDate.toISOString().slice(0, 16));
            setStatus(booking.status);
            setNotes(booking.notes || '');
            setLocation(booking.location || '');
        } else {
            // Reset form for new booking
            setClientId('');
            setSessionCategoryId('');
            setSessionPackageId('');
            setPhotographerId('');
            setDate('');
            setStatus('Pending');
            setNotes('');
            setLocation('');
        }
    }, [booking]);

    useEffect(() => {
        if (!photographerId || !date) {
            setConflicts([]);
            return;
        }

        const selectedDate = new Date(date);

        const conflicting = bookings.filter(existing => {
            if (existing.id === booking?.id) return false;
            if (existing.photographerId !== photographerId) return false;

            // Consider bookings conflicting if they fall on the same day
            const sameDay = existing.date.toDateString() === selectedDate.toDateString();
            if (!sameDay) {
                return false;
            }

            // Treat events starting within a 2 hour window as conflicts
            const diffInMs = Math.abs(existing.date.getTime() - selectedDate.getTime());
            const diffInHours = diffInMs / (1000 * 60 * 60);
            return diffInHours < 2;
        });

        setConflicts(conflicting);
    }, [photographerId, date, bookings, booking?.id]);

    // INTEGRATION: Contextual client info
    useEffect(() => {
        if (clientId) {
            const clientInvoices = invoices.filter(inv => inv.clientId === clientId && inv.status !== 'Paid');
            const outstanding = clientInvoices.reduce((sum, inv) => sum + (inv.amount - inv.amountPaid), 0);
            const pastBookings = bookings.filter(b => b.clientId === clientId).length;
            setClientContext({ outstanding, pastBookings });
        } else {
            setClientContext(null);
        }
    }, [clientId, invoices, bookings]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId || !photographerId || !sessionCategoryId || !sessionPackageId) {
            alert('Please fill out all session and assignment details.');
            return;
        }
        
        // Workflow validation - check for conflicts if confirming
        if (status === 'Confirmed' && conflicts.length > 0) {
            alert('Cannot confirm booking: Photographer has conflicts on this date');
            return;
        }

        const bookingData = {
            id: booking?.id, 
            clientId,
            sessionCategoryId,
            sessionPackageId,
            photographerId,
            date: new Date(date),
            status,
            notes,
            location,
        };

        const savedBooking = await onSave(bookingData);
        
        // Execute workflow transition if status changed and booking was saved
        if (savedBooking && booking?.status !== status) {
            await executeTransition('booking', savedBooking, status as WorkflowStates, 
                `Booking ${status.toLowerCase()} successfully`);
        }
    };
    
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSessionCategoryId(e.target.value);
        setSessionPackageId(''); // Reset package selection when category changes
    }

    const handleSaveNewClient = async (clientData: Omit<Client, 'id' | 'joinDate' | 'totalBookings' | 'totalSpent'> & { id?: string }) => {
        const newClient = await onSaveClient(clientData);
        if (newClient) {
            setClientId(newClient.id); // Auto-select the new client
        }
        setIsClientModalOpen(false);
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="client" className="block text-sm font-medium text-slate-300">Client</label>
                    <div className="flex items-center space-x-2 mt-1">
                        <select
                            id="client"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            required
                            className="block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="" disabled>Select a client</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button 
                            type="button" 
                            onClick={() => setIsClientModalOpen(true)}
                            className="flex-shrink-0 py-2 px-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors text-sm"
                        >
                            + New Client
                        </button>
                    </div>
                </div>
                
                {clientContext && (
                    <div className="bg-slate-900/50 p-3 rounded-lg text-xs grid grid-cols-2 gap-2">
                        <div className="text-slate-400">Past Bookings: <span className="font-bold text-white">{clientContext.pastBookings}</span></div>
                        <div className="text-slate-400">Outstanding Balance: <span className={`font-bold ${clientContext.outstanding > 0 ? 'text-red-400' : 'text-green-400'}`}>${clientContext.outstanding.toFixed(2)}</span></div>
                    </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="sessionCategory" className="block text-sm font-medium text-slate-300">Session Category</label>
                        <select
                            id="sessionCategory"
                            value={sessionCategoryId}
                            onChange={handleCategoryChange}
                            required
                            className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="" disabled>Select a category</option>
                            {sessionTypes.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="sessionPackage" className="block text-sm font-medium text-slate-300">Session Package</label>
                        <select
                            id="sessionPackage"
                            value={sessionPackageId}
                            onChange={(e) => setSessionPackageId(e.target.value)}
                            required
                            disabled={!sessionCategoryId}
                            className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-slate-800 disabled:text-slate-500"
                        >
                            <option value="" disabled>Select a package</option>
                            {availablePackages.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price})</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="photographer" className="block text-sm font-medium text-slate-300">Photographer</label>
                    <select
                        id="photographer"
                        value={photographerId}
                        onChange={(e) => setPhotographerId(e.target.value)}
                        required
                        className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="" disabled>Assign a photographer</option>
                        {photographers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-slate-300">Date & Time</label>
                        <input
                            type="datetime-local"
                            id="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-slate-300">Location</label>
                        <input
                            type="text"
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g., Studio A, Client's Home"
                            className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                </div>
                {conflicts.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/40 text-red-200 text-sm rounded-lg p-3">
                        This photographer already has {conflicts.length} booking{conflicts.length > 1 ? 's' : ''} around this time. Consider selecting another slot or reassigning the job.
                    </div>
                )}

                <div>
                    <label htmlFor="booking-notes" className="block text-sm font-medium text-slate-300">Booking Notes (for Photographer)</label>
                     <textarea
                        id="booking-notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder="e.g., Client requested a second shooter, allergic to cats..."
                        className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-slate-300">Status</label>
                    <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        required
                        className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="py-2 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
                    >
                        Save Booking
                    </button>
                </div>
            </form>

            {isClientModalOpen && (
                <Modal title="Add New Client" onClose={() => setIsClientModalOpen(false)}>
                    <ClientForm 
                        onSave={handleSaveNewClient}
                        onCancel={() => setIsClientModalOpen(false)}
                    />
                </Modal>
            )}
        </>
    );
};

export default BookingForm;
