'use client';

import React, { useState } from 'react';
import {
    useGetClubsQuery,
    useAddClubMutation,
    useUpdateClubMutation,
    useDeleteClubMutation,
    Club
} from '@/lib/features/clubs/clubsApi';
import {
    useGetLeaguesQuery
} from '@/lib/features/leagues/leaguesApi';
import {
    MdAddCircleOutline,
    MdSearch,
    MdGroups,
    MdClose,
    MdEdit,
    MdDelete,
    MdShield,
    MdEmojiEvents,
    MdKeyboardArrowDown
} from 'react-icons/md';
import { CloudinaryUpload } from '../components/common/CloudinaryUpload';
import Image from 'next/image';
import { toast, Toaster } from 'react-hot-toast';

export default function ClubsManagementPage() {
    const { data: clubs, isLoading: isClubsLoading } = useGetClubsQuery(undefined);
    const { data: leagues, isLoading: isLeaguesLoading } = useGetLeaguesQuery();
    const [addClub, { isLoading: isAdding }] = useAddClubMutation();
    const [updateClub, { isLoading: isUpdating }] = useUpdateClubMutation();
    const [deleteClub] = useDeleteClubMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingClub, setEditingClub] = useState<Club | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        logo_url: '',
        league_id: ''
    });

    const handleOpenModal = (club?: Club) => {
        if (club) {
            setEditingClub(club);
            setFormData({
                name: club.name,
                logo_url: club.logo_url,
                league_id: club.league_id
            });
        } else {
            setEditingClub(null);
            setFormData({ name: '', logo_url: '', league_id: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.league_id) {
            toast.error('Please select a league');
            return;
        }
        try {
            if (editingClub) {
                await updateClub({ id: editingClub.id, ...formData }).unwrap();
                toast.success('Club updated successfully');
            } else {
                await addClub(formData).unwrap();
                toast.success('Club added successfully');
            }
            setIsModalOpen(false);
            setFormData({ name: '', logo_url: '', league_id: '' });
            setEditingClub(null);
        } catch (err: any) {
            toast.error(err?.data?.message || (editingClub ? 'Failed to update club' : 'Failed to add club'));
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this club?')) {
            try {
                await deleteClub(id).unwrap();
                toast.success('Club deleted successfully');
            } catch (err) {
                toast.error('Failed to delete club');
            }
        }
    };

    const getLeagueName = (leagueId: string) => {
        return leagues?.find(l => l.id === leagueId)?.name || 'Unknown League';
    };

    const filteredClubs = clubs?.filter((club: Club) =>
        club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getLeagueName(club.league_id).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isLoading = isClubsLoading || isLeaguesLoading;

    return (
        <div className="space-y-6 pt-8">
            <Toaster position="top-right" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#132A5B] tracking-tight">Clubs Management</h1>
                    <p className="text-gray-400 font-medium text-sm md:text-base">Manage football clubs and their league affiliations</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-[#132A5B] text-white font-bold rounded-2xl shadow-xl shadow-blue-900/10 hover:bg-blue-900 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <MdAddCircleOutline size={24} />
                    <span>Register Club</span>
                </button>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className="relative group">
                    <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00A3E0] transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search clubs by name or league..."
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
                ) : filteredClubs?.map((club: Club) => (
                    <div key={club.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500">
                        <div className="h-44 bg-gray-50 relative flex items-center justify-center p-8 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#132A5B]/5 to-transparent opacity-50 group-hover:scale-110 transition-transform duration-700" />
                            <div className="relative w-28 h-28 drop-shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                <Image src={club.logo_url} alt={club.name} fill className="object-contain" />
                            </div>

                            <div className="absolute top-4 right-4 flex gap-2">
                                <button
                                    onClick={() => handleOpenModal(club)}
                                    className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center text-gray-600 hover:text-[#00A3E0] hover:scale-110 active:scale-95 transition-all"
                                >
                                    <MdEdit size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(club.id)}
                                    className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center text-gray-600 hover:text-red-500 hover:scale-110 active:scale-95 transition-all"
                                >
                                    <MdDelete size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-black text-[#132A5B] tracking-tight leading-tight">{club.name}</h3>
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#132A5B]">
                                    <MdShield size={20} />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl w-fit">
                                <MdEmojiEvents size={16} className="text-[#00A3E0]" />
                                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{getLeagueName(club.league_id)}</span>
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
                                {editingClub ? 'Update Club' : 'Register Football Club'}
                            </h2>
                            <p className="text-gray-400 font-medium">Please provide the official club details below</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="flex flex-col items-center justify-center py-4 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                                <CloudinaryUpload
                                    value={formData.logo_url}
                                    onChange={(url) => setFormData({ ...formData, logo_url: url })}
                                    label="Club Official Logo"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Club Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#00A3E0]/20 focus:bg-white outline-none font-bold text-[#132A5B] transition-all"
                                        placeholder="e.g. Arsenal FC"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned League</label>
                                    <div className="relative group">
                                        <select
                                            required
                                            value={formData.league_id}
                                            onChange={(e) => setFormData({ ...formData, league_id: e.target.value })}
                                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#00A3E0]/20 focus:bg-white outline-none font-bold text-[#132A5B] transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Select a league</option>
                                            {leagues?.map(league => (
                                                <option key={league.id} value={league.id}>{league.name}</option>
                                            ))}
                                        </select>
                                        <MdKeyboardArrowDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-[#00A3E0] transition-colors" size={24} />
                                    </div>
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
                                    editingClub ? 'Update Changes' : 'Complete Registration'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
