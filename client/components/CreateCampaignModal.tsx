'use client';

import { useState } from 'react';
import { X, Plus, Trash2, MessageSquare, Clock } from 'lucide-react';

interface CreateCampaignModalProps {
    onClose: () => void;
    onCreated: () => void;
}

interface Step {
    type: 'WHATSAPP' | 'DELAY';
    content: string;
}

export default function CreateCampaignModal({ onClose, onCreated }: CreateCampaignModalProps) {
    const [name, setName] = useState('');
    const [steps, setSteps] = useState<Step[]>([]);
    const [loading, setLoading] = useState(false);

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
            const res = await fetch('http://localhost:5000/api/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, steps })
            });

            if (res.ok) {
                onCreated();
                onClose();
            } else {
                alert('Failed to create campaign');
            }
        } catch (error) {
            console.error(error);
            alert('Error creating campaign');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/30">
                    <h2 className="text-2xl font-bold text-foreground">Create New Campaign</h2>
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
                        {loading ? 'Creating...' : 'Create Campaign'}
                    </button>
                </div>

            </div>
        </div>
    );
}
