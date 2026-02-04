'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Users, AlertCircle, Play, TrendingUp, Search } from 'lucide-react';
import PerformanceChart from '../components/PerformanceChart';

export default function Dashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({ sent: 0, stopped: 0, queue: 0, recent_stops: [] });
    const [dateRange, setDateRange] = useState('30');
    const [loading, setLoading] = useState(true);
    const [recentLeads, setRecentLeads] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                // Mocking date range effect by re-fetching
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/analytics/whatsapp`);
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }

                // Fetch Recent Leads for Activity Feed
                const leadsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/leads?limit=5`);
                if (leadsRes.ok) {
                    const leadsData = await leadsRes.json();
                    setRecentLeads(leadsData.data || []);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [dateRange]);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const target = e.target as HTMLInputElement;
            if (target.value.trim()) {
                router.push(`/leads?search=${encodeURIComponent(target.value)}`);
            }
        }
    };

    const cards = [
        { title: 'Messages Sent', value: stats.sent.toLocaleString(), icon: <MessageSquare className="text-blue-500" />, trend: 'Total outbound', color: 'blue' },
        { title: 'Stopped (Kill Switch)', value: stats.stopped.toLocaleString(), icon: <AlertCircle className="text-red-500" />, trend: 'Opted out', color: 'red' },
        { title: 'Queue Pending', value: stats.queue.toLocaleString(), icon: <Users className="text-yellow-500" />, trend: 'Status: NEW', color: 'yellow' },
    ];

    return (
        <div className="p-8 text-gray-900 max-w-7xl mx-auto h-full overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500 text-sm mt-1">Real-time insights into your conversion engine.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => router.push('/campaigns/new')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 text-sm"
                    >
                        <Play size={16} fill="currentColor" /> Create Campaign
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2.5 rounded-lg ${card.color === 'blue' ? 'bg-blue-50 text-blue-600' : card.color === 'red' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                {card.icon}
                            </div>
                            <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${card.color === 'blue' ? 'bg-blue-50 text-blue-600' : card.color === 'red' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                {card.trend}
                            </span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">{card.title}</h3>
                        <div className="text-3xl font-bold text-gray-900 tracking-tight">
                            {loading ? <span className="animate-pulse bg-gray-100 h-8 w-16 block rounded"></span> : card.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Campaign Performance Chart */}
            <div className="mb-8 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Performance Trends</h3>
                        <p className="text-xs text-gray-500">Message delivery and engagement over the last {dateRange} days</p>
                    </div>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="text-xs border-gray-300 rounded-md text-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                    </select>
                </div>
                <PerformanceChart />
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-full flex flex-col">
                    <h3 className="font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-600" /> Recent Activity
                    </h3>
                    <div className="flex-1 flex flex-col gap-3 min-h-[180px]">
                        {recentLeads.length > 0 ? (
                            recentLeads.map((lead, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                        {lead.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{lead.name}</p>
                                        <p className="text-xs text-gray-500 truncate">Added via {lead.source || 'Import'}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400">
                                        {new Date(lead.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-100 rounded-xl bg-gray-50">
                                <TrendingUp size={24} className="text-gray-300 mb-2" />
                                <p className="text-sm text-gray-400 font-medium">No recent activity</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Search */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
                    {/* Decorative Circles */}
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl" />
                    <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl" />

                    <div className="relative z-10">
                        <h3 className="font-bold text-xl mb-2">Find Leads Instantly</h3>
                        <p className="text-blue-100 text-sm mb-6 opacity-90">Quickly locate any contact in your pipeline by name or phone.</p>

                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search leads (e.g. John Doe)..."
                                onKeyDown={handleSearch}
                                className="w-full bg-white text-gray-900 rounded-lg py-3.5 pl-11 pr-4 shadow-xl shadow-blue-900/10 placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
