'use client';

import { usePathname } from 'next/navigation';
import SideBarNav from "./SideBarNavigation";
import DashboardHeader from "../DashboardHeader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';
    const isFullScreenPage = isLoginPage;

    const getPageDetails = () => {
        switch (pathname) {
            case '/':
                return { title: 'Dashboard Overview', subtitle: 'Real-time statistics and management' };
            case '/users':
                return { title: 'User Management', subtitle: 'Manage system users and their roles' };
            case '/clubs':
                return { title: 'Clubs', subtitle: 'Manage football clubs and associations' };
            case '/content':
                return { title: 'Content Management', subtitle: 'Manage videos, news and other content' };
            case '/highlights':
                return { title: 'Match Highlights', subtitle: 'Manage YouTube highlights for matches' };
            case '/watch-links':
                return { title: 'Watch Links', subtitle: 'Manage live stream and match links' };
            case '/settings':
                return { title: 'Settings', subtitle: 'System configuration and preferences' };
            default:
                return { title: 'FanZone Admin', subtitle: 'Management Dashboard' };
        }
    };

    const { title, subtitle } = getPageDetails();

    if (isFullScreenPage) {
        return <main className="w-full">{children}</main>;
    }

    return (
        <div className="flex bg-[#F8F9FA] min-h-screen">
            <SideBarNav />
            <div className="flex-1 flex flex-col transition-all duration-300 ml-[130px] lg:ml-[306px]">
                {/* Static top gap that stays fixed even on scroll */}
                <div className="fixed top-0 right-0 left-[130px] lg:left-[306px] h-[95px] bg-[#F8F9FA] z-40 transition-all duration-300" />

                <main className="p-4 md:p-8 flex-1 mt-[95px]">
                    {children}
                </main>
            </div>
        </div>
    );
}
