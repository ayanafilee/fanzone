'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { logOut } from '@/lib/features/auth/authSlice';
import { useLogoutMutation } from '@/lib/features/auth/authApi';
import { useGetProfileQuery } from '@/lib/features/user/userApi';
import {
    MdAutoGraph,
    MdPlayCircleOutline,
    MdSettings,
    MdLogout,
    MdMenuOpen,
    MdMenu,
    MdGroups,
    MdPeopleAlt,
    MdVideoLibrary,
    MdLiveTv,
    MdPublic
} from "react-icons/md";

const SideBarNavigation = () => {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();
    const [logout] = useLogoutMutation();
    const { user } = useSelector((state: RootState) => state.auth);
    const [isNavOpen, setIsNavOpen] = useState(true);

    // Fetch profile data
    const { data: profile } = useGetProfileQuery(undefined);
    const currentUser = profile || user;

    const navigation = [
        { name: "Dashboard", icon: MdAutoGraph, link: "/" },
        ...(user?.role === 'super_admin' ? [{ name: "User Management", icon: MdPeopleAlt, link: "/users" }] : []),
        { name: "Leagues", icon: MdPublic, link: "/leagues" },
        { name: "Clubs", icon: MdGroups, link: "/clubs" },
        { name: "Content", icon: MdPlayCircleOutline, link: "/content" },
        { name: "Highlights", icon: MdVideoLibrary, link: "/highlights" },
        { name: "Watch Links", icon: MdLiveTv, link: "/watch-links" },
        { name: "Settings", icon: MdSettings, link: "/settings" },
    ];

    const handleLogout = async () => {
        const token = localStorage.getItem('refreshToken');
        try {
            await logout(token).unwrap();
            router.push('/login');
        } catch (error) {
            dispatch(logOut());
            router.push('/login');
        }
    };

    // Responsive behavior
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsNavOpen(false);
            } else {
                setIsNavOpen(true);
            }
        };
        handleResize(); // Set initial state
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <aside className={`${isNavOpen ? 'w-64' : 'w-20'} fixed top-0 left-0 bg-[#132A5B] h-screen transition-all duration-300 flex flex-col z-[60] shadow-2xl`}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsNavOpen(!isNavOpen)}
                className="absolute -right-4 top-10 bg-[#00A3E0] text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition-all z-[70] border-2 border-[#132A5B]"
            >
                {isNavOpen ? <MdMenuOpen size={18} /> : <MdMenu size={18} />}
            </button>

            {/* Logo Section */}
            <div className="p-6 mb-8 flex items-center gap-4 overflow-hidden">
                <div className="min-w-[44px] h-11 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                    <Image
                        src="/fanzonelogo.jpg"
                        alt="Fanzone Logo"
                        width={44}
                        height={44}
                        className="object-contain"
                    />
                </div>
                {isNavOpen && (
                    <div className="flex flex-col">
                        <span className="font-black tracking-[0.15em] text-white text-base leading-none">FANZONE</span>
                        <span className="text-[10px] text-[#00A3E0] font-black uppercase tracking-[0.2em] mt-1">Management</span>
                    </div>
                )}
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
                {navigation.map((item) => {
                    const isActive = pathname === item.link;
                    return (
                        <Link
                            key={item.name}
                            href={item.link}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${isActive
                                ? 'bg-[#00A3E0] text-white shadow-[0_10px_20px_-5px_rgba(0,163,224,0.4)]'
                                : 'text-white/50 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon size={22} className={`${isActive ? 'text-white' : 'group-hover:text-[#00A3E0]'} transition-colors duration-300`} />
                            {isNavOpen && <span className="font-bold text-[13px] tracking-wide uppercase">{item.name}</span>}

                            {/* Tooltip for closed state */}
                            {!isNavOpen && (
                                <div className="absolute left-full ml-6 px-3 py-2 bg-[#132A5B] text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl border border-white/10 z-[100]">
                                    {item.name}
                                </div>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* User Section / Logout */}
            <div className="mt-auto border-t border-white/5 bg-[#0A1B3D]/30 p-4">
                {/* User Profile Hookup */}
                <div className={`flex items-center ${isNavOpen ? 'gap-3 mb-4' : 'justify-center mb-0'} relative group`}>
                    <Link href="/settings" className="relative shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 shadow-sm overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer hover:border-[#00A3E0]/50 hover:bg-white/15">
                            {currentUser?.profile_image_url ? (
                                <Image
                                    src={currentUser.profile_image_url}
                                    alt="Profile"
                                    width={40}
                                    height={40}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full bg-[#EAECED] text-[#132A5B]">
                                    <span className="text-sm font-black">
                                        {currentUser?.name?.[0]?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#132A5B] rounded-full shadow-sm" />
                    </Link>

                    {isNavOpen && (
                        <div className="flex-1 min-w-0 pr-2">
                            <p className="text-[13px] font-black text-white tracking-tight truncate">
                                {currentUser?.name || 'User'}
                            </p>
                            <p className="text-[10px] font-bold text-[#00A3E0] uppercase tracking-widest truncate">
                                {currentUser?.role?.replace('_', ' ') || 'Admin'}
                            </p>
                        </div>
                    )}

                    {!isNavOpen && (
                        <div className="absolute left-full ml-6 px-3 py-2 bg-[#132A5B] text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl border border-white/10 z-[100]">
                            {currentUser?.name || 'User'}
                        </div>
                    )}
                </div>

                <div className={isNavOpen ? '' : 'hidden'}>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-all group relative border border-white/5"
                    >
                        <MdLogout size={18} className="group-hover:rotate-12 transition-transform" />
                        <span className="font-bold text-[11px] tracking-[0.1em] uppercase">Logout</span>
                    </button>
                </div>

                {/* Slim Logout for closed state */}
                {!isNavOpen && (
                    <button
                        onClick={handleLogout}
                        className="mt-4 w-10 h-10 flex items-center justify-center rounded-xl text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all group relative mx-auto"
                    >
                        <MdLogout size={20} />
                        <div className="absolute left-full ml-6 px-3 py-2 bg-red-500 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl">
                            Logout
                        </div>
                    </button>
                )}
            </div>
        </aside>
    );
};

export default SideBarNavigation;
