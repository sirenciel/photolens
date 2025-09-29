import React, { useState, useMemo } from 'react';
import { ExpensesPageProps, Expense, Permission } from '../../types';
import { hasPermission } from '../../services/permissions';
import Modal from '../shared/Modal';
import ExpensesTable from './ExpensesTable';
import ExpenseForm from './ExpenseForm';

const expenseCategories: Expense['category'][] = ['Software', 'Studio', 'Marketing', 'Gear', 'Travel', 'Other'];

const ExpensesPage: React.FC<ExpensesPageProps> = ({ expenses, bookings, paymentAccounts, currentUser, onSaveExpense, onDeleteExpense, onBillExpense }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    const canManageExpenses = hasPermission(currentUser.role, Permission.MANAGE_EXPENSES);

    const filteredExpenses = useMemo(() => {
        return expenses.filter(expense => {
            const matchesSearch = searchTerm === '' ||
                expense.description.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesCategory = categoryFilter === 'All' || expense.category === categoryFilter;

            return matchesSearch && matchesCategory;
        });
    }, [expenses, searchTerm, categoryFilter]);

    const handleAddNew = () => {
        setEditingExpense(null);
        setIsModalOpen(true);
    };

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const handleSave = async (expenseData: Omit<Expense, 'id'> & { id?: string }) => {
        await onSaveExpense(expenseData);
        setIsModalOpen(false);
    };

    const handleDelete = async (expenseId: string) => {
        if (window.confirm('Are you sure you want to delete this expense record?')) {
            await onDeleteExpense(expenseId);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-100">Expenses</h1>
                {canManageExpenses && (
                    <button 
                        onClick={handleAddNew}
                        className="flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add New Expense
                    </button>
                )}
            </div>
            
            <div className="bg-slate-800 rounded-xl p-4 flex items-center space-x-4">
                <div className="relative flex-grow">
                    <svg className="absolute w-5 h-5 text-slate-400 left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input 
                        type="text" 
                        placeholder="Search by description..." 
                        className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    className="bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                >
                    <option value="All">All Categories</option>
                    {expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>

            <ExpensesTable
                expenses={filteredExpenses}
                paymentAccounts={paymentAccounts}
                currentUser={currentUser}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onBillExpense={onBillExpense}
            />

            {isModalOpen && canManageExpenses && (
                <Modal title={editingExpense ? "Edit Expense" : "Add New Expense"} onClose={() => setIsModalOpen(false)}>
                    <ExpenseForm
                        expense={editingExpense}
                        bookings={bookings}
                        paymentAccounts={paymentAccounts}
                        onSave={handleSave}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </Modal>
            )}
        </div>
    );
};

export default ExpensesPage;
