import React, { useState } from 'react';
import Modal from '../shared/Modal';

interface RevisionNotesModalProps {
    onSave: (notes: string) => void;
    onClose: () => void;
}

const RevisionNotesModal: React.FC<RevisionNotesModalProps> = ({ onSave, onClose }) => {
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!notes.trim()) {
            alert('Please provide revision notes from the client.');
            return;
        }
        onSave(notes);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="revision-notes" className="block text-sm font-medium text-slate-300">
                    Client's Revision Feedback
                </label>
                <textarea
                    id="revision-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={5}
                    placeholder="e.g., Make the ceremony photos brighter. Remove the spot on the groom's jacket in IMG_4588."
                    className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                />
            </div>
            <div className="flex justify-end space-x-4 pt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="py-2 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
                >
                    Submit Revision Request
                </button>
            </div>
        </form>
    );
};

export default RevisionNotesModal;