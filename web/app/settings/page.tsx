'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { useAppSelector } from '@/lib/hooks';
import {
    useGetProfileQuery,
    useUpdateProfileMutation,
    useChangePasswordMutation,
} from '@/lib/features/user/userApi';
import { useGetClubsQuery } from '@/lib/features/clubs/clubsApi';
import ProfileInfoSection from '../components/settings/ProfileInfoSection';
import ProfileImageSection from '../components/settings/ProfileImageSection';
import PasswordChangeSection from '../components/settings/PasswordChangeSection';

export default function SettingsPage() {
    const router = useRouter();
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

    const { data: profile, isLoading: profileLoading, error: profileError } = useGetProfileQuery(undefined);
    const { data: clubsData } = useGetClubsQuery(undefined);
    const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
    const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    const handleProfileUpdate = async (data: { name?: string; language?: string; fav_club_id?: string; profile_image_url?: string }) => {
        try {
            await updateProfile(data).unwrap();
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-in fade-in slide-in-from-top-4' : 'animate-out fade-out slide-out-to-top-2'} max-w-sm w-full bg-[#132A5B] shadow-2xl rounded-2xl pointer-events-auto flex border-l-4 border-[#00A3E0]`}>
                    <div className="flex-1 p-4">
                        <div className="flex items-center">
                            <div className="h-10 w-10 rounded-xl bg-[#00A3E0] flex items-center justify-center text-white font-black italic">FZ</div>
                            <div className="ml-4">
                                <p className="text-sm font-black text-white uppercase tracking-widest">Profile Updated</p>
                                <p className="text-xs text-white/60 font-medium">Your changes have been saved successfully</p>
                            </div>
                        </div>
                    </div>
                </div>
            ), { duration: 3000 });
        } catch (error: any) {
            const errorMessage = error?.data?.error || 'Failed to update profile';
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
                                <p className="text-sm font-black text-[#132A5B] uppercase tracking-widest">Update Failed</p>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">{errorMessage}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ));
        }
    };

    const handleImageUrlUpdate = async (url: string) => {
        try {
            await updateProfile({ profile_image_url: url }).unwrap();
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-in fade-in slide-in-from-top-4' : 'animate-out fade-out slide-out-to-top-2'} max-w-sm w-full bg-[#132A5B] shadow-2xl rounded-2xl pointer-events-auto flex border-l-4 border-[#00A3E0]`}>
                    <div className="flex-1 p-4">
                        <div className="flex items-center">
                            <div className="h-10 w-10 rounded-xl bg-[#00A3E0] flex items-center justify-center text-white font-black italic">FZ</div>
                            <div className="ml-4">
                                <p className="text-sm font-black text-white uppercase tracking-widest">Image URL Updated</p>
                                <p className="text-xs text-white/60 font-medium">Profile picture updated successfully</p>
                            </div>
                        </div>
                    </div>
                </div>
            ), { duration: 3000 });
        } catch (error: any) {
            const errorMessage = error?.data?.error || 'Failed to update image URL';
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
                                <p className="text-sm font-black text-[#132A5B] uppercase tracking-widest">Update Failed</p>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">{errorMessage}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ));
        }
    };

    const handlePasswordChange = async (data: { current_password: string; new_password: string }) => {
        try {
            await changePassword(data).unwrap();
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-in fade-in slide-in-from-top-4' : 'animate-out fade-out slide-out-to-top-2'} max-w-sm w-full bg-[#132A5B] shadow-2xl rounded-2xl pointer-events-auto flex border-l-4 border-[#00A3E0]`}>
                    <div className="flex-1 p-4">
                        <div className="flex items-center">
                            <div className="h-10 w-10 rounded-xl bg-[#00A3E0] flex items-center justify-center text-white font-black italic">FZ</div>
                            <div className="ml-4">
                                <p className="text-sm font-black text-white uppercase tracking-widest">Password Changed</p>
                                <p className="text-xs text-white/60 font-medium">Your password has been updated successfully</p>
                            </div>
                        </div>
                    </div>
                </div>
            ), { duration: 3000 });
        } catch (error: any) {
            const errorMessage = error?.data?.error || 'Failed to change password';
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
                                <p className="text-sm font-black text-[#132A5B] uppercase tracking-widest">Password Change Failed</p>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">{errorMessage}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ));
        }
    };

    if (profileLoading) {
        return (
            <div className="space-y-6">
                <div className="p-12 space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-64 w-full bg-white rounded-[2rem] animate-pulse border border-gray-100" />
                    ))}
                </div>
            </div>
        );
    }

    if (profileError || !profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-black text-[#132A5B] mb-2 tracking-tight">Failed to Load Profile</h2>
                <p className="text-gray-400 max-w-sm font-medium leading-relaxed mb-8">
                    We couldn't load your profile information. Please try again.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-[#00A3E0] text-white font-bold rounded-2xl shadow-lg hover:bg-[#0082b3] transition-all"
                >
                    Retry
                </button>
            </div>
        );
    }

    const clubs = clubsData || [];

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#132A5B] tracking-tight">Account Settings</h1>
                    <p className="text-gray-400 font-medium">Manage your profile, preferences and security</p>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile & Password */}
                <div className="lg:col-span-2 space-y-6">
                    <ProfileInfoSection
                        profile={profile}
                        clubs={clubs}
                        onUpdate={handleProfileUpdate}
                        isLoading={isUpdating}
                    />

                    <PasswordChangeSection
                        onChangePassword={handlePasswordChange}
                        isLoading={isChangingPassword}
                    />
                </div>

                {/* Right Column - Profile Image */}
                <div>
                    <ProfileImageSection
                        currentImageUrl={profile.profile_image_url}
                        onUpdateUrl={handleImageUrlUpdate}
                        isLoading={isUpdating}
                    />
                </div>
            </div>
        </div>
    );
}
