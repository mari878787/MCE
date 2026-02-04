'use client';

import { useState } from 'react';
import { Bell, Search, HelpCircle, ChevronDown, Settings, Plus, MessageCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
    const { user, logout } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showOrgMenu, setShowOrgMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
            {/* Left: Context / Breadcrumbs */}
            <div className="flex items-center gap-4 relative">
                <h2 className="text-lg font-semibold text-gray-800 tracking-tight">
                    Startups
                </h2>
                <div className="h-4 w-px bg-gray-300" />
                <button
                    onClick={() => setShowOrgMenu(!showOrgMenu)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                    Rajoice Digital
                    <ChevronDown size={14} className="text-gray-400" />
                </button>

                {/* Org Menu Dropdown */}
                {showOrgMenu && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowOrgMenu(false)} />
                        <div className="absolute top-10 left-20 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-20 animate-in fade-in zoom-in-95 duration-100">
                            <div className="p-2 border-b border-gray-100">
                                <p className="text-xs font-semibold text-gray-500 px-2 py-1">YOUR ORGANIZATIONS</p>
                            </div>
                            <div className="p-1">
                                <button className="w-full text-left px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-md font-medium flex justify-between items-center">
                                    Rajoice Digital <span className="text-[10px] bg-blue-200 text-blue-700 px-1.5 rounded">CURRENT</span>
                                </button>
                                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors opacity-50 cursor-not-allowed" title="Multi-tenant feature coming soon">
                                    Acme Corp
                                </button>
                            </div>
                            <div className="p-2 border-t border-gray-100">
                                <button className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:text-blue-600 flex items-center gap-2">
                                    <Plus size={12} /> Create Organization
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                {/* Global Search */}
                <div className="relative hidden md:block group">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="h-9 w-64 bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 text-gray-800"
                    />
                </div>

                <div className="h-6 w-px bg-gray-200 mx-2" />

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Bell size={20} />
                        <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                    </button>

                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                            <div className="absolute top-12 right-0 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-20 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
                                <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                                    <button className="text-[10px] text-blue-600 hover:underline">Mark all read</button>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600">
                                                <Bell size={14} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-800 leading-tight mb-1">New lead assigned to you</p>
                                                <p className="text-xs text-gray-400">2 hours ago</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="p-8 text-center text-gray-400">
                                        <p className="text-xs">That's all for now!</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Help Modal Trigger */}
                <button
                    onClick={() => setShowHelp(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <HelpCircle size={20} />
                </button>

                {/* Help Modal */}
                {showHelp && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="absolute inset-0" onClick={() => setShowHelp(false)} />
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative z-10 animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <HelpCircle className="text-blue-500" /> Help & Support
                                </h3>
                                <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            <div className="space-y-2">
                                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center gap-3 group">
                                    <div className="bg-blue-100 p-2 rounded-md text-blue-600 group-hover:bg-blue-200 transition-colors">
                                        <Settings size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Documentation</p>
                                        <p className="text-xs text-gray-500">Read the integration guides</p>
                                    </div>
                                </button>
                                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center gap-3 group">
                                    <div className="bg-green-100 p-2 rounded-md text-green-600 group-hover:bg-green-200 transition-colors">
                                        <MessageCircle size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Contact Support</p>
                                        <p className="text-xs text-gray-500">Chat with an agent</p>
                                    </div>
                                </button>
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                                <p className="text-xs text-gray-400">v1.0.2 • MCE Client</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-3 pl-2 border-l border-gray-100 ml-2 hover:bg-gray-50 rounded-lg p-1 transition-colors"
                    >
                        <div className="text-right hidden md:block leading-tight">
                            <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin User'}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">Organizer</p>
                        </div>
                        <div className="h-9 w-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                    </button>

                    {showUserMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                            <div className="absolute top-12 right-0 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 animate-in fade-in zoom-in-95 duration-100 p-1">
                                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
                                    <Settings size={14} /> Profile Settings
                                </button>
                                <div className="h-px bg-gray-100 my-1" />
                                <button
                                    onClick={logout}
                                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 font-medium"
                                >
                                    <LogOut size={14} /> Log Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
