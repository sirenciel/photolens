

import React, { useState, useMemo, useEffect } from 'react';
import InvoicesTable from './InvoicesTable';
import Modal from '../shared/Modal';
import InvoiceForm from './InvoiceForm';
import RecordPaymentForm from './RecordPaymentForm';
import { InvoicesPageProps, Invoice, Permission, Payment } from '../../types';
import { hasPermission } from '../../services/permissions';

const InvoiceKPICard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-slate-800 rounded-xl p-5 flex items-center">
        <div className="p-3 rounded-full bg-slate-700 mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const InvoicesPage: React.FC<InvoicesPageProps> = ({ invoices, bookings, clients, sessionTypes, paymentAccounts, currentUser, onSaveInvoice, onDeleteInvoice, onRecordPayment, onViewClient, onPreviewInvoice, initialFilters }) => {
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [invoiceToSend, setInvoiceToSend] = useState<Invoice | null>(null);
    
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [invoiceForPayment, setInvoiceForPayment] = useState<Invoice | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(initialFilters?.status || 'All');
    const [clientFilter, setClientFilter] = useState(initialFilters?.clientId || 'All');

    const canManageInvoices = hasPermission(currentUser.role, Permission.MANAGE_INVOICES);

    useEffect(() => {
        if (initialFilters?.status) setStatusFilter(initialFilters.status);
        if (initialFilters?.clientId) setClientFilter(initialFilters.clientId);
    }, [initialFilters]);


    const filteredInvoices = useMemo(() => {
        return invoices.filter(invoice => {
            const matchesSearch = searchTerm === '' ||
                invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;
            
            const matchesClient = clientFilter === 'All' || invoice.clientId === clientFilter;

            return matchesSearch && matchesStatus && matchesClient;
        });
    }, [invoices, searchTerm, statusFilter, clientFilter]);

    const handleAddNew = () => {
        setEditingInvoice(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (invoice: Invoice) => {
        setEditingInvoice(invoice);
        setIsFormModalOpen(true);
    };

    const handleSave = async (invoiceData: Omit<Invoice, 'id' | 'clientName' | 'clientAvatarUrl' | 'amount' | 'amountPaid' | 'payments'> & { id?: string }) => {
        await onSaveInvoice(invoiceData);
        setIsFormModalOpen(false);
    };

    const handleDelete = async (invoiceId: string) => {
        if (window.confirm('Are you sure you want to delete this invoice? This will mark the associated booking as uninvoiced.')) {
            await onDeleteInvoice(invoiceId);
        }
    };
    
    const handleSendInvoice = () => {
        if (!invoiceToSend) return;

        const client = clients.find(c => c.id === invoiceToSend.clientId);
        if (!client) {
            alert("Could not find client associated with this invoice.");
            setInvoiceToSend(null);
            return;
        }

        console.log(`Simulating PDF generation for invoice ${invoiceToSend.id}...`);
        console.log(`Simulating sending email to ${client.email}...`);
        
        // In a real app, this would be an async API call.
        // After success, we show a confirmation.
        alert(`Invoice ${invoiceToSend.id} has been sent to ${client.name} at ${client.email}.`);
        
        setInvoiceToSend(null);
    };
    
    const handleSendWhatsApp = (invoice: Invoice) => {
        const client = clients.find(c => c.id === invoice.clientId);
        if (!client || !client.phone) {
            alert(`Client ${client?.name || 'Unknown'} does not have a valid phone number.`);
            return;
        }
        
        let phoneNumber = client.phone.replace(/[^0-9]/g, '');
        if (phoneNumber.startsWith('0')) {
            phoneNumber = '62' + phoneNumber.substring(1);
        } else if (!phoneNumber.startsWith('62')) {
             phoneNumber = '62' + phoneNumber;
        }

        const invoiceLink = `https://lensledger.app/view/invoice/${invoice.id}`; // Simulated public link
        const message = `Halo ${client.name},\n\nBerikut adalah invoice Anda ${invoice.id} sejumlah ${formatCurrency(invoice.amount)}.\nMohon lakukan pembayaran sebelum ${invoice.dueDate.toLocaleDateString('id-ID')}.\n\nLihat invoice: ${invoiceLink}\n\nTerima kasih,\nLensLedger`;
        
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleOpenPaymentModal = (invoice: Invoice) => {
        setInvoiceForPayment(invoice);
        setIsPaymentModalOpen(true);
    };

    const handleSavePayment = async (paymentData: Omit<Payment, 'id' | 'recordedBy'>) => {
        if (invoiceForPayment) {
            await onRecordPayment(invoiceForPayment.id, paymentData);
        }
        setIsPaymentModalOpen(false);
        setInvoiceForPayment(null);
    };

    const totalOutstanding = invoices.filter(i => i.status === 'Sent' || i.status === 'Overdue').reduce((sum, i) => sum + (i.amount - i.amountPaid), 0);
    const totalOverdue = invoices.filter(i => i.status === 'Overdue').reduce((sum, i) => sum + (i.amount - i.amountPaid), 0);
    const paidLast30d = invoices.flatMap(i => i.payments || [])
        .filter(p => (new Date().getTime() - p.date.getTime()) / (1000 * 3600 * 24) <= 30)
        .reduce((sum, p) => sum + p.amount, 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    }
    
    const uninvoicedBookings = bookings.filter(b => b.invoiceId === '-' && b.status !== 'Cancelled');
    const uninvoicedCompletedBookings = bookings.filter(b => b.status === 'Completed' && b.invoiceId === '-');

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-100">Invoices</h1>
                {canManageInvoices && (
                     <button 
                        onClick={handleAddNew}
                        className="flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create New Invoice
                    </button>
                )}
            </div>

            {uninvoicedCompletedBookings.length > 0 && (
                <div className="bg-yellow-500/10 border-l-4 border-yellow-400 text-yellow-300 p-4 rounded-r-lg flex justify-between items-center" role="alert">
                    <div>
                        <p className="font-bold">Action Required</p>
                        <p className="text-sm">You have {uninvoicedCompletedBookings.length} completed booking(s) that need an invoice.</p>
                    </div>
                    <button 
                        onClick={handleAddNew}
                        className="py-1 px-3 bg-yellow-400/20 hover:bg-yellow-400/40 text-white font-semibold rounded-lg text-sm transition-colors"
                    >
                        Create Invoice
                    </button>
                </div>
            )}

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InvoiceKPICard 
                    title="Total Outstanding" 
                    value={formatCurrency(totalOutstanding)} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>}
                />
                <InvoiceKPICard 
                    title="Total Overdue" 
                    value={formatCurrency(totalOverdue)} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                />
                <InvoiceKPICard 
                    title="Paid (Last 30d)" 
                    value={formatCurrency(paidLast30d)}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
            </div>
            
            {/* Filter and Search Section */}
            <div className="bg-slate-800 rounded-xl p-4 flex items-center space-x-4">
                <div className="relative flex-grow">
                    <svg className="absolute w-5 h-5 text-slate-400 left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input 
                        type="text" 
                        placeholder="Search by client name or invoice ID..." 
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
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Sent">Sent</option>
                </select>
            </div>

            <InvoicesTable 
                invoices={filteredInvoices}
                paymentAccounts={paymentAccounts}
                currentUser={currentUser}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewClient={onViewClient}
                onSend={setInvoiceToSend}
                onSendWhatsApp={handleSendWhatsApp}
                onPreview={(invoice, type) => onPreviewInvoice(invoice.id, type)}
                onRecordPayment={handleOpenPaymentModal}
            />

            {isFormModalOpen && canManageInvoices && (
                <Modal title={editingInvoice ? "Edit Invoice" : "Create New Invoice"} onClose={() => setIsFormModalOpen(false)}>
                    <InvoiceForm 
                        invoice={editingInvoice}
                        bookings={uninvoicedBookings}
                        clients={clients}
                        sessionTypes={sessionTypes}
                        onSave={handleSave}
                        onCancel={() => setIsFormModalOpen(false)}
                    />
                </Modal>
            )}

            {invoiceForPayment && isPaymentModalOpen && canManageInvoices && (
                 <Modal title={`Record Payment for ${invoiceForPayment.id}`} onClose={() => setIsPaymentModalOpen(false)}>
                    <RecordPaymentForm
                        invoice={invoiceForPayment}
                        paymentAccounts={paymentAccounts}
                        onSave={handleSavePayment}
                        onCancel={() => setIsPaymentModalOpen(false)}
                    />
                </Modal>
            )}

            {invoiceToSend && (
                <Modal title="Confirm Invoice Delivery" onClose={() => setInvoiceToSend(null)}>
                    <div className="text-slate-300 space-y-4">
                        <p>
                            This will generate a PDF of the invoice and send it to the client's email address.
                        </p>
                        <div className="bg-slate-900/50 p-4 rounded-lg">
                             <p className="text-sm font-medium text-slate-400">Client</p>
                             <p className="font-semibold text-white">{invoiceToSend.clientName}</p>
                             <p className="font-semibold text-cyan-400">{clients.find(c => c.id === invoiceToSend.clientId)?.email}</p>
                        </div>
                        <p>
                            Are you sure you want to proceed?
                        </p>
                    </div>
                    <div className="flex justify-end space-x-4 pt-6">
                        <button
                            type="button"
                            onClick={() => setInvoiceToSend(null)}
                            className="py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSendInvoice}
                            className="py-2 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                            Send Email
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default InvoicesPage;