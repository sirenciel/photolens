import React, { useState, useEffect } from 'react';
import { ExpenseFormProps, Expense } from '../../types';

const expenseCategories: Expense['category'][] = ['Software', 'Studio', 'Marketing', 'Gear', 'Travel', 'Other'];

const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, bookings, paymentAccounts, onSave, onCancel }) => {
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<Expense['category']>('Other');
    const [date, setDate] = useState('');
    const [amount, setAmount] = useState<number | ''>('');
    const [accountId, setAccountId] = useState('');
    const [bookingId, setBookingId] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (expense) {
            setDescription(expense.description);
            setCategory(expense.category);
            setDate(new Date(expense.date).toISOString().split('T')[0]);
            setAmount(expense.amount);
            setAccountId(expense.accountId);
            setBookingId(expense.bookingId);
        } else {
            const today = new Date();
            const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
            setDate(localDate.toISOString().split('T')[0]);
            setDescription('');
            setCategory('Other');
            setAmount('');
            setAccountId(paymentAccounts[0]?.id || '');
            setBookingId(undefined);
        }
    }, [expense, paymentAccounts]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount === '' || amount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }
        if (!accountId) {
            alert('Please select an account to pay from.');
            return;
        }
        onSave({
            id: expense?.id,
            description,
            category,
            date: new Date(date),
            amount,
            accountId,
            bookingId: bookingId || undefined,
        });
    };
    
    // Sort bookings by most recent date for easier selection
    const sortedBookings = [...bookings].sort((a, b) => b.date.getTime() - a.date.getTime());

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-300">Description</label>
                <input
                    type="text"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder="e.g., Adobe Creative Cloud Subscription"
                    className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
            </div>
             <div>
                <label htmlFor="booking" className="block text-sm font-medium text-slate-300">Associated Booking (Optional)</label>
                <select
                    id="booking"
                    value={bookingId || ''}
                    onChange={(e) => setBookingId(e.target.value || undefined)}
                    className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                    <option value="">None</option>
                    {sortedBookings.map(b => (
                        <option key={b.id} value={b.id}>
                            {new Date(b.date).toLocaleDateString()} - {b.clientName} ({b.sessionType})
                        </option>
                    ))}
                </select>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-slate-300">Category</label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as Expense['category'])}
                        required
                        className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        {expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="account" className="block text-sm font-medium text-slate-300">Paid From Account</label>
                    <select
                        id="account"
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        required
                        className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="" disabled>Select an account</option>
                        {paymentAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-slate-300">Amount</label>
                     <div className="relative mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-slate-400 sm:text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(parseFloat(e.target.value) || '')}
                            required
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            className="block w-full pl-7 bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-slate-300">Date</label>
                    <input
                        type="date"
                        id="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
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
                    Save Expense
                </button>
            </div>
        </form>
    );
};

export default ExpenseForm;
