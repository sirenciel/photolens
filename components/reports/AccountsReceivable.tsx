
import React from 'react';
import { Invoice } from '../../types';

interface AccountsReceivableProps {
    invoices: Invoice[];
}

const AccountsReceivable: React.FC<AccountsReceivableProps> = ({ invoices }) => {
    const today = new Date();
    
    const ar = {
        current: 0,
        '1-30': 0,
        '31-60': 0,
        '61+': 0,
    };

    invoices.filter(i => i.status !== 'Paid').forEach(invoice => {
        const dueDate = invoice.dueDate;
        const diffDays = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));
        
        if (diffDays <= 0) {
            ar.current += invoice.amount;
        } else if (diffDays <= 30) {
            ar['1-30'] += invoice.amount;
        } else if (diffDays <= 60) {
            ar['31-60'] += invoice.amount;
        } else {
            ar['61+'] += invoice.amount;
        }
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
    };

    const arData = [
        { label: 'Current', value: ar.current, color: 'bg-green-500' },
        { label: '1-30 Days Overdue', value: ar['1-30'], color: 'bg-yellow-500' },
        { label: '31-60 Days Overdue', value: ar['31-60'], color: 'bg-orange-500' },
        { label: '61+ Days Overdue', value: ar['61+'], color: 'bg-red-500' },
    ];
    
    const totalReceivable = arData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Accounts Receivable Aging</h3>
            <div className="space-y-4">
                {arData.map(item => (
                    <div key={item.label}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-slate-300">{item.label}</span>
                            <span className="text-sm font-semibold text-white">{formatCurrency(item.value)}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                            <div 
                                className={`${item.color} h-2.5 rounded-full`} 
                                style={{ width: `${(item.value / totalReceivable * 100)}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-700 flex justify-between">
                <span className="font-bold text-white">Total Receivable</span>
                <span className="font-bold text-cyan-400">{formatCurrency(totalReceivable)}</span>
            </div>
        </div>
    );
};

export default AccountsReceivable;
