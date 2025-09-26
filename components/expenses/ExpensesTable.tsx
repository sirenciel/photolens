import React from 'react';
import { Expense, Permission, StaffMember, PaymentAccount } from '../../types';
import { hasPermission } from '../../services/permissions';

interface ExpensesTableProps {
    expenses: Expense[];
    currentUser: StaffMember;
    paymentAccounts: PaymentAccount[];
    onEdit: (expense: Expense) => void;
    onDelete: (expenseId: string) => void;
    onBillExpense: (expenseId: string) => void;
}

const ExpensesTable: React.FC<ExpensesTableProps> = ({ expenses, currentUser, paymentAccounts, onEdit, onDelete, onBillExpense }) => {
    const canManageExpenses = hasPermission(currentUser.role, Permission.MANAGE_EXPENSES);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const getAccountName = (accountId: string) => {
        return paymentAccounts.find(acc => acc.id === accountId)?.name || 'N/A';
    };

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-900">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Description</th>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Paid From</th>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Billing</th>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                            {canManageExpenses && <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {expenses.map(expense => (
                            <tr key={expense.id} className="hover:bg-slate-900/50 transition-colors">
                                <td className="p-4 text-white font-medium whitespace-nowrap">{expense.description}</td>
                                <td className="p-4 text-slate-300 whitespace-nowrap">{expense.category}</td>
                                <td className="p-4 text-slate-300 whitespace-nowrap">{getAccountName(expense.accountId)}</td>
                                <td className="p-4 text-slate-300 whitespace-nowrap">{formatDate(expense.date)}</td>
                                <td className="p-4 text-slate-300 whitespace-nowrap">
                                    {expense.isBilled ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
                                            <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8"><circle cx={4} cy={4} r={3} /></svg>
                                            Billed
                                        </span>
                                    ) : expense.bookingId && canManageExpenses ? (
                                        <button
                                            onClick={() => onBillExpense(expense.id)}
                                            className="flex items-center text-xs py-1 px-2 rounded-md bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-white transition-colors"
                                            title={`Add this expense to the invoice for booking ${expense.bookingId}`}
                                        >
                                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                            </svg>
                                            Add to Invoice
                                        </button>
                                    ) : (
                                        <span className="text-slate-500">-</span>
                                    )}
                                </td>
                                <td className="p-4 text-white font-semibold whitespace-nowrap text-right font-mono">{formatCurrency(expense.amount)}</td>
                                {canManageExpenses && (
                                    <td className="p-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button 
                                                onClick={() => onEdit(expense)}
                                                className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
                                                title="Edit Expense"
                                            >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                            </button>
                                            <button 
                                                onClick={() => onDelete(expense.id)}
                                                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                                title="Delete Expense"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <div className="p-4 flex justify-between items-center bg-slate-900">
                <span className="text-sm text-slate-400">Showing 1 to {expenses.length} of {expenses.length} results</span>
            </div>
        </div>
    );
};

export default ExpensesTable;
