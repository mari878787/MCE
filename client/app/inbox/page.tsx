'use client';

import Sidebar from '../../components/Sidebar';
import { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Paperclip, Send, Phone, Video, Info, RefreshCw, X, Mic, FileText, CheckCheck, Check, Smile, Zap, Archive, Clock, UserPlus, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function InboxPage() {
    const [chats, setChats] = useState<any[] | null>(null);
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]); // Team members
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [waStatus, setWaStatus] = useState('LOADING');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [templates, setTemplates] = useState<any[]>([]);
    const [showTemplates, setShowTemplates] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

    // Fetch WA Status
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/whatsapp/status`);
                const data = await res.json();
                setWaStatus(data.status);
                setQrCode(data.qr);
            } catch (error) {
                console.error('Failed to fetch WA status:', error);
            }
        };
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000); // Poll status
        return () => clearInterval(interval);
    }, []);

    const fetchChats = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/whatsapp/chats`)
            .then(res => res.json())
            .then(data => setChats(data))
            .catch(err => console.error(err));
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/whatsapp/sync`, { method: 'POST' });
            // Wait a moment for backend to process
            setTimeout(() => {
                fetchChats();
                setIsSyncing(false);
            }, 2000);
        } catch (error) {
            console.error('Sync failed:', error);
            setIsSyncing(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedChat) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('caption', input); // Optional: use current input as caption

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/whatsapp/chats/${encodeURIComponent(selectedChat.id)}/files`, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                console.log('File sent successfully');
                setInput(''); // Clear caption
                if (fileInputRef.current) fileInputRef.current.value = '';

                // Refresh messages
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/whatsapp/chats/${encodeURIComponent(selectedChat.id)}/messages`)
                    .then(res => res.json())
                    .then(data => setMessages(data));
            } else {
                console.error('Failed to send file');
                alert('Failed to send file');
            }
        } catch (err) {
            console.error(err);
            alert('Error sending file');
        }
    };

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        }
    };

    // Handle Scroll Events to determine if we should auto-scroll
    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShouldAutoScroll(isNearBottom);
    };

    // Auto-scroll only if user was already at the bottom or it's a new chat
    useEffect(() => {
        if (shouldAutoScroll) {
            setTimeout(scrollToBottom, 50);
        }
    }, [messages, shouldAutoScroll]);

    // Reset auto-scroll when changing chats
    useEffect(() => {
        setShouldAutoScroll(true);
    }, [selectedChat]);

    // Data Fetching
    useEffect(() => {
        // 1. Fetch Chats
        fetchChats();

        // 2. Fetch Team Users
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/team`)
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(err => console.error(err));
    }, []);

    // Fetch chats and templates when WA status becomes connected/authenticated
    useEffect(() => {
        if (waStatus === 'CONNECTED' || waStatus === 'AUTHENTICATED') {
            fetchChats();
            fetchTemplates();
        }
    }, [waStatus]);

    const handleSelectChat = (chat: any) => {
        setSelectedChat(chat);
        setMessages([]); // Clear previous

        // Optimistically clear unread count
        setChats(prev => prev ? prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c) : []);

        // Mark as read on backend
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/whatsapp/chats/${encodeURIComponent(chat.id)}/read`, { method: 'POST' })
            .catch(err => console.error('Error marking as read:', err));

        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/whatsapp/chats/${encodeURIComponent(chat.id)}/messages`)
            .then(res => res.json())
            .then(data => setMessages(data))
            .catch(err => console.error(err));
    };

    const handleAssign = async (userId: string) => {
        if (!selectedChat) return;
        try {
            console.log(`Assigning chat ${selectedChat.name} to user ${userId}`);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/team/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId: selectedChat.id, userId })
            });
            if (res.ok) {
                alert('Assigned successfully!');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchTemplates = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/quick-responses`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) setTemplates(await res.json());
        } catch (e) { console.error(e); }
    };

    const insertTemplate = (content: string) => {
        const leadName = selectedChat?.name || 'there';
        const processed = content.replace(/{name}/g, leadName);
        setInput(processed);
        setShowTemplates(false);
    };

    const sendMessage = async () => {
        if (!input.trim() || !selectedChat) return;
        const tempMsg = {
            id: 'temp-' + Date.now(),
            body: input,
            fromMe: true,
            timestamp: Date.now() / 1000
        };
        setMessages(prev => [...prev, tempMsg]);
        setInput('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/whatsapp/chats/${encodeURIComponent(selectedChat.id)}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: tempMsg.body })
            });
            if (!res.ok) {
                console.error('Failed to send');
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Poll for new messages every 3 seconds
    useEffect(() => {
        if (!selectedChat) return;
        const interval = setInterval(() => {
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/whatsapp/chats/${encodeURIComponent(selectedChat.id)}/messages`)
                .then(res => res.json())
                .then(data => {
                    setMessages(data);
                })
                .catch(err => console.error(err));
        }, 3000);
        return () => clearInterval(interval);
    }, [selectedChat]);

    return (
        <div className="flex h-screen bg-background text-foreground">
            <Sidebar />
            <div className="flex w-full">
                {/* Chat List */}
                <div className="w-80 border-r border-border flex flex-col bg-card">
                    <div className="p-4 border-b border-border">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Inbox</h2>
                            <button
                                onClick={handleSync}
                                disabled={isSyncing}
                                className={`p-2 rounded-full hover:bg-secondary transition-colors ${isSyncing ? 'animate-spin text-blue-500' : 'text-gray-500'}`}
                                title="Sync WhatsApp Chats"
                            >
                                <RefreshCw size={18} />
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                            <input
                                type="text"
                                placeholder="Search chats..."
                                className="w-full bg-secondary rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {/* Loading State */}
                        {chats === null && (
                            <div className="p-4 text-center text-muted-foreground">
                                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                                <p className="text-sm">Loading chats...</p>
                            </div>
                        )}

                        {/* Empty State */}
                        {Array.isArray(chats) && chats.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground">
                                <p className="text-sm mb-2">No active chats found.</p>
                                <p className="text-xs opacity-70">If you just connected, it may take a moment to sync.</p>
                                <button
                                    onClick={fetchChats}
                                    className="mt-4 text-xs text-primary hover:underline"
                                >
                                    Try Refreshing
                                </button>
                            </div>
                        )}

                        {/* Chat List */}
                        {Array.isArray(chats) && chats.map(chat => (
                            <div
                                key={chat.id}
                                onClick={() => handleSelectChat(chat)}
                                className={`p-4 border-b border-border hover:bg-secondary/50 cursor-pointer transition-colors ${selectedChat?.id === chat.id ? 'bg-primary/10' : ''}`}
                            >
                                <div className="flex justify-between mb-1">
                                    <span className="font-semibold text-foreground">{chat.name || chat.id}</span>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-xs text-muted-foreground">
                                            {chat.timestamp ? new Date(chat.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                        {chat.unreadCount > 0 && (
                                            <div className="bg-green-500 text-black text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                                                {chat.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{chat.lastMessage || 'No messages yet'}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                {selectedChat ? (
                    <div className="flex-1 flex flex-col bg-background">
                        {/* Header */}
                        <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold">
                                    {selectedChat.name?.[0]}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">{selectedChat.name}</h3>
                                    <p className="text-xs text-green-500">Online</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* Assignment Dropdown */}
                                <div className="relative group">
                                    <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground bg-secondary px-3 py-1.5 rounded-lg border border-border">
                                        <UserPlus size={16} />
                                        <span>Assign</span>
                                    </button>
                                    <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-xl overflow-hidden hidden group-hover:block z-20">
                                        {Array.isArray(users) && users.map(u => (
                                            <div
                                                key={u.id}
                                                onClick={() => handleAssign(u.id)}
                                                className="px-4 py-2 hover:bg-secondary cursor-pointer text-sm text-foreground"
                                            >
                                                {u.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <MoreVertical className="text-muted-foreground cursor-pointer" />
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                            className="flex-1 p-6 overflow-y-auto space-y-4 bg-secondary/5"
                        >
                            {messages.map((msg: any) => (
                                <div key={msg.id} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`${msg.fromMe ? 'bg-[#144D37] text-white' : 'bg-card border border-border text-foreground'} rounded-lg p-3 max-w-[300px] text-sm shadow-sm whitespace-pre-wrap break-words`}>
                                        {/* Media Content */}
                                        {msg.hasMedia && (
                                            <div className="mb-2">
                                                {msg.type === 'image' ? (
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/whatsapp/media/${encodeURIComponent(selectedChat.id)}/${encodeURIComponent(msg.id)}`}
                                                        alt="Image"
                                                        className="rounded-lg max-w-[200px] h-auto cursor-pointer hover:opacity-90 transition"
                                                        loading="lazy"
                                                    />
                                                ) : msg.type === 'video' ? (
                                                    <video
                                                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/whatsapp/media/${encodeURIComponent(selectedChat.id)}/${encodeURIComponent(msg.id)}`}
                                                        controls
                                                        className="rounded-lg max-w-[200px] h-auto"
                                                    />
                                                ) : (
                                                    <div className="p-3 bg-secondary/50 rounded-lg flex items-center gap-3">
                                                        {(msg.type === 'ptt' || msg.type === 'audio') && <Mic className="text-blue-400" />}
                                                        {msg.type === 'document' && <FileText className="text-orange-400" />}
                                                        <span className="text-xs opacity-70 uppercase tracking-wider">{msg.type}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {/* Message Body */}
                                        {msg.body}

                                        {/* Metadata + Ticks */}
                                        <div className="flex items-center justify-end gap-1 mt-1 opacity-70">
                                            <span className="text-[10px]">
                                                {new Date(msg.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {msg.fromMe && (
                                                <span>
                                                    {msg.ack === 3 ? (
                                                        <CheckCheck size={14} className="text-blue-500" />
                                                    ) : msg.ack === 2 ? (
                                                        <CheckCheck size={14} />
                                                    ) : msg.ack === 1 ? (
                                                        <Check size={14} />
                                                    ) : (
                                                        <Clock size={12} />
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {messages.length === 0 && (
                                <div className="text-center text-muted-foreground mt-10">No messages yet</div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-border bg-card relative">
                            {showTemplates && (
                                <div className="absolute bottom-20 left-4 w-64 bg-popover border border-border rounded-xl shadow-xl z-20 overflow-hidden animate-in slide-in-from-bottom-2">
                                    <div className="p-2 border-b border-border bg-secondary/20">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Quick Replies</p>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto">
                                        {templates.map(t => (
                                            <div
                                                key={t.id}
                                                onClick={() => insertTemplate(t.content)}
                                                className="px-3 py-2 hover:bg-secondary cursor-pointer border-b border-border/50 last:border-0"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-sm text-foreground">{t.title}</span>
                                                    {t.shortcut && <span className="text-[10px] bg-secondary text-secondary-foreground px-1.5 rounded font-mono">/{t.shortcut}</span>}
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">{t.content}</p>
                                            </div>
                                        ))}
                                        {templates.length === 0 && (
                                            <div className="p-4 text-center text-muted-foreground text-xs">
                                                No templates found. <br /> Add them in Settings.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-2 px-4 border border-border">
                                <Zap
                                    className={`cursor-pointer transition ${showTemplates ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground hover:text-yellow-500'}`}
                                    size={20}
                                    onClick={() => setShowTemplates(!showTemplates)}
                                />
                                <Smile className="text-muted-foreground cursor-pointer hover:text-foreground" size={20} />
                                <Paperclip
                                    className="text-muted-foreground cursor-pointer hover:text-foreground transition"
                                    size={20}
                                    onClick={() => fileInputRef.current?.click()}
                                />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                        // Simple slash command check
                                        if (e.target.value === '/') setShowTemplates(true);
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent border-none focus:outline-none text-sm py-2 text-foreground placeholder:text-muted-foreground"
                                />
                                <button
                                    onClick={sendMessage}
                                    className="bg-primary p-2 rounded-lg hover:bg-primary/90 text-primary-foreground transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-background">
                        {(waStatus === 'CONNECTED' || waStatus === 'AUTHENTICATED') ? (
                            <>
                                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                                    <Send size={32} className="opacity-50" />
                                </div>
                                <p>Select a chat to start messaging</p>
                            </>
                        ) : qrCode ? (
                            <div className="text-center p-8 bg-card border border-border rounded-xl shadow-lg">
                                <h3 className="text-xl font-bold text-foreground mb-4">Connect WhatsApp</h3>
                                <div className="bg-white p-2 rounded-lg inline-block mb-4">
                                    <img src={qrCode} alt="WhatsApp QR" className="w-64 h-64" />
                                </div>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                    Scan this QR code with your WhatsApp mobile app to connect directly.
                                </p>
                            </div>
                        ) : (
                            <div className="text-center p-8">
                                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <RefreshCw size={32} />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">WhatsApp Disconnected</h3>
                                <p className="text-muted-foreground mb-4">Connection lost or session expired.</p>
                                <button
                                    onClick={async () => {
                                        setWaStatus('LOADING');
                                        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/whatsapp/restart`, { method: 'POST' });
                                    }}
                                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    Reconnect WhatsApp
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
