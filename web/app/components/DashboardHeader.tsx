'use client';

import React, { FC } from "react";
import Image from "next/image";
import { useGetProfileQuery } from "@/lib/features/user/userApi";

const DashboardHeader: FC = () => {
    // Fetch profile data
    const { data: profileData, isLoading } = useGetProfileQuery(undefined);
    
    // Get user from profile API or fallback to auth state
    const user = profileData || null;

    return (
        <header className="flex items-center justify-end mb-6 md:mb-8 p-4 md:p-6 bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_40px_-15px_rgba(20,45,100,0.05)]">
            {/* User Profile Section */}
            <div className="flex items-center gap-3 md:gap-5">
                <div className="text-right hidden sm:block">
                    {isLoading ? (
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-gray-100 rounded-full animate-pulse" />
                            <div className="h-2.5 w-20 bg-gray-50 rounded-full animate-pulse ml-auto" />
                        </div>
                    ) : (
                        <>
                            <p className="text-sm font-black text-[#132A5B] tracking-tight">
                                {user?.name || 'User'}
                            </p>
                            <p className="text-[10px] font-black text-[#00A3E0] uppercase tracking-widest mt-0.5">
                                {user?.role?.replace('_', ' ') || 'User'}
                            </p>
                        </>
                    )}
                </div>

                <div className="relative group">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#EAECED] flex items-center justify-center border-4 border-white shadow-md overflow-hidden transition-transform duration-300 group-hover:scale-105">
                        {user?.profile_image_url ? (
                            <Image
                                src={user.profile_image_url}
                                alt="Profile"
                                width={56}
                                height={56}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-[#132A5B] to-[#0f1f42] text-white">
                                <span className="text-lg md:text-xl font-black">
                                    {user?.name?.[0]?.toUpperCase() || 'U'}
                                </span>
                            </div>
                        )}
                    </div>
                    {/* Active Status Indicator */}
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;