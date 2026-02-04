'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '@/context/AuthContext';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, isLoading } = useAuth();
    const isLoginPage = pathname === '/login';

    // While loading auth state, show nothing or a spinner to prevent flash
    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background text-muted-foreground">
                Loading...
            </div>
        );
    }

    if (isLoginPage) {
        return <>{children}</>;
    }

    // Attempting to access protected route (AuthContext will redirect, but we hide content meanwhile)
    if (!user) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0" style={{ marginLeft: '256px' }}>
                <Header />
                <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)]">
                    {children}
                </main>
            </div>
        </div>
    );
}
