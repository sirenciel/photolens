import React, { useState, useMemo } from 'react';
import ClientCard from './ClientCard';
import Modal from '../shared/Modal';
import ClientForm from './ClientForm';
import { ClientsPageProps, Client, Permission, ClientFinancialStatus } from '../../types';
import { hasPermission } from '../../services/permissions';

const ClientsPage: React.FC<ClientsPageProps> = ({ clients, currentUser, onSaveClient, onDeleteClient, onViewProfile }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    
    const canManageClients = hasPermission(currentUser.role, Permission.MANAGE_CLIENTS);

    const handleAddNew = () => {
        setIsModalOpen(true);
    };

    const handleSave = async (clientData: Omit<Client, 'id' | 'joinDate' | 'totalBookings' | 'totalSpent'> & { id?: string }) => {
        await onSaveClient(clientData);
        setIsModalOpen(false);
    };

    const handleDelete = (clientId: string) => {
        if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
            onDeleteClient(clientId);
        }
    }

    const filteredClients = useMemo(() => {
        return clients.filter(client => {
            const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.email.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'All' || client.financialStatus === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [clients, searchTerm, statusFilter]);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-100">Clients</h1>
                {canManageClients && (
                    <button 
                        onClick={handleAddNew}
                        className="flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add New Client
                    </button>
                )}
            </div>
            
            <div className="bg-slate-800 rounded-xl p-4 flex items-center space-x-4">
                <div className="relative flex-grow">
                    <svg className="absolute w-5 h-5 text-slate-400 left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input 
                        type="text" 
                        placeholder="Search by client name or email..." 
                        className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                 <select 
                    className="bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Statuses</option>
                    <option value="Good Standing">Good Standing</option>
                    <option value="Overdue">Overdue</option>
                    <option value="High Value">High Value</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredClients.map(client => (
                    <ClientCard 
                        key={client.id} 
                        client={client} 
                        currentUser={currentUser}
                        onViewProfile={onViewProfile}
                        onDelete={handleDelete}
                    />
                ))}
            </div>

            {isModalOpen && canManageClients && (
                <Modal title="Add New Client" onClose={() => setIsModalOpen(false)}>
                    <ClientForm 
                        onSave={handleSave}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </Modal>
            )}
        </div>
    );
};

export default ClientsPage;
