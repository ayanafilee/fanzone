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
                {/* Fixed Header bar with user profile only */}
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-50 pt-6 px-4 md:px-8 pb-4 bg-[#F8F9FA]">
                    <DashboardHeader />
                </div>

                {/* Main content area with page titles - add top padding to account for fixed header */}
                <main className="p-4 md:p-8 flex-1 mt-24 md:mt-28">
                    {children}
                </main>
            </div>
        </div>
    );
}
