import { X, Phone, Mail, Calendar, Hash, Tag, Edit, Trash2, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Lead {
    id: string;
    name: string;
    source: string;
    status: string;
    score: number;
    created_at: string;
    phone?: string;
    email?: string;
    notes?: string;
    tags?: string[];
}

interface LeadDetailsPanelProps {
    lead: Lead;
    onClose: () => void;
    onEdit: () => void;
    onChat: () => void;
}

export default function LeadDetailsPanel({ lead, onClose, onEdit, onChat }: LeadDetailsPanelProps) {
    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[60] w-full max-w-md bg-white shadow-2xl border-l border-gray-200 flex flex-col"
        >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900">Lead Details</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onChat}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                        title="Chat with Lead"
                    >
                        <MessageCircle size={18} />
                    </button>
                    <button
                        onClick={onEdit}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Edit Lead"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {/* Profile Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-blue-100/50 text-blue-600 flex items-center justify-center text-2xl font-bold mb-4 border-4 border-white shadow-sm">
                        {lead.name.charAt(0)}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{lead.name}</h3>
                    <div className="mt-2 flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${lead.status === 'VIP' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                lead.status === 'CONTACTED' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                    lead.status === 'WON' ? 'bg-green-50 text-green-700 border-green-200' :
                                        'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                            {lead.status}
                        </span>
                        <span className="text-xs text-gray-400">ID: {lead.id.slice(0, 8)}</span>
                    </div>
                </div>

                {/* Score Card */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 text-white mb-8 shadow-lg">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Lead Score</div>
                        <div className={`text-lg font-bold ${lead.score > 70 ? 'text-green-400' : lead.score > 40 ? 'text-yellow-400' : 'text-gray-400'}`}>
                            {lead.score}/100
                        </div>
                    </div>
                    <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(lead.score, 100)}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className={`h-full rounded-full ${lead.score > 70 ? 'bg-green-500' : lead.score > 40 ? 'bg-yellow-500' : 'bg-gray-500'}`}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                        {lead.score > 70 ? 'High potential lead. Prioritize engagement.' : 'Nurture this lead to improve quality.'}
                    </p>
                </div>

                {/* Info Grid */}
                <div className="space-y-6">
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact Information</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                    <Phone size={16} />
                                </div>
                                <span className="text-gray-900 font-medium">{lead.phone || 'No phone'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                    <Mail size={16} />
                                </div>
                                <span className="text-gray-900 font-medium">{lead.email || 'No email'}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Lead Info</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                    <Calendar size={16} />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs">Created On</p>
                                    <p className="text-gray-900 font-medium">{new Date(lead.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                    <Hash size={16} />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs">Source</p>
                                    <p className="text-gray-900 font-medium">{lead.source}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {lead.notes && (
                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Notes</h4>
                            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed border border-gray-100">
                                {lead.notes}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
