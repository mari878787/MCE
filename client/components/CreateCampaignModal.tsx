'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, MessageSquare, Clock } from 'lucide-react';

interface CreateCampaignModalProps {
    onClose: () => void;
    onCreated: () => void;
    campaignId?: string; // If present, entering Edit Mode
}

interface Step {
    type: 'WHATSAPP' | 'DELAY';
    content: string;
}

export default function CreateCampaignModal({ onClose, onCreated, campaignId }: CreateCampaignModalProps) {
    const [name, setName] = useState('');
    const [targetType, setTargetType] = useState<'ALL' | 'TAG' | 'STATUS'>('ALL');
    const [targetValue, setTargetValue] = useState('');
    const [steps, setSteps] = useState<Step[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (campaignId) {
            setFetching(true);
            const token = localStorage.getItem('token');
            fetch(`http://localhost:5000/api/campaigns/${campaignId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.error) {
                        alert('Failed to load campaign');
                        onClose();
                        return;
                    }
                    setName(data.name);
                    // Parse target
                    if (data.target_filter && data.target_filter.startsWith('TAG:')) {
                        setTargetType('TAG');
                        setTargetValue(data.target_filter.replace('TAG:', ''));
                    } else if (data.target_filter && data.target_filter.startsWith('STATUS:')) {
                        setTargetType('STATUS');
                        setTargetValue(data.target_filter.replace('STATUS:', ''));
                    } else {
                        setTargetType('ALL');
                    }
                    // Map steps from DB format if needed (DB has lower case usually, ensures type matches)
                    setSteps(data.steps.map((s: any) => ({ type: s.type, content: s.content })));
                })
                .catch(err => {
                    console.error(err);
                    alert('Error loading campaign details');
                })
                .finally(() => setFetching(false));
        }
    }, [campaignId, onClose]);

    const addStep = (type: 'WHATSAPP' | 'DELAY') => {
        setSteps([...steps, { type, content: '' }]);
    };

    const removeStep = (index: number) => {
        setSteps(steps.filter((_, i) => i !== index));
    };

    const updateStep = (index: number, content: string) => {
        const newSteps = [...steps];
        newSteps[index].content = content;
        setSteps(newSteps);
    };

    const handleSubmit = async () => {
        if (!name || steps.length === 0) return;
        setLoading(true);

        try {
            const url = campaignId
                ? `http://localhost:5000/api/campaigns/${campaignId}`
                : 'http://localhost:5000/api/campaigns';

            const method = campaignId ? 'PUT' : 'POST';
            const token = localStorage.getItem('token');

            const finalTarget = targetType === 'TAG' ? `TAG:${targetValue}` : targetType === 'STATUS' ? `STATUS:${targetValue}` : 'ALL';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, steps, target_filter: finalTarget })
            });

            if (res.ok) {
                onCreated();
                onClose();
            } else {
                const err = await res.json();
                alert('Failed to save campaign: ' + (err.error || 'Unknown error'));
            }
        } catch (error) {
            console.error(error);
            alert('Error saving campaign');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-card w-full max-w-sm p-8 rounded-xl flex flex-col items-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                    <p className="text-muted-foreground">Loading campaign...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/30">
                    <h2 className="text-2xl font-bold text-foreground">{campaignId ? 'Edit Campaign' : 'Create New Campaign'}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">

                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Campaign Name</label>
                        <input
                            type="text"
                            className="w-full bg-input/50 border border-input rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                            placeholder="e.g., Welcome Series 2024"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Target Audience */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Target Audience</label>
                        <div className="flex gap-4 mb-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="targetType"
                                    checked={targetType === 'ALL'}
                                    onChange={() => setTargetType('ALL')}
                                    className="accent-primary"
                                />
                                <span className="text-sm text-foreground">All Leads</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="targetType"
                                    checked={targetType === 'TAG'}
                                    onChange={() => setTargetType('TAG')}
                                    className="accent-primary"
                                />
                                <span className="text-sm text-foreground">By Tag</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="targetType"
                                    checked={targetType === 'STATUS'}
                                    onChange={() => {
                                        setTargetType('STATUS');
                                        setTargetValue('NEW');
                                    }}
                                    className="accent-primary"
                                />
                                <span className="text-sm text-foreground">By Status</span>
                            </label>
                        </div>

                        {targetType === 'TAG' && (
                            <input
                                type="text"
                                className="w-full bg-input/50 border border-input rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-colors text-sm"
                                placeholder="Enter tag (e.g. #VIP)"
                                value={targetValue}
                                onChange={(e) => setTargetValue(e.target.value)}
                            />
                        )}

                        {targetType === 'STATUS' && (
                            <select
                                className="w-full bg-input/50 border border-input rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-colors text-sm appearance-none"
                                value={targetValue}
                                onChange={(e) => setTargetValue(e.target.value)}
                            >
                                <option value="NEW">New</option>
                                <option value="CONTACTED">Contacted</option>
                                <option value="INTERESTED">Interested</option>
                                <option value="VIP">VIP</option>
                                <option value="CLOSED">Closed</option>
                                <option value="WON">Won</option>
                                <option value="LOST">Lost</option>
                            </select>
                        )}
                    </div>

                    {/* Steps Builder */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <label className="block text-sm font-medium text-muted-foreground">Sequence Steps</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => addStep('WHATSAPP')}
                                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 text-xs rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <MessageSquare size={14} /> Add Message
                                </button>
                                <button
                                    onClick={() => addStep('DELAY')}
                                    className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 text-xs rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Clock size={14} /> Add Delay
                                </button>
                            </div>
                        </div>

                        {steps.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-secondary/20">
                                <p className="text-muted-foreground text-sm">No steps yet. Add a message or delay to start.</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            {steps.map((step, i) => (
                                <div key={i} className="flex gap-4 items-start group animate-in slide-in-from-left-4 fade-in duration-300">
                                    <div className="flex flex-col items-center gap-2 pt-2">
                                        <div className="w-6 h-6 rounded-full bg-secondary text-muted-foreground text-xs flex items-center justify-center font-bold">
                                            {i + 1}
                                        </div>
                                        {i < steps.length - 1 && <div className="w-0.5 h-full bg-border min-h-[40px]" />}
                                    </div>

                                    <div className="flex-1 glass-card p-4 rounded-xl border border-border bg-card/50">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${step.type === 'WHATSAPP' ? 'text-emerald-400 bg-emerald-500/10' : 'text-blue-400 bg-blue-500/10'}`}>
                                                {step.type === 'WHATSAPP' ? 'Send Message' : 'Wait Duration'}
                                            </span>
                                            <button onClick={() => removeStep(i)} className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        {step.type === 'WHATSAPP' ? (
                                            <textarea
                                                className="w-full bg-secondary/50 border border-input rounded-lg p-3 text-sm text-foreground resize-none focus:outline-none focus:border-primary"
                                                rows={3}
                                                placeholder="Type your message here..."
                                                value={step.content}
                                                onChange={(e) => updateStep(i, e.target.value)}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <span className="text-muted-foreground text-sm">Wait for</span>
                                                <input
                                                    type="number"
                                                    className="w-20 bg-secondary/50 border border-input rounded-lg p-2 text-sm text-center text-foreground focus:outline-none focus:border-primary"
                                                    value={step.content}
                                                    onChange={(e) => updateStep(i, e.target.value)}
                                                    placeholder="24"
                                                />
                                                <span className="text-muted-foreground text-sm">hours</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-secondary/30 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !name || steps.length === 0}
                        className="px-6 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all"
                    >
                        {loading ? 'Saving...' : campaignId ? 'Save Changes' : 'Create Campaign'}
                    </button>
                </div>

            </div>
        </div>
    );
}
