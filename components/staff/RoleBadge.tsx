
import React from 'react';
import { UserRole } from '../../types';

interface RoleBadgeProps {
    role: UserRole;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
    const getRoleStyles = () => {
        switch (role) {
            case UserRole.Owner:
                return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
            case UserRole.Admin:
                return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
            case UserRole.Photographer:
                return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            case UserRole.Editor:
                return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
            case UserRole.Finance:
                return 'bg-green-500/20 text-green-300 border-green-500/30';
            default:
                return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleStyles()}`}>
            {role}
        </span>
    );
};

export default RoleBadge;