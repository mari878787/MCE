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
        <aside className="w-64 h-screen fixed left-0 top-0 border-r border-gray-200 bg-white z-50 flex flex-col">
            {/* Brand Header */}
            <div className="h-16 flex items-center px-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
                    <span className="font-bold text-lg text-gray-900 tracking-tight">MCE Engine</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all duration-200 group ${isActive
                                    ? 'bg-gray-100 text-blue-700 font-semibold' // Active: Light gray bg + Blue text (Meta style)
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                                }`}
                        >
                            <item.icon
                                size={20}
                                strokeWidth={isActive ? 2.5 : 2} // Thicker icon when active
                                className={isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}
                            />
                            <span className="text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile / Organization */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="w-9 h-9 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-500 font-medium overflow-hidden">
                        {/* Placeholder Avatar */}
                        <span>SA</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">Sales Team A</p>
                        <p className="text-xs text-gray-500 truncate">Rajoice Digital</p>
                    </div>
                    <div className="h-2 w-2 bg-green-500 rounded-full shadow-sm ring-2 ring-white" />
                </div>
            </div>
        </aside>
    );
}
