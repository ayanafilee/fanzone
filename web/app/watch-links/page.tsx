'use client';

import React, { useState } from 'react';
import { useGetWatchLinksQuery } from '@/lib/features/watchLinks/watchLinksApi';
import {
    useCreateWatchLinkMutation,
    useUpdateWatchLinkMutation,
    useDeleteWatchLinkMutation,
    WatchLink
} from '@/lib/features/admin/adminApi';
import {
    MdLink,
    MdSearch,
    MdAdd,
    MdEdit,
    MdDelete,
    MdClose,
    MdTv,
    MdLiveTv,
    MdOpenInNew,
    MdImage
} from 'react-icons/md';
import { CloudinaryUpload } from '../components/common/CloudinaryUpload';
import Image from 'next/image';
import { toast, Toaster } from 'react-hot-toast';

export default function WatchLinksManagementPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<WatchLink | null>(null);

    // Queries
    const { data: watchLinks, isLoading } = useGetWatchLinksQuery();

    // Mutations
    const [createWatchLink, { isLoading: isCreating }] = useCreateWatchLinkMutation();
    const [updateWatchLink, { isLoading: isUpdating }] = useUpdateWatchLinkMutation();
    const [deleteWatchLink] = useDeleteWatchLinkMutation();

    const handleEdit = (link: WatchLink) => {
        setEditingLink(link);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this watch link?')) {
            try {
                await deleteWatchLink(id).unwrap();
                toast.success('Watch link deleted successfully');
            } catch (error) {
                toast.error('Failed to delete watch link');
            }
        }
    };

    const filteredLinks = watchLinks?.filter((link: WatchLink) =>
        link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />

            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#132A5B] tracking-tight">Watch Links</h1>
                    <p className="text-gray-400 font-medium">Manage streaming channels and TV links</p>
                </div>
                <button
                    onClick={() => { setEditingLink(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-[#132A5B] text-white font-bold rounded-2xl shadow-lg hover:shadow-blue-900/20 hover:bg-blue-900 transition-all"
                >
                    <MdAdd size={24} />
                    Add Watch Link
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm">
                <div className="relative group w-full">
                    <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00A3E0] transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-50/50 border border-gray-100 h-12 pl-12 pr-4 rounded-xl text-sm font-medium w-full outline-none focus:ring-2 focus:ring-[#00A3E0]/20 transition-all"
                    />
                </div>
            </div>

            {/* Links Table/Grid */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-20 w-full bg-gray-50 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredLinks && filteredLinks.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Channel / Service</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Link URL</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredLinks.map((link: WatchLink) => (
                                    <tr key={link.id} className="group hover:bg-gray-50/80 transition-all duration-300">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center p-2 shadow-sm shrink-0">
                                                    {link.logo_url ? (
                                                        <Image src={link.logo_url} alt={link.name} width={40} height={40} className="object-contain" />
                                                    ) : (
                                                        <MdTv size={24} className="text-gray-300" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-[#132A5B]">{link.name}</span>
                                                    <span className="text-[11px] text-[#00A3E0] font-bold">Channel ID: {link.id.slice(-6)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${link.type.toLowerCase().includes('live') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                                }`}>
                                                {link.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <a
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs font-bold text-gray-400 hover:text-[#00A3E0] flex items-center gap-1 transition-colors group/link"
                                            >
                                                <span className="truncate max-w-[200px]">{link.url}</span>
                                                <MdOpenInNew size={14} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                            </a>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(link)}
                                                    className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <MdEdit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(link.id)}
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
                            <MdLiveTv size={40} />
                        </div>
                        <h3 className="text-xl font-black text-[#132A5B]">No Watch Links Found</h3>
                        <p className="text-gray-400 max-w-xs font-medium">Add streaming services or TV channels for users to watch matches</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <WatchLinkModal
                    link={editingLink}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={async (data: Omit<WatchLink, 'id'>) => {
                        try {
                            if (editingLink) {
                                await updateWatchLink({ id: editingLink.id, ...data }).unwrap();
                                toast.success('Watch link updated successfully');
                            } else {
                                await createWatchLink(data).unwrap();
                                toast.success('Watch link created successfully');
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
function WatchLinkModal({ link, onClose, onSubmit, isLoading }: any) {
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        type: 'Streaming',
        logo_url: ''
    });

    React.useEffect(() => {
        if (link) {
            setFormData({
                name: link.name,
                url: link.url,
                type: link.type,
                logo_url: link.logo_url
            });
        }
    }, [link]);

    const suggestedTypes = ['Streaming', 'TV Channel', 'Live Stream', 'Webcast', 'Mobile App'];

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

                <div className="mb-8">
                    <h2 className="text-3xl font-black text-[#132A5B] tracking-tight">
                        {link ? 'Edit Watch Link' : 'Add Watch Link'}
                    </h2>
                    <p className="text-gray-400 font-medium">Provide streaming details for match access</p>
                </div>

                <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
                    {/* Logo Upload */}
                    <CloudinaryUpload
                        value={formData.logo_url}
                        onChange={(url) => setFormData({ ...formData, logo_url: url })}
                        label="Channel Logo"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Channel Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="e.g. SuperSport Premier League"
                                className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#00A3E0]/20 focus:bg-white outline-none font-bold text-[#132A5B] transition-all"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Service Type</label>
                            <input
                                type="text"
                                list="linkTypes"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                required
                                placeholder="e.g. Streaming"
                                className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#00A3E0]/20 focus:bg-white outline-none font-bold text-[#132A5B] transition-all"
                            />
                            <datalist id="linkTypes">
                                {suggestedTypes.map(type => <option key={type} value={type} />)}
                            </datalist>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Watch URL</label>
                        <div className="relative group">
                            <MdLink className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00A3E0] transition-colors" size={20} />
                            <input
                                type="url"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                required
                                placeholder="https://..."
                                className="w-full h-14 pl-14 pr-6 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#00A3E0]/20 focus:bg-white outline-none font-bold text-[#132A5B] transition-all"
                            />
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
                            disabled={isLoading}
                            className={`flex-[2] h-14 rounded-2xl bg-[#00A3E0] text-white font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20 hover:scale-[1.02] transition-all disabled:opacity-50`}
                        >
                            {isLoading ? 'Processing...' : link ? 'Update Link' : 'Save Watch Link'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
