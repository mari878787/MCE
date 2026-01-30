'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Play, Settings, Plus, GitBranch, Zap } from 'lucide-react';

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
                        className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 transition cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-blue-900/40 p-2 rounded-lg group-hover:bg-blue-800/60 transition">
                                <GitBranch className="w-6 h-6 text-blue-400" />
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${wf.status === 'ACTIVE' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                                {wf.status || 'DRAFT'}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold mb-2 text-white">{wf.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
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
