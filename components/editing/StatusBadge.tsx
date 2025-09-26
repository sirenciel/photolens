
import React from 'react';
import { EditingStatus } from '../../types';

interface StatusBadgeProps {
    statusId: string;
    statuses: EditingStatus[];
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ statusId, statuses }) => {
    const status = statuses.find(s => s.id === statusId);

    const getStatusStyles = () => {
        if (!status) return 'bg-slate-500/20 text-slate-300 border-slate-500/30';

        const color = status.color;
        // The classes need to be spelled out for Tailwind's JIT compiler
        switch (color) {
            case 'green': return 'bg-green-500/20 text-green-300 border-green-500/30';
            case 'purple': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
            case 'blue': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            case 'yellow': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
            case 'slate': return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
            default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyles()} bg-slate-900/50 backdrop-blur-sm`}>
             <svg className="-ml-0.5 mr-1.5 h-2 w-2" fill="currentColor" viewBox="0 0 8 8">
                <circle cx={4} cy={4} r={3} />
            </svg>
            {status?.name || 'Unknown'}
        </span>
    );
};

export default StatusBadge;
