import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'MCE | Markivitech Conversion Engine',
    description: 'Automated Sales Assistant & Conversion Optimizer',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-[#0a0a0f] text-white selection:bg-blue-500/30`} suppressHydrationWarning={true}>
                <div className="flex min-h-screen">
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto h-screen" style={{ marginLeft: '256px' }}>
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
