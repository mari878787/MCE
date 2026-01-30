'use client';

import Sidebar from '../../components/Sidebar';
import { useState, useEffect, useRef } from 'react';
import { Search, Filter, MoreVertical, Send, Paperclip, Smile, Archive, Clock, UserPlus, Check, CheckCheck, Image as ImageIcon, Video, Mic, FileText } from 'lucide-react';

export default function InboxPage() {
    const [chats, setChats] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]); // Team members
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedChat) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('caption', input); // Optional: use current input as caption

        try {
            // Optimistic UI update (optional, but complex for media)
            // Just let the backend handle it and refresh

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
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            // Instant scroll for better UX on load
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
            // Small timeout to ensure DOM is ready
            setTimeout(scrollToBottom, 100);
        }
    }, [messages, shouldAutoScroll]);

    // Reset auto-scroll when changing chats
    useEffect(() => {
        setShouldAutoScroll(true);
    }, [selectedChat]);

    // Data Fetching
    useEffect(() => {
        // 1. Fetch Chats
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/whatsapp/chats`)
            .then(res => res.json())
            .then(data => setChats(data))
            .catch(err => console.error(err));

        // 2. Fetch Team Users
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/team`)
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(err => console.error(err));
    }, []);

    const handleSelectChat = (chat: any) => {
        setSelectedChat(chat);
        setMessages([]); // Clear previous

        // Optimistically clear unread count
        setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c));

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
                // Optionally remove tempMsg or show error
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
                    // Only update if length differs or last message differs? 
                    // For simplicity, just update. Ideally we merge or check IDs.
                    // To avoid scroll jumping, maybe only if length changes.
                    // But we want to update auto-replies too.
                    setMessages(data);
                })
                .catch(err => console.error(err));
        }, 3000);
        return () => clearInterval(interval);
    }, [selectedChat]);

    return (
        <div className="flex h-screen bg-[#0f1117] text-white">
            <Sidebar />
            <div className="flex w-full">
                {/* Chat List */}
                <div className="w-80 border-r border-white/10 flex flex-col">
                    <div className="p-4 border-b border-white/10">
                        <h2 className="text-xl font-bold mb-4">Inbox</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search chats..."
                                className="w-full bg-gray-900 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {Array.isArray(chats) && chats.map(chat => (
                            <div
                                key={chat.id}
                                onClick={() => handleSelectChat(chat)}
                                className={`p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer ${selectedChat?.id === chat.id ? 'bg-blue-500/10' : ''}`}
                            >
                                <div className="flex justify-between mb-1">
                                    <span className="font-semibold">{chat.name || chat.id}</span>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-xs text-gray-500">
                                            {chat.timestamp ? new Date(chat.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                        {chat.unreadCount > 0 && (
                                            <div className="bg-green-500 text-black text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                                                {chat.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400 truncate">{chat.lastMessage || 'No messages yet'}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                {selectedChat ? (
                    <div className="flex-1 flex flex-col">
                        {/* Header */}
                        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0f1117]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold">
                                    {selectedChat.name?.[0]}
                                </div>
                                <div>
                                    <h3 className="font-semibold">{selectedChat.name}</h3>
                                    <p className="text-xs text-green-400">Online</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* Assignment Dropdown */}
                                <div className="relative group">
                                    <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white bg-gray-800 px-3 py-1.5 rounded-lg border border-white/10">
                                        <UserPlus size={16} />
                                        <span>Assign</span>
                                    </button>
                                    <div className="absolute right-0 mt-2 w-48 bg-[#1a1d24] border border-gray-700 rounded-lg shadow-xl overflow-hidden hidden group-hover:block z-20">
                                        {users.map(u => (
                                            <div
                                                key={u.id}
                                                onClick={() => handleAssign(u.id)}
                                                className="px-4 py-2 hover:bg-white/5 cursor-pointer text-sm"
                                            >
                                                {u.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <MoreVertical className="text-gray-400 cursor-pointer" />
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                            className="flex-1 p-6 overflow-y-auto space-y-4 bg-[url('/chat-bg-dark.png')] bg-repeat bg-opacity-5"
                        >
                            {messages.map((msg: any) => (
                                <div key={msg.id} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`${msg.fromMe ? 'bg-blue-600' : 'bg-gray-800'} rounded-lg p-3 max-w-[70%] text-sm`}>
                                        {/* Media Content */}
                                        {msg.hasMedia && (
                                            <div className="mb-2">
                                                {msg.type === 'image' ? (
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/whatsapp/media/${encodeURIComponent(selectedChat.id)}/${encodeURIComponent(msg.id)}`}
                                                        alt="Image"
                                                        className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition"
                                                        loading="lazy"
                                                    />
                                                ) : msg.type === 'video' ? (
                                                    <video
                                                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/whatsapp/media/${encodeURIComponent(selectedChat.id)}/${encodeURIComponent(msg.id)}`}
                                                        controls
                                                        className="rounded-lg max-w-full h-auto"
                                                    />
                                                ) : (
                                                    <div className="p-3 bg-black/20 rounded-lg flex items-center gap-3">
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
                                                        <CheckCheck size={14} className="text-blue-300" />
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
                                <div className="text-center text-gray-500 mt-10">No messages yet</div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10 bg-[#0f1117]">
                            <div className="flex items-center gap-2 bg-gray-900 rounded-xl p-2 px-4 border border-white/5">
                                <Smile className="text-gray-400 cursor-pointer" size={20} />
                                <Paperclip
                                    className="text-gray-400 cursor-pointer hover:text-white transition"
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
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent border-none focus:outline-none text-sm py-2"
                                />
                                <button
                                    onClick={sendMessage}
                                    className="bg-blue-600 p-2 rounded-lg hover:bg-blue-500"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Select a chat to start messaging
                    </div>
                )}
            </div>
        </div>
    );
}
