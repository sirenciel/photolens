import React from 'react';
import { Booking, Permission, StaffMember } from '../../types';
import StatusBadge from './StatusBadge';
import { hasPermission } from '../../services/permissions';
import { NoteIcon } from '../../constants';

interface BookingsTableProps {
    bookings: Booking[];
    currentUser: StaffMember;
    onEdit: (booking: Booking) => void;
    onDelete: (bookingId: string) => void;
    onViewClient: (clientId: string) => void;
    onPreviewInvoice: (invoiceId: string) => void;
    onCreateInvoice: (bookingId: string) => void;
    onViewBrief: (booking: Booking) => void;
}

const BookingsTable: React.FC<BookingsTableProps> = ({ bookings, currentUser, onEdit, onDelete, onViewClient, onPreviewInvoice, onCreateInvoice, onViewBrief }) => {
    const formatDate = (date: Date) => {
        return date.toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
        });
    };
    
    const canManageBookings = hasPermission(currentUser.role, Permission.MANAGE_BOOKINGS);
    const canManageInvoices = hasPermission(currentUser.role, Permission.MANAGE_INVOICES);

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-900">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Client</th>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Session Type</th>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Date & Time</th>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Photographer</th>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Invoice</th>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {bookings.map(booking => (
                            <tr key={booking.id} className="hover:bg-slate-900/50 transition-colors">
                                <td className="p-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img className="h-10 w-10 rounded-full object-cover" src={booking.clientAvatarUrl} alt={booking.clientName} />
                                        <div className="ml-3">
                                            <div className="flex items-center gap-2">
                                                <p 
                                                    className="font-medium text-white hover:text-cyan-400 cursor-pointer"
                                                    onClick={() => onViewClient(booking.clientId)}
                                                >
                                                    {booking.clientName}
                                                </p>
                                                {booking.notes && (
                                                    <div className="relative group">
                                                        <NoteIcon className="h-5 w-5 text-yellow-400" />
                                                        <div className="absolute bottom-full mb-2 w-60 bg-slate-950 text-slate-200 text-sm rounded-lg p-3 border border-slate-700 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                                                            <h4 className="font-bold border-b border-slate-600 pb-1 mb-1">Booking Note</h4>
                                                            <p className="whitespace-pre-wrap">{booking.notes}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-300 whitespace-nowrap">{booking.sessionType}</td>
                                <td className="p-4 text-slate-300 whitespace-nowrap">{formatDate(booking.date)}</td>
                                <td className="p-4 text-slate-300 whitespace-nowrap">{booking.photographer}</td>
                                <td className="p-4 whitespace-nowrap"><StatusBadge status={booking.status} /></td>
                                <td className="p-4 text-cyan-400 whitespace-nowrap font-mono">
                                    {booking.invoiceId !== '-' ? (
                                        <span
                                            className="hover:underline cursor-pointer"
                                            onClick={() => onPreviewInvoice(booking.invoiceId)}
                                        >
                                            {booking.invoiceId}
                                        </span>
                                    ) : (
                                        (canManageInvoices && booking.status !== 'Cancelled') ? (
                                            <button
                                                onClick={() => onCreateInvoice(booking.id)}
                                                className="flex items-center text-xs py-1 px-2 rounded-md bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-white transition-colors"
                                                title="Create invoice for this booking"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                                </svg>
                                                Create Invoice
                                            </button>
                                        ) : (
                                            <span className="text-slate-500">-</span>
                                        )
                                    )}
                                </td>
                                <td className="p-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => onViewBrief(booking)}
                                            className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
                                            title="View Shoot Brief"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 11-2 0V4H6a1 1 0 11-2 0V4zm1.5 5.5a1 1 0 000 2h5a1 1 0 100-2h-5zM5 12a1 1 0 100 2h5a1 1 0 100-2H5z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        {canManageBookings && (
                                        <>
                                            <button 
                                                onClick={() => onEdit(booking)}
                                                className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
                                                title="Edit Booking"
                                            >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                            </button>
                                            <button 
                                                onClick={() => onDelete(booking.id)}
                                                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                                title="Delete Booking"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                            </button>
                                        </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Pagination */}
            <div className="p-4 flex justify-between items-center bg-slate-900">
                <span className="text-sm text-slate-400">Showing 1 to {bookings.length} of {bookings.length} results</span>
                <div className="flex space-x-1">
                    <button className="px-3 py-1 text-sm rounded-md bg-slate-700 text-slate-300 hover:bg-cyan-500 hover:text-white transition-colors">Previous</button>
                    <button className="px-3 py-1 text-sm rounded-md bg-cyan-500 text-white">1</button>
                    <button className="px-3 py-1 text-sm rounded-md bg-slate-700 text-slate-300 hover:bg-cyan-500 hover:text-white transition-colors">Next</button>
                </div>
            </div>
        </div>
    );
};

export default BookingsTable;
