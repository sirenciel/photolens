import React from 'react';
import { ClientCardProps, Permission, ClientFinancialStatus } from '../../types';
import { hasPermission } from '../../services/permissions';

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

    return (
        <span className={`absolute top-4 left-4 inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyles()}`}>
            {status}
        </span>
    );
};


const ClientCard: React.FC<ClientCardProps> = ({ client, currentUser, onViewProfile, onDelete }) => {
    
    const canManageClients = hasPermission(currentUser.role, Permission.MANAGE_CLIENTS);

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click when deleting
        onDelete(client.id);
    };

    return (
        <div 
            className="bg-slate-800 rounded-xl shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 transform hover:-translate-y-1 flex flex-col cursor-pointer relative"
            onClick={() => onViewProfile(client.id)}
        >
            <FinancialStatusBadge status={client.financialStatus} />

            <div className="p-6 pt-12 flex flex-col items-center text-center flex-grow">
                <img className="w-24 h-24 rounded-full object-cover ring-4 ring-slate-700" src={client.avatarUrl} alt={client.name} />
                <h3 className="mt-4 text-xl font-semibold text-white">{client.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{client.email}</p>
            </div>
            
            <div className="bg-slate-900/50 p-4 grid grid-cols-2 gap-4 text-center">
                <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Bookings</p>
                    <p className="text-lg font-bold text-white">{client.totalBookings}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Spent</p>
                    <p className="text-lg font-bold text-white">${(client.totalSpent / 1000).toFixed(1)}k</p>
                </div>
            </div>
            
            {canManageClients && (
                <div className="p-2 border-t border-slate-700/50 flex items-center justify-end">
                    <button 
                        onClick={handleDeleteClick}
                        className="p-2 rounded-lg bg-slate-700 hover:bg-red-500 text-slate-400 hover:text-white transition-colors duration-200"
                        title="Delete Client"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ClientCard;