import React from 'react';
import { Booking, Client, StaffMember, EditingJob, EditingStatus } from '../../types';
import { StaffIcon, MediaIcon, ClientsIcon } from '../../constants';

interface TeamPerformanceMetricsProps {
    bookings: Booking[];
    clients: Client[];
    staff: StaffMember[];
    editingJobs: EditingJob[];
    editingStatuses: EditingStatus[];
}

const MetricCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-slate-800 rounded-xl p-5 flex items-center">
        <div className="p-3 rounded-full bg-slate-700 mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
    </div>
);

// Icon for editors
const EditorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
    </svg>
);


const TeamPerformanceMetrics: React.FC<TeamPerformanceMetricsProps> = ({ bookings, clients, staff, editingJobs, editingStatuses }) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // 1. Top Photographer (This Month)
    const thisMonthBookings = bookings.filter(b => {
        const bookingDate = new Date(b.date);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    });
    
    let topPhotographerStat = 'N/A';
    if(thisMonthBookings.length > 0) {
        const photographerCounts = thisMonthBookings.reduce((acc, booking) => {
            if (booking.photographerId) {
                acc[booking.photographerId] = (acc[booking.photographerId] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const topPhotographerId = Object.keys(photographerCounts).sort((a, b) => photographerCounts[b] - photographerCounts[a])[0];
        if (topPhotographerId) {
            const topPhotographer = staff.find(s => s.id === topPhotographerId);
            if (topPhotographer) {
                topPhotographerStat = `${topPhotographer.name} (${photographerCounts[topPhotographerId]} Sesi)`;
            }
        }
    }

    // 2. Top Editor (This Month)
    const completedStatus = editingStatuses.find(s => s.name === 'Completed');
    let topEditorStat = 'N/A';
    if (completedStatus) {
        const thisMonthCompletedJobs = editingJobs.filter(job => {
            const jobDate = new Date(job.uploadDate); // Using uploadDate as a proxy for completion month
            return job.statusId === completedStatus.id &&
                   jobDate.getMonth() === currentMonth &&
                   jobDate.getFullYear() === currentYear;
        });

        if (thisMonthCompletedJobs.length > 0) {
            const editorCounts = thisMonthCompletedJobs.reduce((acc, job) => {
                if (job.editorId) {
                    acc[job.editorId] = (acc[job.editorId] || 0) + 1;
                }
                return acc;
            }, {} as Record<string, number>);

            const topEditorId = Object.keys(editorCounts).sort((a, b) => editorCounts[b] - editorCounts[a])[0];
            if (topEditorId) {
                const topEditor = staff.find(s => s.id === topEditorId);
                if (topEditor) {
                    topEditorStat = `${topEditor.name} (${editorCounts[topEditorId]} Jobs)`;
                }
            }
        }
    }


    // 3. Average Edit Time
    // Averages time from 'Ready for Edit' (approximated by uploadDate) to now for jobs in 'Client Review'.
    const clientReviewStatus = editingStatuses.find(s => s.name === 'Client Review');
    let avgEditTime = 'N/A';
    if (clientReviewStatus) {
        const jobsInReview = editingJobs.filter(j => j.statusId === clientReviewStatus.id);
        if (jobsInReview.length > 0) {
            const totalDays = jobsInReview.reduce((sum, job) => {
                const uploadDate = new Date(job.uploadDate);
                const diffTime = Math.abs(today.getTime() - uploadDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return sum + diffDays;
            }, 0);
            avgEditTime = `${(totalDays / jobsInReview.length).toFixed(1)} hari`;
        }
    }

    // 4. New Clients This Month
    const newClientsThisMonth = clients.filter(c => {
        const joinDate = new Date(c.joinDate);
        return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
    }).length;

    return (
        <div>
            <h2 className="text-xl font-semibold text-white mb-4">Team & Business Snapshot (Bulan Ini)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Fotografer Teratas" value={topPhotographerStat} icon={<StaffIcon />} />
                <MetricCard title="Editor Teratas" value={topEditorStat} icon={<EditorIcon />} />
                <MetricCard title="Rata-rata Waktu Edit" value={avgEditTime} icon={<MediaIcon />} />
                <MetricCard title="Klien Baru" value={`${newClientsThisMonth} Klien`} icon={<ClientsIcon />} />
            </div>
        </div>
    );
};

export default TeamPerformanceMetrics;