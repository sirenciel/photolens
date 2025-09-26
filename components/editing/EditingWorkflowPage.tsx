import React, { useState, useMemo, useEffect } from 'react';
import JobCard from './JobCard';
import KanbanView from './KanbanView';
import TableView from './TableView';
import Modal from '../shared/Modal';
import JobForm from './JobForm';
import RevisionNotesModal from './RevisionNotesModal';
import { EditingWorkflowPageProps, EditingJob, Permission, UserRole } from '../../types';
import { hasPermission } from '../../services/permissions';

const EditingWorkflowPage: React.FC<EditingWorkflowPageProps> = ({ 
    jobs, 
    bookings, 
    staff,
    clients,
    editingStatuses, 
    currentUser, 
    onSaveJob, 
    onDeleteJob, 
    onUpdateJobStatus,
    onViewClient,
    onNotifyClientForReview,
    onRequestRevision,
    initialFilters
}) => {
    const [view, setView] = useState<'kanban' | 'table' | 'card'>('kanban');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<EditingJob | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(initialFilters?.status || 'All');
    const [editorFilter, setEditorFilter] = useState('All');
    const [clientFilter, setClientFilter] = useState(initialFilters?.clientId || 'All');

    const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
    const [jobForRevision, setJobForRevision] = useState<EditingJob | null>(null);
    const [revisionSaving, setRevisionSaving] = useState(false);

    const canManageEditing = hasPermission(currentUser.role, Permission.MANAGE_EDITING);

    useEffect(() => {
        if (initialFilters?.status) setStatusFilter(initialFilters.status);
        if (initialFilters?.clientId) setClientFilter(initialFilters.clientId);
    }, [initialFilters]);

    const filteredJobs = useMemo(() => {
        return jobs.filter(job => {
            const matchesSearch = searchTerm === '' ||
                job.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.bookingId.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'All' || job.statusId === statusFilter;
            
            const matchesEditor = editorFilter === 'All' || 
                                (editorFilter === 'unassigned' && job.editorId === null) ||
                                job.editorId === editorFilter;
            
            const matchesClient = clientFilter === 'All' || job.clientId === clientFilter;

            return matchesSearch && matchesStatus && matchesEditor && matchesClient;
        });
    }, [jobs, searchTerm, statusFilter, editorFilter, clientFilter]);

    const eligibleBookings = useMemo(() => {
        // Get all booking IDs that already have an editing job.
        const existingJobBookingIds = new Set(jobs.map(j => j.bookingId));

        // Filter for bookings that don't have a job yet.
        const unassignedBookings = bookings.filter(b => !existingJobBookingIds.has(b.id));

        // If we are editing a job, its current booking will be filtered out. We need to add it back to the list
        // so it appears as the selected option in the dropdown.
        if (editingJob) {
            const currentBookingForEditedJob = bookings.find(b => b.id === editingJob.bookingId);
            if (currentBookingForEditedJob) {
                // To avoid duplicates if logic changes, check if it's already there before adding.
                if (!unassignedBookings.some(b => b.id === currentBookingForEditedJob.id)) {
                    return [currentBookingForEditedJob, ...unassignedBookings];
                }
            }
        }
        
        return unassignedBookings;
    }, [bookings, jobs, editingJob]);


    const handleAddNew = () => {
        setEditingJob(null);
        setIsModalOpen(true);
    };

    const handleEdit = (job: EditingJob) => {
        setEditingJob(job);
        setIsModalOpen(true);
    };
    
    const handleSave = async (jobData: Omit<EditingJob, 'id' | 'clientName' | 'editorName' | 'editorAvatarUrl' | 'uploadDate'> & { id?: string }) => {
        try {
            await onSaveJob(jobData);
            setIsModalOpen(false);
            setEditingJob(null);
        } catch (error) {
            console.error('Failed to save editing job', error);
            alert('Unable to save editing job. Please try again.');
        }
    };

    const handleDelete = async (jobId: string) => {
        if (!window.confirm('Are you sure you want to delete this editing job?')) {
            return;
        }

        try {
            await onDeleteJob(jobId);
        } catch (error) {
            console.error('Failed to delete editing job', error);
            alert('Unable to delete editing job. Please try again.');
        }
    };

    const handleOpenRevisionModal = (job: EditingJob) => {
        setJobForRevision(job);
        setIsRevisionModalOpen(true);
        return Promise.resolve();
    };

    const handleSaveRevision = async (notes: string) => {
        if (!jobForRevision) {
            return;
        }

        try {
            setRevisionSaving(true);
            await onRequestRevision(jobForRevision.id, notes);
            setIsRevisionModalOpen(false);
            setJobForRevision(null);
        } catch (error) {
            console.error('Failed to request revision', error);
            alert('Unable to request revision. Please try again.');
        } finally {
            setRevisionSaving(false);
        }
    };


    const renderView = () => {
        switch (view) {
            case 'kanban':
                return <KanbanView jobs={filteredJobs} statuses={editingStatuses} onUpdateStatus={onUpdateJobStatus} onViewJob={handleEdit} onViewClient={onViewClient} onNotifyClient={onNotifyClientForReview} onRequestRevision={handleOpenRevisionModal} />;
            case 'table':
                return <TableView jobs={filteredJobs} statuses={editingStatuses} currentUser={currentUser} onEdit={handleEdit} onDelete={handleDelete} onViewClient={onViewClient} onNotifyClient={onNotifyClientForReview} onRequestRevision={handleOpenRevisionModal} />;
            case 'card':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredJobs.map(job => (
                            <JobCard key={job.id} job={job} statuses={editingStatuses} currentUser={currentUser} onEdit={handleEdit} onDelete={handleDelete} onViewClient={onViewClient} />
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    const baseButtonClass = "px-4 py-2 text-sm font-semibold rounded-md transition-colors";
    const activeButtonClass = "bg-cyan-500 text-white";
    const inactiveButtonClass = "bg-slate-700 text-slate-300 hover:bg-slate-600";
    const editors = staff.filter(s => s.role === UserRole.Editor || s.role === UserRole.Admin);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-100">Editing Workflow</h1>
                <div className="flex items-center space-x-4">
                     <div className="flex items-center p-1 bg-slate-800 rounded-lg">
                        <button onClick={() => setView('kanban')} className={`${baseButtonClass} ${view === 'kanban' ? activeButtonClass : inactiveButtonClass}`}>Kanban</button>
                        <button onClick={() => setView('table')} className={`${baseButtonClass} ${view === 'table' ? activeButtonClass : inactiveButtonClass}`}>Table</button>
                        <button onClick={() => setView('card')} className={`${baseButtonClass} ${view === 'card' ? activeButtonClass : inactiveButtonClass}`}>Card</button>
                    </div>
                   {canManageEditing && (
                     <button onClick={handleAddNew} className="flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Editing Job
                    </button>
                   )}
                </div>
            </div>
            
            <div className="bg-slate-800 rounded-xl p-4 flex items-center space-x-4">
                <div className="relative flex-grow">
                    <svg className="absolute w-5 h-5 text-slate-400 left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input 
                        type="text" 
                        placeholder="Search by client or booking ID..." 
                        className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    className="bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Statuses</option>
                    {editingStatuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select 
                    className="bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={editorFilter}
                    onChange={e => setEditorFilter(e.target.value)}
                >
                    <option value="All">All Editors</option>
                    {editors.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    <option value="unassigned">Unassigned</option>
                </select>
            </div>
            
            <div>{renderView()}</div>

            {isModalOpen && canManageEditing && (
                <Modal title={editingJob ? "Edit Editing Job" : "Add New Editing Job"} onClose={() => setIsModalOpen(false)}>
                    <JobForm 
                        job={editingJob}
                        bookings={eligibleBookings}
                        staff={staff}
                        clients={clients}
                        statuses={editingStatuses}
                        onSave={handleSave}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </Modal>
            )}

            {isRevisionModalOpen && jobForRevision && (
                <Modal title={`Request Revision for ${jobForRevision.clientName}`} onClose={() => setIsRevisionModalOpen(false)}>
                    <RevisionNotesModal
                        onSave={handleSaveRevision}
                        onClose={() => setIsRevisionModalOpen(false)}
                        isSaving={revisionSaving}
                    />
                </Modal>
            )}
        </div>
    );
};

export default EditingWorkflowPage;