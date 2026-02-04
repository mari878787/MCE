'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Play, Pause, MoreVertical, Loader2, Edit, Trash2 } from 'lucide-react';
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
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const handleDuplicate = async (id: string) => {
        if (!confirm('Duplicate this campaign?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/campaigns/${id}/duplicate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchCampaigns();
                setActiveMenu(null);
            } else {
                alert('Failed to duplicate');
            }
        } catch (e) { alert('Error duplicating campaign'); }
    };

    const toggleMenu = (id: string) => {
        if (activeMenu === id) setActiveMenu(null);
        else setActiveMenu(id);
    };



    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/campaigns', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
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
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/campaigns/${id}/start`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert('Campaign Started! The queue is processing.');
                fetchCampaigns(); // Refresh status
            } else {
                const err = await res.json().catch(() => ({}));
                alert('Failed to start: ' + (err.error || 'Unknown error'));
            }
        } catch (e) { alert('Error starting campaign'); }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete campaign "${name}"? This cannot be undone.`)) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/campaigns/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchCampaigns();
            } else {
                alert('Failed to delete campaign');
            }
        } catch (e) { alert('Error deleting campaign'); }
    };

    const handlePause = async (id: string, name: string) => {
        if (!confirm(`Pause campaign "${name}"?`)) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/campaigns/${id}/pause`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchCampaigns();
            else alert('Failed to pause');
        } catch (e) { alert('Error pausing campaign'); }
    };

    const handleResume = async (id: string, name: string) => {
        if (!confirm(`Resume campaign "${name}"?`)) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/campaigns/${id}/resume`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchCampaigns();
            else alert('Failed to resume');
        } catch (e) { alert('Error resuming campaign'); }
    };

    const handleEdit = (id: string) => {
        setEditingId(id);
        setIsCreateModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setEditingId(null);
    };

    return (
        <div className="p-8 h-full overflow-y-auto" onClick={() => setActiveMenu(null)}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Campaigns</h1>
                    <p className="text-muted-foreground">Manage your automated messaging campaigns.</p>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsCreateModalOpen(true);
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus size={20} /> Create Campaign
                </button>
            </div>

            <div className="glass-card rounded-xl border border-border bg-card">
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
                                <th className="p-4 text-muted-foreground font-medium">Sent</th>
                                <th className="p-4 text-muted-foreground font-medium">Open Rate</th>
                                <th className="p-4 text-muted-foreground font-medium">Target</th>
                                <th className="p-4 text-muted-foreground font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map(c => (
                                <tr
                                    key={c.id}
                                    onClick={() => router.push(`/campaigns/${c.id}`)}
                                    className="border-b border-border hover:bg-secondary/20 transition-colors cursor-pointer"
                                >
                                    <td className="p-4 text-foreground font-medium">{c.name}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${c.status === 'RUNNING' ? 'bg-green-500/10 text-green-600' :
                                            c.status === 'PAUSED' ? 'bg-yellow-500/10 text-yellow-600' :
                                                'bg-secondary text-muted-foreground'
                                            }`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-muted-foreground text-sm font-mono">{c.sent || 0}</td>
                                    <td className="p-4 text-muted-foreground text-sm font-mono">{c.openRate || '-'}</td>
                                    <td className="p-4 text-muted-foreground text-sm font-mono">{c.target_filter || 'All'}</td>
                                    <td className="p-4 text-right relative">
                                        <div className="flex justify-end gap-2 items-center">
                                            {/* Quick Actions */}
                                            {c.status === 'DRAFT' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleStart(c.id, c.name); }}
                                                    className="text-green-600 hover:text-green-500 p-2 hover:bg-green-500/10 rounded-lg transition-colors"
                                                    title="Start Campaign"
                                                >
                                                    <Play size={18} />
                                                </button>
                                            )}
                                            {c.status === 'PAUSED' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleResume(c.id, c.name); }}
                                                    className="text-green-600 hover:text-green-500 p-2 hover:bg-green-500/10 rounded-lg transition-colors"
                                                    title="Resume Campaign"
                                                >
                                                    <Play size={18} />
                                                </button>
                                            )}
                                            {c.status === 'RUNNING' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handlePause(c.id, c.name); }}
                                                    className="text-yellow-600 hover:text-yellow-500 p-2 hover:bg-yellow-500/10 rounded-lg transition-colors"
                                                    title="Pause Campaign"
                                                >
                                                    <Pause size={18} />
                                                </button>
                                            )}

                                            {/* Menu Button */}
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleMenu(c.id);
                                                    }}
                                                    className="text-muted-foreground hover:text-foreground p-2 hover:bg-secondary rounded-lg transition-colors"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {activeMenu === c.id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                        <div className="py-1">
                                                            {(c.status === 'DRAFT' || c.status === 'PAUSED') && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleEdit(c.id); setActiveMenu(null); }}
                                                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary flex items-center gap-2"
                                                                >
                                                                    <Edit size={16} /> Edit
                                                                </button>
                                                            )}

                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDuplicate(c.id); }}
                                                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary flex items-center gap-2"
                                                            >
                                                                <span className="text-xs font-bold border rounded px-1">D</span> Duplicate
                                                            </button>

                                                            {(c.status === 'DRAFT' || c.status === 'PAUSED' || c.status === 'RUNNING') && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleDelete(c.id, c.name); setActiveMenu(null); }}
                                                                    className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"
                                                                >
                                                                    <Trash2 size={16} /> Delete
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {campaigns.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
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
                    onClose={handleCloseModal}
                    onCreated={fetchCampaigns}
                    campaignId={editingId || undefined}
                />
            )}
        </div>
    );
}
