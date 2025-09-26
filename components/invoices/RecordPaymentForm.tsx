import React, { useState } from 'react';
import { RecordPaymentFormProps, Payment } from '../../types';

const RecordPaymentForm: React.FC<RecordPaymentFormProps> = ({ invoice, paymentAccounts, onSave, onCancel }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
    const todayString = localDate.toISOString().split('T')[0];

    const amountDue = invoice.amount - invoice.amountPaid;
    
    const [paymentDate, setPaymentDate] = useState(todayString);
    const [amount, setAmount] = useState<number | ''>(amountDue > 0 ? amountDue : '');
    const [accountId, setAccountId] = useState(paymentAccounts[0]?.id || '');
    const [methodNotes, setMethodNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (typeof amount !== 'number' || amount <= 0) {
            alert("Please enter a valid payment amount.");
            return;
        }
        if (!accountId) {
            alert("Please select a payment account.");
            return;
        }
        onSave({
            date: new Date(paymentDate),
            amount: Number(amount),
            accountId,
            methodNotes,
        });
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
             <div className="bg-slate-900/50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm font-medium text-slate-400">Total Invoice</p>
                        <p className="font-semibold text-white text-lg">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.amount)}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-400">Sisa Tagihan</p>
                        <p className="font-semibold text-cyan-400 text-lg">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amountDue)}</p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="payment-date" className="block text-sm font-medium text-slate-300">Tanggal Pembayaran</label>
                    <input
                        type="date"
                        id="payment-date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        required
                        className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
                 <div>
                    <label htmlFor="payment-amount" className="block text-sm font-medium text-slate-300">Jumlah</label>
                    <div className="relative mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-slate-400 sm:text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            id="payment-amount"
                            value={amount}
                            onChange={(e) => setAmount(parseFloat(e.target.value) || '')}
                            required
                            step="0.01"
                            min="0.01"
                            max={amountDue > 0 ? amountDue : undefined}
                            placeholder="0.00"
                            className="block w-full pl-7 bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                </div>
            </div>
            <div>
                <label htmlFor="payment-account" className="block text-sm font-medium text-slate-300">Deposit to Account</label>
                <select
                    id="payment-account"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    required
                    className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                    <option value="" disabled>Select an account</option>
                    {paymentAccounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="payment-notes" className="block text-sm font-medium text-slate-300">Catatan (Opsional)</label>
                <textarea
                    id="payment-notes"
                    value={methodNotes}
                    onChange={(e) => setMethodNotes(e.target.value)}
                    rows={3}
                    placeholder="e.g., Transaction ID, check number, paid via QRIS, etc."
                    className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
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
                    Save Payment
                </button>
            </div>
        </form>
    );
};

export default RecordPaymentForm;
