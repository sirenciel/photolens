
import React from 'react';
import { StaffMember, Permission, UserRole } from '../../types';
import RoleBadge from './RoleBadge';
import { hasPermission } from '../../services/permissions';

interface StaffTableProps {
    staff: StaffMember[];
    currentUser: StaffMember;
    onEdit: (staffMember: StaffMember) => void;
    onDelete: (staffId: string) => void;
}

const StaffTable: React.FC<StaffTableProps> = ({ staff, currentUser, onEdit, onDelete }) => {
    
    const canManageStaff = hasPermission(currentUser.role, Permission.MANAGE_STAFF);

    const timeSince = (date: Date): string => {
        if (date.getFullYear() < 2023) return '-';
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " year(s) ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " month(s) ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " day(s) ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hour(s) ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minute(s) ago";
        return "Just now";
    };

    const getStatusIndicatorColor = (status: StaffMember['status']) => {
        switch (status) {
            case 'Active': return 'bg-green-500';
            case 'Invited': return 'bg-yellow-500';
            case 'Inactive': return 'bg-slate-500';
        }
    }

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-900">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Last Login</th>
                            {canManageStaff && <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {staff.map(member => (
                            <tr key={member.id} className="hover:bg-slate-900/50 transition-colors">
                                <td className="p-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img className="h-10 w-10 rounded-full object-cover" src={member.avatarUrl} alt={member.name} />
                                        <div className="ml-3">
                                            <p className="font-medium text-white">{member.name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-300 whitespace-nowrap">{member.email}</td>
                                <td className="p-4 whitespace-nowrap"><RoleBadge role={member.role} /></td>
                                <td className="p-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className={`h-2.5 w-2.5 rounded-full mr-2 ${getStatusIndicatorColor(member.status)}`}></div>
                                        <span className="text-slate-300">{member.status}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-300 whitespace-nowrap">{timeSince(member.lastLogin)}</td>
                                {canManageStaff && (
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <button 
                                                onClick={() => onEdit(member)}
                                                className="p-1 text-slate-400 hover:text-cyan-400 transition-colors" title="Edit Role">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                            </button>
                                            {/* Prevent deleting yourself or the owner */}
                                            {currentUser.id !== member.id && member.role !== UserRole.Owner && (
                                                <button 
                                                    onClick={() => onDelete(member.id)}
                                                    className="p-1 text-slate-400 hover:text-red-500 transition-colors" title="Delete User">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StaffTable;