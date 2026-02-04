'use client';

import { useRef, useEffect, useState } from 'react';
import { Send, Check, CheckCheck, Clock, Paperclip, Smile, Bell, Zap } from 'lucide-react';

interface Message {
    id: string;
    type: string;
    direction: 'inbound' | 'outbound';
    content: string;
    timestamp: string;
    fromMe?: boolean;
    ack?: number; // 1=Sent, 2=Received, 3=Read
}

interface ChatWindowProps {
    lead: any;
    onClose: () => void;
}

export default function ChatWindow({ lead, onClose }: ChatWindowProps) {
    const [templates, setTemplates] = useState<any[]>([]);
    const [showTemplates, setShowTemplates] = useState(false);

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [showReminder, setShowReminder] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch Templates & Messages
    useEffect(() => {
        const token = localStorage.getItem('token');

        // Load Templates
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/quick-responses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setTemplates(data);
            })
            .catch(err => console.error('Failed to load templates', err));

        const fetchMessages = async () => {
            try {
                let url = `http://localhost:5000/api/leads/${lead.id}/messages`;
                const res = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setMessages(data);
                    } else {
                        setMessages([]);
                    }
                    // Only scroll if we are near bottom or first load? For now just scroll.
                    // setTimeout(scrollToBottom, 50); 
                }
            } catch (err) {
                console.error('Failed to load chat', err);
            }
        };
        fetchMessages();

        // Refresh messages every 3s for live updates
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);

    }, [lead.id]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !lead) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('caption', input);

        try {
            let targetId = lead.id;
            // Best effort chat ID resolution
            if (lead.phone) targetId = lead.phone.replace(/\D/g, '') + '@c.us';

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/whatsapp/chats/${encodeURIComponent(targetId)}/files`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            });

            if (res.ok) {
                console.log('File sent successfully');
                setInput('');
                if (fileInputRef.current) fileInputRef.current.value = '';
            } else {
                alert('Failed to send file');
            }
        } catch (err) {
            alert('Error sending file');
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        // Optimistic Update
        const newMsg: Message = {
            id: Date.now().toString(),
            type: 'whatsapp',
            direction: 'outbound',
            content: input,
            timestamp: new Date().toISOString(),
            fromMe: true,
            ack: 0
        };
        setMessages(prev => [...prev, newMsg]);
        const msgContent = input;
        setInput('');
        setTimeout(scrollToBottom, 50);

        try {
            if (lead.phone) {
                const chatId = lead.phone.replace(/\D/g, '') + '@c.us';
                await fetch(`http://localhost:5000/api/whatsapp/chats/${encodeURIComponent(chatId)}/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ content: msgContent })
                });
            } else {
                await fetch(`http://localhost:5000/api/leads/${lead.id}/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ content: msgContent, direction: 'outbound' })
                });
            }
        } catch (err) {
            console.error('Failed to send message', err);
        }
    };

    const handleSetReminder = async (minutes: number) => {
        const date = new Date();
        date.setMinutes(date.getMinutes() + minutes);
        const reminderAt = date.toISOString();

        try {
            const res = await fetch(`http://localhost:5000/api/leads/${lead.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ reminder_at: reminderAt, reminder_note: 'Follow up' })
            });

            if (res.ok) {
                alert(`Reminder set for ${date.toLocaleTimeString()}`);
                setShowReminder(false);
            }
        } catch (e) {
            console.error(e);
            alert('Failed to set reminder');
        }
    };

    const renderTicks = (msg: Message) => {
        if (msg.direction === 'inbound' && !msg.fromMe) return null;
        const ack = msg.ack ?? 0;

        if (ack <= 0) return <Clock size={11} className="text-muted-foreground" />;
        if (ack === 1) return <Check size={14} className="text-muted-foreground" />;
        if (ack === 2) return <CheckCheck size={14} className="text-muted-foreground" />;
        if (ack >= 3) return <CheckCheck size={14} className="text-blue-500" />;

        return <Check size={14} className="text-muted-foreground" />;
    };

    return (
        <>
            {/* HEADER */}
            <div className="h-[64px] bg-white flex items-center px-4 justify-between border-b border-gray-200 flex-shrink-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                        {lead.name?.charAt(0) || '?'}
                    </div>
                    <div>
                        <div className="text-gray-900 font-semibold text-sm">{lead.name || 'Unknown'}</div>
                        <div className="text-[11px] text-gray-500 font-mono tracking-tight">{lead.phone}</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowReminder(!showReminder)}
                        className={`p-2 rounded-lg transition-colors ${showReminder ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'}`}
                        title="Set Reminder"
                    >
                        <Bell size={20} />
                    </button>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <span className="sr-only">Close</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>
            </div>

            {/* REMINDER & TEMPLATES POPOVERS */}
            {showReminder && (
                <div className="absolute top-16 right-4 z-50 bg-white rounded-xl shadow-xl border border-gray-200 w-48 animate-in slide-in-from-top-2">
                    <div className="p-3 border-b border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Snooze Until</h4>
                    </div>
                    <div className="p-1">
                        <button onClick={() => handleSetReminder(60)} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors flex items-center gap-2">
                            <Clock size={14} /> 1 Hour
                        </button>
                        <button onClick={() => handleSetReminder(24 * 60)} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors flex items-center gap-2">
                            <Clock size={14} /> Tomorrow
                        </button>
                    </div>
                </div>
            )}

            {/* MESSAGES AREA */}
            <div
                className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#efeae2] relative"
                ref={scrollRef}
                style={{
                    backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '400px',
                }}
            >
                <div className="flex flex-col gap-2 max-w-3xl mx-auto">
                    {messages.map((msg, i) => {
                        const isMe = msg.direction === 'outbound' || msg.fromMe;
                        return (
                            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[75%] px-3 py-1.5 rounded-lg text-sm relative shadow-sm border border-black/5
                                        ${isMe ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none' : 'bg-white text-gray-900 rounded-tl-none'}
                                    `}
                                >
                                    <div className="break-words whitespace-pre-wrap leading-relaxed pr-8 text-[14px]">
                                        {msg.content}
                                    </div>
                                    <div className="flex justify-end items-center gap-1 mt-0.5 -mb-0.5 float-right ml-2 relative top-0.5">
                                        <span className="text-[10px] text-gray-500 min-w-fit">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {isMe && renderTicks(msg)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* INPUT AREA */}
            <div className="min-h-[70px] bg-gray-50 px-4 py-3 flex items-center gap-3 border-t border-gray-200 flex-shrink-0 relative">

                {/* Templates Popover */}
                {showTemplates && (
                    <div className="absolute bottom-16 left-4 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-64 overflow-y-auto animate-in slide-in-from-bottom-2">
                        <div className="p-2 border-b border-gray-100 bg-gray-50 rounded-t-xl sticky top-0">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase">Quick Replies</h4>
                        </div>
                        {templates.map(t => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setInput(prev => prev + (prev ? ' ' : '') + t.content.replace('{name}', lead.name || ''));
                                    setShowTemplates(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0"
                            >
                                <div className="font-medium text-xs text-gray-900">{t.title}</div>
                                <p className="text-[10px] text-gray-500 truncate">{t.content}</p>
                            </button>
                        ))}
                        {templates.length === 0 && (
                            <div className="p-4 text-center text-gray-400 text-xs">No templates found.<br />Go to Settings to add.</div>
                        )}
                    </div>
                )}

                <div className="flex gap-2 text-gray-500">
                    <button
                        className={`p-2 hover:bg-gray-200 rounded-full transition-colors ${showTemplates ? 'bg-blue-100 text-blue-600' : ''}`}
                        onClick={() => setShowTemplates(!showTemplates)}
                        title="Templates"
                    >
                        <Zap size={22} />
                    </button>
                    <button className="p-2 hover:bg-gray-200 rounded-full transition-colors" onClick={() => fileInputRef.current?.click()}>
                        <Paperclip size={22} />
                    </button>
                    <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                </div>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 shadow-sm"
                />
                <button
                    onClick={handleSend}
                    className={`p-2.5 rounded-full transition-all ${input.trim() ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-default'}`}
                    disabled={!input.trim()}
                >
                    <Send size={18} fill={input.trim() ? "currentColor" : "none"} />
                </button>
            </div>
        </>
    );
}
