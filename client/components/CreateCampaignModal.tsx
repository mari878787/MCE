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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1a1a24] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-2xl font-bold text-white">Create New Campaign</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                    
                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Campaign Name</label>
                        <input 
                            type="text" 
                            className="w-full bg-[#0b141a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="e.g., Welcome Series 2024"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Steps Builder */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <label className="block text-sm font-medium text-gray-400">Sequence Steps</label>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => addStep('WHATSAPP')}
                                    className="px-3 py-1.5 bg-[#005c4b] hover:bg-[#004f40] text-emerald-100 text-xs rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <MessageSquare size={14} /> Add Message
                                </button>
                                <button 
                                    onClick={() => addStep('DELAY')}
                                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Clock size={14} /> Add Delay
                                </button>
                            </div>
                        </div>

                        {steps.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                                <p className="text-gray-500 text-sm">No steps yet. Add a message or delay to start.</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            {steps.map((step, i) => (
                                <div key={i} className="flex gap-4 items-start group animate-in slide-in-from-left-4 fade-in duration-300">
                                    <div className="flex flex-col items-center gap-2 pt-2">
                                        <div className="w-6 h-6 rounded-full bg-white/10 text-white text-xs flex items-center justify-center font-bold">
                                            {i + 1}
                                        </div>
                                        {i < steps.length - 1 && <div className="w-0.5 h-full bg-white/10 min-h-[40px]" />}
                                    </div>
                                    
                                    <div className="flex-1 glass-panel p-4 rounded-xl border border-white/5 bg-[#0b141a]">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${step.type === 'WHATSAPP' ? 'text-emerald-400 bg-emerald-500/10' : 'text-blue-400 bg-blue-500/10'}`}>
                                                {step.type === 'WHATSAPP' ? 'Send Message' : 'Wait Duration'}
                                            </span>
                                            <button onClick={() => removeStep(i)} className="text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        {step.type === 'WHATSAPP' ? (
                                            <textarea
                                                className="w-full bg-[#1a1a24] border border-white/10 rounded-lg p-3 text-sm text-white resize-none focus:outline-none focus:border-emerald-500/50"
                                                rows={3}
                                                placeholder="Type your message here..."
                                                value={step.content}
                                                onChange={(e) => updateStep(i, e.target.value)}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-400 text-sm">Wait for</span>
                                                <input 
                                                    type="number" 
                                                    className="w-20 bg-[#1a1a24] border border-white/10 rounded-lg p-2 text-sm text-center text-white focus:outline-none focus:border-blue-500/50"
                                                    value={step.content}
                                                    onChange={(e) => updateStep(i, e.target.value)}
                                                    placeholder="24"
                                                />
                                                <span className="text-gray-400 text-sm">hours</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading || !name || steps.length === 0}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all"
                    >
                        {loading ? 'Creating...' : 'Create Campaign'}
                    </button>
                </div>

            </div>
        </div>
    );
}
