
import React from 'react';
import { Activity } from '../types';

interface RecentActivityProps {
    activities: Activity[];
}

const timeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
    return (
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
            <ul className="space-y-4">
                {activities.map(activity => (
                    <li key={activity.id} className="flex items-start space-x-4">
                        <img src={activity.userAvatarUrl} alt={activity.user} className="w-10 h-10 rounded-full" />
                        <div className="flex-1">
                            <p className="text-slate-200">
                                <span className="font-bold">{activity.user}</span> {activity.action} <span className="font-semibold text-cyan-400">{activity.target}</span>.
                            </p>
                            <p className="text-xs text-slate-500 mt-1">{timeSince(activity.timestamp)}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RecentActivity;
