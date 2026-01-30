'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ABTestComparison() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [selection, setSelection] = useState({ a: '', b: '' });
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Fetch list of campaigns for dropdown
    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/campaigns`);
                if (res.ok) {
                    const data = await res.json();
                    setCampaigns(data);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchCampaigns();
    }, []);

    const runComparison = async () => {
        if (!selection.a || !selection.b) return;
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/analytics/ab-test?campaignA=${selection.a}&campaignB=${selection.b}`);
            if (res.ok) {
                const data = await res.json();
                setResult(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel p-6 rounded-2xl border border-white/10 md:col-span-2 flex flex-col h-full"
        >
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <span className="text-2xl">⚖️</span> A/B Testing Lab
                    </h3>
                    <p className="text-xs text-gray-500">Compare campaign performance side-by-side.</p>
                </div>
            </div>

            {/* Selection Controls */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Campaign A</label>
                    <select
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm"
                        value={selection.a}
                        onChange={(e) => setSelection({ ...selection, a: e.target.value })}
                    >
                        <option value="">Select Campaign...</option>
                        {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Campaign B</label>
                    <select
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm"
                        value={selection.b}
                        onChange={(e) => setSelection({ ...selection, b: e.target.value })}
                    >
                        <option value="">Select Campaign...</option>
                        {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            <button
                onClick={runComparison}
                disabled={!selection.a || !selection.b || loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-sm font-medium mb-6 disabled:opacity-50 transition"
            >
                {loading ? 'Analyzing...' : 'Run Comparison'}
            </button>

            {/* Results Grid */}
            {result && (
                <div className="grid grid-cols-3 gap-2 text-center bg-gray-900/50 p-4 rounded-xl border border-white/5 text-sm">
                    <div className="font-bold text-gray-400">Metric</div>
                    <div className="font-bold text-blue-400 line-clamp-1">{result.campaignA?.name || 'A'}</div>
                    <div className="font-bold text-purple-400 line-clamp-1">{result.campaignB?.name || 'B'}</div>

                    <div className="col-span-3 h-px bg-white/5 my-2"></div>

                    <div className="text-gray-400 text-left pl-2">Sent</div>
                    <div>{result.campaignA?.sent}</div>
                    <div>{result.campaignB?.sent}</div>

                    <div className="text-gray-400 text-left pl-2">Read Rate</div>
                    <div className={result.campaignA?.read > result.campaignB?.read ? 'text-green-400' : ''}>
                        {Math.round((result.campaignA?.read / (result.campaignA?.sent || 1)) * 100)}%
                    </div>
                    <div className={result.campaignB?.read > result.campaignA?.read ? 'text-green-400' : ''}>
                        {Math.round((result.campaignB?.read / (result.campaignB?.sent || 1)) * 100)}%
                    </div>

                    <div className="text-gray-400 text-left pl-2">Positive Replies</div>
                    <div className={result.campaignA?.positive > result.campaignB?.positive ? 'text-green-400 font-bold' : ''}>
                        {result.campaignA?.positive}
                    </div>
                    <div className={result.campaignB?.positive > result.campaignA?.positive ? 'text-green-400 font-bold' : ''}>
                        {result.campaignB?.positive}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
