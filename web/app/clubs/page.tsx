'use client';

import React, { useState } from 'react';
import {
    useGetClubsQuery
} from '@/lib/features/clubs/clubsApi';
import {
    useCreateClubMutation,
} from '@/lib/features/admin/adminApi';
import {
    MdAddCircleOutline,
    MdSearch,
    MdGroups,
    MdClose,
    MdLocationOn,
    MdEmojiEvents
} from 'react-icons/md';
import { CloudinaryUpload } from '../components/common/CloudinaryUpload';
import Image from 'next/image';
import { toast, Toaster } from 'react-hot-toast';

export default function ClubsManagementPage() {
    const { data: clubs, isLoading } = useGetClubsQuery(undefined);
    const [createClub, { isLoading: isCreating }] = useCreateClubMutation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        logo_url: '',
        stadium: '',
        location: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createClub(formData).unwrap();
            toast.success('Club created successfully with full secure URL');
            setIsModalOpen(false);
            setFormData({ name: '', logo_url: '', stadium: '', location: '' });
        } catch (err) {
            toast.error('Failed to create club');
        }
    };

    const filteredClubs = clubs?.filter((club: any) =>
        club.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#132A5B] tracking-tight">Clubs Management</h1>
                    <p className="text-gray-400 font-medium">Manage football clubs and their branding</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#132A5B] text-white font-bold rounded-2xl shadow-lg hover:bg-blue-900 transition-all"
                >
                    <MdAddCircleOutline size={24} />
                    Register Club
                </button>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className="relative group">
                    <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search clubs by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-50/50 border border-gray-100 h-12 pl-12 pr-4 rounded-2xl text-sm font-medium w-full outline-none focus:ring-2 focus:ring-[#00A3E0]/20 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="h-64 bg-white rounded-[2.5rem] animate-pulse border border-gray-100" />
                    ))
                ) : filteredClubs?.map((club: any) => (
                    <div key={club.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500">
                        <div className="h-40 bg-gray-50 relative flex items-center justify-center p-8">
                            <div className="absolute inset-0 bg-[#132A5B]/5 group-hover:bg-[#132A5B]/10 transition-colors" />
                            <div className="relative w-24 h-24 drop-shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                <Image src={club.logo_url} alt={club.name} fill className="object-contain" />
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-black text-[#132A5B] tracking-tight">{club.name}</h3>
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#132A5B]">
                                    <MdEmojiEvents size={20} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-400 text-sm font-bold">
                                    <MdLocationOn size={16} />
                                    <span>{club.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400 text-sm font-bold">
                                    <MdGroups size={16} />
                                    <span>{club.stadium}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0A1B3D]/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-8 top-8 w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
                        >
                            <MdClose size={24} />
                        </button>

                        <h2 className="text-3xl font-black text-[#132A5B] tracking-tight mb-8">Register Football Club</h2>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <CloudinaryUpload
                                value={formData.logo_url}
                                onChange={(url) => setFormData({ ...formData, logo_url: url })}
                                label="Club Official Logo"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Club Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#00A3E0]/20 focus:bg-white outline-none font-bold text-[#132A5B] transition-all"
                                        placeholder="e.g. Saint George SC"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Location</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#00A3E0]/20 focus:bg-white outline-none font-bold text-[#132A5B] transition-all"
                                        placeholder="e.g. Addis Ababa"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Stadium Name</label>
                                <input
                                    type="text"
                                    value={formData.stadium}
                                    onChange={(e) => setFormData({ ...formData, stadium: e.target.value })}
                                    className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#00A3E0]/20 focus:bg-white outline-none font-bold text-[#132A5B] transition-all"
                                    placeholder="e.g. Addis Ababa Stadium"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isCreating}
                                className="w-full h-16 rounded-2xl bg-[#00A3E0] text-white font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                            >
                                {isCreating ? 'Processing...' : 'Complete Registration'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
