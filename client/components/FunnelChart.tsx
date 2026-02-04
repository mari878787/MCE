'use client';

import { useState, useEffect } from 'react';
import { ResponsiveContainer, FunnelChart as RechartsFunnel, Funnel, Tooltip, LabelList } from 'recharts';
import { motion } from 'framer-motion';

const data = [
    { value: 'NEW', name: 'New Leads', fill: '#8884d8' },
    { value: 'CONTACTED', name: 'Contacted', fill: '#83a6ed' },
    { value: 'INTERESTED', name: 'Interested', fill: '#8dd1e1' },
    { value: 'CUSTOMER', name: 'Customers', fill: '#82ca9d' },
];

export default function FunnelChart() {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/analytics/funnel`)
            .then(res => res.json())
            .then(setData)
            .catch(err => console.error(err));
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 rounded-2xl h-[400px] flex flex-col"
        >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsFunnel width={400} height={300}>
                        <Tooltip />
                        <Funnel dataKey="value" data={data} isAnimationActive>
                            <LabelList position="right" fill="#374151" stroke="none" dataKey="name" />
                        </Funnel>
                    </RechartsFunnel>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
