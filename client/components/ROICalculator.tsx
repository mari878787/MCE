'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ROICalculator() {
    const [roiData, setRoiData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [leadValue, setLeadValue] = useState(500); // Default $500
    const [campaignCost, setCampaignCost] = useState(50); // Default $50

    // Fetch Backend ROI Data (Real Data)
    useEffect(() => {
        const fetchROI = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/analytics/roi`);
                if (res.ok) {
                    const data = await res.json();
                    setRoiData(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchROI();
    }, []);

    // Calculator Logic (Interactive)
    const calculateProjectedROI = () => {
        if (campaignCost === 0) return 0;
        // Hypothetical: 10 leads * leadValue - cost
        // Let's make it simpler: Just (leadValue - cost) / cost for a single conversion unit?
        // No, let's output a multiplier.
        // Let's just track PROFIT based on inputs.
        return ((leadValue - campaignCost) / campaignCost) * 100;
    };

    if (loading) return <div className="animate-pulse bg-gray-800 rounded-2xl h-64 w-full" />;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col"
        >
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <span className="text-2xl">💰</span> ROI Calculator
                    </h3>
                    <p className="text-xs text-gray-500">Estimate campaign profitability.</p>
                </div>
            </div>

            {/* Real Stats from Backend */}
            <div className="grid grid-cols-3 gap-4 mb-6 bg-gray-900/50 p-4 rounded-xl border border-white/5">
                <div className="text-center">
                    <p className="text-xs text-gray-400 uppercase">Revenue</p>
                    <p className="text-lg font-bold text-green-400">${roiData?.revenue || 0}</p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-400 uppercase">Cost</p>
                    <p className="text-lg font-bold text-red-400">${roiData?.cost || 0}</p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-400 uppercase">Real ROI</p>
                    <p className={`text-lg font-bold ${roiData?.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {roiData?.roi || 0}%
                    </p>
                </div>
            </div>

            {/* Interactive Calculator */}
            <div className="space-y-4">
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Avg Lead Value ($)</label>
                    <input
                        type="number"
                        value={leadValue}
                        onChange={(e) => setLeadValue(Number(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Campaign Cost ($)</label>
                    <input
                        type="number"
                        value={campaignCost}
                        onChange={(e) => setCampaignCost(Number(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Projected ROI:</span>
                        <span className={`text-xl font-bold ${calculateProjectedROI() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {Math.round(calculateProjectedROI())}%
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
