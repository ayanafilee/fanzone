'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/lib/store';
import {
    useGetAllUsersQuery,
    useGetAllAdminsQuery,
    useRegisterAdminMutation,
    UserInfo
} from '@/lib/features/admin/adminApi';
import {
    MdPeopleAlt,
    MdAdminPanelSettings,
    MdSearch,
    MdFilterList,
    MdMoreVert,
    MdEmail,
    MdCalendarToday,
    MdCheckCircle,
    MdError,
    MdAdd,
    MdClose
} from 'react-icons/md';
import Image from 'next/image';
import { toast, Toaster } from 'react-hot-toast';

export default function UserManagementPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState<'users' | 'admins'>('users');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    // Fetch data based on active tab
    const { data: users, isLoading: usersLoading, error: usersError } = useGetAllUsersQuery(undefined, {
        skip: activeTab !== 'users'
    });
    const { data: admins, isLoading: adminsLoading, error: adminsError } = useGetAllAdminsQuery(undefined, {
        skip: activeTab !== 'admins'
    });
    const [registerAdmin, { isLoading: isRegistering }] = useRegisterAdminMutation();

    // Protection logic
    const isSuperAdmin = user?.role === 'super_admin';

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    const handleRegisterAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await registerAdmin(formData).unwrap();
            toast.success('Admin registered successfully!');
            setIsModalOpen(false);
            setFormData({ name: '', email: '', password: '' });
        } catch (error: any) {
            const errorMessage = error?.data?.error || 'Failed to register admin';
            toast.error(errorMessage);
        }
    };

    if (!isSuperAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <MdError size={40} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-black text-[#132A5B] mb-2 tracking-tight">Access Restricted</h2>
                <p className="text-gray-400 max-w-sm font-medium leading-relaxed">
                    This page is only accessible for Super Administrators. If you believe this is an error, please contact the system owner.
                </p>
                <button
                    onClick={() => router.push('/')}
                    className="mt-8 px-8 py-3 bg-[#132A5B] text-white font-bold rounded-2xl shadow-lg hover:bg-blue-900 transition-all"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const currentData = activeTab === 'users' ? users : admins;
    const isLoading = activeTab === 'users' ? usersLoading : adminsLoading;

    // Filter data based on search
    const filteredData = currentData?.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 pt-8">
            <Toaster position="top-right" />
            {/* Page Title */}
            <div className="mb-2">
                <h1 className="text-3xl font-black text-[#132A5B] tracking-tight">User Management</h1>
                <p className="text-gray-400 font-medium mt-1">Manage system users and their roles</p>
            </div>

            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center p-1 bg-white rounded-2xl border border-gray-100 shadow-sm w-fit">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'users'
                            ? 'bg-[#132A5B] text-white shadow-md'
                            : 'text-gray-400 hover:text-[#132A5B]'
                            }`}
                    >
                        <MdPeopleAlt size={20} />
                        Mobile Users
                    </button>
                    <button
                        onClick={() => setActiveTab('admins')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'admins'
                            ? 'bg-[#132A5B] text-white shadow-md'
                            : 'text-gray-400 hover:text-[#132A5B]'
                            }`}
                    >
                        <MdAdminPanelSettings size={20} />
                        Administrators
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    {activeTab === 'admins' && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-[#132A5B] text-white font-bold rounded-2xl shadow-lg hover:shadow-blue-900/20 hover:bg-blue-900 transition-all"
                        >
                            <MdAdd size={24} />
                            Add Admin
                        </button>
                    )}
                    <div className="relative group">
                        <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00A3E0] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-gray-100 h-12 pl-12 pr-4 rounded-2xl text-sm font-medium w-full md:w-64 outline-none focus:ring-2 focus:ring-[#00A3E0]/20 transition-all shadow-sm"
                        />
                    </div>
                    <button className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#132A5B] transition-all shadow-sm">
                        <MdFilterList size={22} />
                    </button>
                </div>
            </div>

            {/* Table/Card Section */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 w-full bg-gray-50 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredData && filteredData.length > 0 ? (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Information</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role & Status</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Details</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined Date</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredData.map((item) => (
                                        <tr key={item.id} className="group hover:bg-gray-50/80 transition-all duration-300">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-[#EAECED] flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0">
                                                        {item.profileImage ? (
                                                            <Image src={item.profileImage} alt={item.name} width={48} height={48} className="object-cover" />
                                                        ) : (
                                                            <span className="text-lg font-black text-[#132A5B]">{item.name[0]}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-[#132A5B] tracking-tight">{item.name}</span>
                                                        <span className="text-[10px] text-gray-400 font-bold">UID: {item.id.slice(-8).toUpperCase()}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.role === 'super_admin' ? 'bg-purple-100 text-purple-600' :
                                                    item.role === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {item.role.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <MdEmail size={14} />
                                                    <span className="text-[13px] font-medium">{item.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-gray-400 font-bold">
                                                    <MdCalendarToday size={14} />
                                                    <span className="text-[12px]">{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button className="w-10 h-10 rounded-xl hover:bg-white hover:shadow-md transition-all flex items-center justify-center text-gray-400 hover:text-[#132A5B]">
                                                    <MdMoreVert size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden p-4 space-y-4">
                            {filteredData.map((item) => (
                                <div key={item.id} className="bg-gray-50/50 rounded-2xl p-4 space-y-3 border border-gray-100">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0">
                                                {item.profileImage ? (
                                                    <Image src={item.profileImage} alt={item.name} width={48} height={48} className="object-cover" />
                                                ) : (
                                                    <span className="text-lg font-black text-[#132A5B]">{item.name[0]}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-[#132A5B]">{item.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold">UID: {item.id.slice(-8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <button className="w-8 h-8 rounded-lg hover:bg-white transition-all flex items-center justify-center text-gray-400">
                                            <MdMoreVert size={18} />
                                        </button>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.role === 'super_admin' ? 'bg-purple-100 text-purple-600' :
                                            item.role === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {item.role.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="space-y-2 pt-2 border-t border-gray-200">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <MdEmail size={14} />
                                            <span className="text-xs font-medium truncate">{item.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <MdCalendarToday size={14} />
                                            <span className="text-xs font-bold">{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="p-20 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-[#F8F9FA] rounded-full flex items-center justify-center mb-4 text-gray-300">
                            <MdSearch size={32} />
                        </div>
                        <h3 className="text-lg font-black text-[#132A5B]">No users found</h3>
                        <p className="text-gray-400 text-sm font-medium">Try adjusting your search or filters to find what you're looking for.</p>
                    </div>
                )}
            </div>

            {/* Add Admin Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0A1B3D]/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-8 md:p-10 animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-6 top-6 w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                            <MdClose size={20} />
                        </button>

                        <div className="space-y-1 mb-8">
                            <h2 className="text-2xl font-black text-[#132A5B] tracking-tight">Register New Admin</h2>
                            <p className="text-gray-400 font-medium text-sm">Create a new administrator account</p>
                        </div>

                        <form onSubmit={handleRegisterAdmin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-12 px-5 rounded-xl bg-gray-50 border-2 border-transparent focus:border-[#00A3E0]/20 focus:bg-white outline-none font-bold text-[#132A5B] transition-all"
                                    placeholder="e.g. John Admin"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full h-12 px-5 rounded-xl bg-gray-50 border-2 border-transparent focus:border-[#00A3E0]/20 focus:bg-white outline-none font-bold text-[#132A5B] transition-all"
                                    placeholder="admin@fanzone.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full h-12 px-5 rounded-xl bg-gray-50 border-2 border-transparent focus:border-[#00A3E0]/20 focus:bg-white outline-none font-bold text-[#132A5B] transition-all"
                                    placeholder="Minimum 6 characters"
                                />
                                <p className="text-xs text-gray-400 font-medium ml-1">Password must be at least 6 characters long</p>
                            </div>

                            <button
                                type="submit"
                                disabled={isRegistering}
                                className="w-full h-14 rounded-xl bg-[#132A5B] text-white font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:bg-blue-900 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isRegistering ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Creating Admin...</span>
                                    </div>
                                ) : (
                                    'Create Admin Account'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
