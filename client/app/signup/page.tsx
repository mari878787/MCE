'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, ArrowRight, Mail, Lock, User } from 'lucide-react';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            setSuccess('Account created successfully! Redirecting to login...');
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b-2 border-gray-100 py-4 px-6 relative z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black text-gray-900">MCE</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/login"
                            className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/"
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-5 py-2 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-md shadow-purple-500/20"
                        >
                            Home
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-purple-200/40 to-pink-200/40 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-orange-200/40 to-pink-200/40 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
                <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-gradient-to-r from-pink-200/30 to-purple-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white/80 backdrop-blur-xl border-2 border-white rounded-3xl shadow-2xl shadow-purple-500/10 p-8 relative z-10"
                >
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black text-gray-900">Create Account</h1>
                        <p className="text-gray-600 mt-2">Sign up for your MCE dashboard</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 text-red-600 text-sm p-3 rounded-xl mb-4 text-center font-medium">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border-2 border-green-200 text-green-600 text-sm p-3 rounded-xl mb-4 text-center font-medium">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-900">Full Name</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full bg-gray-50 text-gray-900 border-2 border-gray-100 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all placeholder:text-gray-400"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-900">Email Address</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-gray-50 text-gray-900 border-2 border-gray-100 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all placeholder:text-gray-400"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-900">Password</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-gray-50 text-gray-900 border-2 border-gray-100 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all placeholder:text-gray-400"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-900">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full bg-gray-50 text-gray-900 border-2 border-gray-100 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all placeholder:text-gray-400"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mt-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
                        >
                            {isSubmitting ? 'Creating Account...' : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        <div className="text-center text-gray-600 mt-4">
                            Already have an account?{' '}
                            <Link href="/login" className="text-purple-500 hover:text-purple-600 font-bold transition-colors">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="bg-white/80 backdrop-blur-xl border-t-2 border-gray-100 py-6 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-gray-900">MCE</span>
                        <span className="text-gray-500">© 2026</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                        <Link href="/#features" className="hover:text-orange-500 transition-colors">Features</Link>
                        <Link href="/#pricing" className="hover:text-pink-500 transition-colors">Pricing</Link>
                        <Link href="/#testimonials" className="hover:text-purple-500 transition-colors">Testimonials</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
