'use client';

import React, { FC } from "react";
import Image from "next/image";
import { useGetProfileQuery } from "@/lib/features/user/userApi";

interface HeaderProps {
    title: string;
    subtitle?: string;
}

const DashboardHeader: FC<HeaderProps> = ({ title, subtitle }) => {
    // Fetch profile data
    const { data: userData, isLoading } = useGetProfileQuery(undefined);
    const user = userData?.user || (userData as any)?.data?.user; // Handling potential variations in response structure

    return (
        <header className="flex items-center justify-between mb-10 p-6 bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_40px_-15px_rgba(20,45,100,0.05)]">
            {/* Left side: Page Info */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-4 bg-[#00A3E0] rounded-full" />
                    <h1 className="text-2xl font-black text-[#132A5B] tracking-tight truncate max-w-[200px] md:max-w-md">
                        {title}
                    </h1>
                </div>
                {subtitle && (
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] ml-3.5">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Right side: User Profile */}
            <div className="flex items-center gap-5">
                <div className="text-right hidden sm:block">
                    {isLoading ? (
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-gray-100 rounded-full animate-pulse" />
                            <div className="h-2.5 w-20 bg-gray-50 rounded-full animate-pulse ml-auto" />
                        </div>
                    ) : (
                        <>
                            <p className="text-sm font-black text-[#132A5B] tracking-tight italic">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-[10px] font-black text-[#00A3E0] uppercase tracking-widest mt-0.5">
                                {user?.role || 'Administrator'}
                            </p>
                        </>
                    )}
                </div>

                <div className="relative group">
                    <div className="w-14 h-14 rounded-2xl bg-[#EAECED] flex items-center justify-center border-4 border-white shadow-md overflow-hidden transition-transform duration-300 group-hover:scale-105">
                        {user?.profileImage ? (
                            <Image
                                src={user.profileImage}
                                alt="Profile"
                                width={56}
                                height={56}
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full bg-[#132A5B] text-white">
                                <span className="text-xl font-black italic">
                                    {user?.firstName?.[0] || 'F'}{user?.lastName?.[0] || 'Z'}
                                </span>
                            </div>
                        )}
                    </div>
                    {/* Active Status Indicator */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;