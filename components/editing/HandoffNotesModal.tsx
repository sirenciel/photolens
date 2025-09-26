import React, { useState } from 'react';
import Modal from '../shared/Modal';
import { Booking } from '../../types';

interface HandoffNotesModalProps {
    booking: Booking;
    onSave: (notes: string) => void;
    onClose: () => void;
}

const HandoffNotesModal: React.FC<HandoffNotesModalProps> = ({ booking, onSave, onClose }) => {
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(notes);
    };

    return (
        <Modal title={`Handoff Notes for ${booking.clientName}`} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                    <p className="text-slate-300 mb-2">
                        Booking <span className="font-bold text-white">{booking.sessionType}</span> telah ditandai sebagai "Completed".
                    </p>
                    <label htmlFor="handoff-notes" className="block text-sm font-medium text-slate-300">
                        Tambahkan catatan untuk tim editor:
                    </label>
                     <textarea
                        id="handoff-notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={5}
                        placeholder="e.g., Klien lebih suka foto candid. Hati-hati dengan highlight pada file IMG_1234 - IMG_1250."
                        className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        Skip
                    </button>
                    <button
                        type="submit"
                        className="py-2 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
                    >
                        Save & Handoff to Editor
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default HandoffNotesModal;
