
import React, { useState, useEffect } from 'react';
import { StaffFormProps, UserRole } from '../../types';

const StaffForm: React.FC<StaffFormProps> = ({ staffMember, onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.Photographer);

    useEffect(() => {
        if (staffMember) {
            setName(staffMember.name);
            setEmail(staffMember.email);
            setRole(staffMember.role);
        } else {
            setName('');
            setEmail('');
            setRole(UserRole.Photographer);
        }
    }, [staffMember]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: staffMember?.id, name, email, role });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="staff-name" className="block text-sm font-medium text-slate-300">Full Name</label>
                <input
                    type="text"
                    id="staff-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
            </div>
            <div>
                <label htmlFor="staff-email" className="block text-sm font-medium text-slate-300">Email Address</label>
                <input
                    type="email"
                    id="staff-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
            </div>
            <div>
                <label htmlFor="staff-role" className="block text-sm font-medium text-slate-300">Role</label>
                <select
                    id="staff-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    required
                    className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                    {Object.values(UserRole).map(roleValue => (
                        <option key={roleValue} value={roleValue}>{roleValue}</option>
                    ))}
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
                    {staffMember ? 'Save Changes' : 'Send Invite'}
                </button>
            </div>
        </form>
    );
};

export default StaffForm;
