'use client';

import React, { useState, useEffect } from 'react';
import { useGetHighlightsQuery } from '@/lib/features/highlights/highlightsApi';
import {
    useCreateHighlightMutation,
    useUpdateHighlightMutation,
    useDeleteHighlightMutation,
    Highlight
} from '@/lib/features/admin/adminApi';
import { useGetClubsQuery } from '@/lib/features/clubs/clubsApi';
import {
    MdVideoLibrary,
    MdSearch,
    MdFilterList,
    MdEdit,
    MdDelete,
    MdAdd,
    MdClose,
    MdPlayCircleOutline,
    MdOpenInNew
} from 'react-icons/md';
import { toast, Toaster } from 'react-hot-toast';

export default function HighlightsManagementPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClub, setSelectedClub] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null);

    // Queries
    const { data: highlightsList, isLoading, isError } = useGetHighlightsQuery({
        club_id: selectedClub === 'All' ? undefined : selectedClub
    });
    const { data: clubs } = useGetClubsQuery(undefined);

    // Mutations
    const [createHighlight, { isLoading: isCreating }] = useCreateHighlightMutation();
    const [updateHighlight, { isLoading: isUpdating }] = useUpdateHighlightMutation();
    const [deleteHighlight] = useDeleteHighlightMutation();

    const handleEdit = (highlight: Highlight) => {
        setEditingHighlight(highlight);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this highlight?')) {
            try {
                await deleteHighlight(id).unwrap();
                toast.success('Highlight deleted successfully');
            } catch (error) {
                toast.error('Failed to delete highlight');
            }
        }
    };

    const filteredHighlights = highlightsList?.filter((h: any) =>
        h.match_title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />

            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#132A5B] tracking-tight">Match Highlights</h1>
                    <p className="text-gray-400 font-medium">Manage YouTube highlights for matches</p>
                </div>
                <button
                    onClick={() => { setEditingHighlight(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-[#132A5B] text-white font-bold rounded-2xl shadow-lg hover:shadow-blue-900/20 hover:bg-blue-900 transition-all"
                >
                    <MdAdd size={24} />
                    Add Highlight
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group w-full">
                    <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00A3E0] transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by match title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-50/50 border border-gray-100 h-12 pl-12 pr-4 rounded-xl text-sm font-medium w-full outline-none focus:ring-2 focus:ring-[#00A3E0]/20 transition-all"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <select
                        value={selectedClub}
                        onChange={(e) => setSelectedClub(e.target.value)}
                        className="bg-gray-50/50 border border-gray-100 h-12 px-4 rounded-xl text-sm font-bold text-[#132A5B] outline-none cursor-pointer w-full md:w-48"
                    >
                        <option value="All">All Clubs</option>
                        {clubs?.map((club: any) => (
                            <option key={club.id} value={club.id}>{club.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grid Section */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-64 w-full bg-gray-50 rounded-[2rem] animate-pulse" />
                        ))}
                    </div>
                ) : filteredHighlights && filteredHighlights.length > 0 ? (
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredHighlights.map((highlight: Highlight) => (
                            <div key={highlight.id} className="group bg-gray-50/50 rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                                <div className="aspect-video bg-[#132A5B] relative flex items-center justify-center group-hover:bg-blue-900 transition-colors">
                                    <MdPlayCircleOutline size={64} className="text-white opacity-20 group-hover:opacity-40 transition-opacity" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a
                                            href={highlight.youtube_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-6 py-2 bg-white text-[#132A5B] font-black rounded-full text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform shadow-xl"
                                        >
                                            Watch on YouTube <MdOpenInNew size={16} />
                                        </a>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-lg font-black text-[#132A5B] mb-2 leading-tight">{highlight.match_title}</h3>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {highlight.club_ids.map(clubId => {
                                            const club = clubs?.find((c: any) => c.id === clubId);
                                            return (
                                                <span key={clubId} className="px-3 py-1 bg-white border border-gray-200 text-[#00A3E0] text-[10px] font-black uppercase tracking-widest rounded-full">
                                                    {club?.name || 'Unknown Club'}
                                                </span>
                                            );
                                        })}
                                    </div>
                                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => handleEdit(highlight)}
                                            className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
                                        >
                                            <MdEdit size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(highlight.id)}
                                            className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
                                        >
                                            <MdDelete size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-20 text-center flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-200">
                            <MdVideoLibrary size={40} />
                        </div>
                        <h3 className="text-xl font-black text-[#132A5B]">No Highlights Found</h3>
                        <p className="text-gray-400 max-w-xs font-medium">Add some match highlights to show them to the fans</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <HighlightModal
                    highlight={editingHighlight}
                    clubs={clubs}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={async (data: Omit<Highlight, 'id'>) => {
                        try {
                            if (editingHighlight) {
                                await updateHighlight({ id: editingHighlight.id, ...data }).unwrap();
                                toast.success('Highlight updated successfully');
                            } else {
                                await createHighlight(data).unwrap();
                                toast.success('Highlight created successfully');
                            }
                            setIsModalOpen(false);
                        } catch (err) {
                            toast.error('Operation failed');
                        }
                    }}
                    isLoading={isCreating || isUpdating}
                />
            )}
        </div>
    );
}

// Modal Component
function HighlightModal({ highlight, clubs, onClose, onSubmit, isLoading }: any) {
    const [formData, setFormData] = useState({
        match_title: '',
        youtube_url: '',
        club_ids: [] as string[]
    });

    useEffect(() => {
        if (highlight) {
            setFormData({
                match_title: highlight.match_title,
                youtube_url: highlight.youtube_url,
                club_ids: [...highlight.club_ids]
            });
        }
    }, [highlight]);

    const toggleClubSelection = (clubId: string) => {
        setFormData(prev => {
            const isSelected = prev.club_ids.includes(clubId);
            if (isSelected) {
                return { ...prev, club_ids: prev.club_ids.filter(id => id !== clubId) };
            } else {
                return { ...prev, club_ids: [...prev.club_ids, clubId] };
            }
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0A1B3D]/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl p-8 md:p-12 animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-8 top-8 w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
                >
                    <MdClose size={24} />
                </button>

                <div className="mb-8 text-center md:text-left">
                    <h2 className="text-3xl font-black text-[#132A5B] tracking-tight">
                        {highlight ? 'Edit Highlight' : 'Add New Highlight'}
                    </h2>
                    <p className="text-gray-400 font-medium italic">Link YouTube content to specific clubs</p>
                </div>

                <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Match Title</label>
                        <input
                            type="text"
                            value={formData.match_title}
                            onChange={(e) => setFormData({ ...formData, match_title: e.target.value })}
                            required
                            placeholder="e.g. Arsenal vs Man United"
                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#00A3E0]/20 focus:bg-white outline-none font-bold text-[#132A5B] transition-all"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">YouTube URL</label>
                        <input
                            type="url"
                            value={formData.youtube_url}
                            onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                            required
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#00A3E0]/20 focus:bg-white outline-none font-bold text-[#132A5B] transition-all"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Clubs (Involved in the match)</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {clubs?.map((club: any) => {
                                const isSelected = formData.club_ids.includes(club.id);
                                return (
                                    <button
                                        key={club.id}
                                        type="button"
                                        onClick={() => toggleClubSelection(club.id)}
                                        className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border-2 ${isSelected
                                                ? 'bg-[#132A5B] border-[#132A5B] text-white'
                                                : 'bg-white border-gray-100 text-gray-400 hover:border-[#00A3E0]/20'
                                            }`}
                                    >
                                        {club.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-14 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || formData.club_ids.length === 0}
                            className={`flex-[2] h-14 rounded-2xl bg-[#00A3E0] text-white font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isLoading ? 'Processing...' : highlight ? 'Update Highlight' : 'Save Highlight'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
