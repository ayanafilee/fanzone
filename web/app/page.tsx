'use client';

import React from 'react';
import {
  MdGroup,
  MdSportsSoccer,
  MdDescription,
  MdVideoLibrary,
  MdLink,
  MdTrendingUp,
  MdTrendingDown,
  MdMoreVert,
  MdOutlineArticle,
  MdPublic,
  MdGroups,
  MdLiveTv,
  MdHistory,
  MdFiberManualRecord
} from "react-icons/md";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell, PieChart, Pie
} from 'recharts';
import {
  useGetStatsQuery,
  useGetAnalyticsQuery,
  useGetActivitiesQuery
} from "@/lib/features/admin/adminApi";

const timeAgo = (date: string | Date) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

export default function Dashboard() {
  const { data: statsData, isLoading: isStatsLoading, error: statsError } = useGetStatsQuery();
  const { data: analyticsData, isLoading: isAnalyticsLoading } = useGetAnalyticsQuery();
  const { data: activitiesData, isLoading: isActivitiesLoading } = useGetActivitiesQuery();

  // Helper to calculate dummy trends (You can replace this with real logic)
  const getTrend = (value: number) => {
    return value > 1000 ? { icon: MdTrendingUp, color: 'text-green-500', text: '+12.5%' } : { icon: MdTrendingUp, color: 'text-blue-500', text: '+5.2%' };
  };

  const getStatsList = () => {
    if (!statsData) return [];
    return [
      { label: "Total Users", value: statsData.users, icon: MdGroup, color: "bg-blue-600", lightColor: "bg-blue-100" },
      { label: "Total Admins", value: statsData.admins, icon: MdSportsSoccer, color: "bg-purple-600", lightColor: "bg-purple-100" },
      { label: "Leagues", value: statsData.leagues, icon: MdPublic, color: "bg-pink-600", lightColor: "bg-pink-100" },
      { label: "Clubs", value: statsData.clubs, icon: MdGroups, color: "bg-indigo-600", lightColor: "bg-indigo-100" },
      { label: "Articles", value: statsData.content, icon: MdDescription, color: "bg-green-600", lightColor: "bg-green-100" },
      { label: "Highlights", value: statsData.highlights, icon: MdVideoLibrary, color: "bg-orange-600", lightColor: "bg-orange-100" },
      { label: "Watch Links", value: statsData.watch_links, icon: MdLiveTv, color: "bg-cyan-600", lightColor: "bg-cyan-100" },
    ];
  };

  const stats = getStatsList();

  // Format Chart Data
  const userGrowthData = analyticsData?.user_growth?.map(d => ({ name: d.month, users: d.count })) || [];
  const clubPopularityData = analyticsData?.club_popularity?.map(d => ({ name: d.club_name, count: d.fan_count })) || [];

  const languageData = analyticsData?.languages ? [
    { name: 'English', value: analyticsData.languages.en || 0, color: '#132A5B' },
    { name: 'Amharic', value: analyticsData.languages.am || 0, color: '#00A3E0' },
    { name: 'Afaan Oromo', value: analyticsData.languages.om || 0, color: '#F59E0B' },
  ] : [];

  const totalLanguageUsers = languageData.reduce((acc, curr) => acc + curr.value, 0);

  const activities = Array.isArray(activitiesData) ? activitiesData : [];

  if (isStatsLoading || isAnalyticsLoading || isActivitiesLoading) return <DashboardSkeleton />;
  if (statsError) return <ErrorState />;

  return (
    <div className="flex flex-col min-h-screen font-sans text-[#132A5B] p-2 md:p-6 space-y-6">

      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#132A5B]">Dashboard Overview</h1>
          <p className="text-gray-500 font-medium">Welcome back! Here is what's happening at FanZone ET today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2.5 bg-white border border-gray-200 text-sm font-bold rounded-xl shadow-sm hover:bg-gray-50 transition">
            Download Report
          </button>
          <button className="px-6 py-2.5 bg-[#132A5B] text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-900 transition">
            Filter View
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const trend = getTrend(stat.value);
          return (
            <div key={i} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 ${stat.lightColor} text-white rounded-2xl flex items-center justify-center`}>
                  <stat.icon size={24} className={stat.color.replace('bg-', 'text-')} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-gray-50 ${trend.color}`}>
                  <trend.icon /> {trend.text}
                </div>
              </div>
              <h3 className="text-3xl font-black text-[#132A5B] mb-1">{(stat.value || 0).toLocaleString()}</h3>
              <p className="text-gray-400 text-sm font-semibold">{stat.label}</p>

              {/* Decorative Circle */}
              <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 ${stat.color} group-hover:scale-150 transition-transform duration-500`}></div>
            </div>
          );
        })}
      </div>

      {/* 3. Main Charts Section (Growth & Popularity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* User Growth Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#132A5B]">User Growth</h3>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-[10px] font-black uppercase tracking-wider text-gray-400">
              <MdFiberManualRecord className="text-[#00A3E0]" />
              Live Analytics
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00A3E0" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00A3E0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#132A5B', borderRadius: '12px', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="users" stroke="#00A3E0" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Club Popularity Chart */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-[#132A5B] mb-6">Top Clubs by Fans</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={clubPopularityData} margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F3F4F6" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                  {clubPopularityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#132A5B' : '#00A3E0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Recent Activity & Language Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#132A5B]">
                <MdHistory size={20} />
              </div>
              <h3 className="text-xl font-bold text-[#132A5B]">Recent Audit Logs</h3>
            </div>
            <button className="text-[#00A3E0] text-sm font-bold hover:underline">Full Logs</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50">
                  <th className="pb-4 pl-2">Admin</th>
                  <th className="pb-4">Action</th>
                  <th className="pb-4">Target Entity</th>
                  <th className="pb-4">Time</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium">
                {activities.map((activity) => (
                  <tr key={activity.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">
                          {activity.user_name?.charAt(0) || 'U'}
                        </div>
                        <span className="font-bold text-[#132A5B]">{activity.user_name || 'Unknown Admin'}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${activity.action?.includes('Added') ? 'bg-green-50 text-green-600' :
                        activity.action?.includes('Deleted') ? 'bg-red-50 text-red-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                        {activity.action || 'Performed Action'}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-700 font-bold capitalize">{activity.entity}</span>
                        <span className="text-[10px] text-gray-400 truncate max-w-[150px]">{activity.detail}</span>
                      </div>
                    </td>
                    <td className="py-4 text-gray-400 text-xs font-bold">
                      {timeAgo(activity.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Language Distribution */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-[#132A5B] mb-2">User Distribution</h3>
          <p className="text-gray-400 text-sm mb-6 font-medium">By preferred app language</p>

          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={languageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {languageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-[#132A5B]">{analyticsData ? Object.keys(analyticsData.languages).length : 0}</span>
              <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Regions</span>
            </div>
          </div>

          {/* Custom Legend */}
          <div className="mt-8 space-y-4">
            {languageData.map((lang, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: lang.color }}></div>
                  <span className="text-xs font-black text-gray-600 uppercase tracking-widest">{lang.name}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-black text-[#132A5B]">{lang.value.toLocaleString()}</span>
                  <span className="text-[10px] text-gray-400 font-bold">{totalLanguageUsers > 0 ? ((lang.value / totalLanguageUsers) * 100).toFixed(1) : 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// --- Loading & Error Components ---

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse bg-[#F8F9FA] min-h-screen">
      <div className="h-10 w-1/3 bg-gray-200 rounded-xl"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7].map(i => <div key={i} className="h-40 bg-gray-200 rounded-[1.5rem]"></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[400px] bg-gray-200 rounded-[2rem]"></div>
        <div className="h-[400px] bg-gray-200 rounded-[2rem]"></div>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
      <div className="text-center p-12 bg-white rounded-[3rem] shadow-xl border border-red-50">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <MdHistory size={40} />
        </div>
        <h2 className="text-2xl font-black text-[#132A5B] mb-2 tracking-tight">Sync Connection Failed</h2>
        <p className="text-gray-500 font-medium mb-8">We couldn't fetch the latest analytics data from the server.</p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-[#132A5B] text-white font-bold rounded-2xl">
          Retry Connection
        </button>
      </div>
    </div>
  );
}