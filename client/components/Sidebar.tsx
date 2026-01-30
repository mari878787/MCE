'use client';

import { LayoutDashboard, Users, BarChart3, Settings, Zap, MessageSquare, Send, LayoutList } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { label: 'Inbox', icon: MessageSquare, href: '/inbox' },
    { label: 'Campaigns', icon: Send, href: '/campaigns' },
    { label: 'Automations', icon: Zap, href: '/automations' },
    { label: 'Segments', icon: Users, href: '/segments' },
    { label: 'Leads Pipeline', icon: LayoutList, href: '/leads' },
    { label: 'Insights', icon: BarChart3, href: '/insights' }, // Deep Analytics
    { label: 'Settings', icon: Settings, href: '/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 h-screen fixed left-0 top-0 border-r border-white/10 bg-black/40 backdrop-blur-xl z-50 flex flex-col">
            {/* Brand */}
            <div className="p-8">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                    MCE
                </h1>
                <p className="text-xs text-gray-500 tracking-widest mt-1">CONVERSION ENGINE</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group relative ${isActive
                                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} className={isActive ? 'text-blue-400' : 'group-hover:text-white'} />
                            <span className="font-medium text-sm">{item.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="active-nav"
                                    className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Status */}
            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500" />
                    <div>
                        <p className="text-sm font-medium text-white">Sales Team A</p>
                        <p className="text-xs text-green-400">● Online</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
