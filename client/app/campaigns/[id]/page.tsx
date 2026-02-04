'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, MessageCircle, Clock, CheckCircle, Users, Activity, BarChart2 } from 'lucide-react';

export default function CampaignDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                // Fetch stats which now includes steps breakdown
                const res = await fetch(`http://localhost:5000/api/campaigns/${id}/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [id]);

    if (loading) return <div className="p-12 flex justify-center text-muted-foreground">Loading details...</div>;
    if (!stats) return <div className="p-12 text-center">Campaign not found</div>;

    const { audience, performance, steps } = stats;

    return (
        <div className="p-8 h-full overflow-y-auto max-w-5xl mx-auto">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
                <ArrowLeft size={18} /> Back to Campaigns
            </button>

            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={20} /></div>
                        <span className="text-sm font-medium text-gray-500">Total Audience</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{audience.total}</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Activity size={20} /></div>
                        <span className="text-sm font-medium text-gray-500">Active / Pending</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{audience.pending}</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><MessageCircle size={20} /></div>
                        <span className="text-sm font-medium text-gray-500">Messages Sent</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{performance.sent}</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><BarChart2 size={20} /></div>
                        <span className="text-sm font-medium text-gray-500">Open Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        {performance.sent > 0 ? Math.round((performance.read / performance.sent) * 100) + '%' : '-'}
                    </div>
                </div>
            </div>

            {/* Funnel / Steps View */}
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                Campaign Flow Analysis
            </h2>

            <div className="space-y-6 relative">
                {/* Connecting Line */}
                <div className="absolute left-[28px] top-8 bottom-8 w-0.5 bg-gray-200 -z-10"></div>

                {steps.map((step: any, idx: number) => (
                    <div key={idx} className="flex gap-6 items-start group">
                        {/* Step Icon */}
                        <div className={`w-14 h-14 rounded-full border-4 border-white shadow-sm flex items-center justify-center shrink-0 z-10 
                            ${step.type === 'WHATSAPP' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                            {step.type === 'WHATSAPP' ? <MessageCircle size={24} /> : <Clock size={24} />}
                        </div>

                        {/* Step Card */}
                        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-gray-900">
                                            {step.type === 'WHATSAPP' ? 'Message ' : 'Wait '} #{step.step_order}
                                        </span>
                                        <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                                            {step.type}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                        {step.type === 'WHATSAPP' ? `"${step.content}"` : `${step.content} Hours`}
                                    </p>
                                </div>

                                {/* Step Stats */}
                                <div className="flex gap-6 text-right">
                                    <div>
                                        <div className="text-xs text-uppercase font-semibold text-gray-400 mb-1">REACHED</div>
                                        <div className="text-xl font-bold text-gray-900 flex items-center justify-end gap-1">
                                            {step.completed + step.waiting}
                                            <span className="text-xs font-normal text-gray-400">leads</span>
                                        </div>
                                    </div>
                                    <div className="w-px bg-gray-100 self-stretch"></div>
                                    <div>
                                        <div className="text-xs text-uppercase font-semibold text-gray-400 mb-1">WAITING</div>
                                        <div className="text-xl font-bold text-blue-600 flex items-center justify-end gap-1">
                                            {step.waiting}
                                            <span className="text-xs font-normal text-blue-300">now</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Completion Node */}
                <div className="flex gap-6 items-center">
                    <div className="w-14 h-14 rounded-full border-4 border-white bg-blue-600 text-white shadow-sm flex items-center justify-center shrink-0 z-10">
                        <CheckCircle size={24} />
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                        {audience.finished} leads completed the campaign
                    </div>
                </div>
            </div>
        </div>
    );
}
