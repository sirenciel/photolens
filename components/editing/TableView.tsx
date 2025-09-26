import React from 'react';
import { EditingJob, Permission, StaffMember, EditingStatus } from '../../types';
import StatusBadge from './StatusBadge';
import { hasPermission } from '../../services/permissions';
import { WhatsAppIcon, GoogleDriveIcon, UrgentIcon, HighPriorityIcon } from '../../constants';

interface TableViewProps {
    jobs: EditingJob[];
    statuses: EditingStatus[];
    currentUser: StaffMember;
    onEdit: (job: EditingJob) => void;
    onDelete: (jobId: string) => void;
    onViewClient: (clientId: string) => void;
    onNotifyClient: (jobId: string) => void;
    onRequestRevision: (job: EditingJob) => void;
}

const TableView: React.FC<TableViewProps> = ({ jobs, statuses, currentUser, onEdit, onDelete, onViewClient, onNotifyClient, onRequestRevision }) => {
    const canManageEditing = hasPermission(currentUser.role, Permission.MANAGE_EDITING);
    
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };
    
    const reviewStatusId = statuses.find(s => s.name === 'Client Review')?.id;

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-900">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Client / Booking</th>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Editor</th>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Assets</th>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Priority</th>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Date Added</th>
                            {canManageEditing && <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {jobs.map(job => (
                            <tr key={job.id} className="hover:bg-slate-900/50 transition-colors">
                                <td className="p-4 whitespace-nowrap">
                                    <p 
                                        className="font-medium text-white hover:text-cyan-400 cursor-pointer"
                                        onClick={() => onViewClient(job.clientId)}
                                    >
                                        {job.clientName}
                                    </p>
                                    <p className="text-xs text-slate-400 font-mono">{job.bookingId}</p>
                                </td>
                                <td className="p-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img className="h-8 w-8 rounded-full object-cover" src={job.editorAvatarUrl} alt={job.editorName} />
                                        <div className="ml-3">
                                            <p className="text-sm text-white">{job.editorName}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    {job.driveFolderUrl ? (
                                        <a href={job.driveFolderUrl} target="_blank" rel="noopener noreferrer" title="Open Google Drive Folder" className="inline-block p-1 text-slate-400 hover:text-white">
                                            <GoogleDriveIcon />
                                        </a>
                                    ) : (
                                        <span className="text-slate-500">-</span>
                                    )}
                                </td>
                                <td className="p-4 text-center">
                                    {job.priority === 'Urgent' && <UrgentIcon className="h-5 w-5 text-red-400 mx-auto" title="Urgent" />}
                                    {job.priority === 'High' && <HighPriorityIcon className="h-5 w-5 text-yellow-400 mx-auto" title="High" />}
                                    {(!job.priority || job.priority === 'Normal') && <span className="text-slate-500">-</span>}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center space-x-2">
                                        <StatusBadge statusId={job.statusId} statuses={statuses} />
                                        {job.revisionCount && job.revisionCount > 0 && (
                                            <span className="text-xs font-mono bg-slate-700 text-yellow-300 rounded-full px-2 py-0.5" title={`${job.revisionCount} revision(s) requested`}>
                                                R{job.revisionCount}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-slate-300">{formatDate(job.uploadDate)}</td>
                                {canManageEditing && (
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            {job.statusId === reviewStatusId && (
                                                <>
                                                    <button onClick={() => onNotifyClient(job.id)} className="p-1 text-slate-400 hover:text-green-400" title="Notify Client for Review via WhatsApp">
                                                        <WhatsAppIcon />
                                                    </button>
                                                    <button onClick={() => onRequestRevision(job)} className="p-1 text-slate-400 hover:text-purple-400" title="Request Revision">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 11.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-5.586l-1.707 1.707a1 1 0 001.414-1.414l-7-7z" />
                                                        </svg>
                                                    </button>
                                                </>
                                            )}
                                            <button onClick={() => onEdit(job)} className="p-1 text-slate-400 hover:text-cyan-400" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                                            <button onClick={() => onDelete(job.id)} className="p-1 text-slate-400 hover:text-red-500" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TableView;