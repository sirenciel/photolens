import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { SessionRevenue } from '../../types';

interface RevenueBySessionChartProps {
    data: SessionRevenue[];
    navigateAndFilter: (page: string, filters: any) => void;
}

const COLORS = ['#22d3ee', '#818cf8', '#f472b6', '#fbbf24', '#34d399'];

const RevenueBySessionChart: React.FC<RevenueBySessionChartProps> = ({ data, navigateAndFilter }) => {
    
    const handlePieClick = (data: any) => {
        if (data && data.id) {
            navigateAndFilter('Bookings', { sessionCategoryId: data.id });
        }
    };

    return (
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg h-96">
            <h3 className="text-xl font-semibold text-white mb-4">Revenue by Session Type</h3>
            <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        stroke="none"
                        cursor="pointer"
                        onClick={handlePieClick}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            borderColor: '#374151',
                        }}
                    />
                    <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RevenueBySessionChart;