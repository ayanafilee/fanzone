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
  MdOutlineArticle
} from "react-icons/md";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell, PieChart, Pie
} from 'recharts';
import { useGetStatsQuery } from "@/lib/features/admin/adminApi";

// --- Mock Data for Charts (Replace with API data later) ---
const userGrowthData = [
  { name: 'Jan', users: 400 },
  { name: 'Feb', users: 800 },
  { name: 'Mar', users: 1200 },
  { name: 'Apr', users: 1800 },
  { name: 'May', users: 2400 },
  { name: 'Jun', users: 3500 },
];

const clubPopularityData = [
  { name: 'Arsenal', count: 850 },
  { name: 'Man Utd', count: 700 },
  { name: 'St. George', count: 600 },
  { name: 'Eth. Bunna', count: 550 },
  { name: 'Liverpool', count: 400 },
];

const languageData = [
  { name: 'English', value: 400, color: '#132A5B' },
  { name: 'Amharic', value: 800, color: '#00A3E0' },
  { name: 'Afaan Oromo', value: 300, color: '#F59E0B' },
];

const recentActivity = [
  { id: 1, action: 'New Highlight Added', detail: 'Arsenal vs Chelsea', time: '2 mins ago', status: 'Success' },
  { id: 2, action: 'User Registration', detail: 'New user from Addis Ababa', time: '15 mins ago', status: 'Success' },
  { id: 3, action: 'Server Warning', detail: 'High API latency', time: '1 hour ago', status: 'Warning' },
  { id: 4, action: 'News Published', detail: 'Transfer Market Update', time: '2 hours ago', status: 'Success' },
];

export default function Dashboard() {
  const { data: statsData, isLoading, error } = useGetStatsQuery();

  // Helper to calculate dummy trends (You can replace this with real logic)
  const getTrend = (value: number) => {
    return value > 1000 ? { icon: MdTrendingUp, color: 'text-green-500', text: '+12.5%' } : { icon: MdTrendingUp, color: 'text-blue-500', text: '+5.2%' };
  };

  const getStatsList = () => {
    if (!statsData) return [];
    return [
      { label: "Total Users", value: statsData.users, icon: MdGroup, color: "bg-blue-600", lightColor: "bg-blue-100" },
      { label: "Total Admins", value: statsData.admins, icon: MdSportsSoccer, color: "bg-purple-600", lightColor: "bg-purple-100" },
      { label: "Articles", value: statsData.content, icon: MdDescription, color: "bg-green-600", lightColor: "bg-green-100" },
      { label: "Highlights", value: statsData.highlights, icon: MdVideoLibrary, color: "bg-orange-600", lightColor: "bg-orange-100" },
    ];
  };

  const stats = getStatsList();

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState />;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] font-sans text-[#132A5B] p-2 md:p-6 space-y-6">

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
            Add Content
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
              <h3 className="text-3xl font-black text-[#132A5B] mb-1">{stat.value.toLocaleString()}</h3>
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
            <select className="bg-gray-50 border border-gray-200 text-xs font-bold rounded-lg px-3 py-2 outline-none">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
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
          <h3 className="text-xl font-bold text-[#132A5B] mb-6">Top Clubs</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={clubPopularityData} margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F3F4F6" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
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

        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#132A5B]">Recent Activity</h3>
            <button className="text-[#00A3E0] text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-3 pl-2">Action</th>
                  <th className="pb-3">Detail</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-gray-700">
                {recentActivity.map((activity) => (
                  <tr key={activity.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 pl-2 font-bold text-[#132A5B]">{activity.action}</td>
                    <td className="py-4 text-gray-500">{activity.detail}</td>
                    <td className="py-4 text-gray-400">{activity.time}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${activity.status === 'Success' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                        }`}>
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Language Distribution (Donut Chart) */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-[#132A5B] mb-2">User Languages</h3>
          <p className="text-gray-400 text-sm mb-6">Preferred language breakdown</p>

          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={languageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {languageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-[#132A5B]">3</span>
              <span className="text-xs text-gray-400 font-bold uppercase">Languages</span>
            </div>
          </div>

          {/* Custom Legend */}
          <div className="mt-4 space-y-3">
            {languageData.map((lang, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lang.color }}></div>
                  <span className="text-sm font-bold text-gray-600">{lang.name}</span>
                </div>
                <span className="text-sm font-bold text-[#132A5B]">{((lang.value / 1500) * 100).toFixed(0)}%</span>
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
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-10 w-1/3 bg-gray-200 rounded-xl"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-gray-200 rounded-[1.5rem]"></div>)}
      </div>
      <div className="h-80 bg-gray-200 rounded-[2rem]"></div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
      <div className="text-center">
        <h2 className="text-2xl font-black text-red-500 mb-2">Failed to load Dashboard</h2>
        <p className="text-gray-500">Please check your internet connection or try again later.</p>
      </div>
    </div>
  );
}