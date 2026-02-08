'use client';

import React, { useState, useEffect } from 'react';
import {
    useGetContentQuery
} from '@/lib/features/content/contentApi';
import {
    useCreateContentMutation,
    useUpdateContentMutation,
    useDeleteContentMutation,
    Content
} from '@/lib/features/admin/adminApi';
import { useGetClubsQuery } from '@/lib/features/clubs/clubsApi';
import {
    MdPostAdd,
    MdSearch,
    MdFilterList,
    MdEdit,
    MdDelete,
    MdImage,
    MdLanguage,
    MdClose,
    MdCloudUpload,
    MdArticle
} from 'react-icons/md';
import { CloudinaryUpload } from '../components/common/CloudinaryUpload';
import Image from 'next/image';
import { toast, Toaster } from 'react-hot-toast';

export default function ContentManagementPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedClub, setSelectedClub] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContent, setEditingContent] = useState<Content | null>(null);

    // Queries
    const { data: contentList, isLoading, isError } = useGetContentQuery({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        club_id: selectedClub === 'All' ? undefined : selectedClub
    });
    const { data: clubs } = useGetClubsQuery(undefined);

    // Mutations
    const [createContent, { isLoading: isCreating }] = useCreateContentMutation();
    const [updateContent, { isLoading: isUpdating }] = useUpdateContentMutation();
    const [deleteContent] = useDeleteContentMutation();

    const handleEdit = (content: Content) => {
        setEditingContent(content);
        setIsModalOpen(true);
    };

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
                <button
                    onClick={() => { setEditingContent(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-[#132A5B] text-white font-bold rounded-2xl shadow-lg hover:shadow-blue-900/20 hover:bg-blue-900 transition-all"
                >
                    <MdPostAdd size={24} />
                    Create Article
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
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
                        className="bg-gray-50/50 border border-gray-100 h-12 px-4 rounded-xl text-sm font-bold text-[#132A5B] outline-none cursor-pointer"
                    >
                        <option value="All">All Categories</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <select
                        value={selectedClub}
                        onChange={(e) => setSelectedClub(e.target.value)}
                        className="bg-gray-50/50 border border-gray-100 h-12 px-4 rounded-xl text-sm font-bold text-[#132A5B] outline-none cursor-pointer max-w-[150px]"
                    >
                        <option value="All">All Clubs</option>
                        {clubs?.map((club: any) => (
                            <option key={club.id} value={club.id}>{club.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
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
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Main Info</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Club</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredContent.map((content: Content) => (
                                    <tr key={content.id} className="group hover:bg-gray-50/80 transition-all duration-300">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-12 rounded-xl bg-[#EAECED] flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0">
                                                    {content.image_url ? (
                                                        <Image src={content.image_url} alt={content.title.en} width={64} height={48} className="object-cover h-full" />
                                                    ) : (
                                                        <MdImage size={24} className="text-gray-300" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col max-w-sm">
                                                    <span className="text-[13px] font-black text-[#132A5B] truncate">{content.title.en}</span>
                                                    <span className="text-[11px] text-[#00A3E0] font-bold">{content.title.am}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600`}>
                                                {content.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-bold text-gray-500">
                                            {clubs?.find((club: any) => club.id === content.club_id)?.name || 'General'}
                                        </td>
                                        <td className="px-6 py-5 text-[12px] font-bold text-gray-400">
                                            {new Date(content.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(content)}
                                                    className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <MdEdit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(content.id)}
                                                    className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <MdDelete size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-20 text-center flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-200">
                            <MdArticle size={40} />
                        </div>
                        <h3 className="text-xl font-black text-[#132A5B]">No Content Found</h3>
                        <p className="text-gray-400 max-w-xs font-medium">Get started by creating your first platform news or transfer update</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <ContentModal
                    content={editingContent}
                    clubs={clubs}
                    categories={categories}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={async (data: Omit<Content, 'id' | 'created_at'>) => {
                        try {
                            if (editingContent) {
                                await updateContent({ id: editingContent.id, ...data }).unwrap();
                                toast.success('Content updated successfully');
                            } else {
                                await createContent(data as any).unwrap();
                                toast.success('Content created successfully');
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
function ContentModal({ content, clubs, categories, onClose, onSubmit, isLoading }: any) {
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [formData, setFormData] = useState({
        title: { en: '', am: '', om: '' },
        body: { en: '', am: '', om: '' },
        image_url: '',
        category: 'News',
        club_id: ''
    });

    useEffect(() => {
        if (content) {
            setFormData({
                title: { ...content.title },
                body: { ...content.body },
                image_url: content.image_url,
                category: content.category,
                club_id: content.club_id
            });
        }
    }, [content]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0A1B3D]/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl p-8 md:p-12 animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-8 top-8 w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
                >
                    <MdClose size={24} />
                </button>

                <div className="mb-8">
                    <h2 className="text-3xl font-black text-[#132A5B] tracking-tight">
                        {content ? 'Edit Article' : 'Create New Article'}
                    </h2>
                    <p className="text-gray-400 font-medium">Fill in the details for all three languages</p>
                </div>

                <form className="space-y-10" onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
                    {/* Integrated Cloudinary Upload */}
                    <CloudinaryUpload
                        value={formData.image_url}
                        onChange={(url) => setFormData({ ...formData, image_url: url })}
                        label="Article Featured Image"
                    />

                    {/* Metadata Section (Category & Club) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#00A3E0]/20 focus:bg-white outline-none font-bold text-[#132A5B] transition-all"
                            >
                                {categories.map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Associated Club</label>
                            <select
                                value={formData.club_id}
                                onChange={(e) => setFormData({ ...formData, club_id: e.target.value })}
                                required
                                className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#00A3E0]/20 focus:bg-white outline-none font-bold text-[#132A5B] transition-all"
                            >
                                <option value="">Select a Club</option>
                                <option value="GENERAL">General News (No Club)</option>
                                {clubs?.map((club: any) => (
                                    <option key={club.id} value={club.id}>{club.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Multilingual Title & Body Sections */}
                    {['en', 'am', 'om'].map((lang) => (
                        <div key={lang} className="p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100 space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <MdLanguage className="text-[#00A3E0]" />
                                <span className="text-xs font-black text-[#132A5B] uppercase tracking-widest">
                                    {lang === 'en' ? 'English' : lang === 'am' ? 'Amharic (አማርኛ)' : 'Afaan Oromo'}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Article Title</label>
                                <input
                                    type="text"
                                    value={(formData.title as any)[lang]}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        title: { ...formData.title, [lang]: e.target.value }
                                    })}
                                    required
                                    placeholder={`Enter ${lang} title...`}
                                    className="w-full h-12 px-6 rounded-xl bg-white border border-gray-100 focus:ring-2 focus:ring-[#00A3E0]/20 outline-none font-bold text-[#132A5B] transition-all"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Article Body</label>
                                <textarea
                                    rows={4}
                                    value={(formData.body as any)[lang]}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        body: { ...formData.body, [lang]: e.target.value }
                                    })}
                                    required
                                    placeholder={`Enter ${lang} content...`}
                                    className="w-full p-6 rounded-xl bg-white border border-gray-100 focus:ring-2 focus:ring-[#00A3E0]/20 outline-none font-medium text-[#132A5B] transition-all resize-none"
                                />
                            </div>
                        </div>
                    ))}

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-14 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-[2] h-14 rounded-2xl bg-[#00A3E0] text-white font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : content ? 'Save Changes' : 'Publish Article'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
