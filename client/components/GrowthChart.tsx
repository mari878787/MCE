'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const data = [
    { name: '1', leads: 400 },
    { name: '5', leads: 600 },
    { name: '10', leads: 900 },
    { name: '15', leads: 1200 },
    { name: '20', leads: 1500 },
    { name: '25', leads: 1800 },
    { name: '30', leads: 2400 },
];

export default function GrowthChart() {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/analytics/growth`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(async res => {
                if (!res.ok) throw new Error(res.statusText);
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    const formatted = data.map((d: any) => ({
                        name: new Date(d.date).getDate().toString(),
                        leads: d.leads
                    }));
                    setData(formatted);
                } else {
                    console.error('Growth API returned non-array:', data);
                    setData([]);
                }
            })
            .catch(err => {
                console.error('Failed to load growth chart:', err);
                setData([]);
            });
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 rounded-2xl h-[400px] flex flex-col"
        >
            <h3 className="text-lg font-semibold text-foreground mb-4">Lead Database Growth</h3>
            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                        <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                        <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            itemStyle={{ color: '#09090b' }}
                        />
                        <Line type="monotone" dataKey="leads" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
