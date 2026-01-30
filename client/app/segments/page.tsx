'use client';

import { Filter, UserPlus } from 'lucide-react';

export default function SegmentsPage() {
    return (
        <div className="p-8 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Audience Segments</h1>
                    <p className="text-gray-400">Target specific groups of leads.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <UserPlus size={20} /> Create Segment
                </button>
            </div>

            <div className="glass-panel rounded-xl border border-white/10 p-12 flex flex-col items-center justify-center text-center">
                <div className="bg-white/5 p-4 rounded-full mb-4">
                    <Filter size={48} className="text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Segments Created</h3>
                <p className="text-gray-400 max-w-md mb-6">
                    Segments allow you to filter leads based on tags, score, or behavior (e.g., "High Intent" or "Visited Pricing").
                </p>
                <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors">
                    Build Your First Segment
                </button>
            </div>
        </div>
    );
}
