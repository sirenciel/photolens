
import React from 'react';
import { Invoice } from '../../types';

interface InvoiceStatusBadgeProps {
    status: Invoice['status'];
}

const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({ status }) => {
    const getStatusStyles = () => {
        switch (status) {
            case 'Paid':
                return 'bg-green-500/20 text-green-300 border-green-500/30';
            case 'Overdue':
                return 'bg-red-500/20 text-red-300 border-red-500/30';
            case 'Sent':
                return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            default:
                return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyles()}`}>
            <svg className="-ml-0.5 mr-1.5 h-2 w-2" fill="currentColor" viewBox="0 0 8 8">
                <circle cx={4} cy={4} r={3} />
            </svg>
            {status}
        </span>
    );
};

export default InvoiceStatusBadge;
