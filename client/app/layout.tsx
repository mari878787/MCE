import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import LayoutContent from '@/components/LayoutContent';
import GlobalAlerts from '@/components/GlobalAlerts';

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
            <body className={`${inter.className} bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary`} suppressHydrationWarning={true}>
                <AuthProvider>
                    <GlobalAlerts />
                    <LayoutContent>
                        {children}
                    </LayoutContent>
                </AuthProvider>
            </body>
        </html>
    );
}
