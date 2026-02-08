'use client';

import { MdGroup, MdSportsSoccer, MdDescription, MdVideoLibrary, MdLink, MdAdminPanelSettings } from "react-icons/md";
import { useGetStatsQuery } from "@/lib/features/admin/adminApi";

export default function Home() {
  const { data: statsData, isLoading, error } = useGetStatsQuery();

  const getStatsList = () => {
    if (!statsData) return [];

    return [
      { label: "Total Users", value: statsData.users.toLocaleString(), icon: MdGroup, color: "bg-blue-500" },
      { label: "Total Admins", value: statsData.admins.toLocaleString(), icon: MdAdminPanelSettings, color: "bg-purple-500" },
      { label: "Total Content", value: statsData.content.toLocaleString(), icon: MdDescription, color: "bg-green-500" },
      { label: "Highlights", value: statsData.highlights.toLocaleString(), icon: MdVideoLibrary, color: "bg-orange-500" },
      { label: "Watch Links", value: statsData.watch_links.toLocaleString(), icon: MdLink, color: "bg-red-500" },
    ];
  };

  const stats = getStatsList();

  return (
    <div className="flex flex-col min-h-screen font-sans antialiased text-[#132A5B]">
      <main className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {isLoading ? (
            // Skeleton loaders
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between animate-pulse">
                <div className="space-y-3">
                  <div className="h-2 w-16 bg-gray-200 rounded"></div>
                  <div className="h-6 w-12 bg-gray-200 rounded"></div>
                </div>
                <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-full p-6 bg-red-50 text-red-600 rounded-[2rem] border border-red-100 text-center font-medium">
              Failed to load statistics. Please try again later.
            </div>
          ) : (
            stats.map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                <div>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-black text-[#132A5B] tracking-tight">{stat.value}</h3>
                </div>
                <div className={`w-14 h-14 ${stat.color} text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
                  <stat.icon size={24} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Placeholder Content Section */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-[#EAECED] rounded-full flex items-center justify-center mb-6">
            <MdSportsSoccer size={40} className="text-[#00A3E0] animate-bounce" />
          </div>
          <h2 className="text-2xl font-black text-[#132A5B] mb-2 tracking-tight">Welcome to FanZone Admin</h2>
          <p className="text-gray-400 max-w-sm font-medium leading-relaxed">
            This is your central hub for managing the FanZone platform.
            Use the sidebar to navigate through users, clubs, and content settings.
          </p>
        </div>
      </main>
    </div>
  );
}
