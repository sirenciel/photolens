import React from 'react';
import ProfitLossChart from './ProfitLossChart';
import RevenueBySessionChart from './RevenueBySessionChart';
import AccountsReceivable from './AccountsReceivable';
import { ReportsPageProps, Invoice, Expense, PandLData, SessionRevenue, SessionCategory, Booking } from '../../types';
import TeamPerformanceMetrics from './TeamPerformanceMetrics';
import BookingProfitability from './BookingProfitability';

const ReportStatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
    <div className="bg-slate-800 rounded-xl p-6">
        <p className="text-sm text-slate-400">{title}</p>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
);

const ReportsPage: React.FC<ReportsPageProps> = ({ 
    invoices, 
    expenses, 
    sessionTypes, 
    bookings, 
    currentUser, 
    navigateAndFilter,
    clients,
    staff,
    editingJobs,
    editingStatuses
}) => {
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
    };

    const calculatePandLData = (invoices: Invoice[], expenses: Expense[]): PandLData[] => {
        const dataByMonth: { [key: string]: { revenue: number, expenses: number } } = {};
        const monthOrder: string[] = [];
    
        // Process revenue from paid invoices
        invoices.forEach(invoice => {
            if (invoice.payments) {
                invoice.payments.forEach(payment => {
                    const date = payment.date;
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    if (!dataByMonth[key]) {
                        dataByMonth[key] = { revenue: 0, expenses: 0 };
                        monthOrder.push(key);
                    }
                    dataByMonth[key].revenue += payment.amount;
                });
            }
        });
    
        // Process expenses
        expenses.forEach(expense => {
            const date = expense.date;
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!dataByMonth[key]) {
                dataByMonth[key] = { revenue: 0, expenses: 0 };
                 monthOrder.push(key);
            }
            dataByMonth[key].expenses += expense.amount;
        });
    
        // Sort keys chronologically
        const sortedKeys = [...new Set(monthOrder)].sort();

        // Convert to array
        return sortedKeys.map(key => {
            const [year, monthNum] = key.split('-');
            const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString('default', { month: 'short' });
            return {
                month: `${monthName} '${year.slice(2)}`,
                ...dataByMonth[key]
            };
        });
    };
    
    const calculateSessionRevenue = (bookings: Booking[], invoices: Invoice[], sessionTypes: SessionCategory[]): SessionRevenue[] => {
        const revenueMap: { [key: string]: number } = {};

        invoices.forEach(invoice => {
            const booking = bookings.find(b => b.id === invoice.bookingId);
            if (booking) {
                if (!revenueMap[booking.sessionCategoryId]) {
                    revenueMap[booking.sessionCategoryId] = 0;
                }
                revenueMap[booking.sessionCategoryId] += invoice.amountPaid;
            }
        });

        return sessionTypes.map(st => ({
            id: st.id,
            name: st.name,
            value: revenueMap[st.id] || 0
        })).filter(sr => sr.value > 0);
    };


    const pandLData = calculatePandLData(invoices, expenses);
    const sessionRevenue = calculateSessionRevenue(bookings, invoices, sessionTypes);
    const totalRevenue = pandLData.reduce((acc, month) => acc + month.revenue, 0);
    const totalExpenses = pandLData.reduce((acc, month) => acc + month.expenses, 0);
    const netProfit = totalRevenue - totalExpenses;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-100">Financial Reports</h1>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-slate-800 rounded-lg">
                        <button className="px-4 py-2 text-sm font-semibold text-white bg-cyan-500 rounded-l-lg">Last 90d</button>
                        <button className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">Last 6m</button>
                        <button className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-r-lg">All Time</button>
                    </div>
                    <button className="flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export Report
                    </button>
                </div>
            </div>

            {/* P&L Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ReportStatCard title="Gross Revenue" value={formatCurrency(totalRevenue)} color="text-green-400" />
                <ReportStatCard title="Total Expenses" value={formatCurrency(totalExpenses)} color="text-red-400" />
                <ReportStatCard title="Net Profit" value={formatCurrency(netProfit)} color="text-cyan-400" />
            </div>

            {/* Team & Business Snapshot */}
             <TeamPerformanceMetrics
                bookings={bookings}
                clients={clients}
                staff={staff}
                editingJobs={editingJobs}
                editingStatuses={editingStatuses}
            />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <ProfitLossChart data={pandLData} navigateAndFilter={navigateAndFilter} />
                </div>
                <div className="lg:col-span-2">
                    <RevenueBySessionChart data={sessionRevenue} navigateAndFilter={navigateAndFilter} />
                </div>
            </div>

            {/* Booking Profitability */}
             <BookingProfitability
                bookings={bookings}
                invoices={invoices}
                expenses={expenses}
            />
            
            {/* A/R Aging */}
            <div className="grid grid-cols-1">
                <AccountsReceivable invoices={invoices} />
            </div>

        </div>
    );
};

export default ReportsPage;