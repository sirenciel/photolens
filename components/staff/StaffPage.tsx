import React, { useState, useMemo } from 'react';
import StaffTable from './StaffTable';
import Modal from '../shared/Modal';
import StaffForm from './StaffForm';
import { StaffPageProps, StaffMember, Permission, UserRole } from '../../types';
import { hasPermission } from '../../services/permissions';

const StaffPage: React.FC<StaffPageProps> = ({ staff, currentUser, onSaveStaff, onDeleteStaff }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    const canManageStaff = hasPermission(currentUser.role, Permission.MANAGE_STAFF);

    const filteredStaff = useMemo(() => {
        return staff.filter(member => {
            const matchesSearch = searchTerm === '' ||
                member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.email.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesRole = roleFilter === 'All' || member.role === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [staff, searchTerm, roleFilter]);


    const handleInvite = () => {
        setEditingStaff(null);
        setIsModalOpen(true);
    };

    const handleEdit = (staffMember: StaffMember) => {
        setEditingStaff(staffMember);
        setIsModalOpen(true);
    };
    
    const handleSave = (staffData: Omit<StaffMember, 'id' | 'status' | 'lastLogin' | 'avatarUrl'> & { id?: string }) => {
        onSaveStaff(staffData);
        setIsModalOpen(false);
    };

    const handleDelete = (staffId: string) => {
        if (window.confirm('Are you sure you want to delete this staff member?')) {
            onDeleteStaff(staffId);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-100">Staff Management</h1>
                {canManageStaff && (
                    <button 
                        onClick={handleInvite}
                        className="flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Invite New Member
                    </button>
                )}
            </div>
            
            {/* Filter and Search Section */}
            <div className="bg-slate-800 rounded-xl p-4 flex items-center space-x-4">
                <div className="relative flex-grow">
                    <svg className="absolute w-5 h-5 text-slate-400 left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    className="bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                >
                    <option value="All">All Roles</option>
                    {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                </select>
            </div>

            <StaffTable 
                staff={filteredStaff} 
                currentUser={currentUser}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {isModalOpen && canManageStaff && (
                <Modal title={editingStaff ? "Edit Staff Member" : "Invite New Member"} onClose={() => setIsModalOpen(false)}>
                    <StaffForm
                        staffMember={editingStaff}
                        onSave={handleSave}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </Modal>
            )}
        </div>
    );
};

export default StaffPage;