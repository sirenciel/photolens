
import React from 'react';
import { Booking } from '../types';

interface UpcomingBookingsProps {
    bookings: Booking[];
}

const UpcomingBookings: React.FC<UpcomingBookingsProps> = ({ bookings }) => {
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Confirmed': return 'bg-green-500';
            case 'Pending': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg h-96 flex flex-col">
            <h3 className="text-xl font-semibold text-white mb-4">Upcoming Bookings</h3>
            <div className="flex-grow overflow-y-auto pr-2">
                <ul className="space-y-4">
                    {bookings.slice(0, 5).map(booking => (
                        <li key={booking.id} className="flex items-center space-x-4 p-3 bg-slate-900/50 rounded-lg">
                            <div className="flex-shrink-0 w-12 h-12 bg-cyan-900 rounded-lg flex flex-col items-center justify-center">
                                <span className="text-cyan-400 text-xs font-bold uppercase">{formatDate(booking.date).split(' ')[0]}</span>
                                <span className="text-white text-lg font-bold">{formatDate(booking.date).split(' ')[1]}</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-white truncate">{booking.clientName}</p>
                                <p className="text-sm text-slate-400">{booking.sessionType} - {formatTime(booking.date)}</p>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${getStatusColor(booking.status)}`}>
                                {booking.status}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default UpcomingBookings;
