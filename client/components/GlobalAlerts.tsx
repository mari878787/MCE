'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bell } from 'lucide-react';

export default function GlobalAlerts() {
    const { user } = useAuth();
    const lastCheckRef = useRef<string>(new Date().toISOString());
    const [audio] = useState(typeof Audio !== 'undefined' ? new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3') : null);

    useEffect(() => {
        if (!user) return;

        // Poll every 10 seconds
        const interval = setInterval(async () => {
            try {
                const now = new Date().toISOString();
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/leads?created_after=${lastCheckRef.current}`);

                if (res.ok) {
                    const data = await res.json();
                    if (data.data && data.data.length > 0) {
                        // Play Sound
                        if (audio) {
                            audio.currentTime = 0;
                            audio.play().catch(e => console.log('Audio play blocked', e));
                        }

                        // Show Browser Notification (if permission granted)
                        if (Notification.permission === 'granted') {
                            new Notification('New Lead!', {
                                body: `${data.data.length} new lead(s) arrived.`,
                                icon: '/icon.png'
                            });
                        }

                        // Show simple Toast (could replace with your toast lib)
                        const toast = document.createElement('div');
                        toast.className = 'fixed top-4 right-4 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl z-[100] animate-in slide-in-from-right flex items-center gap-3 border border-gray-700';
                        toast.innerHTML = `
                            <div class="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold">
                                ${data.data.length}
                            </div>
                            <div>
                                <h4 class="font-bold text-sm">New Lead Received!</h4>
                                <p class="text-xs text-gray-400">Just now</p>
                            </div>
                        `;
                        document.body.appendChild(toast);
                        setTimeout(() => toast.remove(), 5000);
                    }
                }

                // 2. Poll Reminders
                const remindersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/leads/reminders`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });

                if (remindersRes.ok) {
                    const rData = await remindersRes.json();
                    if (rData.data && rData.data.length > 0) {
                        // Play Sound for Reminder (maybe different sound?)
                        if (audio) {
                            audio.currentTime = 0;
                            audio.play().catch(() => { });
                        }

                        // Toast
                        const toast = document.createElement('div');
                        toast.className = 'fixed top-20 right-4 bg-yellow-900 text-white px-6 py-4 rounded-xl shadow-2xl z-[100] animate-in slide-in-from-right flex items-center gap-3 border border-yellow-700';
                        toast.innerHTML = `
                            <div class="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold">
                                !
                            </div>
                            <div>
                                <h4 class="font-bold text-sm">Follow-up Due!</h4>
                                <p class="text-xs text-yellow-200">You have ${rData.data.length} lead(s) to contact.</p>
                            </div>
                        `;
                        document.body.appendChild(toast);
                        setTimeout(() => toast.remove(), 8000);
                    }
                }

                // 3. Poll Link Views
                const viewsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/tracking/recent-views?since=${lastCheckRef.current}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });

                if (viewsRes.ok) {
                    const vData = await viewsRes.json();
                    if (vData.data && vData.data.length > 0) {
                        // Sound
                        if (audio) {
                            audio.currentTime = 0;
                            audio.play().catch(() => { });
                        }

                        vData.data.forEach((view: any, i: number) => {
                            setTimeout(() => {
                                // Toast
                                const toast = document.createElement('div');
                                toast.className = 'fixed top-32 right-4 bg-blue-900 text-white px-6 py-4 rounded-xl shadow-2xl z-[100] animate-in slide-in-from-right flex items-center gap-3 border border-blue-700';
                                toast.innerHTML = `
                                    <div class="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                        👁️
                                    </div>
                                    <div>
                                        <h4 class="font-bold text-sm">Link Viewed!</h4>
                                        <p class="text-xs text-blue-200">"${view.title}" was just opened.</p>
                                    </div>
                                `;
                                document.body.appendChild(toast);
                                setTimeout(() => toast.remove(), 6000);
                            }, i * 1000);
                        });
                    }
                }

                // Update check time
                lastCheckRef.current = now;

            } catch (e) {
                console.error('Alert poll failed', e);
            }
        }, 10000); // 10s

        // Request Permission on mount
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        return () => clearInterval(interval);
    }, [user, audio]);

    return null; // Invisible component
}
