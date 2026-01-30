'use client';

import { useEffect, useState } from 'react';
import LeadCard from '../../components/LeadCard';
import ChatWindow from '../../components/ChatWindow'; // Reuse ChatWindow
import { AnimatePresence } from 'framer-motion';

interface Lead {
    id: string;
    name: string;
    source: string;
    status: string;
    score: number;
    created_at: string;
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    useEffect(() => {
        fetch('http://localhost:5000/api/leads')
            .then(res => res.json())
            .then(data => setLeads(data))
            .catch(err => console.error(err));
    }, []);

    const [viewMode, setViewMode] = useState<'BOARD' | 'LIST'>('BOARD');

    const STATUS_COLUMNS = ['NEW', 'CONTACTED', 'VIP', 'CLOSED'];

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const formData = new FormData();
        formData.append('file', e.target.files[0]);
        try {
            alert('Uploading...');
            const res = await fetch('http://localhost:5000/api/leads/import', { method: 'POST', body: formData });
            const data = await res.json();
            alert(data.message + `\nImported: ${data.stats.imported}`);
            window.location.reload();
        } catch (err) { alert('Import failed'); }
    };

    return (
        <div className="max-w-[1600px] mx-auto h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
                <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold text-white">CRM Pipeline</h2>
                    <div className="bg-white/5 p-1 rounded-lg flex text-sm">
                        <button
                            onClick={() => setViewMode('BOARD')}
                            className={`px-3 py-1.5 rounded-md transition-colors ${viewMode === 'BOARD' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            Board
                        </button>
                        <button
                            onClick={() => setViewMode('LIST')}
                            className={`px-3 py-1.5 rounded-md transition-colors ${viewMode === 'LIST' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            List
                        </button>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => window.location.reload()} className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg">
                        🔄 Refresh
                    </button>
                    <label className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-all">
                        <span>📂 Import CSV</span>
                        <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                    </label>
                </div>
            </div>

            {viewMode === 'BOARD' ? (
                <div className="grid grid-cols-4 gap-6 h-full overflow-hidden pb-4">
                    {STATUS_COLUMNS.map(status => (
                        <div key={status} className="glass-panel rounded-xl flex flex-col h-full bg-white/5 border-white/5">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <h3 className="font-semibold text-gray-200">{status}</h3>
                                <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-gray-400">
                                    {leads.filter(l => (l.status || 'NEW') === status).length}
                                </span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {leads
                                    .filter(l => (l.status || 'NEW') === status)
                                    .map((lead) => (
                                        <div key={lead.id} onClick={() => setSelectedLead(lead)} className="cursor-pointer transform transition-transform hover:scale-[1.02]">
                                            <div className="bg-[#1a1a24] p-4 rounded-lg border border-white/5 hover:border-blue-500/30 shadow-lg">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-medium text-white">{lead.name}</h4>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded border ${lead.score > 50 ? 'border-green-500/30 text-green-400' : 'border-gray-600 text-gray-400'}`}>{lead.score}</span>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <span className="text-xs text-gray-500">{lead.source}</span>
                                                    <span className="text-[10px] text-gray-600">{new Date(lead.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-panel rounded-xl border border-white/10 overflow-hidden flex-1 bg-[#0a0a0f]">
                    <div className="overflow-x-auto h-full">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white/5 sticky top-0 z-10">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-400 border-b border-white/10">Name</th>
                                    <th className="p-4 text-sm font-semibold text-gray-400 border-b border-white/10">Phone</th>
                                    <th className="p-4 text-sm font-semibold text-gray-400 border-b border-white/10">Source</th>
                                    <th className="p-4 text-sm font-semibold text-gray-400 border-b border-white/10">Status</th>
                                    <th className="p-4 text-sm font-semibold text-gray-400 border-b border-white/10">Score</th>
                                    <th className="p-4 text-sm font-semibold text-gray-400 border-b border-white/10">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map((lead) => (
                                    <tr
                                        key={lead.id}
                                        onClick={() => setSelectedLead(lead)}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                                    >
                                        <td className="p-4 text-white font-medium group-hover:text-blue-400">{lead.name}</td>
                                        <td className="p-4 text-gray-400 font-mono text-xs">{(lead as any).phone || 'N/A'}</td>
                                        <td className="p-4 text-gray-400 text-sm">{lead.source}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs ${lead.status === 'VIP' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-400'}`}>
                                                {lead.status || 'NEW'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-400">{lead.score}</td>
                                        <td className="p-4 text-gray-500 text-xs">{new Date(lead.created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {leads.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">
                                            No leads found. Import CSV or sync Google Sheet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {selectedLead && (
                    <ChatWindow lead={selectedLead} onClose={() => setSelectedLead(null)} />
                )}
            </AnimatePresence>
        </div>
    );
}
