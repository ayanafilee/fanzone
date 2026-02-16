'use client';

import React, { useState, useEffect } from 'react';
import { MdLanguage, MdClose, MdSave, MdArrowBack } from 'react-icons/md';
import { CloudinaryUpload } from '../common/CloudinaryUpload';
import { Content } from '@/lib/features/admin/adminApi';
import { useRouter } from 'next/navigation';

interface ContentFormProps {
    content?: Content | null;
    clubs: any[];
    categories: string[];
    onSubmit: (data: any) => Promise<void>;
    isLoading: boolean;
    title: string;
}

export default function ContentForm({ content, clubs, categories, onSubmit, isLoading, title }: ContentFormProps) {
    const router = useRouter();
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#132A5B] hover:shadow-md transition-all border border-gray-100"
                    >
                        <MdArrowBack size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-[#132A5B] tracking-tight">{title}</h1>
                        <p className="text-gray-400 font-medium">Provide details in all three languages for maximum reach</p>
                    </div>
                </div>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
                {/* Main Content Card */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 md:p-12 space-y-12">

                    {/* 1. Classification Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-gray-50">
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Article Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#00A3E0]/20 focus:bg-white outline-none font-bold text-[#132A5B] transition-all cursor-pointer"
                            >
                                {categories.map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Club Affiliation</label>
                            <select
                                value={formData.club_id}
                                onChange={(e) => setFormData({ ...formData, club_id: e.target.value })}
                                required
                                className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#00A3E0]/20 focus:bg-white outline-none font-bold text-[#132A5B] transition-all cursor-pointer"
                            >
                                <option value="">Select a Club</option>
                                <option value="GENERAL">General News (Public)</option>
                                {clubs?.map((club: any) => (
                                    <option key={club.id} value={club.id}>{club.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 2. Headlines Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1.5 h-6 bg-[#00A3E0] rounded-full" />
                            <h3 className="text-xl font-black text-[#132A5B] tracking-tight">Article Headlines</h3>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {[
                                { id: 'en', label: 'English', placeholder: 'e.g. Manchester United wins...' },
                                { id: 'am', label: 'Amharic (አማርኛ)', placeholder: 'ርዕስ ያስገቡ...' },
                                { id: 'om', label: 'Afaan Oromo', placeholder: 'Mata duree galchu...' }
                            ].map((lang) => (
                                <div key={lang.id} className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{lang.label}</label>
                                    <input
                                        type="text"
                                        value={(formData.title as any)[lang.id]}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            title: { ...formData.title, [lang.id]: e.target.value }
                                        })}
                                        required
                                        placeholder={lang.placeholder}
                                        className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-[#00A3E0]/5 focus:border-[#00A3E0]/20 outline-none font-bold text-[#132A5B] transition-all shadow-sm"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. Article Stories Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1.5 h-6 bg-[#00A3E0] rounded-full" />
                            <h3 className="text-xl font-black text-[#132A5B] tracking-tight">Article Stories</h3>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {[
                                { id: 'en', label: 'English', placeholder: 'Write the full story in English...' },
                                { id: 'am', label: 'Amharic (አማርኛ)', placeholder: 'ይዘቱን እዚህ ይጻፉ...' },
                                { id: 'om', label: 'Afaan Oromo', placeholder: 'Seenaa guutuu barreessi...' }
                            ].map((lang) => (
                                <div key={lang.id} className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{lang.label}</label>
                                    <textarea
                                        rows={10}
                                        value={(formData.body as any)[lang.id]}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            body: { ...formData.body, [lang.id]: e.target.value }
                                        })}
                                        required
                                        placeholder={lang.placeholder}
                                        className="w-full p-6 rounded-[2rem] bg-gray-50/50 border border-transparent focus:bg-white focus:ring-4 focus:ring-[#00A3E0]/5 focus:border-[#00A3E0]/20 outline-none font-medium text-[#132A5B] transition-all resize-none shadow-sm leading-relaxed"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. Featured Image Section (At the End) */}
                    <div className="space-y-4 pt-8 border-t border-gray-50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-1.5 h-6 bg-[#00A3E0] rounded-full" />
                            <h3 className="text-xl font-black text-[#132A5B] tracking-tight">Featured Visual</h3>
                        </div>
                        <div className="p-8 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                            <CloudinaryUpload
                                value={formData.image_url}
                                onChange={(url) => setFormData({ ...formData, image_url: url })}
                                label="High Resolution Cover Image"
                            />
                        </div>
                    </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="flex items-center justify-end gap-4 pb-12">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-10 h-16 rounded-2xl text-gray-400 font-black uppercase tracking-widest hover:text-red-500 transition-all"
                    >
                        Discard
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-12 h-16 rounded-2xl bg-[#132A5B] text-white font-black uppercase tracking-widest shadow-2xl shadow-blue-900/20 hover:bg-blue-900 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-3"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : <MdSave size={24} />}
                        <span>{content ? 'Save Changes' : 'Publish Article'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
