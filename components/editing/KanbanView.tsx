import React, { useState } from 'react';
import { EditingJob, EditingStatus, KanbanViewProps } from '../../types';
import StatusBadge from './StatusBadge';
import { WhatsAppIcon, GoogleDriveIcon, UrgentIcon, HighPriorityIcon } from '../../constants';

const KanbanCard: React.FC<{ 
    job: EditingJob;
    statuses: EditingStatus[];
    onDragStart: (e: React.DragEvent<HTMLDivElement>, jobId: string) => void; 
    onViewJob: (job: EditingJob) => void;
    onViewClient: (clientId: string) => void;
    onNotifyClient: (jobId: string) => void;
    onRequestRevision: (job: EditingJob) => void;
}> = ({ job, statuses, onDragStart, onViewJob, onViewClient, onNotifyClient, onRequestRevision }) => {
    
    const handleClientClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card's onViewJob from firing
        onViewClient(job.clientId);
    };
    
    const handleNotifyClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await onNotifyClient(job.id);
    };
    
    const handleDriveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };


    const status = statuses.find(s => s.id === job.statusId);
    const isReviewStatus = status?.name === 'Client Review';

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, job.id)}
            onClick={() => onViewJob(job)}
            className="bg-slate-800 p-3 rounded-lg shadow-md cursor-grab active:cursor-grabbing mb-3 border-l-4 border-cyan-500 hover:bg-slate-700"
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.5">
                    {job.priority === 'Urgent' && <UrgentIcon className="h-4 w-4 text-red-400 flex-shrink-0" title="Urgent Priority" />}
                    {job.priority === 'High' && <HighPriorityIcon className="h-4 w-4 text-yellow-400 flex-shrink-0" title="High Priority" />}
                    <p 
                        className="font-bold text-slate-100 text-sm hover:text-cyan-400 cursor-pointer"
                        onClick={handleClientClick}
                    >
                        {job.clientName}
                    </p>
                </div>
                {job.driveFolderUrl && (
                    <a href={job.driveFolderUrl} target="_blank" rel="noopener noreferrer" onClick={handleDriveClick} title="Open Google Drive Folder">
                        <GoogleDriveIcon className="h-5 w-5 text-slate-400 hover:text-white" />
                    </a>
                )}
            </div>

            <p className="text-xs text-slate-400 mb-2 font-mono">{job.bookingId}</p>
            {isReviewStatus && (
                 <div className="flex items-center space-x-2 mb-2">
                    <button 
                        onClick={handleNotifyClick}
                        className="w-full text-left text-xs py-1 px-2 rounded-md bg-green-500/20 text-green-300 hover:bg-green-500 hover:text-white transition-colors flex items-center"
                        title="Notify client for review via WhatsApp"
                    >
                        <WhatsAppIcon className="h-4 w-4 mr-1.5" />
                        Notify (WA)
                    </button>
                    <button 
                        onClick={async (e) => { e.stopPropagation(); await onRequestRevision(job); }}
                        className="w-full text-left text-xs py-1 px-2 rounded-md bg-purple-500/20 text-purple-300 hover:bg-purple-500 hover:text-white transition-colors flex items-center"
                        title="Request a revision for this job"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 11.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-5.586l-1.707 1.707a1 1 0 001.414-1.414l-7-7z" /></svg>
                        Revision
                    </button>
                 </div>
            )}
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    <img src={job.editorAvatarUrl} alt={job.editorName} className="w-6 h-6 rounded-full mr-2" />
                    <span className="text-xs text-slate-300">{job.editorName}</span>
                </div>
                <div className="flex items-center space-x-2">
                    {job.revisionCount && job.revisionCount > 0 && (
                        <span className="text-xs font-mono bg-slate-700 text-yellow-300 rounded-full px-2 py-0.5" title={`${job.revisionCount} revision(s) requested`}>
                            R{job.revisionCount}
                        </span>
                    )}
                    <StatusBadge statusId={job.statusId} statuses={statuses} />
                </div>
            </div>
        </div>
    );
};

const KanbanColumn: React.FC<{
    status: EditingStatus;
    jobs: EditingJob[];
    statuses: EditingStatus[];
    onDragStart: (e: React.DragEvent<HTMLDivElement>, jobId: string) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>, statusId: string) => void;
    onViewJob: (job: EditingJob) => void;
    onViewClient: (clientId: string) => void;
    onNotifyClient: (jobId: string) => void;
    onRequestRevision: (job: EditingJob) => void;
    isOver: boolean;
}> = ({ status, jobs, statuses, onDragStart, onDrop, onViewJob, onViewClient, onNotifyClient, onRequestRevision, isOver }) => {
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

    return (
        <div className={`bg-slate-900/50 rounded-lg p-3 w-full transition-colors ${isOver ? 'bg-cyan-500/10' : ''}`}
            onDragOver={handleDragOver}
            onDrop={(e) => onDrop(e, status.id)}
        >
            <h3 className="font-bold text-slate-200 mb-4 px-2 tracking-wider">{status.name} ({jobs.length})</h3>
            <div className="h-full overflow-y-auto pr-1">
                {jobs.map(job => (
                    <KanbanCard key={job.id} job={job} statuses={statuses} onDragStart={onDragStart} onViewJob={onViewJob} onViewClient={onViewClient} onNotifyClient={onNotifyClient} onRequestRevision={onRequestRevision} />
                ))}
            </div>
        </div>
    );
};

const KanbanView: React.FC<KanbanViewProps> = ({ jobs, statuses, onUpdateStatus, onViewJob, onViewClient, onNotifyClient, onRequestRevision }) => {
    const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
    const [dragOverStatusId, setDragOverStatusId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, jobId: string) => {
        setDraggedJobId(jobId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, statusId: string) => {
        e.preventDefault();
        if (draggedJobId) {
            const job = jobs.find(a => a.id === draggedJobId);
            if (job && job.statusId !== statusId) {
                 await onUpdateStatus(draggedJobId, statusId);
            }
        }
        setDraggedJobId(null);
        setDragOverStatusId(null);
    };
    
    const handleDragEnd = () => {
        setDraggedJobId(null);
        setDragOverStatusId(null);
    }

    const jobsByStatus = statuses.reduce((acc, status) => {
        acc[status.id] = jobs.filter(j => j.statusId === status.id);
        return acc;
    }, {} as Record<string, EditingJob[]>);

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5 h-[calc(100vh-22rem)]`} onDragEnd={handleDragEnd}>
            {statuses.map(status => (
                <div 
                    key={status.id} 
                    onDragEnter={() => setDragOverStatusId(status.id)}
                >
                    <KanbanColumn
                        status={status}
                        jobs={jobsByStatus[status.id] || []}
                        statuses={statuses}
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
                        onViewJob={onViewJob}
                        onViewClient={onViewClient}
                        onNotifyClient={onNotifyClient}
                        onRequestRevision={onRequestRevision}
                        isOver={dragOverStatusId === status.id}
                    />
                </div>
            ))}
        </div>
    );
};

export default KanbanView;
