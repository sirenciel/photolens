import React, { useState, useRef, useEffect } from 'react';
import { JobCardProps, Permission } from '../../types';
import StatusBadge from './StatusBadge';
import { hasPermission } from '../../services/permissions';
import { MediaIcon, GoogleDriveIcon, UrgentIcon, HighPriorityIcon } from '../../constants';

const JobCard: React.FC<JobCardProps> = ({ job, statuses, currentUser, onEdit, onDelete, onViewClient }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const canManageEditing = hasPermission(currentUser.role, Permission.MANAGE_EDITING);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleClientClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onViewClient(job.clientId);
    }
    
    const handleDriveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };


    const handleEditClick = () => {
        setIsMenuOpen(false);
        onEdit(job);
    };

    const handleDeleteClick = async () => {
        if (isDeleting) {
            return;
        }

        try {
            setIsDeleting(true);
            await onDelete(job.id);
        } finally {
            setIsDeleting(false);
            setIsMenuOpen(false);
        }
    };

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden group transition-all duration-300 transform hover:-translate-y-1 hover:shadow-cyan-500/20">
            <div className="relative h-48 w-full bg-slate-900 flex items-center justify-center">
                 <div className="text-slate-700">
                    <MediaIcon />
                 </div>
                 <div className="absolute top-2 left-2 flex items-center gap-2">
                    {job.priority === 'Urgent' && <UrgentIcon className="h-5 w-5 text-red-400" title="Urgent Priority" />}
                    {job.priority === 'High' && <HighPriorityIcon className="h-5 w-5 text-yellow-400" title="High Priority" />}
                </div>
                <div className="absolute top-2 right-2 flex items-center gap-2">
                    {job.revisionCount && job.revisionCount > 0 && (
                        <span className="text-xs font-mono bg-slate-900/50 backdrop-blur-sm text-yellow-300 rounded-full px-2 py-1" title={`${job.revisionCount} revision(s) requested`}>
                            R{job.revisionCount}
                        </span>
                    )}
                    <StatusBadge statusId={job.statusId} statuses={statuses} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                     <p className="text-sm text-slate-300 font-mono">{job.bookingId}</p>
                     <p 
                        className="font-semibold text-white truncate hover:text-cyan-400 cursor-pointer"
                        onClick={handleClientClick}
                    >
                        {job.clientName}
                    </p>
                </div>
            </div>
            
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                         <img className="h-8 w-8 rounded-full object-cover" src={job.editorAvatarUrl} alt={job.editorName} />
                        <div className="ml-2">
                            <p className="text-xs text-slate-400">Assigned To</p>
                            <p className="text-sm font-medium text-slate-200">{job.editorName}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                         {job.driveFolderUrl && (
                            <a href={job.driveFolderUrl} target="_blank" rel="noopener noreferrer" onClick={handleDriveClick} title="Open Google Drive Folder" className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white transition-colors duration-200">
                                <GoogleDriveIcon className="h-5 w-5" />
                            </a>
                        )}

                         {canManageEditing && (
                            <div className="relative" ref={menuRef}>
                                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-lg bg-slate-700 hover:bg-cyan-500 text-slate-400 hover:text-white transition-colors duration-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                    </svg>
                                </button>
                                 {isMenuOpen && (
                                    <div className="absolute right-0 bottom-full mb-2 w-32 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-10">
                                        <button onClick={handleEditClick} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-cyan-400">Edit</button>
                                        <button onClick={handleDeleteClick} disabled={isDeleting} className={`w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-red-500 ${isDeleting ? 'opacity-60 cursor-not-allowed' : ''}`}>{isDeleting ? 'Deleting…' : 'Delete'}</button>
                                    </div>
                                )}
                            </div>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobCard;