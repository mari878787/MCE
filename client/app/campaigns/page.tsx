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
                    <h1 className="text-3xl font-bold text-foreground mb-2">Campaigns</h1>
                    <p className="text-muted-foreground">Manage your automated messaging campaigns.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus size={20} /> Create Campaign
                </button>
            </div>

            <div className="glass-card rounded-xl border border-border overflow-hidden bg-card">
                {loading && campaigns.length === 0 ? (
                    <div className="p-12 flex justify-center text-muted-foreground">
                        <Loader2 className="animate-spin" />
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-secondary/30 border-b border-border">
                            <tr>
                                <th className="p-4 text-muted-foreground font-medium">Name</th>
                                <th className="p-4 text-muted-foreground font-medium">Status</th>
                                <th className="p-4 text-muted-foreground font-medium">Target</th>
                                <th className="p-4 text-muted-foreground font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map(c => (
                                <tr key={c.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                                    <td className="p-4 text-foreground font-medium">{c.name}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${c.status === 'RUNNING' ? 'bg-green-500/10 text-green-600' :
                                            c.status === 'PAUSED' ? 'bg-yellow-500/10 text-yellow-600' :
                                                'bg-secondary text-muted-foreground'
                                            }`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-muted-foreground text-sm font-mono">{c.target_filter || 'All'}</td>
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        {c.status === 'DRAFT' && (
                                            <button
                                                onClick={() => handleStart(c.id, c.name)}
                                                className="text-green-600 hover:text-green-500 p-2 hover:bg-green-500/10 rounded-lg transition-colors"
                                                title="Start Campaign"
                                            >
                                                <Play size={18} />
                                            </button>
                                        )}
                                        {c.status === 'RUNNING' && (
                                            <button className="text-yellow-600 hover:text-yellow-500 p-2 hover:bg-yellow-500/10 rounded-lg transition-colors">
                                                <Pause size={18} />
                                            </button>
                                        )}
                                        <button className="text-muted-foreground hover:text-foreground p-2 hover:bg-secondary rounded-lg transition-colors">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {campaigns.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
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
