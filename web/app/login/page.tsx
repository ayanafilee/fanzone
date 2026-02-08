'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useLoginMutation } from '@/lib/features/auth/authApi';
import { Toaster, toast } from 'react-hot-toast';

// --- Icons ---
const EyeIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const EyeSlashIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.822 7.822L21 21m-2.278-2.278L15.07 15.07M14.25 14.25a3 3 0 01-4.243-4.243m4.243 4.243L10.007 10.007" />
    </svg>
);

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();
    const [login, { isLoading, isSuccess, error }] = useLoginMutation();

    // ✅ Success Toast (Welcome Message)
    useEffect(() => {
        if (isSuccess) {
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-in fade-in slide-in-from-top-4' : 'animate-out fade-out slide-out-to-top-2'} max-w-sm w-full bg-[#132A5B] shadow-2xl rounded-2xl pointer-events-auto flex border-l-4 border-[#00A3E0]`}>
                    <div className="flex-1 p-4">
                        <div className="flex items-center">
                            <div className="h-10 w-10 rounded-xl bg-[#00A3E0] flex items-center justify-center text-white font-black italic">FZ</div>
                            <div className="ml-4">
                                <p className="text-sm font-black text-white uppercase tracking-widest">Welcome Back</p>
                                <p className="text-xs text-white/60 font-medium">Redirecting you to the pitch...</p>
                            </div>
                        </div>
                    </div>
                </div>
            ), { duration: 2500 });

            setTimeout(() => router.push('/'), 1200);
        }
    }, [isSuccess, router]);

    // ❌ Error Toast (More understandable text)
    useEffect(() => {
        if (error) {
            let message = 'Please check your email and password and try again.';
            if ('data' in error) {
                // If the server provides a specific message, use it, otherwise use our friendly default
                message = (error.data as { message?: string })?.message || message;
            }

            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-in fade-in slide-in-from-top-4' : 'animate-out fade-out slide-out-to-top-2'} max-w-sm w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex border-l-4 border-red-500`}>
                    <div className="flex-1 p-4">
                        <div className="flex items-center">
                            <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-black text-[#132A5B] uppercase tracking-widest">Couldn't Sign In</p>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">{message}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ));
        }
    }, [error]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        toast.dismiss();
        try {
            await login({ email, password }).unwrap();
        } catch {
            // Error is handled by the useEffect watching the "error" state from RTK Query
            // Console error removed as requested.
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-[#EAECED] items-center justify-center p-4 md:p-6 font-sans antialiased">
            <Toaster position="top-right" />

            <div className="flex w-full max-w-5xl h-[700px] bg-white rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(20,45,100,0.15)] overflow-hidden border border-white/50 relative">

                {/* --- Left Side --- */}
                <div className="hidden lg:flex w-1/2 relative bg-[#132A5B] overflow-hidden">
                    {/* Image layer */}
                    <div className="absolute inset-0">
                        <Image
                            src="/loginimage.png"
                            alt="Football"
                            fill
                            className="object-contain opacity-100"
                            priority
                        />
                    </div>

                    {/* Glow effect (kept separate from image) */}
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-[120px] opacity-20" />

                    {/* Content */}
                    <div className="relative z-10 p-16 flex flex-col justify-between h-full text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#00A3E0] rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30 rotate-3">
                                <span className="font-black text-white text-2xl italic">FZ</span>
                            </div>
                            <span className="font-black tracking-[0.1em] text-xl">FANZONE ET</span>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-6xl font-black leading-[1] tracking-tighter">
                                THE <br /> PITCH <br /> IS YOURS.
                            </h2>
                            <p className="text-white/60 text-lg font-medium max-w-xs border-l-2 border-[#00A3E0] pl-4">
                                Secure access to the FanZone ET personalized hub.
                            </p>
                        </div>
                    </div>
                </div>


                {/* --- Right Side --- */}
                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 md:p-16 bg-white relative">
                    <div className="w-full max-w-sm">
                        <header className="mb-12">
                            <h1 className="text-4xl font-black text-[#132A5B] tracking-tight">Sign In</h1>
                            <p className="text-gray-400 mt-2 font-bold text-[10px] uppercase tracking-[0.2em]">Dashboard Access Only</p>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="e.g. admin@fanzone.et"
                                    className="w-full px-6 py-4 rounded-2xl bg-[#EAECED]/50 border-2 border-transparent focus:border-[#00A3E0]/30 focus:bg-white transition-all outline-none text-[#132A5B] font-bold 
                                    placeholder:text-gray-400/50 placeholder:italic placeholder:font-medium shadow-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full px-6 py-4 rounded-2xl bg-[#EAECED]/50 border-2 border-transparent focus:border-[#00A3E0]/30 focus:bg-white transition-all outline-none text-[#132A5B] font-bold 
                                        placeholder:text-gray-400/50 shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#00A3E0] transition-colors"
                                    >
                                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-5 mt-4 rounded-2xl bg-[#00A3E0] text-white font-black text-sm uppercase tracking-[0.2em] shadow-[0_15px_30px_-5px_rgba(0,163,224,0.4)] hover:shadow-[0_20px_40px_-5px_rgba(0,163,224,0.5)] transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Verifying...
                                    </span>
                                ) : 'Sign In'}
                            </button>
                        </form>

                        <div className="mt-16 text-center">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}