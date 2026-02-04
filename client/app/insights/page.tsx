'use client';

import FunnelChart from '../../components/FunnelChart';
import GrowthChart from '../../components/GrowthChart';
import SentimentChart from '../../components/SentimentChart';
import HeatmapChart from '../../components/HeatmapChart';
import ROICalculator from '../../components/ROICalculator';

export default function InsightsPage() {
    return (
        <div className="p-8 text-gray-900 max-w-7xl mx-auto h-full overflow-y-auto">
            <h1 className="text-3xl font-bold mb-2">Deep Insights</h1>
            <p className="text-gray-600 mb-8">Analyze conversion funnels, database growth, and audience health.</p>

            {/* Row 1: Funnel & Growth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <FunnelChart />
                <GrowthChart />
            </div>

            {/* Row 2: Advanced Intelligence (AI) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="md:col-span-1">
                    <SentimentChart />
                </div>
                <div className="md:col-span-2">
                    <HeatmapChart />
                </div>
            </div>

            {/* Row 3: Enterprise Features (ROI & A/B) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="md:col-span-1">
                    <ROICalculator />
                </div>
                {/* Placeholder for A/B Testing */}
                <div className="md:col-span-2 bg-gray-900 border border-gray-800 p-6 rounded-2xl flex items-center justify-center min-h-[300px]">
                    <div className="text-center">
                        <h3 className="text-xl font-semibold text-white mb-2">⚖️ A/B Testing Lab</h3>
                        <p className="text-gray-500 max-w-xs mx-auto">Compare campaign variants side-by-side to optimize conversion rates.</p>
                        <button className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg opacity-50 cursor-not-allowed">Coming Soon</button>
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-4">Audience Segmentation</h3>
                <p className="text-gray-500 italic">Integration with live tags coming soon...</p>
            </div>
        </div>
    );
}
