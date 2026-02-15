'use client';

import { useState } from 'react';
import { MdImage, MdCloudUpload, MdCheckCircle } from 'react-icons/md';
import { toast } from 'react-hot-toast';

interface ProfileImageSectionProps {
    currentImageUrl?: string;
    onUpdateUrl: (url: string) => Promise<void>;
    isLoading: boolean;
}

export default function ProfileImageSection({ currentImageUrl, onUpdateUrl, isLoading }: ProfileImageSectionProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

    const handleCloudinaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            toast.error('Cloudinary configuration is missing');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (res.ok && data.secure_url) {
                // Store the Cloudinary URL temporarily
                setUploadedImageUrl(data.secure_url);
                toast.success('Image uploaded to Cloudinary! Click "Update Profile" to save.');
            } else {
                toast.error(data.error?.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            toast.error('Network error during upload');
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!uploadedImageUrl) return;
        await onUpdateUrl(uploadedImageUrl);
        setUploadedImageUrl(''); // Clear after successful update
    };

    // Show uploaded image if exists, otherwise show current profile image
    const displayImageUrl = uploadedImageUrl || currentImageUrl;
    // Only show "NEW" badge if there's a newly uploaded image that's different from current
    const hasNewImage = !!uploadedImageUrl && uploadedImageUrl !== currentImageUrl;

    return (
        <div className="bg-white rounded-[2rem] shadow-lg border border-gray-100 p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            {/* Decorative Background Element */}
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-gradient-to-br from-[#00A3E0] to-[#0082b3] opacity-5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>

            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00A3E0] to-[#0082b3] rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <MdImage size={24} className="text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-[#132A5B] tracking-tight">Profile Picture</h2>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Upload your photo</p>
                </div>
            </div>

            {/* Image Preview */}
            <div className="flex flex-col items-center space-y-6 mb-6">
                <div className="relative w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-xl border-4 border-white group-hover:scale-105 transition-transform duration-300">
                    {displayImageUrl ? (
                        <>
                            <img
                                src={displayImageUrl}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                            {hasNewImage && (
                                <div className="absolute inset-0 bg-[#00A3E0]/10 flex items-center justify-center">
                                    <div className="bg-[#00A3E0] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                                        New
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center">
                            <MdImage size={48} className="text-gray-400 mb-2" />
                            <span className="text-xs text-gray-400 font-bold">No Image</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Cloudinary Upload Area */}
            <div className="relative border-2 border-dashed rounded-2xl p-8 text-center transition-all border-gray-300 hover:border-[#00A3E0]/50 hover:bg-gray-50">
                <input
                    type="file"
                    id="profileImageUpload"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleCloudinaryUpload}
                    disabled={isUploading || isLoading}
                    className="hidden"
                />
                <label htmlFor="profileImageUpload" className="cursor-pointer">
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-3">
                            <svg className="animate-spin h-12 w-12 text-[#00A3E0]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-sm font-black text-[#132A5B]">Uploading to Cloudinary...</span>
                            <span className="text-xs text-gray-400">Please wait</span>
                        </div>
                    ) : (
                        <>
                            <MdCloudUpload size={48} className="mx-auto mb-4 text-[#00A3E0]" />
                            <p className="text-sm font-bold text-[#132A5B] mb-2">
                                Drop your image here or <span className="text-[#00A3E0]">browse</span>
                            </p>
                            <p className="text-xs text-gray-400 mb-1">Max 5MB • JPEG, PNG, GIF, or WebP</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
                                Step 1: Upload to Cloudinary
                            </p>
                        </>
                    )}
                </label>
            </div>

            {/* Update Profile Button */}
            {hasNewImage && (
                <button
                    onClick={handleUpdateProfile}
                    disabled={isLoading}
                    className="w-full py-5 mt-6 rounded-2xl bg-gradient-to-r from-[#00A3E0] to-[#0082b3] text-white font-black text-sm uppercase tracking-[0.2em] shadow-[0_15px_30px_-5px_rgba(0,163,224,0.4)] hover:shadow-[0_20px_40px_-5px_rgba(0,163,224,0.5)] transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating Profile...
                        </>
                    ) : (
                        <>
                            <MdCheckCircle size={20} />
                            Update Profile Picture
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
