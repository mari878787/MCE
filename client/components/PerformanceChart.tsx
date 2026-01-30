'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

export default function PerformanceChart() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch recent campaigns
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/campaigns`);
                if (!res.ok) return;
                const campaigns = await res.json();

                // Take top 5 recent
                const recent = campaigns.slice(0, 5);

                // 2. Fetch stats for each
                const statsPromises = recent.map(async (c: any) => {
                    const sRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/campaigns/${c.id}/stats`);
                    // Returns { audience: {...}, performance: { sent, delivered, read, replies, interested } }
                    const stats = sRes.ok ? await sRes.json() : {};

                    return {
                        name: c.name.substring(0, 15) + (c.name.length > 15 ? '...' : ''),
                        Sent: stats.performance?.sent || 0,
                        Read: stats.performance?.read || 0,
                        Interested: stats.performance?.interested || 0
                    };
                });

                const chartData = await Promise.all(statsPromises);
                setData(chartData.reverse());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return (
        <div className="glass-panel p-6 rounded-2xl h-[400px] flex items-center justify-center text-gray-500">
            Loading metrics...
        </div>
    );

    if (data.length === 0) return (
        <div className="glass-panel p-6 rounded-2xl h-[400px] flex items-center justify-center text-gray-500 flex-col gap-2">
            <p>No campaign data yet.</p>
            <p className="text-xs">Start a campaign to see performance metrics.</p>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-6 rounded-2xl h-[400px] flex flex-col"
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Campaign Performance</h3>
            </div>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            dx={-10}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Legend />
                        <Bar dataKey="Sent" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="Read" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="Interested" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
