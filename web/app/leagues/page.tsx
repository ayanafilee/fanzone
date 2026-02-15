'use client';

import React, { useState } from 'react';
import {
    useGetLeaguesQuery,
    useAddLeagueMutation,
    useUpdateLeagueMutation,
    useDeleteLeagueMutation,
    League
} from '@/lib/features/leagues/leaguesApi';
import {
    MdAddCircleOutline,
    MdSearch,
    MdClose,
    MdEdit,
    MdDelete,
    MdFlag,
    MdEmojiEvents,
    MdPublic
} from 'react-icons/md';
import { CloudinaryUpload } from '../components/common/CloudinaryUpload';
import Image from 'next/image';
import { toast, Toaster } from 'react-hot-toast';

export default function LeaguesManagementPage() {
    const { data: leagues, isLoading } = useGetLeaguesQuery();
    const [addLeague, { isLoading: isAdding }] = useAddLeagueMutation();
    const [updateLeague, { isLoading: isUpdating }] = useUpdateLeagueMutation();
    const [deleteLeague] = useDeleteLeagueMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingLeague, setEditingLeague] = useState<League | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        logo_url: '',
        country: ''
    });

    const handleOpenModal = (league?: League) => {
        if (league) {
            setEditingLeague(league);
            setFormData({
                name: league.name,
                logo_url: league.logo_url,
                country: league.country
            });
        } else {
            setEditingLeague(null);
            setFormData({ name: '', logo_url: '', country: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingLeague) {
                await updateLeague({ id: editingLeague.id, ...formData }).unwrap();
                toast.success('League updated successfully');
            } else {
                await addLeague(formData).unwrap();
                toast.success('League added successfully');
            }
            setIsModalOpen(false);
            setFormData({ name: '', logo_url: '', country: '' });
            setEditingLeague(null);
        } catch (err) {
            toast.error(editingLeague ? 'Failed to update league' : 'Failed to add league');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this league? All clubs associated with it might be affected.')) {
            try {
                await deleteLeague(id).unwrap();
                toast.success('League deleted successfully');
            } catch (err) {
                toast.error('Failed to delete league');
            }
        }
    };

    const filteredLeagues = leagues?.filter((league: League) =>
        league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        league.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#132A5B] tracking-tight">Leagues Management</h1>
                    <p className="text-gray-400 font-medium text-sm md:text-base">Organize and manage football leagues globally</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-[#132A5B] text-white font-bold rounded-2xl shadow-xl shadow-blue-900/10 hover:bg-blue-900 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <MdAddCircleOutline size={24} />
                    <span>Create League</span>
                </button>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className="relative group">
                    <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00A3E0] transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search leagues by name or country..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-50/50 border border-gray-100 h-12 pl-12 pr-4 rounded-2xl text-sm font-medium w-full outline-none focus:ring-2 focus:ring-[#00A3E0]/20 focus:border-[#00A3E0]/30 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="h-64 bg-white rounded-[2.5rem] animate-pulse border border-gray-100" />
                    ))
                ) : filteredLeagues?.map((league: League) => (
                    <div key={league.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500">
                        <div className="h-44 bg-gray-50 relative flex items-center justify-center p-8 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#132A5B]/5 to-transparent opacity-50 group-hover:scale-110 transition-transform duration-700" />
                            <div className="relative w-28 h-28 drop-shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                <Image src={league.logo_url} alt={league.name} fill className="object-contain" />
                            </div>

                            <div className="absolute top-4 right-4 flex gap-2">
                                <button
                                    onClick={() => handleOpenModal(league)}
                                    className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center text-gray-600 hover:text-[#00A3E0] hover:scale-110 active:scale-95 transition-all"
                                >
                                    <MdEdit size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(league.id)}
                                    className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center text-gray-600 hover:text-red-500 hover:scale-110 active:scale-95 transition-all"
                                >
                                    <MdDelete size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-black text-[#132A5B] tracking-tight leading-tight">{league.name}</h3>
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#132A5B]">
                                    <MdEmojiEvents size={20} />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl w-fit">
                                <MdPublic size={16} className="text-[#00A3E0]" />
                                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{league.country}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0A1B3D]/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-8 md:p-12 animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-6 top-6 md:right-8 md:top-8 w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                            <MdClose size={24} />
                        </button>

                        <div className="space-y-1 mb-10">
                            <h2 className="text-3xl font-black text-[#132A5B] tracking-tight">
                                {editingLeague ? 'Update League' : 'Create New League'}
                            </h2>
                            <p className="text-gray-400 font-medium">Define the league details and branding</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="flex flex-col items-center justify-center py-4 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                                <CloudinaryUpload
                                    value={formData.logo_url}
                                    onChange={(url) => setFormData({ ...formData, logo_url: url })}
                                    label="League Official Logo"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">League Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#00A3E0]/20 focus:bg-white outline-none font-bold text-[#132A5B] transition-all"
                                        placeholder="e.g. English Premier League"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Country</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#00A3E0]/20 focus:bg-white outline-none font-bold text-[#132A5B] transition-all"
                                        placeholder="e.g. England"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isAdding || isUpdating}
                                className="w-full h-16 rounded-2xl bg-[#132A5B] text-white font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:bg-blue-900 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isAdding || isUpdating ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    editingLeague ? 'Update League' : 'Create League'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
