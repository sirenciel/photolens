import React, { useState, useMemo, useEffect } from 'react';
import BookingsTable from './BookingsTable';
import Modal from '../shared/Modal';
import BookingForm from './BookingForm';
import CalendarView from './CalendarView';
import RecordPaymentForm from '../invoices/RecordPaymentForm';
import ShootBriefModal from './ShootBriefModal';
import HandoffNotesModal from '../editing/HandoffNotesModal';
import { BookingsPageProps, Booking, Client, Permission, Invoice, Payment, StaffMember, SessionPackage } from '../../types';
import { hasPermission } from '../../services/permissions';

const BookingsPage: React.FC<BookingsPageProps> = ({ 
    bookings, 
    clients, 
    staff, 
    sessionTypes, 
    paymentAccounts,
    invoices,
    currentUser, 
    onSaveBooking, 
    onDeleteBooking, 
    onSaveClient, 
    onViewClient, 
    onPreviewInvoice, 
    onCreateInvoiceFromBooking,
    onRecordPayment,
    onSavePhotographerNotes,
    initialFilters
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [view, setView] = useState<'list' | 'calendar'>('list');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(initialFilters?.status || 'All');
    const [photographerFilter, setPhotographerFilter] = useState('All');
    const [clientFilter, setClientFilter] = useState(initialFilters?.clientId || 'All');

    // State for the new guided workflow
    const [wizardStep, setWizardStep] = useState<null | 'createInvoice' | 'recordPayment'>(null);
    const [wizardContext, setWizardContext] = useState<{ booking?: Booking, invoice?: Invoice }>({});
    
    // State for new modals
    const [briefModalBooking, setBriefModalBooking] = useState<Booking | null>(null);
    const [handoffModalBooking, setHandoffModalBooking] = useState<Booking | null>(null);

    const canManageBookings = hasPermission(currentUser.role, Permission.MANAGE_BOOKINGS);

    useEffect(() => {
        if (initialFilters?.status) setStatusFilter(initialFilters.status);
        if (initialFilters?.clientId) setClientFilter(initialFilters.clientId);
    }, [initialFilters]);

    const filteredBookings = useMemo(() => {
        return bookings.filter(booking => {
            const matchesSearch = searchTerm === '' ||
                booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.sessionType.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'All' || booking.status === statusFilter;
            
            const matchesPhotographer = photographerFilter === 'All' || booking.photographerId === photographerFilter;
            
            const matchesClient = clientFilter === 'All' || booking.clientId === clientFilter;

            return matchesSearch && matchesStatus && matchesPhotographer && matchesClient;
        });
    }, [bookings, searchTerm, statusFilter, photographerFilter, clientFilter]);

    const handleAddNew = () => {
        setEditingBooking(null);
        setIsModalOpen(true);
    };

    const handleEdit = (booking: Booking) => {
        setEditingBooking(booking);
        setIsModalOpen(true);
    };

    const handleSave = (bookingData: Omit<Booking, 'id' | 'clientName' | 'clientAvatarUrl' | 'photographer' | 'invoiceId' | 'sessionType' | 'photoSelections'> & { id?: string }) => {
        const originalBooking = bookingData.id ? bookings.find(b => b.id === bookingData.id) : null;
        const wasCompleted = originalBooking?.status === 'Completed';
        
        const savedBooking = onSaveBooking(bookingData);
        setIsModalOpen(false);
        
        if (savedBooking) {
            // If status changed to 'Completed', trigger handoff modal
            if (bookingData.status === 'Completed' && !wasCompleted) {
                setHandoffModalBooking(savedBooking as Booking);
            } 
            // If it was a new booking (and not immediately completed), start the invoice wizard
            else if (!originalBooking && savedBooking.status !== 'Completed') {
                setWizardContext({ booking: savedBooking as Booking });
                setWizardStep('createInvoice');
            }
        }
    };

    const handleDelete = (bookingId: string) => {
        if (window.confirm('Are you sure you want to delete this booking?')) {
            onDeleteBooking(bookingId);
        }
    }
    
    const handleViewBrief = (booking: Booking) => {
        setBriefModalBooking(booking);
    };

    const handleWizardCreateInvoice = () => {
        if (wizardContext.booking) {
            const newInvoice = onCreateInvoiceFromBooking(wizardContext.booking.id);
            if (newInvoice) {
                setWizardContext(prev => ({...prev, invoice: newInvoice}));
                setWizardStep('recordPayment');
            } else {
                // If invoice creation fails, just close the wizard
                handleCloseWizard();
            }
        }
    };
    
    const handleWizardSavePayment = (paymentData: Omit<Payment, 'id' | 'recordedBy'>) => {
        if (wizardContext.invoice) {
            onRecordPayment(wizardContext.invoice.id, paymentData);
        }
        handleCloseWizard();
    };

    const handleCloseWizard = () => {
        setWizardStep(null);
        setWizardContext({});
    };

    const handleUpdateBookingDate = (bookingId: string, newDate: Date) => {
        const bookingToUpdate = bookings.find(b => b.id === bookingId);
        if (bookingToUpdate) {
            // Create a payload that onSaveBooking expects.
            const saveData = {
                id: bookingToUpdate.id,
                clientId: bookingToUpdate.clientId,
                sessionCategoryId: bookingToUpdate.sessionCategoryId,
                sessionPackageId: bookingToUpdate.sessionPackageId,
                photographerId: bookingToUpdate.photographerId,
                status: bookingToUpdate.status,
                date: newDate, // The only changed property
                notes: bookingToUpdate.notes,
                location: bookingToUpdate.location
            };
            onSaveBooking(saveData);
        }
    };


    const baseButtonClass = "px-4 py-2 text-sm font-semibold rounded-md transition-colors";
    const activeButtonClass = "bg-cyan-500 text-white";
    const inactiveButtonClass = "bg-slate-700 text-slate-300 hover:bg-slate-600";

    const renderWizardModals = () => {
        if (wizardStep === 'createInvoice' && wizardContext.booking) {
            return (
                <Modal title="Pemesanan Dibuat!" onClose={handleCloseWizard}>
                    <div className="text-center space-y-4 text-slate-300">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                         </svg>
                        <p className="text-lg">
                           Pemesanan untuk <span className="font-bold text-white">{wizardContext.booking.clientName}</span> telah berhasil dikonfirmasi.
                        </p>
                        <p>Apa langkah selanjutnya?</p>
                    </div>
                     <div className="flex justify-center space-x-4 pt-6">
                        <button onClick={handleCloseWizard} className="py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors">
                           Nanti Saja
                        </button>
                        <button onClick={handleWizardCreateInvoice} className="py-2 px-6 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h2a2 2 0 002-2V4a2 2 0 00-2-2H9z" /><path d="M4 12a2 2 0 012-2h10a2 2 0 110 4H6a2 2 0 01-2-2z" /></svg>
                           Buat Invoice Sekarang
                        </button>
                    </div>
                </Modal>
            );
        }
        if (wizardStep === 'recordPayment' && wizardContext.invoice) {
             return (
                <Modal title={`Invoice ${wizardContext.invoice.id} Dibuat!`} onClose={handleCloseWizard}>
                     <p className="text-slate-300 mb-6">Apakah Anda ingin mencatat pembayaran (misalnya, deposit) untuk invoice ini sekarang?</p>
                    <RecordPaymentForm
                        invoice={wizardContext.invoice}
                        paymentAccounts={paymentAccounts}
                        onSave={handleWizardSavePayment}
                        onCancel={handleCloseWizard}
                    />
                </Modal>
            );
        }
        return null;
    }
    
    const photographers = staff.filter(s => s.role === 'Photographer' || s.role === 'Admin' || s.role === 'Owner');

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-100">Bookings Management</h1>
                <div className="flex items-center space-x-4">
                     <div className="flex items-center p-1 bg-slate-800 rounded-lg">
                        <button onClick={() => setView('list')} className={`${baseButtonClass} ${view === 'list' ? activeButtonClass : inactiveButtonClass}`}>
                            List
                        </button>
                        <button onClick={() => setView('calendar')} className={`${baseButtonClass} ${view === 'calendar' ? activeButtonClass : inactiveButtonClass}`}>
                            Calendar
                        </button>
                    </div>
                   {canManageBookings && (
                     <button 
                        onClick={handleAddNew}
                        className="flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create New Booking
                    </button>
                   )}
                </div>
            </div>
            
            {view === 'list' && (
                <>
                    {/* Filter and Search Section */}
                    <div className="bg-slate-800 rounded-xl p-4 flex items-center space-x-4">
                        <div className="relative flex-grow">
                            <svg className="absolute w-5 h-5 text-slate-400 left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            <input 
                                type="text" 
                                placeholder="Search by client name or session type..." 
                                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select 
                            className="bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <select 
                            className="bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            value={photographerFilter}
                            onChange={e => setPhotographerFilter(e.target.value)}
                        >
                            <option value="All">All Photographers</option>
                            {photographers.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <BookingsTable 
                        bookings={filteredBookings}
                        currentUser={currentUser}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onViewClient={onViewClient}
                        onPreviewInvoice={onPreviewInvoice}
                        onCreateInvoice={onCreateInvoiceFromBooking}
                        onViewBrief={handleViewBrief}
                    />
                </>
            )}

            {view === 'calendar' && (
                <CalendarView 
                    bookings={filteredBookings}
                    onSelectBooking={handleEdit}
                    onUpdateBooking={handleUpdateBookingDate}
                />
            )}

            {isModalOpen && canManageBookings && (
                <Modal title={editingBooking ? "Edit Booking" : "Create New Booking"} onClose={() => setIsModalOpen(false)}>
                    <BookingForm
                        booking={editingBooking}
                        clients={clients}
                        staff={staff}
                        sessionTypes={sessionTypes}
                        invoices={invoices}
                        bookings={bookings}
                        onSave={handleSave}
                        onCancel={() => setIsModalOpen(false)}
                        onSaveClient={onSaveClient}
                    />
                </Modal>
            )}

            {renderWizardModals()}

            {briefModalBooking && (
                <ShootBriefModal
                    booking={briefModalBooking}
                    client={clients.find(c => c.id === briefModalBooking.clientId)!}
                    sessionPackage={sessionTypes.find(st => st.id === briefModalBooking.sessionCategoryId)?.packages.find(p => p.id === briefModalBooking.sessionPackageId)}
                    onClose={() => setBriefModalBooking(null)}
                />
            )}

            {handoffModalBooking && (
                <HandoffNotesModal
                    booking={handoffModalBooking}
                    onSave={(notes) => {
                        onSavePhotographerNotes(handoffModalBooking.id, notes);
                        setHandoffModalBooking(null);
                    }}
                    onClose={() => setHandoffModalBooking(null)}
                />
            )}
        </div>
    );
};

export default BookingsPage;
