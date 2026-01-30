'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Users, AlertCircle, Play, TrendingUp, Search } from 'lucide-react';
import PerformanceChart from '../components/PerformanceChart';

export default function Dashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({ sent: 0, stopped: 0, queue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/analytics/whatsapp`);
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { title: 'Messages Sent', value: stats.sent.toLocaleString(), icon: <MessageSquare className="text-blue-500" />, trend: 'Total outbound', color: 'blue' },
        { title: 'Stopped (Kill Switch)', value: stats.stopped.toLocaleString(), icon: <AlertCircle className="text-red-500" />, trend: 'Opted out', color: 'red' },
        { title: 'Queue Pending', value: stats.queue.toLocaleString(), icon: <Users className="text-yellow-500" />, trend: 'Status: NEW', color: 'yellow' },
    ];

    return (
        <div className="p-8 text-white max-w-7xl mx-auto h-full overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-gray-400 mt-1">Real-time overview of your messaging engine.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => router.push('/campaigns/new')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-blue-900/20 transition flex items-center gap-2"
                    >
                        <Play size={18} fill="currentColor" /> New Campaign
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl hover:border-gray-700 transition group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl bg-gray-800 group-hover:bg-${card.color}-900/20 transition`}>
                                {card.icon}
                            </div>
                            <span className="text-xs font-medium text-gray-500 bg-gray-800 px-2 py-1 rounded-full">{card.trend}</span>
                        </div>
                        <h3 className="text-gray-400 text-sm font-medium mb-1">{card.title}</h3>
                        <div className="text-3xl font-bold text-white tracking-tight">
                            {loading ? <span className="animate-pulse bg-gray-700 h-8 w-16 block rounded"></span> : card.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Campaign Performance Chart (Deep Analytics) */}
            <div className="mb-8">
                <PerformanceChart />
            </div>

            {/* Quick Actions / Recent Activity (Placeholder for now) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-green-500" /> Recent Activity
                    </h3>
                    <div className="text-gray-500 text-sm italic py-8 text-center border border-dashed border-gray-800 rounded-xl">
                        No recent activity log available yet.
                    </div>
                </div>
                <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-900/30 rounded-2xl p-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="font-bold text-lg mb-2 text-blue-100">Quick Search</h3>
                        <p className="text-blue-300/60 text-sm mb-6">Find leads by name, phone, or tag instantly.</p>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search leads..."
                                className="w-full bg-gray-900/50 border border-blue-500/30 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 transition"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
