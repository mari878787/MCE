'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function HeatmapChart() {
    // 7 days x 24 hours grid
    const [grid, setGrid] = useState<number[][]>(Array(7).fill(0).map(() => Array(24).fill(0)));
    const [loading, setLoading] = useState(true);

    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const HOURS = [0, 6, 12, 18]; // Labels

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/analytics/heatmap`);
                if (!res.ok) return;
                const rows = await res.json();

                // Map rows { day_of_week: "1", hour_of_day: "14", value: 5 } to grid
                const newGrid = Array(7).fill(0).map(() => Array(24).fill(0));

                rows.forEach((r: any) => {
                    const d = parseInt(r.day_of_week);
                    const h = parseInt(r.hour_of_day);
                    if (!isNaN(d) && !isNaN(h)) {
                        newGrid[d][h] = r.value;
                    }
                });
                setGrid(newGrid);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Helper to get color intensity
    const getColor = (val: number) => {
        if (val === 0) return 'bg-gray-800/50';
        if (val < 5) return 'bg-green-900/40';
        if (val < 10) return 'bg-green-700/60';
        return 'bg-green-500';
    };

    if (loading) return <div className="animate-pulse bg-gray-800 rounded-2xl h-80 w-full mb-8" />;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6 rounded-2xl border border-white/10 col-span-1 md:col-span-2"
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <span className="text-2xl">🔥</span> Activity Heatmap
                    </h3>
                    <p className="text-xs text-gray-500">Best time to send messages based on reply density.</p>
                </div>
                <div className="flex gap-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-800/50 rounded-sm"></div> Low</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> High</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                    <div className="flex">
                        <div className="w-10"></div> {/* Y-Axis Label Space */}
                        <div className="flex-1 grid grid-cols-24 text-[10px] text-gray-500 mb-2">
                            {Array.from({ length: 24 }).map((_, i) => (
                                <div key={i} className="text-center">{i % 6 === 0 ? `${i}h` : ''}</div>
                            ))}
                        </div>
                    </div>

                    {grid.map((row, dayIdx) => (
                        <div key={dayIdx} className="flex items-center gap-2 mb-1">
                            <div className="w-10 text-xs text-gray-400 font-medium">{DAYS[dayIdx]}</div>
                            <div className="flex-1 grid grid-cols-24 gap-1">
                                {row.map((val, hourIdx) => (
                                    <div
                                        key={hourIdx}
                                        className={`aspect-square rounded-sm transition hover:scale-125 cursor-help ${getColor(val)}`}
                                        title={`${DAYS[dayIdx]} @ ${hourIdx}:00 - ${val} messages`}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
