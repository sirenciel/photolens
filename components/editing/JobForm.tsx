import React, { useState, useEffect } from 'react';
import { JobFormProps, UserRole, EditingJob } from '../../types';

const JobForm: React.FC<JobFormProps> = ({ job, bookings, staff, clients, statuses, onSave, onCancel }) => {
    const [bookingId, setBookingId] = useState('');
    const [editorId, setEditorId] = useState<string | null>(null);
    const [statusId, setStatusId] = useState('');
    const [driveFolderUrl, setDriveFolderUrl] = useState('');
    const [priority, setPriority] = useState<EditingJob['priority']>('Normal');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const editors = staff.filter(s => s.role === UserRole.Editor || s.role === UserRole.Admin);

    useEffect(() => {
        setError(null);
        setIsSubmitting(false);
        if (job) {
            setBookingId(job.bookingId);
            setEditorId(job.editorId);
            setStatusId(job.statusId);
            setDriveFolderUrl(job.driveFolderUrl || '');
            setPriority(job.priority || 'Normal');
        } else {
            setBookingId('');
            setEditorId(null);
            setStatusId(statuses[0]?.id || '');
            setDriveFolderUrl('');
            setPriority('Normal');
        }
    }, [job, statuses]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookingId) {
            alert('Please select a booking.');
            return;
        }
        const selectedBooking = bookings.find(b => b.id === bookingId);
        if (!selectedBooking) {
            alert('Could not find the selected booking details.');
            return;
        }
        try {
            setError(null);
            setIsSubmitting(true);
            await onSave({ id: job?.id, bookingId, clientId: selectedBooking.clientId, editorId, statusId, driveFolderUrl, priority });
        } catch (err) {
            console.error('Failed to save editing job', err);
            setError('Unable to save editing job. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedBooking = bookings.find(b => b.id === bookingId);
    const selectedClient = selectedBooking ? clients.find(c => c.id === selectedBooking.clientId) : null;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="booking" className="block text-sm font-medium text-slate-300">Associated Booking</label>
                <select
                    id="booking"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    required
                    className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                    <option value="" disabled>Select a booking</option>
                    {bookings.map(b => (
                        <option key={b.id} value={b.id}>
                           {b.clientName} - {b.sessionType} ({new Date(b.date).toLocaleDateString()})
                        </option>
                    ))}
                </select>
            </div>

            {selectedBooking && (
                 <div className="bg-slate-900/50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-slate-400">Client Information</label>
                    <div className="flex items-center mt-2">
                        <img src={selectedBooking.clientAvatarUrl} alt={selectedBooking.clientName} className="w-10 h-10 rounded-full" />
                        <div className="ml-3">
                            <p className="font-semibold text-white">{selectedBooking.clientName}</p>
                        </div>
                    </div>
                </div>
            )}
            
            {selectedBooking && (
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                        Client's Photo Selections {selectedBooking.photoSelections && selectedBooking.photoSelections.length > 0 ? `(${selectedBooking.photoSelections.length} files)` : ''}
                    </label>
                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 max-h-48 overflow-y-auto">
                        {selectedBooking.photoSelections && selectedBooking.photoSelections.length > 0 ? (
                            <ul className="space-y-1">
                                {selectedBooking.photoSelections.map((selection, index) => (
                                    <li key={index} className="text-sm text-slate-300 font-mono">
                                        {selection.name}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-2">
                                The client has not finalized their photo selections yet.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {selectedBooking && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Booking Notes (from Admin)</label>
                        <textarea
                            readOnly
                            value={selectedBooking.notes || 'No notes for this booking.'}
                            rows={5}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm text-slate-400 whitespace-pre-wrap"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Photographer Handoff Notes</label>
                        <textarea
                            readOnly
                            value={job?.photographerNotes || 'No handoff notes from photographer.'}
                            rows={5}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm text-slate-400 whitespace-pre-wrap"
                        />
                    </div>
                </div>
            )}
            
            {job && job.revisionCount && job.revisionCount > 0 && (
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                        Revision History ({job.revisionCount} {job.revisionCount > 1 ? 'Revisions' : 'Revision'})
                    </label>
                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 max-h-48 overflow-y-auto space-y-3">
                        {job.revisionNotes?.map((revision, index) => (
                             <div key={index} className="text-sm">
                                <p className="text-slate-400 text-xs border-b border-slate-600 pb-1 mb-1">
                                    Requested on {new Date(revision.date).toLocaleDateString()}
                                </p>
                                <p className="text-slate-300 whitespace-pre-wrap">{revision.note}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <label htmlFor="driveUrl" className="block text-sm font-medium text-slate-300">Google Drive Folder URL</label>
                 <input
                    type="url"
                    id="driveUrl"
                    value={driveFolderUrl}
                    onChange={(e) => setDriveFolderUrl(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="editor" className="block text-sm font-medium text-slate-300">Assign to Editor</label>
                    <select
                        id="editor"
                        value={editorId || ''}
                        onChange={(e) => setEditorId(e.target.value || null)}
                        className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="">Unassigned</option>
                        {editors.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-slate-300">Priority</label>
                    <select
                        id="priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                    </select>
                </div>
            </div>
            
             <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-300">Status</label>
                <select
                    id="status"
                    value={statusId}
                    onChange={(e) => setStatusId(e.target.value)}
                    required
                    className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                    {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
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
                    disabled={isSubmitting}
                    className={`py-2 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                    {isSubmitting ? 'Saving...' : 'Save Job'}
                </button>
            </div>
            {error && (
                <p className="text-sm text-red-400 text-right">{error}</p>
            )}
        </form>
    );
};

export default JobForm;