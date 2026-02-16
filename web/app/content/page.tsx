'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    useGetContentQuery
} from '@/lib/features/content/contentApi';
import {
    useDeleteContentMutation,
    Content
} from '@/lib/features/admin/adminApi';
import { useGetClubsQuery } from '@/lib/features/clubs/clubsApi';
import {
    MdPostAdd,
    MdSearch,
    MdEdit,
    MdDelete,
    MdImage,
    MdArticle
} from 'react-icons/md';
import Image from 'next/image';
import { toast, Toaster } from 'react-hot-toast';

export default function ContentManagementPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedClub, setSelectedClub] = useState('All');

    // Queries
    const { data: contentList, isLoading } = useGetContentQuery({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        club_id: selectedClub === 'All' ? undefined : selectedClub
    });
    const { data: clubs } = useGetClubsQuery(undefined);

    // Mutations
    const [deleteContent] = useDeleteContentMutation();

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this content?')) {
            try {
                await deleteContent(id).unwrap();
                toast.success('Content deleted successfully');
            } catch (error) {
                toast.error('Failed to delete content');
            }
        }
    };

    const categories = ['News', 'Transfer', 'Match'];

    const filteredContent = contentList?.filter((c: any) =>
        c.title.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title.am.includes(searchTerm) ||
        c.title.om.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />

            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#132A5B] tracking-tight">Content Management</h1>
                    <p className="text-gray-400 font-medium">Create and manage your platform articles</p>
                </div>
                <Link
                    href="/content/add"
                    className="flex items-center gap-2 px-8 py-4 bg-[#132A5B] text-white font-bold rounded-2xl shadow-xl shadow-blue-900/20 hover:bg-blue-900 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <MdPostAdd size={24} />
                    <span>Create Article</span>
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group w-full">
                    <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00A3E0] transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-50/50 border border-gray-100 h-12 pl-12 pr-4 rounded-xl text-sm font-medium w-full outline-none focus:ring-2 focus:ring-[#00A3E0]/20 transition-all"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-gray-50/50 border border-gray-100 h-12 px-6 rounded-xl text-sm font-bold text-[#132A5B] outline-none cursor-pointer hover:bg-white transition-colors"
                    >
                        <option value="All">All Categories</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <select
                        value={selectedClub}
                        onChange={(e) => setSelectedClub(e.target.value)}
                        className="bg-gray-50/50 border border-gray-100 h-12 px-6 rounded-xl text-sm font-bold text-[#132A5B] outline-none cursor-pointer hover:bg-white transition-colors min-w-[160px]"
                    >
                        <option value="All">All Clubs</option>
                        {clubs?.map((club: any) => (
                            <option key={club.id} value={club.id}>{club.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-md overflow-hidden">
                {isLoading ? (
                    <div className="p-12 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-20 w-full bg-gray-50 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredContent && filteredContent.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Main Information</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Category</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Assigned Club</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Published</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right border-b border-gray-100">Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredContent.map((content: Content) => (
                                    <tr key={content.id} className="group hover:bg-gray-50/80 transition-all duration-300">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-20 h-14 rounded-2xl bg-[#EAECED] flex items-center justify-center overflow-hidden border-4 border-white shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                                                    {content.image_url ? (
                                                        <Image src={content.image_url} alt={content.title.en} width={80} height={56} className="object-cover h-full" />
                                                    ) : (
                                                        <MdImage size={24} className="text-gray-300" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col max-w-sm">
                                                    <span className="text-[15px] font-black text-[#132A5B] tracking-tight">{content.title.en}</span>
                                                    <span className="text-[12px] text-[#00A3E0] font-bold">{content.title.am}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                                                {content.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-sm font-bold text-[#132A5B]">
                                            {clubs?.find((club: any) => club.id === content.club_id)?.name || 'General News'}
                                        </td>
                                        <td className="px-6 py-6 text-[12px] font-bold text-gray-400">
                                            {new Date(content.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <Link
                                                    href={`/content/edit/${content.id}`}
                                                    className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-[#132A5B] hover:text-white transition-all shadow-sm hover:shadow-lg"
                                                >
                                                    <MdEdit size={20} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(content.id)}
                                                    className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm hover:shadow-lg"
                                                >
                                                    <MdDelete size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-32 text-center flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6 text-gray-200 shadow-inner">
                            <MdArticle size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-[#132A5B] mb-2">Platform Content is Empty</h3>
                        <p className="text-gray-400 max-w-sm font-medium leading-relaxed">Your platform doesn't have any published articles yet. Start by creating your first news or transfer story.</p>
                        <Link
                            href="/content/add"
                            className="mt-8 px-8 py-4 bg-[#132A5B] text-white font-bold rounded-2xl hover:bg-blue-900 transition-all flex items-center gap-2 shadow-xl shadow-blue-900/10"
                        >
                            <MdPostAdd size={24} />
                            Create First Article
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

