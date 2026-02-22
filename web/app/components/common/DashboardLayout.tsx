'use client';

import { usePathname } from 'next/navigation';
import SideBarNav from "./SideBarNavigation";
import DashboardHeader from "../DashboardHeader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';
    const isFullScreenPage = isLoginPage;

    if (isFullScreenPage) {
        return <main className="w-full">{children}</main>;
    }

    return (
        <div className="flex bg-[#F8F9FA] min-h-screen">
            <SideBarNav />
            <div className="flex-1 flex flex-col transition-all duration-300 lg:ml-64">
                {/* Header bar with user profile only */}
                <div className="pt-24 lg:pt-6 px-4 md:px-8">
                    <DashboardHeader />
                </div>

                {/* Main content area with page titles */}
                <main className="p-4 md:p-8 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
