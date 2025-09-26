import React, { useState, useMemo } from 'react';
import { Booking } from '../../types';
import { NoteIcon } from '../../constants';

interface CalendarViewProps {
    bookings: Booking[];
    onSelectBooking: (booking: Booking) => void;
    onUpdateBooking: (bookingId: string, newDate: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ bookings, onSelectBooking, onUpdateBooking }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [draggedBooking, setDraggedBooking] = useState<{ id: string; initialMouseOffsetY: number } | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState<string | null>(null); // dateString of column
    const [isConflict, setIsConflict] = useState<boolean>(false);

    const getWeekDays = (forDate: Date) => {
        const date = new Date(forDate);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(date.setDate(diff));
        return Array.from({ length: 7 }, (_, i) => {
             const d = new Date(monday);
             d.setDate(monday.getDate() + i);
             return d;
        });
    };
    
    const weekDates = useMemo(() => getWeekDays(currentDate), [currentDate]);
    const weekStart = weekDates[0];
    const weekEnd = weekDates[6];

    const bookingsByDay = useMemo(() => {
        const map = new Map<string, Booking[]>();
        weekDates.forEach(date => {
            const dateString = date.toISOString().split('T')[0];
            const dayBookings = bookings.filter(b => b.date.toISOString().split('T')[0] === dateString);
            map.set(dateString, dayBookings);
        });
        return map;
    }, [bookings, weekDates]);

    const calculateNewDateAndConflict = (e: React.DragEvent<HTMLDivElement>, columnDate: Date) => {
        const dayColumn = e.currentTarget.querySelector('.booking-area');
        if (!dayColumn || !draggedBooking) return { newDate: columnDate, conflictedBooking: null };

        const rect = dayColumn.getBoundingClientRect();
        const startHour = 7;
        const totalMinutesInView = (22 - startHour) * 60;
        const totalHeight = rect.height;
        let y = e.clientY - rect.top - draggedBooking.initialMouseOffsetY;
        y = Math.max(0, Math.min(y, totalHeight));
        const minutesFromStart = (y / totalHeight) * totalMinutesInView;
        const quantizedMinutes = Math.round(minutesFromStart / 15) * 15;
        const newHour = startHour + Math.floor(quantizedMinutes / 60);
        const newMinute = quantizedMinutes % 60;
        const newDate = new Date(columnDate);
        newDate.setHours(newHour, newMinute, 0, 0);

        const draggedBookingFull = bookings.find(b => b.id === draggedBooking.id);
        if (!draggedBookingFull) return { newDate, conflictedBooking: null };

        const sessionDurationMinutes = 90;
        const newStartTime = newDate.getTime();
        const newEndTime = newStartTime + sessionDurationMinutes * 60 * 1000;
        const bookingsOnThisDay = bookingsByDay.get(columnDate.toISOString().split('T')[0]) || [];

        const conflictedBooking = bookingsOnThisDay.find(otherBooking => {
            if (otherBooking.id === draggedBooking.id) return false;
            if (otherBooking.photographerId !== draggedBookingFull.photographerId) return false;
            const otherStartTime = otherBooking.date.getTime();
            const otherEndTime = otherStartTime + sessionDurationMinutes * 60 * 1000;
            return (newStartTime < otherEndTime) && (newEndTime > otherStartTime);
        });

        return { newDate, conflictedBooking: conflictedBooking || null };
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, booking: Booking) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setDraggedBooking({ id: booking.id, initialMouseOffsetY: e.clientY - rect.top });
        e.dataTransfer.setData('bookingId', booking.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, date: Date) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDraggingOver(date.toISOString().split('T')[0]);
        if (!draggedBooking) return;
        const { conflictedBooking } = calculateNewDateAndConflict(e, date);
        setIsConflict(!!conflictedBooking);
    };

    const handleDragLeave = () => {
        setIsDraggingOver(null);
        setIsConflict(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, date: Date) => {
        e.preventDefault();
        if (!draggedBooking) return;
        const { newDate, conflictedBooking } = calculateNewDateAndConflict(e, date);
        if (conflictedBooking) {
            alert(`Conflict detected with ${conflictedBooking.clientName}'s booking for photographer ${conflictedBooking.photographer}. Please choose another time slot.`);
        } else {
            onUpdateBooking(draggedBooking.id, newDate);
        }
        setDraggedBooking(null);
        setIsDraggingOver(null);
        setIsConflict(false);
    };

    const handlePrevWeek = () => setCurrentDate(d => new Date(d.setDate(d.getDate() - 7)));
    const handleNextWeek = () => setCurrentDate(d => new Date(d.setDate(d.getDate() + 7)));
    const handleToday = () => setCurrentDate(new Date());

    const timeSlots = Array.from({ length: 15 }, (_, i) => i + 7);

    const getBookingPosition = (booking: Booking) => {
        const startHour = 7;
        const totalMinutesInView = (22 - startHour) * 60;
        const bookingStartMinutes = (booking.date.getHours() - startHour) * 60 + booking.date.getMinutes();
        return (bookingStartMinutes / totalMinutesInView) * 100;
    };
    
    const getBookingHeight = () => {
        const sessionDurationMinutes = 90;
        const startHour = 7;
        const totalMinutesInView = (22 - startHour) * 60;
        return (sessionDurationMinutes / totalMinutesInView) * 100;
    };
    
    const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden flex flex-col h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <button onClick={handlePrevWeek} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Previous week">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </button>
                    <button onClick={handleToday} className="font-semibold px-4 py-2 text-sm rounded-lg hover:bg-slate-700 transition-colors">Today</button>
                    <button onClick={handleNextWeek} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Next week">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white text-center">
                    {weekStart.toLocaleString('default', { month: 'short' })} {weekStart.getDate()} - {weekEnd.toLocaleString('default', { month: 'short' })} {weekEnd.getDate()}, {weekEnd.getFullYear()}
                </h2>
                <div></div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-grow grid grid-cols-[auto_repeat(7,1fr)] overflow-y-auto">
                {/* Time Gutter */}
                <div className="border-r border-slate-700">
                    <div className="h-12 border-b border-slate-700"></div>
                     <div className="relative">
                        {timeSlots.map(hour => (
                            <div key={hour} className="h-20 text-right pr-2">
                                <span className="text-xs text-slate-400 relative -top-2">{hour > 9 ? hour : '0' + hour}:00</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Day Columns */}
                {weekDates.map(date => {
                    const dateString = date.toISOString().split('T')[0];
                    const dayBookings = bookingsByDay.get(dateString) || [];
                    const isToday = isSameDay(date, new Date());
                    
                    const dropZoneClass = isDraggingOver === dateString
                        ? isConflict ? 'bg-red-500/10' : 'bg-cyan-500/10'
                        : '';
                    
                    return (
                        <div 
                            key={dateString} 
                            className={`border-r border-slate-700 last:border-r-0 relative transition-colors ${dropZoneClass}`}
                            onDragOver={(e) => handleDragOver(e, date)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, date)}
                        >
                            {/* Day Header */}
                            <div className={`h-12 border-b border-slate-700 text-center py-2 sticky top-0 z-10 bg-slate-800 ${isToday ? 'bg-cyan-900/50' : ''}`}>
                                <p className="text-sm text-slate-400">{date.toLocaleString('default', { weekday: 'short' })}</p>
                                <p className={`text-lg font-bold ${isToday ? 'text-cyan-400' : 'text-white'}`}>{date.getDate()}</p>
                            </div>

                            <div className="relative booking-area">
                                {/* Hour lines background */}
                                <div>
                                    {timeSlots.map(hour => (
                                        <div key={hour} className="h-20 border-b border-slate-700/50"></div>
                                    ))}
                                </div>
                            
                                {/* Bookings */}
                                <div className="absolute inset-0">
                                    {dayBookings.map(booking => {
                                        const top = getBookingPosition(booking);
                                        const height = getBookingHeight();
                                        const isBeingDragged = draggedBooking?.id === booking.id;
                                        return (
                                            <div 
                                                key={booking.id}
                                                draggable="true"
                                                onDragStart={(e) => handleDragStart(e, booking)}
                                                onClick={() => onSelectBooking(booking)}
                                                className={`absolute w-[95%] left-1 rounded-lg p-1.5 bg-cyan-600/80 border border-cyan-500 text-white cursor-grab hover:bg-cyan-500 transition-all shadow-lg group ${isBeingDragged ? 'opacity-30' : ''}`}
                                                style={{ top: `${top}%`, height: `${height}%` }}
                                                title={`${booking.clientName} - ${booking.sessionType}`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <p className="text-xs font-bold truncate pr-1">{booking.clientName}</p>
                                                    {booking.notes && (
                                                        <div className="relative flex-shrink-0">
                                                            <NoteIcon className="h-4 w-4 text-yellow-300" />
                                                             <div className="absolute bottom-full mb-2 -right-2 w-52 bg-slate-950 text-slate-200 text-sm rounded-lg p-2 border border-slate-700 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                                                                <p className="whitespace-pre-wrap">{booking.notes}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-cyan-100 truncate">{booking.sessionType}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};
export default CalendarView;