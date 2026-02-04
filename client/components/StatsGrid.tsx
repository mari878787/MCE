'use client';

import { motion } from 'framer-motion';
import { Users, DollarSign, Activity, Zap } from 'lucide-react';

const STATS = [
    { label: 'Active Leads', value: '124', icon: Users, color: 'text-blue-400', change: '+12%' },
    { label: 'Revenue Won', value: '₹4.2L', icon: DollarSign, color: 'text-green-400', change: '+8.4%' },
    { label: 'Conversion Rate', value: '18%', icon: Activity, color: 'text-purple-400', change: '-2%' },
    { label: 'Avg Response', value: '42s', icon: Zap, color: 'text-yellow-400', change: '-10%' },
];

export default function StatsGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {STATS.map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card rounded-2xl p-6 hover:bg-card/80 transition-all group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl bg-secondary ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon size={24} />
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                            }`}>
                            {stat.change}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-foreground mb-1">{stat.value}</h3>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
