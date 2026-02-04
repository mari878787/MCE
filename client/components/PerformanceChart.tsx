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
        <div className="h-[400px] flex items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            Scanning metrics...
        </div>
    );

    if (data.length === 0) return (
        <div className="h-[400px] flex items-center justify-center text-gray-500 flex-col gap-2 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <p className="font-medium">No campaign data yet.</p>
            <p className="text-xs text-gray-400">Launch a campaign to track performance here.</p>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-[400px]"
        >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#9ca3af"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                        itemStyle={{ color: '#111827', fontSize: '12px', fontWeight: 500 }}
                        cursor={{ fill: '#f9fafb' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="Sent" name="Sent" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    <Bar dataKey="Read" name="Read" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    <Bar dataKey="Interested" name="Leads" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
            </ResponsiveContainer>
        </motion.div>
    );
}
