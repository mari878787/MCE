'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Play, Settings, Plus, GitBranch, Zap, Trash2 } from 'lucide-react';

export default function AutomationsPage() {
    const router = useRouter();
    const [workflows, setWorkflows] = useState<any[]>([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/workflows')
            .then(res => res.json())
            .then(data => setWorkflows(data))
            .catch(err => console.error(err));
    }, []);

    const handleCreate = () => {
        // For now, just navigate to a new ID (or 'new')
        // We'll handle 'new' in the builder or create a UUID here
        const newId = crypto.randomUUID();
        router.push(`/automations/${newId}`);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this workflow? This cannot be undone.')) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/workflows/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setWorkflows(prev => prev.filter(w => w.id !== id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleStatus = async (e: React.MouseEvent, wf: any) => {
        e.stopPropagation();
        const newStatus = wf.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/workflows/${wf.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setWorkflows(prev => prev.map(w => w.id === wf.id ? { ...w, status: newStatus } : w));
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-8 text-white max-w-7xl mx-auto h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Sparkles className="text-yellow-400" /> Automations
                    </h1>
                    <p className="text-gray-400 mt-1">Manage your intelligent workflow sequences.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                >
                    <Plus size={18} /> New Workflow
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workflows.map((wf) => (
                    <div
                        key={wf.id}
                        onClick={() => router.push(`/automations/${wf.id}`)}
                        className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 transition cursor-pointer group relative"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-blue-900/40 p-2 rounded-lg group-hover:bg-blue-800/60 transition">
                                <GitBranch className="w-6 h-6 text-blue-400" />
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => handleToggleStatus(e, wf)}
                                    className={`px-2 py-1 rounded text-xs font-semibold transition-colors border ${wf.status === 'ACTIVE'
                                        ? 'bg-green-900/30 text-green-400 border-green-900/50 hover:bg-green-900/50'
                                        : 'bg-yellow-900/30 text-yellow-400 border-yellow-900/50 hover:bg-yellow-900/50'}`}
                                    title={wf.status === 'ACTIVE' ? 'Click to Deactivate' : 'Click to Activate'}
                                >
                                    {wf.status || 'DRAFT'}
                                </button>
                                <button
                                    onClick={(e) => handleDelete(e, wf.id)}
                                    className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                                    title="Delete Workflow"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold mb-2 text-white">{wf.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                            {wf.description || 'No description provided.'}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-800 pt-4">
                            <span className="flex items-center gap-1"><Zap size={12} /> 0 Runs</span>
                            <span>Created {new Date(wf.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}

                {/* Create New Card (Empty State if no workflows) */}
                {workflows.length === 0 && (
                    <div
                        onClick={handleCreate}
                        className="border border-dashed border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 transition cursor-pointer min-h-[220px]"
                    >
                        <Plus className="w-10 h-10 mb-2 opacity-50" />
                        <span className="font-medium">Create your first workflow</span>
                    </div>
                )}
            </div>
        </div>
    );
}
