import React from 'react';
import Modal from '../shared/Modal';
import { Booking, Client, SessionPackage } from '../../types';

interface ShootBriefModalProps {
    booking: Booking;
    client: Client;
    sessionPackage?: SessionPackage;
    onClose: () => void;
}

const ShootBriefModal: React.FC<ShootBriefModalProps> = ({ booking, client, sessionPackage, onClose }) => {
    
    const googleMapsUrl = booking.location 
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.location)}`
        : null;

    return (
        <Modal title="Shoot Brief" onClose={onClose}>
            <div className="space-y-6 text-slate-300">
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-bold text-white">{booking.sessionType}</h2>
                    <p className="text-md text-cyan-400">{new Date(booking.date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
                </div>

                {/* Client & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                        <h3 className="font-semibold text-slate-400 uppercase text-xs tracking-wider mb-2">Client</h3>
                        <p className="font-bold text-lg text-white">{client.name}</p>
                        <p>{client.phone}</p>
                        <p>{client.email}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                        <h3 className="font-semibold text-slate-400 uppercase text-xs tracking-wider mb-2">Location</h3>
                        <p className="font-bold text-lg text-white">{booking.location || 'N/A'}</p>
                        {googleMapsUrl && (
                            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-sm">
                                Open in Google Maps
                            </a>
                        )}
                    </div>
                </div>

                {/* Package Inclusions */}
                {sessionPackage && sessionPackage.inclusions && (
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                        <h3 className="font-semibold text-slate-400 uppercase text-xs tracking-wider mb-2">Package Inclusions</h3>
                        <ul className="list-disc list-inside space-y-1">
                            {sessionPackage.inclusions.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {/* Notes */}
                {booking.notes && (
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                        <h3 className="font-semibold text-slate-400 uppercase text-xs tracking-wider mb-2">Important Notes</h3>
                        <p className="whitespace-pre-wrap">{booking.notes}</p>
                    </div>
                )}

                 <div className="flex justify-end pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="py-2 px-6 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ShootBriefModal;
