'use client';

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
    // In real app, fetch from /api/insights/growth
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6 rounded-2xl h-[400px] flex flex-col"
        >
            <h3 className="text-lg font-semibold text-white mb-4">Lead Database Growth (Mock)</h3>
            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                        <Line type="monotone" dataKey="leads" stroke="#10b981" strokeWidth={3} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
