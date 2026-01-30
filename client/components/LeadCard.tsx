'use client';

import { motion } from 'framer-motion';
import { Phone, MessageCircle, Calendar, Star } from 'lucide-react';

interface LeadProps {
    name: string;
    source: string;
    status: string;
    score: number;
    time: string;
    index: number;
}

export default function LeadCard({ name, source, status, score, time, index }: LeadProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="glass-card rounded-xl p-4 w-full flex items-center justify-between group cursor-pointer"
        >
            <div className="flex items-center gap-4">
                {/* Avatar / Score Indicator */}
                <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                        {name.charAt(0)}
                    </div>
                    {score > 50 && (
                        <div className="absolute -top-1 -right-1 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Star size={8} fill="black" /> VIP
                        </div>
                    )}
                </div>

                {/* Info */}
                <div>
                    <h3 className="text-white font-semibold text-lg leading-tight">{name}</h3>
                    <div className="flex items-center gap-2 text-gray-400 text-xs mt-1">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 uppercase tracking-wider text-[10px]">
                            {source}
                        </span>
                        <span>• {time}</span>
                    </div>
                </div>
            </div>

            {/* Status & Actions */}
            <div className="flex items-center gap-4">
                <div className={`text-sm font-medium px-3 py-1 rounded-full 
          ${status === 'NEW' ? 'bg-blue-500/20 text-blue-300' :
                        status === 'WON' ? 'bg-green-500/20 text-green-300' :
                            'bg-gray-500/20 text-gray-400'}`}>
                    {status}
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button className="p-2 rounded-full bg-green-500/20 hover:bg-green-500/40 text-green-400 transition-colors">
                        <MessageCircle size={18} />
                    </button>
                    <button className="p-2 rounded-full bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 transition-colors">
                        <Phone size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
