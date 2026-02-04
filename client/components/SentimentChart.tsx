'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = {
    POSITIVE: '#10b981', // green-500
    NEGATIVE: '#ef4444', // red-500
    NEUTRAL: '#9ca3af'   // gray-400
};

export default function SentimentChart() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/analytics/sentiment`);
                if (!res.ok) return;
                const stats = await res.json();

                // Transform object { POSITIVE: 10, ... } to array for Recharts
                const chartData = Object.entries(stats).map(([key, value]) => ({
                    name: key,
                    value: value
                }));
                setData(chartData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="animate-pulse bg-gray-800 rounded-2xl h-80 w-full mb-8" />;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col items-center"
        >
            <h3 className="text-lg font-semibold text-gray-900 mb-2 self-start flex items-center gap-2">
                <span className="text-2xl">🧠</span> AI Sentiment Analysis
            </h3>
            <p className="text-xs text-gray-500 self-start mb-6">Automated tone detection of inbound replies.</p>

            <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
