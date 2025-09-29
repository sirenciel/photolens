
import React from 'react';
import KPICard from './KPICard';
import RevenueChart from './RevenueChart';
import UpcomingBookings from './UpcomingBookings';
import RecentActivity from './RecentActivity';
import EmptyStateMessage from './EmptyStateMessage';
import { KPI, DashboardProps } from '../types';

const KPICardIcon1 = () => <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>;
const KPICardIcon2 = () => <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const KPICardIcon3 = () => <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const KPICardIcon4 = () => <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;

// FIX: Removed unused `mockUser` import and used `currentUser` from props.
const Dashboard: React.FC<DashboardProps> = ({ bookings, invoices, editingJobs, activities, revenueData, currentUser, setActivePage, navigateAndFilter }) => {
    const totalRevenue = revenueData.reduce((acc, item) => acc + item.revenue, 0);
    const upcomingBookingsCount = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending').length;
    const overdueInvoicesCount = invoices.filter(i => i.status === 'Overdue').length;
    const editingQueueCount = editingJobs.filter(j => j.statusId === 'status-1').length;

    // Check if this is a fresh installation with no data
    const hasNoData = bookings.length === 0 && invoices.length === 0 && activities.length === 0;

    const kpiData: KPI[] = [
        { title: 'Total Revenue', value: `$${(totalRevenue / 1000).toFixed(1)}k`, change: '+12.5%', changeType: 'increase', icon: <KPICardIcon1 /> },
        { title: 'Upcoming Bookings', value: upcomingBookingsCount.toString(), change: '+2 this week', changeType: 'increase', icon: <KPICardIcon2 />, onClick: () => navigateAndFilter('Bookings', { status: 'Confirmed' }) },
        { title: 'Overdue Invoices', value: overdueInvoicesCount.toString(), change: '-5.2%', changeType: 'decrease', icon: <KPICardIcon3 />, onClick: () => navigateAndFilter('Invoices', { status: 'Overdue' }) },
        { title: 'Editing Queue', value: editingQueueCount.toString(), change: '+3 new', changeType: 'increase', icon: <KPICardIcon4 />, onClick: () => navigateAndFilter('Editing', { status: 'status-1' }) },
    ];

    if (hasNoData && currentUser.name === 'Admin (local)') {
        return (
            <div className="min-h-screen">
                <EmptyStateMessage
                    title="Welcome to PhotoLens!"
                    message="Your photography business management system is ready, but your database needs some initial data to get started. Please follow the setup guide to add your first staff member, clients, and session types."
                    actionText="Go to Setup Guide"
                    onAction={() => window.open('/README-DATABASE-SETUP.md', '_blank')}
                />
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-100">Welcome back, {currentUser.name.split(' ')[0]}!</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiData.map((kpi, index) => (
                    <KPICard key={index} {...kpi} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <RevenueChart data={revenueData} />
                </div>
                <div className="lg:col-span-1">
                    <UpcomingBookings bookings={bookings} />
                </div>
            </div>

             <div className="grid grid-cols-1">
                 <RecentActivity activities={activities} />
            </div>
        </div>
    );
};

export default Dashboard;