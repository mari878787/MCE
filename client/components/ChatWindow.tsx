'use client';

import { useRef, useEffect, useState } from 'react';
import { Send, Check, CheckCheck, Clock, Paperclip, Smile } from 'lucide-react';

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
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                let url = `http://localhost:5000/api/leads/${lead.id}/messages`;
                if (lead.source === 'whatsapp_live') {
                    // Encode ID because it contains special chars
                    url = `http://localhost:5000/api/whatsapp/chats/${encodeURIComponent(lead.id)}/messages`;
                }
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setMessages(data);
                    } else {
                        setMessages([]);
                    }
                    setTimeout(scrollToBottom, 50);
                }
            } catch (err) {
                console.error('Failed to load chat', err);
            }
        };
        fetchMessages();

        // Refresh messages every 3s for live updates
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);

    }, [lead.id, lead.source]);

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
            // Determine target ID: use phone if available, else UUID (which might fail for WA)
            // Ideally we convert phone to chat ID
            let targetId = lead.id;
            if (lead.phone) {
                targetId = lead.phone.replace(/\D/g, '') + '@c.us';
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/whatsapp/chats/${encodeURIComponent(targetId)}/files`, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                console.log('File sent successfully');
                setInput('');
                if (fileInputRef.current) fileInputRef.current.value = '';
                // The interval will pick up the new message
            } else {
                console.error('Failed to send file');
                alert('Failed to send file');
            }
        } catch (err) {
            console.error(err);
            alert('Error sending file');
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        // Optimistic UI Update
        const newMsg: Message = {
            id: Date.now().toString(),
            type: 'whatsapp',
            direction: 'outbound',
            content: input,
            timestamp: new Date().toISOString(),
            fromMe: true,
            ack: 0 // Pending
        };
        setMessages([...messages, newMsg]);
        setInput('');
        setTimeout(scrollToBottom, 50);

        try {
            try {
                // Always try to send via WhatsApp if we have a phone number
                if (lead.phone) {
                    // Construct Chat ID
                    const chatId = lead.phone.replace(/\D/g, '') + '@c.us';

                    // Use Standard Chat API
                    await fetch(`http://localhost:5000/api/whatsapp/chats/${encodeURIComponent(chatId)}/messages`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: input })
                    });
                } else {
                    // Fallback for leads without phone (internal notes?)
                    await fetch(`http://localhost:5000/api/leads/${lead.id}/messages`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: input, direction: 'outbound' })
                    });
                }
            } catch (err) {
                console.error('Failed to send message', err);
            }
        } catch (err) {
            console.error('Failed to send message', err);
        }
    };

    const renderTicks = (msg: Message) => {
        // Only show ticks for Outbound messages (from me)
        if (msg.direction === 'inbound' && !msg.fromMe) return null;

        // Map ack to status
        // 0: Clock, 1: Sent (Check), 2: Delivered (CheckCheck Grey), 3: Read (CheckCheck Blue)
        const ack = msg.ack ?? 0; // Default to pending if missing

        if (ack <= 0) return <Clock size={11} className="text-gray-400" />;
        if (ack === 1) return <Check size={14} className="text-gray-400" />; // Sent
        if (ack === 2) return <CheckCheck size={14} className="text-gray-400" />; // Delivered
        if (ack >= 3) return <CheckCheck size={14} className="text-[#53bdeb]" />; // Read (Blue)

        return <Check size={14} className="text-gray-400" />;
    };

    // Helper to parse metadata
    const getMetadata = () => {
        try {
            if (!lead.metadata) return {};
            return typeof lead.metadata === 'string' ? JSON.parse(lead.metadata) : lead.metadata || {};
        } catch { return {}; }
    };

    const metadata = getMetadata();

    return (
        <>
            {/* HEADER */}
            <div className="h-[60px] bg-[#202c33] flex items-center px-4 justify-between border-b border-white/5 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold overflow-hidden">
                        {/* We could use img here if we had profilePicUrl */}
                        {lead.name?.charAt(0) || '?'}
                    </div>
                    <div>
                        <div className="text-white font-medium text-sm">{lead.name || 'Unknown'}</div>
                        <div className="text-[10px] text-gray-400">{lead.phone}</div>
                    </div>
                </div>
            </div>

            {/* MESSAGES AREA */}
            <div
                className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#0b141a] relative"
                ref={scrollRef}
                style={{
                    backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '400px',
                    // Blend tint
                    backgroundColor: 'rgba(11, 20, 26, 0.94)',
                    backgroundBlendMode: 'overlay'
                }}
            >
                <div className="flex flex-col gap-1">
                    {messages.map((msg, i) => {
                        const isMe = msg.direction === 'outbound' || msg.fromMe;
                        // WhatsApp Style Bubbles
                        return (
                            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                                <div
                                    className={`max-w-[70%] px-2 py-1.5 rounded-lg text-sm relative shadow-sm text-white
                                        ${isMe ? 'bg-[#005c4b] rounded-tr-none' : 'bg-[#202c33] rounded-tl-none'}
                                    `}
                                >
                                    <div className="break-words whitespace-pre-wrap leading-relaxed pr-6 text-[14.2px]">
                                        {msg.content}
                                    </div>
                                    <div className="flex justify-end items-center gap-1 mt-0.5 -mb-0.5 float-right ml-2 relative top-1">
                                        <span className="text-[10px] text-gray-400 min-w-fit">
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
            <div className="min-h-[62px] bg-[#202c33] px-4 py-2 flex items-center gap-2 border-t border-white/5 flex-shrink-0">
                <div className="flex gap-3 text-gray-400 mr-2">
                    <Smile size={24} className="cursor-pointer hover:text-white" />
                    <Paperclip
                        size={24}
                        className="cursor-pointer hover:text-white"
                        onClick={() => fileInputRef.current?.click()}
                    />
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
                    placeholder="Type a message"
                    className="flex-1 bg-[#2a3942] text-white rounded-lg px-4 py-2 text-sm focus:outline-none placeholder:text-gray-400"
                />
                <button
                    onClick={handleSend}
                    className="p-2 text-gray-400 hover:text-[#00a884] transition-colors"
                >
                    <Send size={20} />
                </button>
            </div>
        </>
    );
}
