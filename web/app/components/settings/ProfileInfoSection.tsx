'use client';

import { useState, useEffect } from 'react';
import { validateName } from '@/lib/utils/validation';
import { MdPerson, MdLanguage, MdSportsSoccer, MdCheckCircle } from 'react-icons/md';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    language: 'en' | 'am' | 'om';
    fav_club_id?: string;
    role: string;
    profile_image_url?: string;
    created_at: string;
}

interface Club {
    id: string;
    name: string;
}

interface ProfileInfoSectionProps {
    profile: UserProfile;
    clubs: Club[];
    onUpdate: (data: { name?: string; language?: string; fav_club_id?: string; profile_image_url?: string }) => Promise<void>;
    isLoading: boolean;
}

export default function ProfileInfoSection({ profile, clubs, onUpdate, isLoading }: ProfileInfoSectionProps) {
    const [name, setName] = useState(profile.name);
    const [language, setLanguage] = useState(profile.language);
    const [favClubId, setFavClubId] = useState(profile.fav_club_id || '');
    const [errors, setErrors] = useState<{ name?: string }>({});

    useEffect(() => {
        setName(profile.name);
        setLanguage(profile.language);
        setFavClubId(profile.fav_club_id || '');
    }, [profile]);

    const handleNameBlur = () => {
        const result = validateName(name);
        setErrors(prev => ({ ...prev, name: result.error }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const nameValidation = validateName(name);

        if (!nameValidation.isValid) {
            setErrors({
                name: nameValidation.error,
            });
            return;
        }

        await onUpdate({
            name,
            language,
            fav_club_id: favClubId || undefined,
        });
    };

    const hasErrors = !!errors.name;
    const isFormDirty = name !== profile.name ||
        language !== profile.language ||
        favClubId !== (profile.fav_club_id || '');

    return (
        <div className="bg-white rounded-[2rem] shadow-lg border border-gray-100 p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            {/* Decorative Background Element */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#00A3E0] opacity-5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>

            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00A3E0] to-[#0082b3] rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <MdPerson size={24} className="text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-[#132A5B] tracking-tight">Profile Information</h2>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Update your details</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                    <label htmlFor="name" className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <MdPerson size={14} />
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                        }}
                        onBlur={handleNameBlur}
                        maxLength={100}
                        placeholder="Enter your full name"
                        className="w-full px-6 py-4 rounded-2xl bg-[#EAECED]/50 border-2 border-transparent focus:border-[#00A3E0]/30 focus:bg-white transition-all outline-none text-[#132A5B] font-bold shadow-sm"
                    />
                    {errors.name && (
                        <p className="text-red-500 text-xs font-medium ml-1 flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {errors.name}
                        </p>
                    )}
                </div>

                {/* Email Field (Read-only) */}
                <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email Address
                    </label>
                    <div className="relative">
                        <input
                            type="email"
                            value={profile.email}
                            disabled
                            className="w-full px-6 py-4 rounded-2xl bg-gray-100 border-2 border-transparent text-gray-500 font-bold shadow-sm cursor-not-allowed"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-200 px-3 py-1 rounded-full">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Read Only</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 ml-1">Email cannot be changed for security reasons</p>
                </div>

                {/* Language Field */}
                <div className="space-y-2">
                    <label htmlFor="language" className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <MdLanguage size={14} />
                        Preferred Language
                    </label>
                    <select
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as 'en' | 'am' | 'om')}
                        className="w-full px-6 py-4 rounded-2xl bg-[#EAECED]/50 border-2 border-transparent focus:border-[#00A3E0]/30 focus:bg-white transition-all outline-none text-[#132A5B] font-bold shadow-sm appearance-none cursor-pointer"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23132A5B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5rem' }}
                    >
                        <option value="en">🇬🇧 English</option>
                        <option value="am">🇪🇹 አማርኛ (Amharic)</option>
                        <option value="om">🇪🇹 Afaan Oromoo</option>
                    </select>
                </div>

                {/* Favorite Club Field */}
                <div className="space-y-2">
                    <label htmlFor="favClub" className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <MdSportsSoccer size={14} />
                        Favorite Club
                    </label>
                    <select
                        id="favClub"
                        value={favClubId}
                        onChange={(e) => setFavClubId(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-[#EAECED]/50 border-2 border-transparent focus:border-[#00A3E0]/30 focus:bg-white transition-all outline-none text-[#132A5B] font-bold shadow-sm appearance-none cursor-pointer"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23132A5B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5rem' }}
                    >
                        <option value="">⚽ Select your favorite club</option>
                        {clubs.map((club) => (
                            <option key={club.id} value={club.id}>
                                {club.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading || hasErrors || !isFormDirty}
                    className="w-full py-5 mt-6 rounded-2xl bg-gradient-to-r from-[#00A3E0] to-[#0082b3] text-white font-black text-sm uppercase tracking-[0.2em] shadow-[0_15px_30px_-5px_rgba(0,163,224,0.4)] hover:shadow-[0_20px_40px_-5px_rgba(0,163,224,0.5)] transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                        </>
                    ) : (
                        <>
                            <MdCheckCircle size={20} />
                            Save Changes
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
