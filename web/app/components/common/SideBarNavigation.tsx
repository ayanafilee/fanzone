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
    MdClose,
    MdPublic
} from "react-icons/md";

const SideBarNavigation = () => {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();
    const [logout] = useLogoutMutation();
    const { user } = useSelector((state: RootState) => state.auth);
    const [isNavOpen, setIsNavOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Fetch profile data
    const { data: profile } = useGetProfileQuery(undefined);
    const currentUser = profile || user;

    const navigation = [
        { name: "Dashboard", icon: MdAutoGraph, link: "/" },
        ...(currentUser?.role === 'super_admin' ? [{ name: "User Management", icon: MdPeopleAlt, link: "/users" }] : []),
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

    const handleMobileNavClick = (link: string) => {
        setIsMobileMenuOpen(false);
        router.push(link);
    };

    // Responsive behavior for desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsNavOpen(false);
            } else {
                setIsNavOpen(true);
                setIsMobileMenuOpen(false);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            {/* Mobile Menu Button - Fixed at top with padding */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-6 left-4 z-[100] bg-[#132A5B] text-white p-3 rounded-2xl shadow-2xl hover:bg-[#00A3E0] transition-all"
            >
                {isMobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
            </button>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Desktop Sidebar */}
            <aside className={`${isNavOpen ? 'w-64' : 'w-20'} hidden lg:flex fixed top-0 left-0 bg-[#132A5B] h-screen transition-all duration-300 flex-col z-[60] shadow-2xl`}>
                {/* Desktop Toggle Button */}
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

                                {!isNavOpen && (
                                    <div className="absolute left-full ml-6 px-3 py-2 bg-[#132A5B] text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl border border-white/10 z-[100]">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Logout Button */}
                <div className="p-3 mt-auto border-t border-white/5 bg-[#0A1B3D]/30">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-all group relative"
                    >
                        <MdLogout size={22} className="group-hover:rotate-12 transition-transform" />
                        {isNavOpen && <span className="font-bold text-[13px] tracking-wide uppercase">Logout</span>}

                        {!isNavOpen && (
                            <div className="absolute left-full ml-6 px-3 py-2 bg-red-500 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl">
                                Logout
                            </div>
                        )}
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            <aside className={`lg:hidden fixed top-0 left-0 bg-[#132A5B] h-screen w-72 transition-transform duration-300 flex flex-col z-[95] shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo Section with top padding */}
                <div className="p-6 pt-8 mb-6 flex items-center gap-4">
                    <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                        <Image 
                            src="/fanzonelogo.jpg" 
                            alt="Fanzone Logo" 
                            width={44} 
                            height={44} 
                            className="object-contain"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black tracking-[0.15em] text-white text-base leading-none">FANZONE</span>
                        <span className="text-[10px] text-[#00A3E0] font-black uppercase tracking-[0.2em] mt-1">Management</span>
                    </div>
                </div>

                {/* User Info */}
                {currentUser && (
                    <div className="px-6 pb-6 mb-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                                {currentUser.profile_image_url ? (
                                    <Image 
                                        src={currentUser.profile_image_url} 
                                        alt={currentUser.name || 'User'} 
                                        width={48} 
                                        height={48} 
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <span className="text-white font-black text-lg">
                                        {currentUser.name?.[0]?.toUpperCase() || 'U'}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">{currentUser.name || 'User'}</p>
                                <p className="text-[#00A3E0] text-xs font-bold uppercase">{currentUser.role?.replace('_', ' ') || 'User'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Links */}
                <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.link;
                        return (
                            <button
                                key={item.name}
                                onClick={() => handleMobileNavClick(item.link)}
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive
                                    ? 'bg-[#00A3E0] text-white shadow-lg'
                                    : 'text-white/50 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <item.icon size={22} />
                                <span className="font-bold text-[13px] tracking-wide uppercase">{item.name}</span>
                            </button>
                        )
                    })}
                </nav>

                {/* Logout Button */}
                <div className="p-3 border-t border-white/5 bg-[#0A1B3D]/30">
                    <button
                        onClick={() => {
                            handleLogout();
                            setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-all"
                    >
                        <MdLogout size={22} />
                        <span className="font-bold text-[13px] tracking-wide uppercase">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default SideBarNavigation;
