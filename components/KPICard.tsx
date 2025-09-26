
import React from 'react';
import { KPI } from '../types';

const KPICard: React.FC<KPI> = ({ title, value, change, changeType, icon, onClick }) => {
    const changeColor = changeType === 'increase' ? 'text-green-400' : 'text-red-400';
    const arrow = changeType === 'increase' ? '↑' : '↓';

    const cardContent = (
         <div className="bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-cyan-500/20 transition-shadow duration-300 transform hover:-translate-y-1 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <p className="text-slate-400 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-white mt-1">{value}</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-full">
                    {icon}
                </div>
            </div>
            <p className={`text-sm mt-4 ${changeColor}`}>
                <span className="font-semibold">{arrow} {change}</span>
                <span className="text-slate-500"> vs last month</span>
            </p>
        </div>
    );

    if (onClick) {
        return (
            <button onClick={onClick} className="text-left w-full h-full">
                {cardContent}
            </button>
        )
    }

    return cardContent;
};

export default KPICard;