import React, { useState, useEffect } from 'react';
import { ClientProfilePageProps, Client, Permission, ClientFinancialStatus, Activity, Booking, PhotoSelection, EditingJob } from '../../types';
import StatusBadge from '../bookings/StatusBadge';
import InvoiceStatusBadge from '../invoices/InvoiceStatusBadge';
import Modal from '../shared/Modal';
import ClientForm from './ClientForm';
import { hasPermission } from '../../services/permissions';

const StatCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
    <div className="bg-slate-800 p-4 rounded-lg text-center">
        <p className="text-sm text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
);

const QuickStatusCard: React.FC<{ title: string; value: string; color: string; onClick?: () => void }> = ({ title, value, color, onClick }) => {
    const isClickable = !!onClick;
    return (
        <button 
            onClick={onClick}
            disabled={!isClickable}
            className={`bg-slate-800 p-4 rounded-lg text-left w-full transition-transform transform ${isClickable ? 'hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10' : 'cursor-default'}`}
        >
            <p className="text-sm text-slate-400">{title}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
        </button>
    );
};


const FinancialStatusBadge: React.FC<{ status?: ClientFinancialStatus }> = ({ status }) => {
    if (!status) return null;
    const getStatusStyles = () => {
        switch (status) {
            case 'Good Standing': return 'bg-green-500/20 text-green-300';
            case 'Overdue': return 'bg-red-500/20 text-red-300';
            case 'High Value': return 'bg-purple-500/20 text-purple-300';
            default: return 'bg-slate-500/20 text-slate-300';
        }
    };
    return <span className={`ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyles()}`}>{status}</span>;
};

const PhotoSelectionManager: React.FC<{
    booking: Booking;
    canManage: boolean;
    onAdd: (bookingId: string, selectionName: string) => Promise<void>;
    onRemove: (bookingId: string, selectionName: string) => Promise<void>;
    onFinalize: (bookingId: string) => Promise<void>;
    isFinalizeEnabled: boolean;
}> = ({ booking, canManage, onAdd, onRemove, onFinalize, isFinalizeEnabled }) => {
    const [newSelection, setNewSelection] = useState('');

    const handleAddSelection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newSelection.trim()) {
            await onAdd(booking.id, newSelection.trim());
            setNewSelection('');
        }
    };

    return (
        <div className="bg-slate-900/50 p-4 rounded-b-lg">
            {canManage && (
                <form onSubmit={handleAddSelection} className="flex items-center space-x-2 mb-4">
                    <input
                        type="text"
                        value={newSelection}
                        onChange={(e) => setNewSelection(e.target.value)}
                        placeholder="Enter file name (e.g., IMG_1234.jpg)"
                        className="flex-grow bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <button type="submit" className="py-2 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors">Add</button>
                </form>
            )}
            <ul className="space-y-2 max-h-60 overflow-y-auto">
                {(booking.photoSelections || []).length > 0 ? (
                    (booking.photoSelections || []).map((selection, index) => (
                        <li key={index} className="flex justify-between items-center p-2 rounded-md bg-slate-800">
                            <span className="font-mono text-slate-200 text-sm">{selection.name}</span>
                            {canManage && (
                                <button onClick={async () => await onRemove(booking.id, selection.name)} className="text-slate-500 hover:text-red-400" title="Remove selection">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </button>
                            )}
                        </li>
                    ))
                ) : (
                    <p className="text-center text-slate-500 py-4 text-sm">No photo selections have been added for this booking yet.</p>
                )}
            </ul>
            {canManage && (booking.photoSelections || []).length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700 flex justify-end">
                    <div className="relative group">
                        <button
                            onClick={async () => await onFinalize(booking.id)}
                            disabled={!isFinalizeEnabled}
                            className="flex items-center py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-sm disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Finalize Selections & Mark Ready
                        </button>
                         {!isFinalizeEnabled && (
                            <div className="absolute bottom-full mb-2 right-0 w-72 bg-slate-950 text-slate-200 text-sm rounded-lg p-3 border border-slate-700 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                                <p className="font-bold text-white">Cannot Finalize</p>
                                <p>An editing job for this booking is not ready to be finalized. This usually means the booking's status is not yet "Completed", which is when the editing job is created.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


const ClientProfilePage: React.FC<ClientProfilePageProps> = ({ 
    client, 
    bookings, 
    invoices, 
    editingJobs,
    editingStatuses,
    expenses,
    activities,
    currentUser, 
    onBack, 
    onSaveClient, 
    onDeleteClient, 
    onSaveNotes,
    onAddPhotoSelection,
    onRemovePhotoSelection,
    onTogglePhotoSelectionEdited,
    onPreviewInvoice,
    onFinalizeSelections,
    navigateAndFilter,
}) => {
    const [activeTab, setActiveTab] = useState<'bookings' | 'invoices' | 'notes' | 'history'>('bookings');
    const [notes, setNotes] = useState(client.notes || '');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
    
    const canManageClients = hasPermission(currentUser.role, Permission.MANAGE_CLIENTS);

    useEffect(() => {
        setNotes(client.notes || '');
    }, [client.notes]);
    
    const handleSaveNotes = async () => {
        await onSaveNotes(client.id, notes);
        alert('Notes saved!');
    };

    const handleSaveClient = async (clientData: Omit<Client, 'id' | 'joinDate' | 'totalBookings' | 'totalSpent'> & { id?: string }) => {
        await onSaveClient(clientData);
        setIsEditModalOpen(false);
    };

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${client.name}? This will also delete their associated bookings and invoices. This action cannot be undone.`)) {
            await onDeleteClient(client.id);
        }
    };
    
    const toggleBookingExpansion = (bookingId: string) => {
        setExpandedBookingId(prevId => prevId === bookingId ? null : bookingId);
    };

    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    const timeSince = (date: Date): string => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000; if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000; if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400; if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600; if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60; if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    // --- Quick Status Calculations ---
    const overdueInvoices = invoices.filter(i => i.status === 'Overdue');
    const upcomingBookings = bookings.filter(b => b.date > new Date() && (b.status === 'Confirmed' || b.status === 'Pending'));
    
    const mostRecentActiveJob = editingJobs
        .filter(j => editingStatuses.find(s => s.id === j.statusId)?.name !== 'Completed')
        .sort((a,b) => b.uploadDate.getTime() - a.uploadDate.getTime())[0];
    
    const editingStatus = mostRecentActiveJob ? editingStatuses.find(s => s.id === mostRecentActiveJob.statusId) : null;
    
    const awaitingSelectionStatus = editingStatuses.find(s => s.name === 'Awaiting Selection');

    const clientActivities = activities.filter(a => a.target.toLowerCase().includes(client.name.toLowerCase()));

    const baseTabClass = "px-4 py-2 text-sm font-semibold rounded-md transition-colors";
    const activeTabClass = "bg-cyan-500 text-white";
    const inactiveTabClass = "bg-slate-700 text-slate-300 hover:bg-slate-600";

    const sortedBookings = [...bookings].sort((a,b) => b.date.getTime() - a.date.getTime());

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <button onClick={onBack} className="flex items-center text-sm text-cyan-400 hover:text-cyan-300 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Clients
                    </button>
                    <div className="flex items-center space-x-6">
                        <img src={client.avatarUrl} alt={client.name} className="w-24 h-24 rounded-full ring-4 ring-slate-700"/>
                        <div>
                            <div className="flex items-center">
                                <h1 className="text-3xl font-bold text-white">{client.name}</h1>
                                <FinancialStatusBadge status={client.financialStatus} />
                            </div>
                            <p className="text-slate-400">{client.email}</p>
                            <p className="text-slate-400">{client.phone}</p>
                        </div>
                    </div>
                </div>
                {canManageClients && (
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setIsEditModalOpen(true)} className="py-2 px-4 bg-slate-700 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-colors">Edit</button>
                        <button onClick={handleDelete} className="py-2 px-4 bg-slate-700 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors">Delete</button>
                    </div>
                )}
            </div>

             {/* Quick Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Bookings" value={client.totalBookings} />
                <StatCard title="Total Spent" value={formatCurrency(client.totalSpent)} />
                <QuickStatusCard 
                    title="Invoices Overdue"
                    value={overdueInvoices.length.toString()}
                    color={overdueInvoices.length > 0 ? 'text-red-400' : 'text-green-400'}
                    onClick={overdueInvoices.length > 0 ? () => navigateAndFilter('Invoices', { status: 'Overdue', clientId: client.id }) : undefined}
                />
                <QuickStatusCard 
                    title="Current Editing Status"
                    value={editingStatus ? editingStatus.name : 'N/A'}
                    color={editingStatus ? 'text-cyan-400' : 'text-slate-400'}
                    onClick={mostRecentActiveJob ? () => navigateAndFilter('Editing', { clientId: client.id }) : undefined}
                />
            </div>
            
            {/* Tab Content */}
            <div className="bg-slate-800 rounded-xl p-6">
                <div className="border-b border-slate-700 mb-6">
                    <nav className="flex space-x-2" aria-label="Tabs">
                        <button onClick={() => setActiveTab('bookings')} className={`${baseTabClass} ${activeTab === 'bookings' ? activeTabClass : inactiveTabClass}`}>Bookings & Selections</button>
                        <button onClick={() => setActiveTab('invoices')} className={`${baseTabClass} ${activeTab === 'invoices' ? activeTabClass : inactiveTabClass}`}>Invoices</button>
                        <button onClick={() => setActiveTab('history')} className={`${baseTabClass} ${activeTab === 'history' ? activeTabClass : inactiveTabClass}`}>History</button>
                        <button onClick={() => setActiveTab('notes')} className={`${baseTabClass} ${activeTab === 'notes' ? activeTabClass : inactiveTabClass}`}>Notes</button>
                    </nav>
                </div>

                <div>
                    {activeTab === 'bookings' && (
                         <div className="space-y-2">
                             {sortedBookings.map(b => {
                                 const isFinalizeEnabled = editingJobs.some(job => 
                                     job.bookingId === b.id && 
                                     job.statusId === awaitingSelectionStatus?.id
                                 );

                                 return (
                                     <div key={b.id} className="bg-slate-900 rounded-lg">
                                         <button onClick={() => toggleBookingExpansion(b.id)} className="w-full flex justify-between items-center p-4 text-left">
                                             <div>
                                                <p className="font-semibold text-white">{b.sessionType}</p>
                                                <p className="text-sm text-slate-400">{formatDate(b.date)}</p>
                                             </div>
                                             <div className="flex items-center space-x-4">
                                                <StatusBadge status={b.status} />
                                                 <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-400 transition-transform ${expandedBookingId === b.id ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                             </div>
                                         </button>
                                         {expandedBookingId === b.id && (
                                            <PhotoSelectionManager 
                                                booking={b}
                                                canManage={canManageClients}
                                                onAdd={onAddPhotoSelection}
                                                onRemove={onRemovePhotoSelection}
                                                onFinalize={onFinalizeSelections}
                                                isFinalizeEnabled={isFinalizeEnabled}
                                            />
                                         )}
                                     </div>
                                 );
                             })}
                         </div>
                    )}
                    {activeTab === 'invoices' && (
                        <table className="w-full text-left">
                            <thead className="text-xs text-slate-400 uppercase">
                                <tr><th className="p-2">Invoice ID</th><th className="p-2">Amount</th><th className="p-2">Due Date</th><th className="p-2">Status</th></tr>
                            </thead>
                            <tbody>
                                {invoices.map(i => (
                                    <tr key={i.id} className="border-b border-slate-700">
                                        <td className="p-2 font-mono text-cyan-400 hover:underline cursor-pointer" onClick={() => onPreviewInvoice(i.id)}>
                                            {i.id}
                                        </td>
                                        <td className="p-2 font-medium text-white">{formatCurrency(i.amount)}</td>
                                        <td className="p-2 text-slate-300">{formatDate(i.dueDate)}</td>
                                        <td className="p-2"><InvoiceStatusBadge status={i.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                     {activeTab === 'history' && (
                        <ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
                             {clientActivities.length > 0 ? clientActivities.map(activity => (
                                <li key={activity.id} className="flex items-start space-x-4">
                                    <img src={activity.userAvatarUrl} alt={activity.user} className="w-10 h-10 rounded-full" />
                                    <div className="flex-1">
                                        <p className="text-slate-200">
                                            <span className="font-bold">{activity.user}</span> {activity.action} <span className="font-semibold text-cyan-400">{activity.target}</span>.
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">{timeSince(activity.timestamp)}</p>
                                    </div>
                                </li>
                            )) : <p className="text-center text-slate-500 py-4">No activities recorded for this client.</p>}
                        </ul>
                    )}
                    {activeTab === 'notes' && (
                        <div className="space-y-4">
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={8}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 whitespace-pre-wrap"
                                placeholder="Add private team notes about this client..."
                                readOnly={!canManageClients}
                            />
                            {canManageClients && (
                                <div className="flex justify-end">
                                    <button onClick={handleSaveNotes} className="py-2 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors">
                                        Save Notes
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
             {isEditModalOpen && canManageClients && (
                <Modal title={`Edit ${client.name}`} onClose={() => setIsEditModalOpen(false)}>
                    <ClientForm 
                        client={client}
                        onSave={handleSaveClient}
                        onCancel={() => setIsEditModalOpen(false)}
                    />
                </Modal>
            )}
        </div>
    );
};

export default ClientProfilePage;