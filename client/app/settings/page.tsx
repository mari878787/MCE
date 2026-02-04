'use client';

import { useEffect, useState } from 'react';
import { User, Building, Users, CreditCard, Plug, Lock, Smartphone, RefreshCw, CheckCircle, LogOut, Copy, Plus, MessageSquare, Trash2, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type Tab = 'profile' | 'organization' | 'team' | 'integrations' | 'billing' | 'templates';

export default function SettingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('profile');

    // --- Data States ---
    const [team, setTeam] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [orgSettings, setOrgSettings] = useState<any>({});
    const [loading, setLoading] = useState(false);

    // --- WhatsApp States ---
    const [waStatus, setWaStatus] = useState('LOADING');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [sheetUrl, setSheetUrl] = useState('');

    // --- Facebook States ---
    const [fbForms, setFbForms] = useState<any[]>([]);
    const [showMappingModal, setShowMappingModal] = useState(false);
    const [selectedForm, setSelectedForm] = useState<any>(null);
    const [formFields, setFormFields] = useState<any[]>([]);
    const [mapping, setMapping] = useState<any>({});

    const CRM_FIELDS = [
        { id: 'name', label: 'Full Name' },
        { id: 'phone', label: 'Phone Number' },
        { id: 'email', label: 'Email Address' },
        { id: 'ignore', label: 'Ignore (Don\'t Import)' }
    ];

    // --- Effects ---
    useEffect(() => {
        if (activeTab === 'team') fetchTeam();
        if (activeTab === 'organization') fetchSettings();
        if (activeTab === 'templates') fetchTemplates();
        if (activeTab === 'integrations') {
            fetchWaStatus();
            fetchSheetConfig();
        }
    }, [activeTab]);

    // Initial Load of Forms if connected
    useEffect(() => {
        if (activeTab === 'integrations' && orgSettings.fb_page_id) {
            fetchFbForms(orgSettings.fb_page_id);
        }
    }, [activeTab, orgSettings.fb_page_id]);

    // Detect Redirect from Facebook
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('fb_connected') === 'true') {
            fetchFbPages();
            window.history.replaceState({}, '', '/settings');
        }
    }, []);

    const [fbPages, setFbPages] = useState<any[]>([]);
    const [showFbSelector, setShowFbSelector] = useState(false);

    // --- API Calls ---
    const fetchTeam = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/team`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) setTeam(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/settings`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) setOrgSettings(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchWaStatus = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/whatsapp/status`);
            const data = await res.json();
            setWaStatus(data.status);
            setQrCode(data.qr);
        } catch (e) { console.error(e); }
    };

    const fetchSheetConfig = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/leads/sync-sheet/config`);
            const data = await res.json();
            if (data?.url) setSheetUrl(data.url);
        } catch (e) { console.error(e); }
    };

    const fetchFbForms = async (pageId: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/facebook/forms?pageId=${pageId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) setFbForms(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchFbPages = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/facebook/pages`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setFbPages(data);
                setShowFbSelector(true);
            }
        } catch (e) { console.error(e); }
    };

    const handleSelectPage = async (page: any) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/facebook/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    pageId: page.id,
                    pageName: page.name,
                    pageAccessToken: page.access_token
                })
            });
            setShowFbSelector(false);
            fetchSettings();
        } catch (e) { alert('Failed'); }
    };

    const handleOpenMapping = async (form: any) => {
        setSelectedForm(form);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/facebook/form/${form.id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            setFormFields(data.questions || []);
            setMapping({});
            setShowMappingModal(true);
        } catch (e) { alert('Failed to fetch fields'); }
    };

    const handleSaveMapping = async () => {
        if (!selectedForm) return;
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/facebook/mapping`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ formId: selectedForm.id, mapping })
            });
            setShowMappingModal(false);
            alert('Mapping Saved!');
        } catch (e) { alert('Failed to save'); }
    };
    // --- Fetch Templates (Restored) ---
    const fetchTemplates = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/quick-responses`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) setTemplates(await res.json());
        } catch (e) { console.error(e); }
    };

    // --- Tab Content Components ---

    const ProfileTab = () => (
        <div className="max-w-xl animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Profile</h2>

            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
                <div className="flex items-center gap-6 mb-6">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <button className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors">
                            Change Avatar
                        </button>
                        <p className="text-xs text-gray-500 mt-2">JPG or PNG. Max 1MB.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input type="text" defaultValue={user?.name} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input type="email" defaultValue={user?.email} disabled className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-500 cursor-not-allowed" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Lock size={18} className="text-gray-400" /> Security
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input type="password" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input type="password" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                    </div>
                    <div className="pt-2">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg text-sm transition-colors shadow-sm">
                            Update Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const TeamTab = () => (
        <div className="max-w-4xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
                    <p className="text-gray-500 text-sm">Manage who has access to your workspace.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 shadow-sm">
                    <Plus size={16} /> Invite Member
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                        <tr>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {team.length > 0 ? team.map((member) => (
                            <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{member.name}</p>
                                            <p className="text-xs text-gray-500">{member.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 capitalize">{member.role}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${member.status !== 'inactive' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {member.status || 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right text-gray-400">
                                    <button className="hover:text-gray-800">Edit</button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    No team members found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const IntegrationsTab = () => (
        <div className="max-w-3xl animate-fade-in space-y-8">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Connected Apps</h2>

                {/* WhatsApp Card - Migrated Logic */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex gap-4">
                            <div className="p-3 bg-green-50 rounded-xl">
                                <Smartphone className="text-green-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">WhatsApp Business</h3>
                                <p className="text-sm text-gray-500">Connect your phone to enable automation and messaging.</p>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${waStatus === 'CONNECTED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {waStatus}
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px] border border-gray-100">
                        {waStatus === 'LOADING' && (
                            <div className="flex flex-col items-center text-gray-500 animate-pulse">
                                <RefreshCw size={24} className="animate-spin mb-3" />
                                <p className="text-sm">Connecting to server...</p>
                            </div>
                        )}
                        {waStatus === 'QR_READY' && qrCode && (
                            <div className="text-center">
                                <div className="bg-white p-2 rounded-lg border border-gray-200 inline-block mb-3 shadow-sm">
                                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                                </div>
                                <p className="font-medium text-gray-900">Scan via WhatsApp &gt; Linked Devices</p>
                            </div>
                        )}
                        {waStatus === 'AUTHENTICATED' && (
                            <div className="text-center animate-in fade-in zoom-in-95">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle size={32} />
                                </div>
                                <h4 className="font-bold text-gray-900">Successfully Connected</h4>
                                <p className="text-sm text-gray-500 mb-4">Automation is active.</p>
                                <button
                                    onClick={async () => {
                                        if (!confirm('Disconnect WhatsApp session?')) return;
                                        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/whatsapp/logout`, { method: 'POST' });
                                        setWaStatus('DISCONNECTED');
                                        setQrCode(null);
                                    }}
                                    className="text-red-600 text-sm hover:underline flex items-center justify-center gap-1"
                                >
                                    <LogOut size={14} /> Disconnect
                                </button>
                            </div>
                        )}
                        {waStatus === 'CONNECTED' && (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle size={32} />
                                </div>
                                <h4 className="font-bold text-gray-900">Successfully Connected</h4>
                                <p className="text-sm text-gray-500 mb-4">Automation is active.</p>
                                <button
                                    onClick={async () => {
                                        await fetch('http://localhost:5000/api/whatsapp/logout', { method: 'POST' });
                                        setWaStatus('DISCONNECTED');
                                        setQrCode(null);
                                    }}
                                    className="text-red-600 text-sm hover:underline flex items-center justify-center gap-1"
                                >
                                    <LogOut size={14} /> Disconnect
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!confirm('This will delete all session files and require re-scanning QR. Continue?')) return;
                                        setWaStatus('LOADING');
                                        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/whatsapp/hard-reset`, { method: 'POST' });
                                        // Wait for server restart
                                        setTimeout(() => {
                                            fetchWaStatus();
                                        }, 5000);
                                    }}
                                    className="text-orange-500 text-xs hover:underline flex items-center justify-center gap-1 mt-3 opactiy-80"
                                >
                                    <RefreshCw size={12} /> Hard Reset Connection
                                </button>
                            </div>
                        )}
                        {waStatus === 'DISCONNECTED' && !qrCode && (
                            <div className="text-center text-gray-400">
                                <p>Disconnected. Refresh to retry.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Facebook Integration Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex gap-4">
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <span className="text-blue-600 text-2xl font-bold">f</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Facebook Lead Ads</h3>
                                <p className="text-sm text-gray-500">Sync leads from your Facebook & Instagram ads in real-time.</p>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${orgSettings.fb_page_id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {orgSettings.fb_page_id ? 'Connected' : 'Disconnected'}
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        {!orgSettings.fb_page_id ? (
                            <div className="text-center">
                                <button
                                    onClick={async () => {
                                        // 1. Get Auth URL
                                        try {
                                            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/facebook`, {
                                                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                                            });
                                            const data = await res.json();
                                            if (data.url) window.location.href = data.url;
                                        } catch (e) {
                                            alert('Failed to start Facebook Login');
                                        }
                                    }}
                                    className="bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold py-2.5 px-6 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 mx-auto"
                                >
                                    <span className="text-xl font-bold">f</span> Connect Facebook Account
                                </button>
                                <p className="text-xs text-gray-400 mt-3">Requires 'Manage Pages' and 'Leads Retrieval' permissions.</p>
                            </div>
                        ) : (
                            <div className="text-center animate-fade-in">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle size={32} />
                                </div>
                                <h4 className="font-bold text-gray-900">Connected to {orgSettings.fb_page_name || 'Page'}</h4>
                                <p className="text-sm text-gray-500 mb-4">Leads will appear in your inbox automatically.</p>

                                <div className="flex justify-center gap-4">
                                    <button className="text-sm text-blue-600 hover:underline">Test Webhook</button>
                                    <span className="text-gray-300">|</span>
                                    <button className="text-sm text-red-600 hover:underline">Disconnect</button>
                                </div>
                            </div>
                        )}

                        {/* Page Selection Mode (Hidden logic: if fb_connected param exists but no page selected) */}
                        {/* TODO: Implement Page Selector Modal/State if multiple pages found */}
                    </div>
                </div>

                {/* Webhook Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-4">
                            <div className="p-3 bg-purple-50 rounded-xl">
                                <Plug className="text-purple-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Universal Webhook</h3>
                                <p className="text-sm text-gray-500">Receive leads from Facebook Ads, WordPress, or Zapier.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <code className="flex-1 font-mono text-xs text-blue-600 break-all">
                            {`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/leads/ingest`}
                        </code>
                        <button className="p-2 hover:bg-white rounded-md transition-colors text-gray-500">
                            <Copy size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );

    const TemplatesTab = () => {
        const [showAdd, setShowAdd] = useState(false);
        const [newTitle, setNewTitle] = useState('');
        const [newContent, setNewContent] = useState('');
        const [newShortcut, setNewShortcut] = useState('');

        const handleCreate = async () => {
            if (!newTitle || !newContent) return;
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/quick-responses`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ title: newTitle, content: newContent, shortcut: newShortcut })
                });
                if (res.ok) {
                    setNewTitle('');
                    setNewContent('');
                    setNewShortcut('');
                    setShowAdd(false);
                    fetchTemplates();
                }
            } catch (e) { console.error(e); }
        };

        const handleDelete = async (id: string) => {
            if (!confirm('Delete this template?')) return;
            try {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/quick-responses/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                fetchTemplates();
            } catch (e) { console.error(e); }
        };

        return (
            <div className="max-w-4xl animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Quick Response Templates</h2>
                        <p className="text-gray-500 text-sm">Create pre-saved messages for faster replies.</p>
                    </div>
                    <button
                        onClick={() => setShowAdd(!showAdd)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Plus size={16} /> New Template
                    </button>
                </div>

                {showAdd && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Title (Internal Name)</label>
                                <input
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    placeholder="e.g. Intro Message"
                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Shortcut (Optional)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-400 text-sm">/</span>
                                    <input
                                        value={newShortcut}
                                        onChange={e => setNewShortcut(e.target.value)}
                                        placeholder="intro"
                                        className="w-full bg-white border border-gray-300 rounded-lg pl-6 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Message Content</label>
                            <textarea
                                value={newContent}
                                onChange={e => setNewContent(e.target.value)}
                                placeholder="Hi {name}, thanks for contacting us..."
                                rows={3}
                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">Tip: Use <b>{'{name}'}</b> to auto-insert the lead's name.</p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
                            <button onClick={handleCreate} disabled={!newTitle || !newContent} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Save Template</button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                    {templates.map(t => (
                        <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-gray-900">{t.title}</h3>
                                    {t.shortcut && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-mono">/{t.shortcut}</span>}
                                </div>
                                <button onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{t.content}</p>
                        </div>
                    ))}
                    {templates.length === 0 && !showAdd && (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <Zap size={32} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500">No templates yet. Create one to get started!</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const BillingTab = () => (
        <div className="max-w-3xl animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Billing & Plan</h2>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 text-white shadow-lg mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl" />

                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Current Plan</p>
                        <h3 className="text-3xl font-bold mb-4">Starter Plan</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <CheckCircle size={16} className="text-green-400" /> Basic Automation
                            <span className="mx-2">•</span>
                            <CheckCircle size={16} className="text-green-400" /> 100 Leads / mo
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold">$0<span className="text-sm text-gray-400 font-normal">/mo</span></p>
                        <p className="text-xs text-gray-400 mt-1">Free Tier Active</p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-4">Payment Method</h4>
                <div className="flex items-center justify-between p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded border border-gray-200 text-gray-400">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <p className="font-medium text-gray-500">No payment method added</p>
                            <p className="text-xs text-gray-400">Add a card to upgrade to Pro.</p>
                        </div>
                    </div>
                    <button className="text-sm text-blue-600 font-medium hover:underline">Add Card</button>
                </div>
            </div>
        </div>
    );

    // --- Navigation Items ---
    const navItems = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'organization', label: 'Organization', icon: Building },
        { id: 'team', label: 'Team Members', icon: Users },
        { id: 'templates', label: 'Response Templates', icon: MessageSquare },
        { id: 'integrations', label: 'Integrations', icon: Plug },
        { id: 'billing', label: 'Billing', icon: CreditCard },
    ];

    return (
        <div className="flex h-full bg-white">
            {/* Sidebar Navigation */}
            <div className="w-64 border-r border-gray-200 flex-shrink-0 bg-gray-50/50">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-gray-900">Settings</h1>
                </div>
                <nav className="px-3 space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as Tab)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === item.id
                                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200'
                                : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                                }`}
                        >
                            <item.icon size={18} className={activeTab === item.id ? 'text-blue-500' : 'text-gray-400'} />
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 bg-white min-h-[calc(100vh-4rem)]">
                {activeTab === 'profile' && <ProfileTab />}
                {activeTab === 'organization' && (
                    <div className="max-w-xl animate-fade-in">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Organization Settings</h2>
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                    <input type="text" defaultValue={orgSettings.company_name || 'Rajoice Digital'} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                                    <select defaultValue="UTC" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                                        <option>UTC (GMT+0)</option>
                                        <option>IST (GMT+5:30)</option>
                                        <option>EST (GMT-5)</option>
                                    </select>
                                </div>
                                <div className="pt-2">
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg text-sm transition-colors shadow-sm">
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'team' && <TeamTab />}
                {activeTab === 'templates' && <TemplatesTab />}
                {activeTab === 'integrations' && (
                    <>
                        <IntegrationsTab />
                        {showFbSelector && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
                                    <h3 className="text-lg font-bold mb-4">Select Facebook Page</h3>
                                    <p className="text-sm text-gray-500 mb-4">Choose the page you want to sync leads from.</p>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {fbPages.map(page => (
                                            <button
                                                key={page.id}
                                                onClick={() => handleSelectPage(page)}
                                                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center group"
                                            >
                                                <span className="font-medium">{page.name}</span>
                                                <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100">Connect &rarr;</span>
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setShowFbSelector(false)}
                                        className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-gray-700"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                        {showMappingModal && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in-95">
                                    <h3 className="text-lg font-bold mb-2">Map Form Fields</h3>
                                    <p className="text-sm text-gray-500 mb-6">Match fields from <b>{selectedForm?.name}</b> to your CRM.</p>

                                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                        {formFields.map(field => (
                                            <div key={field.id} className="grid grid-cols-2 gap-4 items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <div>
                                                    <p className="font-bold text-sm text-gray-800">{field.label}</p>
                                                    <p className="text-xs text-gray-400 font-mono">{field.type}</p>
                                                </div>
                                                <div>
                                                    <select
                                                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                                                        value={mapping[field.id] || ''}
                                                        onChange={(e) => setMapping({ ...mapping, [field.id]: e.target.value })}
                                                    >
                                                        <option value="">-- Select CRM Field --</option>
                                                        {CRM_FIELDS.map(crm => (
                                                            <option key={crm.id} value={crm.id}>{crm.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => setShowMappingModal(false)}
                                            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveMapping}
                                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                        >
                                            Save Mapping
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
                {activeTab === 'billing' && <BillingTab />}
            </div>
        </div>
    );
}
