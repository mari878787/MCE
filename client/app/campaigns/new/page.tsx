'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Smartphone, Mail, MessageSquare, Users, FileText, Send, Calendar } from 'lucide-react';

export default function NewCampaignPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // --- Form State ---
    const [formData, setFormData] = useState({
        name: '',
        type: 'WHATSAPP', // WHATSAPP, SMS, EMAIL
        audience: '',
        message: '',
        schedule: 'NOW', // NOW, LATER
    });

    const steps = [
        { id: 1, title: 'Campaign Setup', icon: FileText },
        { id: 2, title: 'Select Audience', icon: Users },
        { id: 3, title: 'Message Content', icon: MessageSquare },
        { id: 4, title: 'Review & Launch', icon: Send },
    ];

    const handleNext = () => setStep(s => Math.min(s + 1, 4));
    const handleBack = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        router.push('/campaigns'); // Redirect to list
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-8 flex flex-col">
            {/* Header */}
            <div className="max-w-4xl mx-auto w-full mb-8 flex items-center justify-between">
                <div>
                    <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-900 mb-2 flex items-center gap-1">
                        <ChevronLeft size={14} /> Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> System Online
                </div>
            </div>

            {/* Wizard Progress */}
            <div className="max-w-4xl mx-auto w-full mb-10">
                <div className="flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-0 rounded-full" />
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-blue-600 -z-0 rounded-full transition-all duration-500"
                        style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                    />

                    {steps.map((s) => {
                        const isCompleted = s.id < step;
                        const isCurrent = s.id === step;

                        return (
                            <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-4 ${isCompleted ? 'bg-blue-600 text-white border-blue-600' :
                                        isCurrent ? 'bg-white text-blue-600 border-blue-600' :
                                            'bg-gray-100 text-gray-400 border-gray-50'
                                    }`}>
                                    {isCompleted ? <Check size={18} /> : s.id}
                                </div>
                                <span className={`text-xs font-semibold uppercase tracking-wider ${isCurrent ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {s.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-3xl mx-auto w-full flex-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[400px] flex flex-col">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1"
                        >
                            {/* STEP 1: SETUP */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Campaign Details</h2>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. February Promo Blast"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            autoFocus
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Channel</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {[
                                                { id: 'WHATSAPP', label: 'WhatsApp', icon: Smartphone, color: 'bg-green-50 text-green-700 border-green-200' },
                                                { id: 'SMS', label: 'SMS', icon: MessageSquare, color: 'bg-blue-50 text-blue-700 border-blue-200' },
                                                { id: 'EMAIL', label: 'Email', icon: Mail, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
                                            ].map((type) => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => setFormData({ ...formData, type: type.id })}
                                                    className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${formData.type === type.id
                                                            ? `${type.color} ring-2 ring-offset-1 ring-blue-500 border-transparent`
                                                            : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-500'
                                                        }`}
                                                >
                                                    <type.icon size={28} />
                                                    <span className="font-semibold text-sm">{type.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: AUDIENCE */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Select Audience</h2>

                                    <div className="space-y-3">
                                        {[
                                            { id: 'ALL', label: 'All Leads', count: 1250, desc: 'Everyone in the database' },
                                            { id: 'NEW', label: 'New Leads', count: 45, desc: 'Leads added in last 24h' },
                                            { id: 'VIP', label: 'VIP Customers', count: 120, desc: 'High score leads (>80)' }
                                        ].map((seg) => (
                                            <div
                                                key={seg.id}
                                                onClick={() => setFormData({ ...formData, audience: seg.id })}
                                                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${formData.audience === seg.id
                                                        ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                                                        : 'bg-white border-gray-200 hover:border-blue-300'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.audience === seg.id ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                                        <Users size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900">{seg.label}</h3>
                                                        <p className="text-xs text-gray-500">{seg.desc}</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-mono font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                    {seg.count}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: MESSAGE */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Compose Message</h2>

                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Message Body</label>
                                            <textarea
                                                className="w-full h-64 bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-sm resize-none"
                                                placeholder="Hi {{name}}, we have a special offer for you..."
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            />
                                            <div className="flex gap-2 mt-2">
                                                <button className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border border-gray-200 text-gray-600 font-mono">{'{{name}}'}</button>
                                                <button className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border border-gray-200 text-gray-600 font-mono">{'{{email}}'}</button>
                                            </div>
                                        </div>

                                        {/* Preview Phone */}
                                        <div className="col-span-1">
                                            <div className="border-8 border-gray-800 rounded-[2rem] h-full bg-gray-100 overflow-hidden relative shadow-xl">
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-gray-800 rounded-b-xl" />
                                                <div className="h-full pt-8 px-3 pb-4 flex flex-col bg-[#e5ddd5]">
                                                    <div className="bg-white p-2 rounded-lg rounded-tl-none shadow-sm max-w-[90%] self-start mt-4 text-xs relative">
                                                        <div className="font-bold text-teal-600 text-[10px] mb-0.5">+91 999 888 7777</div>
                                                        {formData.message || 'Check out our new features!'}
                                                        <div className="text-[10px] text-gray-400 text-right mt-1">10:30 AM</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: REVIEW */}
                            {step === 4 && (
                                <div className="space-y-6">
                                    <div className="text-center py-6">
                                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                            <Send size={32} />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">Ready to Launch?</h2>
                                        <p className="text-gray-500">Review your campaign details below.</p>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-4">
                                        <div className="flex justify-between border-b border-gray-200 pb-2">
                                            <span className="text-gray-500">Campaign Name</span>
                                            <span className="font-medium">{formData.name}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-200 pb-2">
                                            <span className="text-gray-500">Channel</span>
                                            <span className="font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">{formData.type}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-200 pb-2">
                                            <span className="text-gray-500">Target Audience</span>
                                            <span className="font-medium">{formData.audience}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Schedule</span>
                                            <span className="font-medium flex items-center gap-1 text-blue-600">
                                                <Calendar size={14} /> Immediate
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Footer / Navigation */}
                    <div className="mt-auto pt-8 border-t border-gray-100 flex justify-between">
                        <button
                            onClick={handleBack}
                            disabled={step === 1}
                            className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Back
                        </button>

                        {step < 4 ? (
                            <button
                                onClick={handleNext}
                                disabled={!formData.name && step === 1}
                                className="px-6 py-2.5 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 flex items-center gap-2 transition-all shadow-lg shadow-gray-900/20"
                            >
                                Continue <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30"
                            >
                                {loading ? 'Launching...' : '🚀 Launch Campaign'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
