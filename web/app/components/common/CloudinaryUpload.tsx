'use client';

import React, { useState } from 'react';
import { MdCloudUpload, MdClose } from 'react-icons/md';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface CloudinaryUploadProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
}

export const CloudinaryUpload: React.FC<CloudinaryUploadProps> = ({ value, onChange, label = "Featured Image" }) => {
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            toast.error('Cloudinary configuration is missing in environment variables');
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
                // Ensure we store the FULL secure_url as requested
                onChange(data.secure_url);
                toast.success('Image uploaded and full URL stored');
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

    return (
        <div className="space-y-4 w-full">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            <div className="flex flex-col md:flex-row gap-6">
                <div className="relative flex-1 group">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="cloudinary-upload-input"
                        disabled={isUploading}
                        onChange={handleUpload}
                    />
                    <label
                        htmlFor="cloudinary-upload-input"
                        className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-[2rem] transition-all cursor-pointer group 
                            ${isUploading ? 'border-gray-300 bg-gray-100' : 'border-gray-100 hover:border-[#00A3E0]/40 hover:bg-blue-50/30'}`}
                    >
                        {isUploading ? (
                            <div className="flex flex-col items-center gap-2">
                                <svg className="animate-spin h-8 w-8 text-[#00A3E0]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-sm font-black text-[#132A5B]">Uploading to Cloudinary...</span>
                            </div>
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-[#00A3E0] group-hover:scale-110 transition-all mb-3 text-2xl">
                                    <MdCloudUpload />
                                </div>
                                <span className="text-sm font-black text-[#132A5B]">Upload New Asset</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Full Secure URL will be saved</span>
                            </>
                        )}
                    </label>
                </div>

                {value && (
                    <div className="w-full md:w-64 h-40 rounded-[2rem] border-4 border-white shadow-xl overflow-hidden bg-gray-100 relative group">
                        <Image src={value} alt="Current Asset" fill className="object-cover" />
                        <button
                            type="button"
                            onClick={() => onChange('')}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110 transition-all"
                        >
                            <MdClose size={18} />
                        </button>
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[8px] text-white font-mono truncate">{value}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
