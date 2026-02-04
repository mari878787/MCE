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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="bg-white rounded-xl border border-gray-200 p-4 w-full flex items-center justify-between group cursor-pointer hover:shadow-md hover:border-blue-200 transition-all duration-200"
        >
            <div className="flex items-center gap-4">
                {/* Avatar / Score Indicator */}
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {name.charAt(0)}
                    </div>
                    {score > 50 && (
                        <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-[9px] font-bold px-1 py-0.5 rounded-full ring-2 ring-white flex items-center shadow-sm">
                            <Star size={7} fill="currentColor" className="mr-0.5" /> VIP
                        </div>
                    )}
                </div>

                {/* Info */}
                <div>
                    <h3 className="text-gray-900 font-semibold text-sm leading-tight group-hover:text-blue-600 transition-colors">{name}</h3>
                    <div className="flex items-center gap-2 text-gray-500 text-xs mt-1">
                        <span className="px-1.5 py-0.5 rounded-md bg-gray-100 border border-gray-200 uppercase tracking-wider text-[10px] font-medium text-gray-600">
                            {source}
                        </span>
                        <span>• {time}</span>
                    </div>
                </div>
            </div>

            {/* Status & Actions */}
            <div className="flex items-center gap-4">
                <div className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border 
          ${status === 'NEW' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        status === 'WON' ? 'bg-green-50 text-green-700 border-green-100' :
                            'bg-gray-50 text-gray-600 border-gray-100'}`}>
                    {status}
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button className="p-2 rounded-full hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors">
                        <MessageCircle size={16} />
                    </button>
                    <button className="p-2 rounded-full hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                        <Phone size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
