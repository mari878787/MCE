'use client';

import { useEffect, useState } from 'react';
import { Smartphone, RefreshCw, LogOut, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
    const [status, setStatus] = useState('LOADING'); // LOADING, DISCONNECTED, QR_READY, CONNECTED
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('whatsapp');
    const [sheetUrl, setSheetUrl] = useState('');
    const [sheetStatus, setSheetStatus] = useState<{ url: string, last_sync: string } | null>(null);
    const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    const WEBHOOK_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/leads/ingest`;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    useEffect(() => {
        const interval = setInterval(fetchStatus, 2000);
        fetchStatus();
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Fetch existing config
        fetch('http://localhost:5000/api/leads/sync-sheet/config')
            .then(res => res.json())
            .then(data => {
                if (data && data.url) {
                    setSheetStatus(data);
                    setSheetUrl(data.url);
                }
            })
            .catch(err => console.error('Failed to load sheet config', err));
    }, []);

    useEffect(() => {
        // Fetch Settings
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/settings`)
            .then(res => res.json())
            .then(data => {
                if (data.auto_reply_enabled !== undefined) {
                    setAutoReplyEnabled(data.auto_reply_enabled === 'true');
                }
            })
            .catch(console.error);
    }, []);

    const toggleAutoReply = async () => {
        const newValue = !autoReplyEnabled;
        setAutoReplyEnabled(newValue);
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'auto_reply_enabled', value: newValue })
            });
        } catch (err) {
            console.error('Failed to save setting', err);
            setAutoReplyEnabled(!newValue); // Revert
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/whatsapp/sync`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                alert(`Sync Complete! Processed ${data.count} chats.`);
            } else {
                alert('Sync Failed: ' + data.message);
            }
        } catch (err) {
            alert('Sync Request Failed');
        } finally {
            setIsSyncing(false);
        }
    };

    const fetchStatus = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/whatsapp/status`);
            const data = await res.json();
            console.log('WhatsApp Status:', data); // DEBUG
            setStatus(data.status);
            setQrCode(data.qr);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = async () => {
        await fetch('http://localhost:5000/api/whatsapp/logout', { method: 'POST' });
        setStatus('DISCONNECTED');
        setQrCode(null);
    };

    return (
        <div className="max-w-6xl mx-auto p-8 h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar">
            <h1 className="text-3xl font-bold text-white mb-8">Settings & Integrations</h1>

            <div className="flex gap-6 mb-8 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('whatsapp')}
                    className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'whatsapp' ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
                >
                    <div className="flex items-center gap-2">
                        <Smartphone size={18} /> WhatsApp
                    </div>
                    {activeTab === 'whatsapp' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400" />}
                </button>
                <button
                    onClick={() => setActiveTab('integrations')}
                    className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'integrations' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
                >
                    <div className="flex items-center gap-2">
                        <RefreshCw size={18} /> Integrations (Ads/Web)
                    </div>
                    {activeTab === 'integrations' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400" />}
                </button>
            </div>

            {/* WHATSAPP TAB */}
            {activeTab === 'whatsapp' && (
                <div className="glass-panel p-8 rounded-xl border border-white/10 animate-fade-in">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-green-500/20 text-green-500 rounded-lg">
                            <Smartphone size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">WhatsApp Connection</h2>
                            <p className="text-gray-400 text-sm">Scan to connect your phone for automation.</p>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px]">
                        {status === 'LOADING' && (
                            <div className="flex flex-col items-center text-gray-400 animate-pulse">
                                <RefreshCw size={32} className="animate-spin mb-4" />
                                <p>Initializing Client...</p>
                            </div>
                        )}

                        {status === 'QR_READY' && qrCode && (
                            <div className="text-center">
                                <div className="bg-white p-4 rounded-lg mb-4 inline-block">
                                    <img src={qrCode} alt="Scan me" className="w-64 h-64" />
                                </div>
                                <p className="text-white font-medium mb-2">Scan with WhatsApp</p>
                                <p className="text-gray-400 text-sm">Open WhatsApp &gt; Settings &gt; Linked Devices</p>
                            </div>
                        )}

                        {status === 'CONNECTED' && (
                            <div className="text-center w-full max-w-md">
                                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                                    <CheckCircle size={40} className="text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">System Online</h3>
                                <p className="text-green-400 mb-6">Automation is active and listening.</p>

                                {/* CONTROLS */}
                                <div className="bg-white/5 rounded-xl p-6 mb-6 text-left space-y-4 border border-white/10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white font-medium">Auto-Reply Bot</h4>
                                            <p className="text-xs text-gray-400">Respond to keywords automatically</p>
                                        </div>
                                        <button
                                            onClick={toggleAutoReply}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${autoReplyEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${autoReplyEnabled ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    <div className="h-px bg-white/10" />

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white font-medium">Chat History</h4>
                                            <p className="text-xs text-gray-400">Import recent chats from phone</p>
                                        </div>
                                        <button
                                            onClick={handleSync}
                                            disabled={isSyncing}
                                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors disabled:opacity-50"
                                        >
                                            {isSyncing ? 'Syncing...' : 'Sync Now'}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={async () => {
                                            try {
                                                await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/whatsapp/restart`, { method: 'POST' });
                                                alert('Restarting WhatsApp Service...');
                                                setStatus('LOADING');
                                            } catch (e) { alert('Failed to restart'); }
                                        }}
                                        className="px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-lg hover:bg-yellow-500/20 transition-colors flex items-center gap-2"
                                    >
                                        <RefreshCw size={16} /> Soft Restart
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2"
                                    >
                                        <LogOut size={16} /> Disconnect
                                    </button>
                                </div>
                            </div>
                        )}

                        {status === 'DISCONNECTED' && !qrCode && (
                            <div className="text-center text-gray-400">
                                <RefreshCw size={32} className="animate-spin mb-4 mx-auto" />
                                <p>Waiting for QR Code...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* INTEGRATIONS TAB */}
            {activeTab === 'integrations' && (
                <div className="space-y-6 animate-fade-in">

                    {/* Webhook Card */}
                    <div className="glass-panel p-6 rounded-xl border border-white/10 bg-gradient-to-br from-blue-900/20 to-purple-900/20">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="text-blue-400">⚡</span> Universal Webhook
                                </h3>
                                <p className="text-gray-400 text-sm mt-1">
                                    Connect Facebook Ads, WordPress, or any 3rd party tool by sending data here.
                                </p>
                            </div>
                            <div className="bg-blue-500/20 px-3 py-1 rounded text-xs text-blue-300 font-mono">
                                POST Method
                            </div>
                        </div>

                        <div className="bg-black/40 p-4 rounded-lg border border-white/5 flex justify-between items-center mb-4">
                            <code className="text-green-400 font-mono text-sm break-all">{WEBHOOK_URL}</code>
                            <button
                                onClick={() => copyToClipboard(WEBHOOK_URL)}
                                className="ml-4 text-gray-400 hover:text-white"
                            >
                                Copy
                            </button>
                        </div>

                        <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Accepted JSON Format</p>
                            <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
                                {`{
  "name": "Jane",
  "phone": "+919999988888",
  "email": "jane@example.com",
  "source": "fb_ads" // or any string
}`}
                            </pre>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Meta Ads */}
                        <div className="glass-panel p-6 rounded-xl border border-white/10 hover:border-blue-500/30 transition-colors">
                            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                                🟦 Meta / Facebook Ads
                            </h3>
                            <p className="text-sm text-gray-400 mb-4">
                                Use Zapier or Make to forward "New Lead" events to the Webhook URL above.
                            </p>
                            <div className="text-xs bg-yellow-500/10 text-yellow-500 p-2 rounded">
                                * Direct integration requires HTTPS (Live Server)
                            </div>
                        </div>

                        {/* WordPress */}
                        <div className="glass-panel p-6 rounded-xl border border-white/10 hover:border-blue-500/30 transition-colors">
                            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                                📝 WordPress / Elementor
                            </h3>
                            <p className="text-sm text-gray-400 mb-4">
                                Use the "Webhook" action in Elementor Forms and paste the URL.
                            </p>
                            <div className="text-xs bg-green-500/10 text-green-500 p-2 rounded">
                                * Works directly on localhost if tested locally
                            </div>
                        </div>

                        {/* Google Sheets */}
                        {/* Google Sheets (Native Sync) */}
                        <div className="glass-panel p-6 rounded-xl border border-white/10 hover:border-green-500/30 transition-colors col-span-1 md:col-span-2">
                            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                                <span className="text-green-500">📊</span> Google Sheets Sync
                            </h3>
                            <div className="space-y-4">
                                <p className="text-gray-400 text-sm">
                                    Paste your Google Sheet CSV Link below. <br />
                                    <span className="text-xs opacity-70">(File {'>'} Share {'>'} Publish to web {'>'} Link {'>'} CSV)</span>
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
                                        className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-2 text-white text-sm"
                                        value={sheetUrl}
                                        onChange={(e) => setSheetUrl(e.target.value)}
                                    />
                                    <button
                                        onClick={async () => {
                                            const url = sheetUrl;
                                            if (!url) return alert('Enter a URL');
                                            try {
                                                alert('Syncing...');
                                                const res = await fetch('http://localhost:5000/api/leads/sync-sheet', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ url })
                                                });
                                                const data = await res.json();
                                                alert(`Sync Complete!\nNew Leads: ${data.imported}\nTotal Rows: ${data.total}\n\nfound Columns: ${data.columns?.join(', ')}`);
                                                // Refresh status
                                                const statusRes = await fetch('http://localhost:5000/api/leads/sync-sheet/config');
                                                setSheetStatus(await statusRes.json());
                                            } catch (e) { alert('Sync Failed'); }
                                        }}
                                        className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-sm font-bold"
                                    >
                                        Sync Now
                                    </button>
                                </div>

                                {sheetStatus?.url && (
                                    <div className="bg-green-500/10 border border-green-500/20 rounded p-3 text-xs flex justify-between items-center">
                                        <span className="text-green-400 flex items-center gap-2">
                                            ✅ <b>Connected</b>
                                        </span>
                                        <span className="text-gray-400">
                                            Last Synced: {new Date(sheetStatus.last_sync).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
