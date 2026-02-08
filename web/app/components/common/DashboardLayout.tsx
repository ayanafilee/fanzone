'use client';

import { usePathname } from 'next/navigation';
import SideBarNav from "./SideBarNavigation";
import DashboardHeader from "../DashboardHeader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';

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
            case '/watch-links':
                return { title: 'Watch Links', subtitle: 'Manage live stream and match links' };
            case '/settings':
                return { title: 'Settings', subtitle: 'System configuration and preferences' };
            default:
                return { title: 'FanZone Admin', subtitle: 'Management Dashboard' };
        }
    };

    const { title, subtitle } = getPageDetails();

    if (isLoginPage) {
        return <main className="w-full">{children}</main>;
    }

    return (
        <div className="flex bg-[#EAECED] min-h-screen">
            <SideBarNav />
            <div className="flex-1 flex flex-col transition-all duration-300 ml-20 lg:ml-64">
                <main className="p-4 md:p-8 flex-1">
                    <DashboardHeader title={title} subtitle={subtitle} />
                    {children}
                </main>
            </div>
        </div>
    );
}
