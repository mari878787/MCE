'use client';

import { useState, useEffect } from 'react';
import { Plus, Play, Pause, MoreVertical, Loader2 } from 'lucide-react';
import CreateCampaignModal from '../../components/CreateCampaignModal';

interface Campaign {
    id: string;
    name: string;
    status: string;
    sent?: number;
    openRate?: string;
    target_filter?: string;
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/campaigns');
            if (res.ok) {
                const data = await res.json();
                setCampaigns(data);
            }
        } catch (error) {
            console.error('Failed to load campaigns', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const handleStart = async (id: string, name: string) => {
        if (!confirm(`Start campaign "${name}" for all eligible leads?`)) return;
        try {
            const res = await fetch(`http://localhost:5000/api/campaigns/${id}/start`, { method: 'POST' });
            if (res.ok) {
                alert('Campaign Started! The queue is processing.');
                fetchCampaigns(); // Refresh status
            } else {
                alert('Failed to start');
            }
        } catch (e) { alert('Error starting campaign'); }
    };

    return (
        <div className="p-8 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Campaigns</h1>
                    <p className="text-gray-400">Manage your automated messaging campaigns.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                >
                    <Plus size={20} /> Create Campaign
                </button>
            </div>

            <div className="glass-panel rounded-xl border border-white/10 overflow-hidden bg-[#0a0a0f]">
                {loading && campaigns.length === 0 ? (
                    <div className="p-12 flex justify-center text-gray-500">
                        <Loader2 className="animate-spin" />
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="p-4 text-gray-400 font-medium">Name</th>
                                <th className="p-4 text-gray-400 font-medium">Status</th>
                                <th className="p-4 text-gray-400 font-medium">Target</th>
                                <th className="p-4 text-gray-400 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map(c => (
                                <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-white font-medium">{c.name}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${c.status === 'RUNNING' ? 'bg-green-500/20 text-green-400' :
                                                c.status === 'PAUSED' ? 'bg-yellow-500/20 text-yellow-500' :
                                                    'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-300 text-sm font-mono">{c.target_filter || 'All'}</td>
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        {c.status === 'DRAFT' && (
                                            <button
                                                onClick={() => handleStart(c.id, c.name)}
                                                className="text-green-400 hover:text-green-300 p-2 hover:bg-green-500/10 rounded-lg transition-colors"
                                                title="Start Campaign"
                                            >
                                                <Play size={18} />
                                            </button>
                                        )}
                                        {c.status === 'RUNNING' && (
                                            <button className="text-yellow-400 hover:text-yellow-300 p-2 hover:bg-yellow-500/10 rounded-lg transition-colors">
                                                <Pause size={18} />
                                            </button>
                                        )}
                                        <button className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {campaigns.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500">
                                        No campaigns found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {isCreateModalOpen && (
                <CreateCampaignModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreated={fetchCampaigns}
                />
            )}
        </div>
    );
}
