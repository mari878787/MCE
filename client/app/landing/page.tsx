'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    MessageSquare,
    Users,
    Zap,
    BarChart3,
    Shield,
    ArrowRight,
    Check,
    Play,
    Sparkles,
    Target,
    Clock
} from 'lucide-react';

export default function LandingPage() {
    const features = [
        {
            icon: <MessageSquare className="w-6 h-6" />,
            title: 'WhatsApp Campaigns',
            description: 'Launch targeted WhatsApp campaigns that convert. Reach thousands of leads with personalized messages.'
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: 'Lead Management',
            description: 'Import, segment, and manage your leads effortlessly. Track every interaction in one place.'
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: 'Smart Automations',
            description: 'Build powerful automation workflows. Trigger messages based on user actions and behaviors.'
        },
        {
            icon: <BarChart3 className="w-6 h-6" />,
            title: 'Real-time Analytics',
            description: 'Track campaign performance with detailed insights. Optimize your strategy with data.'
        },
        {
            icon: <Target className="w-6 h-6" />,
            title: 'Audience Targeting',
            description: 'Segment your audience by tags, status, or custom fields for hyper-targeted campaigns.'
        },
        {
            icon: <Clock className="w-6 h-6" />,
            title: 'Scheduled Delivery',
            description: 'Schedule messages for the perfect time. Maximize engagement with smart timing.'
        }
    ];

    const stats = [
        { value: '10M+', label: 'Messages Sent' },
        { value: '50K+', label: 'Active Leads' },
        { value: '98%', label: 'Delivery Rate' },
        { value: '3x', label: 'ROI Increase' }
    ];

    return (
        <div className="min-h-screen bg-background overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-foreground">MCE</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
                        <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
                        <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Sign In
                        </Link>
                        <Link
                            href="/signup"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-40 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-60 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto relative">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            Supercharge Your Conversions
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
                            The Ultimate
                            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-transparent"> Conversion </span>
                            Engine
                        </h1>

                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                            Transform your leads into customers with powerful WhatsApp campaigns,
                            smart automations, and real-time analytics. All in one platform.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/signup"
                                className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-8 py-4 rounded-xl transition-all shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center gap-2"
                            >
                                Start Free Trial
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="group flex items-center gap-3 text-foreground font-medium px-6 py-4 rounded-xl hover:bg-secondary transition-colors">
                                <div className="w-12 h-12 bg-white border-2 border-border rounded-full flex items-center justify-center shadow-lg group-hover:border-blue-500 transition-colors">
                                    <Play className="w-5 h-5 text-blue-600 ml-0.5" fill="currentColor" />
                                </div>
                                Watch Demo
                            </button>
                        </div>
                    </motion.div>

                    {/* Stats Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="mt-20 bg-white border border-border rounded-2xl shadow-xl shadow-black/5 p-8"
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="text-center">
                                    <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-6 bg-gradient-to-b from-background to-secondary/30">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Everything You Need to Convert
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Powerful features designed to help you reach, engage, and convert your leads at scale.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group bg-white border border-border rounded-2xl p-6 hover:shadow-xl hover:shadow-black/5 transition-all hover:border-blue-200 hover:-translate-y-1"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-3xl p-12 md:p-16 text-center overflow-hidden"
                    >
                        {/* Decorative Elements */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                                <Shield className="w-4 h-4" />
                                14-Day Free Trial
                            </div>

                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                                Ready to Supercharge Your Sales?
                            </h2>
                            <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8 opacity-90">
                                Join thousands of businesses using MCE to automate their outreach and multiply their conversions.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    href="/signup"
                                    className="group bg-white text-blue-600 font-semibold px-8 py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl flex items-center gap-2 hover:bg-blue-50"
                                >
                                    Get Started Free
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href="/login"
                                    className="text-white font-medium px-8 py-4 rounded-xl border border-white/30 hover:bg-white/10 transition-colors"
                                >
                                    Sign In
                                </Link>
                            </div>

                            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-blue-100">
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4" />
                                    No credit card required
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4" />
                                    Cancel anytime
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-bold text-foreground">MCE</span>
                        </div>
                        <div className="flex items-center gap-8 text-sm text-muted-foreground">
                            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                            <a href="#" className="hover:text-foreground transition-colors">Support</a>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © 2026 MCE. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
