import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { PandLData } from '../../types';

interface ProfitLossChartProps {
    data: PandLData[];
    navigateAndFilter: (page: string, filters: any) => void;
}

const ProfitLossChart: React.FC<ProfitLossChartProps> = ({ data, navigateAndFilter }) => {

    const handleBarClick = (data: any) => {
        if (data && data.activePayload && data.activePayload[0]) {
            const payload = data.activePayload[0].payload;
            const [monthName, yearShort] = payload.month.split(' ');
            const year = `20${yearShort.replace("'", "")}`;
            
            const monthIndex = new Date(Date.parse(monthName +" 1, 2012")).getMonth();

            const startDate = new Date(parseInt(year), monthIndex, 1);
            const endDate = new Date(parseInt(year), monthIndex + 1, 0);

            navigateAndFilter('Invoices', { dateRange: { start: startDate, end: endDate } });
        }
    };

    return (
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg h-96">
            <h3 className="text-xl font-semibold text-white mb-4">Revenue vs. Expenses</h3>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} onClick={handleBarClick}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                    <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                    <Tooltip
                        cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            borderColor: '#374151',
                            color: '#f9fafb',
                        }}
                        itemStyle={{ color: '#f9fafb' }}
                        labelStyle={{ color: '#9ca3af' }}
                    />
                    <Legend wrapperStyle={{ color: '#9ca3af' }} />
                    <Bar dataKey="revenue" fill="#22d3ee" name="Revenue" radius={[4, 4, 0, 0]} cursor="pointer" />
                    <Bar dataKey="expenses" fill="#f472b6" name="Expenses" radius={[4, 4, 0, 0]} cursor="pointer" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ProfitLossChart;