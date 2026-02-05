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
    Clock,
    Star,
    ChevronRight,
    Globe,
    Lock,
    Smartphone,
    Send,
    TrendingUp,
    FileText,
    Settings,
    Bell,
    Layers
} from 'lucide-react';

export default function LandingPage() {
    const features = [
        {
            icon: <MessageSquare className="w-6 h-6" />,
            title: 'WhatsApp Campaigns',
            description: 'Launch targeted WhatsApp campaigns that convert. Reach thousands of leads with personalized messages at scale.'
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: 'Lead Management',
            description: 'Import, segment, and manage your leads effortlessly. Track every interaction in one centralized platform.'
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: 'Smart Automations',
            description: 'Build powerful automation workflows. Trigger messages based on user actions and behaviors automatically.'
        },
        {
            icon: <BarChart3 className="w-6 h-6" />,
            title: 'Real-time Analytics',
            description: 'Track campaign performance with detailed insights. Optimize your strategy with actionable data.'
        },
        {
            icon: <Target className="w-6 h-6" />,
            title: 'Audience Targeting',
            description: 'Segment your audience by tags, status, or custom fields for hyper-targeted, personalized campaigns.'
        },
        {
            icon: <Clock className="w-6 h-6" />,
            title: 'Scheduled Delivery',
            description: 'Schedule messages for the perfect time. Maximize engagement with smart timing optimization.'
        }
    ];

    const stats = [
        { value: '10M+', label: 'Messages Sent' },
        { value: '50K+', label: 'Active Leads' },
        { value: '98%', label: 'Delivery Rate' },
        { value: '3x', label: 'ROI Increase' }
    ];

    const howItWorks = [
        {
            step: '01',
            icon: <Users className="w-8 h-8" />,
            title: 'Import Your Leads',
            description: 'Upload your leads via CSV or connect your existing CRM. Organize them with tags and custom fields.'
        },
        {
            step: '02',
            icon: <FileText className="w-8 h-8" />,
            title: 'Create Campaigns',
            description: 'Design compelling message templates with personalization. Set up targeting rules and delivery schedules.'
        },
        {
            step: '03',
            icon: <Send className="w-8 h-8" />,
            title: 'Launch & Engage',
            description: 'Start your campaign and watch the magic happen. Messages are delivered automatically to your audience.'
        },
        {
            step: '04',
            icon: <TrendingUp className="w-8 h-8" />,
            title: 'Track & Optimize',
            description: 'Monitor real-time analytics and conversion rates. Refine your strategy based on performance data.'
        }
    ];

    const testimonials = [
        {
            name: 'Rajesh Kumar',
            role: 'Marketing Director',
            company: 'TechStart Solutions',
            avatar: 'RK',
            content: 'MCE transformed our lead conversion process. We saw a 3x increase in response rates within the first month. The automation features are incredible.',
            rating: 5
        },
        {
            name: 'Priya Sharma',
            role: 'Founder & CEO',
            company: 'GrowthBox',
            avatar: 'PS',
            content: 'The best investment we made for our sales team. Managing 50,000+ leads is now effortless. Customer support is outstanding.',
            rating: 5
        },
        {
            name: 'Amit Patel',
            role: 'Sales Manager',
            company: 'RetailPro India',
            avatar: 'AP',
            content: 'We reduced our follow-up time by 80%. The WhatsApp integration is seamless and our customers love the instant communication.',
            rating: 5
        }
    ];

    const pricingPlans = [
        {
            name: 'Starter',
            price: '₹2,999',
            period: '/month',
            description: 'Perfect for small businesses getting started',
            features: [
                'Up to 5,000 leads',
                '10,000 messages/month',
                'Basic analytics',
                'Email support',
                '1 team member'
            ],
            cta: 'Start Free Trial',
            popular: false
        },
        {
            name: 'Professional',
            price: '₹7,999',
            period: '/month',
            description: 'For growing businesses with bigger needs',
            features: [
                'Up to 25,000 leads',
                '50,000 messages/month',
                'Advanced analytics',
                'Priority support',
                '5 team members',
                'Automation workflows',
                'API access'
            ],
            cta: 'Start Free Trial',
            popular: true
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            description: 'For large organizations with custom needs',
            features: [
                'Unlimited leads',
                'Unlimited messages',
                'Custom analytics',
                'Dedicated support',
                'Unlimited team members',
                'Advanced automations',
                'Custom integrations',
                'SLA guarantee'
            ],
            cta: 'Contact Sales',
            popular: false
        }
    ];

    const integrations = [
        { name: 'WhatsApp Business', icon: <Smartphone className="w-6 h-6" /> },
        { name: 'Google Sheets', icon: <Layers className="w-6 h-6" /> },
        { name: 'Zapier', icon: <Zap className="w-6 h-6" /> },
        { name: 'Webhooks', icon: <Globe className="w-6 h-6" /> },
        { name: 'REST API', icon: <Settings className="w-6 h-6" /> },
        { name: 'Notifications', icon: <Bell className="w-6 h-6" /> }
    ];

    return (
        <div className="min-h-screen bg-white overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-extrabold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">MCE</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">Features</a>
                        <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">How It Works</a>
                        <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">Pricing</a>
                        <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">Testimonials</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-orange-600 transition-colors">
                            Sign In
                        </Link>
                        <Link
                            href="/signup"
                            className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105"
                        >
                            Get Started Free →
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Vibrant Light Theme */}
            <section className="pt-28 pb-24 px-6 relative overflow-hidden bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
                {/* Vibrant Background Elements */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-400/20 via-pink-400/20 to-purple-400/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-400/20 via-pink-400/20 to-orange-400/20 rounded-full blur-3xl" />

                {/* Decorative Elements */}
                <div className="absolute top-32 left-10 w-4 h-4 bg-orange-500 rounded-full animate-bounce shadow-lg shadow-orange-500/50" style={{ animationDuration: '2s' }} />
                <div className="absolute top-48 right-20 w-3 h-3 bg-pink-500 rounded-full animate-bounce shadow-lg shadow-pink-500/50" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
                <div className="absolute bottom-32 left-1/4 w-5 h-5 bg-purple-500 rounded-full animate-bounce shadow-lg shadow-purple-500/50" style={{ animationDuration: '3s', animationDelay: '1s' }} />
                <div className="absolute top-60 left-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                <div className="absolute bottom-48 right-1/3 w-3 h-3 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="text-center max-w-5xl mx-auto"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-pink-100 border-2 border-orange-200 text-orange-700 px-5 py-2 rounded-full text-sm font-bold mb-8 shadow-lg shadow-orange-500/10"
                        >
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            🚀 #1 WhatsApp Marketing Platform in India
                        </motion.div>

                        {/* Main Headline */}
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-tight mb-6">
                            Turn Your Leads Into{' '}
                            <span className="relative">
                                <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                                    Revenue Machines
                                </span>
                                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                                    <path d="M2 10C50 4 100 2 150 6C200 10 250 4 298 8" stroke="url(#gradient)" strokeWidth="4" strokeLinecap="round" />
                                    <defs>
                                        <linearGradient id="gradient" x1="0" y1="0" x2="300" y2="0">
                                            <stop offset="0%" stopColor="#f97316" />
                                            <stop offset="50%" stopColor="#ec4899" />
                                            <stop offset="100%" stopColor="#9333ea" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
                            The <span className="font-bold text-gray-900">all-in-one WhatsApp marketing platform</span> that helps you reach, engage, and convert leads at scale with powerful automations.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                            <Link
                                href="/signup"
                                className="group relative bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white font-bold px-10 py-5 rounded-2xl transition-all shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 flex items-center gap-3 text-lg"
                            >
                                Start Free Trial
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="group flex items-center gap-4 text-gray-700 font-bold px-8 py-5 rounded-2xl bg-white border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all shadow-lg">
                                <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                                    <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                                </div>
                                <span className="text-lg">Watch Demo</span>
                            </button>
                        </div>

                        {/* Trust Indicators */}
                        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                                <span className="font-medium">No credit card required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                                <span className="font-medium">14-day free trial</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                                <span className="font-medium">Cancel anytime</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Bar - Vibrant */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="mt-20 bg-white border-2 border-gray-100 rounded-3xl shadow-2xl shadow-gray-200/50 p-8 relative overflow-hidden"
                    >
                        {/* Gradient accent */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600" />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { value: '10M+', label: 'Messages Sent', color: 'from-orange-500 to-pink-500' },
                                { value: '50K+', label: 'Active Leads', color: 'from-pink-500 to-purple-500' },
                                { value: '98%', label: 'Delivery Rate', color: 'from-purple-500 to-blue-500' },
                                { value: '3x', label: 'ROI Increase', color: 'from-green-500 to-teal-500' }
                            ].map((stat, idx) => (
                                <div key={idx} className="text-center">
                                    <div className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-2 font-semibold uppercase tracking-wide">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Trusted By Section */}
            <section className="py-16 px-6 bg-white border-y border-gray-100">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-sm font-semibold text-gray-400 mb-8 uppercase tracking-widest">Trusted by 1000+ growing businesses</p>
                    <div className="flex flex-wrap items-center justify-center gap-12">
                        {['TechCorp', 'GrowthX', 'ScaleUp', 'IndiaMart', 'RetailPro', 'StartupHub'].map((company, idx) => (
                            <div key={idx} className="text-2xl font-bold text-gray-300 hover:text-orange-500 transition-colors cursor-default">{company}</div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-28 px-6 bg-gradient-to-b from-white to-purple-50/50 relative">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-pink-100 border-2 border-orange-200 text-orange-700 px-5 py-2 rounded-full text-sm font-bold mb-6">
                            <Sparkles className="w-4 h-4" />
                            Powerful Features
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                            Everything You Need to{' '}
                            <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">Convert</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Powerful features designed to help you reach, engage, and convert your leads at scale.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: <MessageSquare className="w-6 h-6" />, title: 'WhatsApp Campaigns', description: 'Launch targeted WhatsApp campaigns that convert. Reach thousands of leads with personalized messages at scale.', color: 'orange' },
                            { icon: <Users className="w-6 h-6" />, title: 'Lead Management', description: 'Import, segment, and manage your leads effortlessly. Track every interaction in one centralized platform.', color: 'pink' },
                            { icon: <Zap className="w-6 h-6" />, title: 'Smart Automations', description: 'Build powerful automation workflows. Trigger messages based on user actions and behaviors automatically.', color: 'purple' },
                            { icon: <BarChart3 className="w-6 h-6" />, title: 'Real-time Analytics', description: 'Track campaign performance with detailed insights. Optimize your strategy with actionable data.', color: 'blue' },
                            { icon: <Target className="w-6 h-6" />, title: 'Audience Targeting', description: 'Segment your audience by tags, status, or custom fields for hyper-targeted, personalized campaigns.', color: 'green' },
                            { icon: <Clock className="w-6 h-6" />, title: 'Scheduled Delivery', description: 'Schedule messages for the perfect time. Maximize engagement with smart timing optimization.', color: 'amber' }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className={`group relative bg-white border-2 border-gray-100 rounded-2xl p-8 hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden ${feature.color === 'orange' ? 'hover:border-orange-300 hover:shadow-orange-500/10' :
                                    feature.color === 'pink' ? 'hover:border-pink-300 hover:shadow-pink-500/10' :
                                        feature.color === 'purple' ? 'hover:border-purple-300 hover:shadow-purple-500/10' :
                                            feature.color === 'blue' ? 'hover:border-blue-300 hover:shadow-blue-500/10' :
                                                feature.color === 'green' ? 'hover:border-green-300 hover:shadow-green-500/10' :
                                                    'hover:border-amber-300 hover:shadow-amber-500/10'
                                    }`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.color === 'orange' ? 'bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600' :
                                    feature.color === 'pink' ? 'bg-gradient-to-br from-pink-100 to-pink-200 text-pink-600' :
                                        feature.color === 'purple' ? 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600' :
                                            feature.color === 'blue' ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600' :
                                                feature.color === 'green' ? 'bg-gradient-to-br from-green-100 to-green-200 text-green-600' :
                                                    'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600'
                                    } group-hover:scale-110 transition-transform shadow-lg`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Detailed Feature: Campaign Builder */}
            <section className="py-28 px-6 bg-gradient-to-br from-orange-50 to-pink-50 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-orange-200/40 to-pink-200/40 rounded-full blur-3xl" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-pink-100 border-2 border-orange-200 text-orange-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                                <MessageSquare className="w-4 h-4" />
                                Campaign Builder
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                                Create Powerful Campaigns in{' '}
                                <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">Minutes</span>
                            </h2>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Our intuitive campaign builder lets you design, schedule, and launch targeted WhatsApp campaigns without any technical expertise.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Visual drag-and-drop campaign designer',
                                    'Pre-built templates for common use cases',
                                    'Dynamic personalization with merge tags',
                                    'A/B testing to optimize performance',
                                    'Smart scheduling by timezone',
                                    'Rate limiting protection'
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-gray-700 font-medium">
                                        <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md shadow-green-500/30">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-orange-500/10 border-2 border-orange-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-gray-900">New Campaign</h3>
                                    <span className="text-xs bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 px-3 py-1 rounded-full font-bold border border-orange-200">Draft</span>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-gray-500 font-semibold">Campaign Name</label>
                                        <div className="mt-1 bg-gray-50 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 border border-gray-100">Summer Sale Promo 2026</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 font-semibold">Target Audience</label>
                                        <div className="mt-2 flex gap-2">
                                            <span className="bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 text-xs px-3 py-1.5 rounded-full font-bold border border-orange-200">Premium Customers</span>
                                            <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs px-3 py-1.5 rounded-full font-bold border border-green-200">2,450 leads</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 font-semibold">Message Preview</label>
                                        <div className="mt-1 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl px-4 py-3 text-sm border-l-4 border-green-500 text-gray-700">
                                            Hi {'{{name}}'}, 🎉 Exclusive 30% off just for you!
                                        </div>
                                    </div>
                                    <button className="w-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 hover:from-orange-600 hover:via-pink-600 hover:to-purple-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02]">
                                        Launch Campaign →
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Detailed Feature: Lead Management */}
            <section className="py-28 px-6 bg-gradient-to-b from-purple-50 to-white relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-200/40 to-pink-200/40 rounded-full blur-3xl" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="order-2 lg:order-1"
                        >
                            <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-purple-500/10 border-2 border-purple-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-900">Lead Pipeline</h3>
                                    <div className="flex gap-2">
                                        <span className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg font-semibold text-gray-600">Filter</span>
                                        <span className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg font-semibold text-gray-600">Export</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { name: 'Arun Mehta', phone: '+91 98765 43210', status: 'Hot Lead', color: 'orange' },
                                        { name: 'Sneha Reddy', phone: '+91 87654 32109', status: 'Contacted', color: 'pink' },
                                        { name: 'Vikram Singh', phone: '+91 76543 21098', status: 'Interested', color: 'purple' },
                                        { name: 'Kavita Joshi', phone: '+91 65432 10987', status: 'Converted', color: 'green' }
                                    ].map((lead, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors border border-gray-100">
                                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                {lead.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 text-sm">{lead.name}</p>
                                                <p className="text-xs text-gray-500">{lead.phone}</p>
                                            </div>
                                            <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${lead.color === 'orange' ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border border-orange-200' :
                                                lead.color === 'pink' ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 border border-pink-200' :
                                                    lead.color === 'purple' ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border border-purple-200' :
                                                        'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200'
                                                }`}>{lead.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="order-1 lg:order-2"
                        >
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200 text-purple-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                                <Users className="w-4 h-4" />
                                Lead Management
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                                Manage Thousands of Leads{' '}
                                <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">with Ease</span>
                            </h2>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Import, organize, and track your leads in one central dashboard. Segment your audience and never lose track of a potential customer.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Bulk import via CSV, Excel, or Google Sheets',
                                    'Custom fields and tags for organization',
                                    'Advanced filtering and search capabilities',
                                    'Lead scoring and priority management',
                                    'Complete interaction history tracking',
                                    'Duplicate detection and merging'
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-gray-700 font-medium">
                                        <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-500/30">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Detailed Feature: Inbox */}
            <section className="py-28 px-6 bg-gradient-to-br from-green-50 to-teal-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-green-200/40 to-teal-200/40 rounded-full blur-3xl" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-teal-100 border-2 border-green-200 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                                <MessageSquare className="w-4 h-4" />
                                Unified Inbox
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                                All Conversations{' '}
                                <span className="bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">in One Place</span>
                            </h2>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Never miss a message again. Our unified inbox brings all your WhatsApp conversations together for quick responses.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Real-time message sync across devices',
                                    'Quick reply templates for faster responses',
                                    'Conversation assignment to team members',
                                    'Message read receipts and delivery status',
                                    'Media sharing support (images, documents)',
                                    'Conversation labels and priority flags'
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-gray-700 font-medium">
                                        <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md shadow-green-500/30">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-green-500/10 border-2 border-green-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-4 py-3 text-white rounded-xl mb-4">
                                    <h3 className="font-bold text-sm">Inbox</h3>
                                    <p className="text-xs text-green-100">12 unread conversations</p>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { name: 'Priya S.', message: 'Yes, I am interested in the premium plan!', time: '2m ago', unread: true },
                                        { name: 'Rahul M.', message: 'Can you share the pricing details?', time: '15m ago', unread: true },
                                        { name: 'Anita K.', message: 'Thank you for the quick response 👍', time: '1h ago', unread: false }
                                    ].map((chat, idx) => (
                                        <div key={idx} className={`p-4 flex items-center gap-3 rounded-xl transition-colors border ${chat.unread ? 'bg-gradient-to-r from-green-50 to-teal-50 border-green-100' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                {chat.name.split(' ')[0][0]}{chat.name.split(' ')[1]?.[0] || ''}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className={`text-sm ${chat.unread ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{chat.name}</p>
                                                    <span className="text-xs text-gray-500">{chat.time}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 truncate">{chat.message}</p>
                                            </div>
                                            {chat.unread && <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-full shadow-md shadow-green-500/50" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Detailed Feature: Analytics */}
            <section className="py-28 px-6 bg-gradient-to-b from-blue-50 to-indigo-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-blue-200/40 to-indigo-200/40 rounded-full blur-3xl" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="order-2 lg:order-1"
                        >
                            <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-blue-500/10 border-2 border-blue-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-gray-900">Analytics Dashboard</h3>
                                    <span className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1.5 rounded-full font-bold border border-blue-200">Last 30 days</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    {[
                                        { label: 'Messages Sent', value: '24,582', change: '+12%', color: 'orange' },
                                        { label: 'Open Rate', value: '89.2%', change: '+5%', color: 'green' },
                                        { label: 'Response Rate', value: '34.5%', change: '+8%', color: 'purple' },
                                        { label: 'Conversions', value: '1,247', change: '+23%', color: 'blue' }
                                    ].map((stat, idx) => (
                                        <div key={idx} className={`rounded-xl p-4 ${stat.color === 'orange' ? 'bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-100' :
                                            stat.color === 'green' ? 'bg-gradient-to-br from-green-50 to-teal-50 border border-green-100' :
                                                stat.color === 'purple' ? 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100' :
                                                    'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100'
                                            }`}>
                                            <p className="text-xs text-gray-500 font-semibold mb-1">{stat.label}</p>
                                            <p className={`text-2xl font-black ${stat.color === 'orange' ? 'bg-gradient-to-r from-orange-500 to-pink-500' :
                                                stat.color === 'green' ? 'bg-gradient-to-r from-green-500 to-teal-500' :
                                                    stat.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                                                        'bg-gradient-to-r from-blue-500 to-indigo-500'
                                                } bg-clip-text text-transparent`}>{stat.value}</p>
                                            <span className="text-xs text-green-600 font-bold">{stat.change}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="h-32 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl flex items-end justify-around px-4 pb-4 border border-blue-100">
                                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                                        <div
                                            key={i}
                                            className="w-4 bg-gradient-to-t from-blue-600 via-indigo-500 to-purple-400 rounded-t-lg shadow-md"
                                            style={{ height: `${h}%` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="order-1 lg:order-2"
                        >
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-200 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                                <BarChart3 className="w-4 h-4" />
                                Analytics & Insights
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                                Data-Driven Decisions{' '}
                                <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">Made Easy</span>
                            </h2>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Track every message, open, and conversion. Get the insights you need to optimize campaigns and maximize ROI.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Real-time campaign performance metrics',
                                    'Delivery, open, and response rate tracking',
                                    'Conversion attribution and ROI calculation',
                                    'Custom date ranges and comparison views',
                                    'Exportable reports for stakeholders',
                                    'Team performance leaderboards'
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-gray-700 font-medium">
                                        <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/30">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Detailed Feature: Automations */}
            <section className="py-28 px-6 bg-gradient-to-br from-amber-50 to-yellow-50 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-amber-200/40 to-yellow-200/40 rounded-full blur-3xl" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-200 text-amber-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                                <Zap className="w-4 h-4" />
                                Smart Automations
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                                Automate Your Entire{' '}
                                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Sales Workflow</span>
                            </h2>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Build powerful automation workflows that work 24/7. Trigger messages based on user actions and nurture leads automatically.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Visual workflow builder with drag-and-drop',
                                    'Trigger-based automation (time, action, event)',
                                    'Multi-step sequences with delays',
                                    'Conditional logic and branching paths',
                                    'Auto-tagging based on responses',
                                    'Integration with external webhooks'
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-gray-700 font-medium">
                                        <div className="w-6 h-6 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/30">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-amber-500/10 border-2 border-amber-100">
                                <h3 className="font-bold text-gray-900 mb-6">Welcome Sequence Workflow</h3>
                                <div className="space-y-4">
                                    {[
                                        { icon: '🎯', title: 'Trigger', desc: 'New lead added', color: 'orange' },
                                        { icon: '⏰', title: 'Wait', desc: '5 minutes', color: 'gray' },
                                        { icon: '📱', title: 'Send Message', desc: 'Welcome message', color: 'green' },
                                        { icon: '⏰', title: 'Wait', desc: '24 hours', color: 'gray' },
                                        { icon: '📱', title: 'Send Message', desc: 'Follow-up offer', color: 'green' },
                                        { icon: '🏷️', title: 'Add Tag', desc: 'Welcome sequence complete', color: 'purple' }
                                    ].map((step, idx) => (
                                        <div key={idx} className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg shadow-md ${step.color === 'orange' ? 'bg-gradient-to-br from-orange-100 to-amber-100 border border-orange-200' :
                                                    step.color === 'green' ? 'bg-gradient-to-br from-green-100 to-emerald-100 border border-green-200' :
                                                        step.color === 'purple' ? 'bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200' :
                                                            'bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200'
                                                }`}>
                                                {step.icon}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900 text-sm">{step.title}</p>
                                                <p className="text-xs text-gray-500">{step.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-28 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200 text-purple-700 px-5 py-2 rounded-full text-sm font-bold mb-6">
                            <Sparkles className="w-4 h-4" />
                            How It Works
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                            Get Started in{' '}
                            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">4 Simple Steps</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            From importing leads to launching campaigns, we've made the process incredibly simple.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {howItWorks.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.15 }}
                                className="relative"
                            >
                                {idx < howItWorks.length - 1 && (
                                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-orange-300 via-pink-300 to-purple-300 -translate-x-4" />
                                )}
                                <div className="text-center">
                                    <div className="relative inline-block mb-6">
                                        <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto shadow-xl ${
                                            idx === 0 ? 'bg-gradient-to-br from-orange-100 to-pink-100 text-orange-600 shadow-orange-500/20' :
                                            idx === 1 ? 'bg-gradient-to-br from-pink-100 to-purple-100 text-pink-600 shadow-pink-500/20' :
                                            idx === 2 ? 'bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 shadow-purple-500/20' :
                                            'bg-gradient-to-br from-green-100 to-teal-100 text-green-600 shadow-green-500/20'
                                        }`}>
                                            {step.icon}
                                        </div>
                                        <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg ${
                                            idx === 0 ? 'bg-gradient-to-r from-orange-500 to-pink-500' :
                                            idx === 1 ? 'bg-gradient-to-r from-pink-500 to-purple-500' :
                                            idx === 2 ? 'bg-gradient-to-r from-purple-500 to-indigo-500' :
                                            'bg-gradient-to-r from-green-500 to-teal-500'
                                        }`}>
                                            {step.step}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Integrations Section */}
            <section className="py-20 px-6 bg-gradient-to-b from-purple-50 to-pink-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-purple-200/40 to-pink-200/40 rounded-full blur-3xl" />
                
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-gray-900 mb-3">
                            Powerful <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Integrations</span>
                        </h2>
                        <p className="text-gray-600 text-lg">Connect with your favorite tools and services</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {integrations.map((integration, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white border-2 border-gray-100 rounded-xl p-4 text-center hover:shadow-xl hover:border-purple-200 hover:-translate-y-1 transition-all"
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                                    idx % 6 === 0 ? 'bg-gradient-to-br from-orange-100 to-pink-100 text-orange-600' :
                                    idx % 6 === 1 ? 'bg-gradient-to-br from-pink-100 to-purple-100 text-pink-600' :
                                    idx % 6 === 2 ? 'bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600' :
                                    idx % 6 === 3 ? 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600' :
                                    idx % 6 === 4 ? 'bg-gradient-to-br from-green-100 to-teal-100 text-green-600' :
                                    'bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-600'
                                }`}>
                                    {integration.icon}
                                </div>
                                <p className="text-sm font-bold text-gray-900">{integration.name}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-28 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-teal-100 border-2 border-green-200 text-green-700 px-5 py-2 rounded-full text-sm font-bold mb-6">
                            <Star className="w-4 h-4" />
                            Testimonials
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                            Loved by{' '}
                            <span className="bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">Businesses Everywhere</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            See what our customers have to say about their experience with MCE.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className={`bg-white border-2 rounded-2xl p-8 hover:shadow-2xl transition-all hover:-translate-y-1 ${
                                    idx === 0 ? 'border-orange-100 hover:border-orange-300 hover:shadow-orange-500/10' :
                                    idx === 1 ? 'border-pink-100 hover:border-pink-300 hover:shadow-pink-500/10' :
                                    'border-green-100 hover:border-green-300 hover:shadow-green-500/10'
                                }`}
                            >
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 leading-relaxed font-medium">"{testimonial.content}"</p>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                                        idx === 0 ? 'bg-gradient-to-br from-orange-500 to-pink-500 shadow-orange-500/30' :
                                        idx === 1 ? 'bg-gradient-to-br from-pink-500 to-purple-500 shadow-pink-500/30' :
                                        'bg-gradient-to-br from-green-500 to-teal-500 shadow-green-500/30'
                                    }`}>
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{testimonial.name}</p>
                                        <p className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-28 px-6 bg-gradient-to-b from-orange-50 to-pink-50 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-orange-200/40 to-pink-200/40 rounded-full blur-3xl" />
                
                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-pink-100 border-2 border-orange-200 text-orange-700 px-5 py-2 rounded-full text-sm font-bold mb-6">
                            <Sparkles className="w-4 h-4" />
                            Pricing
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                            Simple, <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">Transparent Pricing</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Choose the plan that fits your business. All plans include a 14-day free trial.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {pricingPlans.map((plan, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className={`relative bg-white rounded-2xl p-8 shadow-xl ${
                                    plan.popular 
                                        ? 'border-2 border-orange-400 shadow-2xl shadow-orange-500/20 scale-105' 
                                        : 'border-2 border-gray-100 hover:border-orange-200'
                                } transition-all`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg shadow-orange-500/30">
                                        Most Popular
                                    </div>
                                )}
                                <div className="text-center mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className={`text-4xl font-black ${
                                            plan.popular ? 'bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent' : 'text-gray-900'
                                        }`}>{plan.price}</span>
                                        <span className="text-gray-500">{plan.period}</span>
                                    </div>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                plan.popular 
                                                    ? 'bg-gradient-to-r from-orange-400 to-pink-500' 
                                                    : 'bg-gradient-to-r from-green-400 to-teal-500'
                                            }`}>
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/signup"
                                    className={`block w-full text-center py-3.5 rounded-xl font-bold transition-all ${plan.popular
                                        ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50'
                                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                    }`}
                                >
                                    {plan.cta}
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Security Section */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-gradient-to-r from-gray-900 via-purple-950 to-gray-900 rounded-3xl p-12 text-center shadow-2xl">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                            Enterprise-Grade <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Security</span>
                        </h2>
                        <p className="text-gray-300 max-w-2xl mx-auto mb-8 text-lg">
                            Your data is protected with industry-leading security measures. We're compliant with global data protection standards.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-300 font-medium">
                            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
                                <Shield className="w-5 h-5 text-green-400" />
                                End-to-End Encryption
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
                                <Shield className="w-5 h-5 text-blue-400" />
                                GDPR Compliant
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
                                <Shield className="w-5 h-5 text-purple-400" />
                                99.9% Uptime SLA
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-28 px-6 bg-gradient-to-b from-white to-orange-50">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 rounded-3xl p-12 md:p-16 text-center overflow-hidden shadow-2xl shadow-pink-500/20"
                    >
                        {/* Decorative Elements */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white px-5 py-2 rounded-full text-sm font-bold mb-6">
                                <Sparkles className="w-4 h-4" />
                                14-Day Free Trial
                            </div>

                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
                                Ready to Supercharge Your Sales?
                            </h2>
                            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
                                Join thousands of businesses using MCE to automate their outreach and multiply their conversions.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    href="/signup"
                                    className="group bg-white text-gray-900 font-bold px-8 py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl flex items-center gap-2 hover:scale-105"
                                >
                                    Get Started Free
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href="/login"
                                    className="text-white font-bold px-8 py-4 rounded-xl border-2 border-white/40 hover:bg-white/10 transition-colors"
                                >
                                    Sign In
                                </Link>
                            </div>

                            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-white/80 font-medium">
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

            {/* FAQ Section */}
            <section className="py-28 px-6 bg-gradient-to-b from-purple-50 to-white">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                            Frequently Asked <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Questions</span>
                        </h2>
                        <p className="text-xl text-gray-600">
                            Got questions? We've got answers.
                        </p>
                    </motion.div>

                    <div className="space-y-4">
                        {[
                            { q: 'What is MCE?', a: 'MCE (Marketing Conversion Engine) is an all-in-one platform for managing leads, launching WhatsApp campaigns, and automating your sales outreach.', color: 'orange' },
                            { q: 'Do I need WhatsApp Business API?', a: 'Yes, MCE integrates with WhatsApp Business to send messages. We can help you set up the integration during onboarding.', color: 'pink' },
                            { q: 'Can I import my existing leads?', a: 'Absolutely! You can import leads via CSV file, connect your existing CRM, or use our API to sync leads automatically.', color: 'purple' },
                            { q: 'Is there a free trial?', a: 'Yes, all plans come with a 14-day free trial. No credit card required to get started.', color: 'green' },
                            { q: 'What kind of support do you offer?', a: 'We offer email support for all plans, priority support for Professional, and dedicated support for Enterprise customers.', color: 'blue' }
                        ].map((faq, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                                className={`bg-white border-2 rounded-2xl p-6 hover:shadow-lg transition-all ${
                                    faq.color === 'orange' ? 'border-orange-100 hover:border-orange-200' :
                                    faq.color === 'pink' ? 'border-pink-100 hover:border-pink-200' :
                                    faq.color === 'purple' ? 'border-purple-100 hover:border-purple-200' :
                                    faq.color === 'green' ? 'border-green-100 hover:border-green-200' :
                                    'border-blue-100 hover:border-blue-200'
                                }`}
                            >
                                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                        faq.color === 'orange' ? 'bg-gradient-to-r from-orange-400 to-pink-500' :
                                        faq.color === 'pink' ? 'bg-gradient-to-r from-pink-400 to-purple-500' :
                                        faq.color === 'purple' ? 'bg-gradient-to-r from-purple-400 to-indigo-500' :
                                        faq.color === 'green' ? 'bg-gradient-to-r from-green-400 to-teal-500' :
                                        'bg-gradient-to-r from-blue-400 to-indigo-500'
                                    }`}>
                                        <ChevronRight className="w-4 h-4 text-white" />
                                    </div>
                                    {faq.q}
                                </h3>
                                <p className="text-gray-600 pl-8">{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t-2 border-gray-100 py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-black text-gray-900">MCE</span>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                The ultimate conversion engine for modern businesses. Automate your outreach and multiply your sales.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-4">Product</h4>
                            <ul className="space-y-2 text-gray-600">
                                <li><a href="#features" className="hover:text-orange-500 transition-colors">Features</a></li>
                                <li><a href="#pricing" className="hover:text-orange-500 transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-orange-500 transition-colors">Integrations</a></li>
                                <li><a href="#" className="hover:text-orange-500 transition-colors">API</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-4">Company</h4>
                            <ul className="space-y-2 text-gray-600">
                                <li><a href="#" className="hover:text-pink-500 transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-pink-500 transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-pink-500 transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-pink-500 transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
                            <ul className="space-y-2 text-gray-600">
                                <li><a href="#" className="hover:text-purple-500 transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-purple-500 transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-purple-500 transition-colors">Cookie Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t-2 border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-gray-600">
                            © 2026 MCE. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6 text-gray-600">
                            <a href="#" className="hover:text-orange-500 transition-colors font-medium">Twitter</a>
                            <a href="#" className="hover:text-pink-500 transition-colors font-medium">LinkedIn</a>
                            <a href="#" className="hover:text-purple-500 transition-colors font-medium">GitHub</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
