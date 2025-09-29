import React from 'react';
import { Booking, Invoice, Expense } from '../../types';

interface BookingProfitabilityProps {
    bookings: Booking[];
    invoices: Invoice[];
    expenses: Expense[];
}

interface ProfitabilityData {
    bookingId: string;
    clientName: string;
    sessionType: string;
    date: Date;
    revenue: number;
    costs: number;
    profit: number;
}

const BookingProfitability: React.FC<BookingProfitabilityProps> = ({ bookings, invoices, expenses }) => {
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };


    const profitabilityData: ProfitabilityData[] = bookings.map(booking => {
        const invoice = booking.invoiceId ? invoices.find(inv => inv.id === booking.invoiceId) : undefined;
        const revenue = invoice ? invoice.amount : 0;
        
        const linkedExpenses = expenses.filter(exp => exp.bookingId === booking.id);
        const costs = linkedExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        const profit = revenue - costs;

        return {
            bookingId: booking.id,
            clientName: booking.clientName,
            sessionType: booking.sessionType,
            date: booking.date,
            revenue,
            costs,
            profit,
        };
    }).filter(p => p.revenue > 0 || p.costs > 0) // Only show bookings with financial data
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Profitabilitas per Booking</h2>
            <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left">
                    <thead className="bg-slate-900 sticky top-0">
                        <tr>
                            <th className="p-3 text-sm font-semibold text-slate-400 uppercase tracking-wider">Client & Session</th>
                            <th className="p-3 text-sm font-semibold text-slate-400 uppercase tracking-wider text-right">Revenue</th>
                            <th className="p-3 text-sm font-semibold text-slate-400 uppercase tracking-wider text-right">Costs</th>
                            <th className="p-3 text-sm font-semibold text-slate-400 uppercase tracking-wider text-right">Net Profit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {profitabilityData.map(data => (
                            <tr key={data.bookingId} className="hover:bg-slate-900/50">
                                <td className="p-3">
                                    <p className="font-medium text-white">{data.clientName}</p>
                                    <p className="text-sm text-slate-400">{data.sessionType} on {formatDate(data.date)}</p>
                                </td>
                                <td className="p-3 text-right font-mono text-green-400">{formatCurrency(data.revenue)}</td>
                                <td className="p-3 text-right font-mono text-red-400">({formatCurrency(data.costs)})</td>
                                <td className={`p-3 text-right font-mono font-bold ${data.profit >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                                    {formatCurrency(data.profit)}
                                </td>
                            </tr>
                        ))}
                         {profitabilityData.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center p-8 text-slate-500">
                                    No booking financial data to display. Link expenses to bookings to see profitability.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BookingProfitability;
