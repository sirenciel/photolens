
import React, { useState, useEffect, useRef } from 'react';
import { Invoice, PaymentAccount, Permission, StaffMember } from '../../types';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import { hasPermission } from '../../services/permissions';
import { WhatsAppIcon } from '../../constants';

interface InvoicesTableProps {
    invoices: Invoice[];
    currentUser: StaffMember;
    paymentAccounts: PaymentAccount[];
    onEdit: (invoice: Invoice) => void;
    onDelete: (invoiceId: string) => void;
    onViewClient: (clientId: string) => void;
    onSend: (invoice: Invoice) => void;
    onSendWhatsApp: (invoice: Invoice) => void;
    onPreview: (invoice: Invoice, type: 'invoice' | 'receipt') => void;
    onRecordPayment: (invoice: Invoice) => void;
}

const InvoicesTable: React.FC<InvoicesTableProps> = ({ invoices, currentUser, paymentAccounts, onEdit, onDelete, onViewClient, onSend, onSendWhatsApp, onPreview, onRecordPayment }) => {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };
    
    const canManageInvoices = hasPermission(currentUser.role, Permission.MANAGE_INVOICES);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openMenuId && menuRefs.current[openMenuId] && !menuRefs.current[openMenuId]!.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [openMenuId]);

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-900">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Invoice ID</th>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Client</th>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Due Date</th>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                            {canManageInvoices && <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {invoices.map(invoice => (
                            <tr key={invoice.id} className="hover:bg-slate-900/50 transition-colors">
                                <td 
                                    className="p-4 text-cyan-400 whitespace-nowrap font-mono hover:underline cursor-pointer"
                                    onClick={() => onPreview(invoice, 'invoice')}
                                >
                                    {invoice.id}
                                </td>
                                <td className="p-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img className="h-10 w-10 rounded-full object-cover" src={invoice.clientAvatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(invoice.clientName || 'Client')}`} alt={invoice.clientName} />
                                        <div className="ml-3">
                                            <p 
                                                className="font-medium text-white hover:text-cyan-400 cursor-pointer"
                                                onClick={() => onViewClient(invoice.clientId)}
                                            >
                                                {invoice.clientName}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-white">{formatCurrency(invoice.amount)}</span>
                                        {invoice.amountPaid > 0 && (
                                            <span className={`text-xs ${invoice.amountPaid >= invoice.amount ? 'text-green-400' : 'text-yellow-400'}`}>
                                                Paid: {formatCurrency(invoice.amountPaid)}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-slate-300 whitespace-nowrap">
                                    <div>
                                        <span>{formatDate(invoice.dueDate)}</span>
                                        {invoice.status === 'Overdue' && invoice.lastReminderSent && (
                                            <div className="text-xs text-yellow-400 flex items-center mt-1" title={`Last reminder sent on ${formatDate(new Date(invoice.lastReminderSent))}`}>
                                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                                Reminder Sent
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 whitespace-nowrap"><InvoiceStatusBadge status={invoice.status} /></td>
                                {canManageInvoices && (
                                    <td className="p-4 whitespace-nowrap text-right">
                                        <div className="relative inline-block text-left" ref={el => { menuRefs.current[invoice.id] = el; }}>
                                            <button 
                                                onClick={() => setOpenMenuId(openMenuId === invoice.id ? null : invoice.id)}
                                                className="p-1 text-slate-400 hover:text-white rounded-full transition-colors" title="Actions">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                </svg>
                                            </button>
                                            {openMenuId === invoice.id && (
                                                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-slate-900 ring-1 ring-slate-700 focus:outline-none z-10">
                                                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                                        {invoice.status !== 'Paid' && (
                                                            <a href="#" onClick={(e) => { e.preventDefault(); onRecordPayment(invoice); setOpenMenuId(null); }} className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-green-400" role="menuitem">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 004 0V7.15c.22.071.412.164.567.267C13.863 7.84 14 8.298 14 8.768V12.5A2.5 2.5 0 0111.5 15h-3A2.5 2.5 0 016 12.5V8.768c0-.47.137-.928.433-1.35z" /><path fillRule="evenodd" d="M7 6a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                                                                Record Payment
                                                            </a>
                                                        )}
                                                        <a href="#" onClick={(e) => { e.preventDefault(); onPreview(invoice, 'invoice'); setOpenMenuId(null); }} className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-cyan-400" role="menuitem">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                                            View/Download PDF
                                                        </a>
                                                         {invoice.status === 'Paid' && (
                                                            <a href="#" onClick={(e) => { e.preventDefault(); onPreview(invoice, 'receipt'); setOpenMenuId(null); }} className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-green-400" role="menuitem">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" /></svg>
                                                                Download Receipt
                                                            </a>
                                                        )}
                                                         <a href="#" onClick={(e) => { e.preventDefault(); onSendWhatsApp(invoice); setOpenMenuId(null); }} className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-green-400" role="menuitem">
                                                            <WhatsAppIcon className="h-5 w-5 mr-3" />
                                                            Send via WhatsApp
                                                        </a>
                                                        <a href="#" onClick={(e) => { e.preventDefault(); onSend(invoice); setOpenMenuId(null); }} className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-800" role="menuitem">
                                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                                                            Send Email
                                                        </a>
                                                        <a href="#" onClick={(e) => { e.preventDefault(); onEdit(invoice); setOpenMenuId(null); }} className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-800" role="menuitem">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                                            Edit
                                                        </a>
                                                        <a href="#" onClick={(e) => { e.preventDefault(); onDelete(invoice.id); setOpenMenuId(null); }} className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-red-500" role="menuitem">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                                            Delete
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {/* Pagination */}
            <div className="p-4 flex justify-between items-center bg-slate-900">
                <span className="text-sm text-slate-400">Showing 1 to {invoices.length} of {invoices.length} results</span>
                <div className="flex space-x-1">
                    <button className="px-3 py-1 text-sm rounded-md bg-slate-700 text-slate-300 hover:bg-cyan-500 hover:text-white transition-colors">Previous</button>
                    <button className="px-3 py-1 text-sm rounded-md bg-cyan-500 text-white">1</button>
                    <button className="px-3 py-1 text-sm rounded-md bg-slate-700 text-slate-300 hover:bg-cyan-500 hover:text-white transition-colors">Next</button>
                </div>
            </div>
        </div>
    );
};

export default InvoicesTable;
