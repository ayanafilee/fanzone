'use client';

import { useState } from 'react';
import { validatePassword, validatePasswordMatch } from '@/lib/utils/validation';
import { MdLock, MdCheckCircle, MdVisibility, MdVisibilityOff } from 'react-icons/md';

interface PasswordChangeSectionProps {
    onChangePassword: (data: { current_password: string; new_password: string }) => Promise<void>;
    isLoading: boolean;
}

export default function PasswordChangeSection({ onChangePassword, isLoading }: PasswordChangeSectionProps) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<{
        currentPassword?: string;
        newPassword?: string;
        confirmPassword?: string;
    }>({});

    const handleCurrentPasswordBlur = () => {
        if (!currentPassword) {
            setErrors(prev => ({ ...prev, currentPassword: 'Current password is required' }));
        }
    };

    const handleNewPasswordBlur = () => {
        const result = validatePassword(newPassword);
        setErrors(prev => ({ ...prev, newPassword: result.error }));
    };

    const handleConfirmPasswordBlur = () => {
        const result = validatePasswordMatch(newPassword, confirmPassword);
        setErrors(prev => ({ ...prev, confirmPassword: result.error }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const currentPasswordValidation = currentPassword ? { isValid: true } : { isValid: false, error: 'Current password is required' };
        const newPasswordValidation = validatePassword(newPassword);
        const confirmPasswordValidation = validatePasswordMatch(newPassword, confirmPassword);

        if (!currentPasswordValidation.isValid || !newPasswordValidation.isValid || !confirmPasswordValidation.isValid) {
            setErrors({
                currentPassword: currentPasswordValidation.error,
                newPassword: newPasswordValidation.error,
                confirmPassword: confirmPasswordValidation.error,
            });
            return;
        }

        await onChangePassword({
            current_password: currentPassword,
            new_password: newPassword,
        });

        // Clear form on success
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});
    };

    const hasErrors = errors.currentPassword || errors.newPassword || errors.confirmPassword;
    const isFormComplete = currentPassword && newPassword && confirmPassword;

    return (
        <div className="bg-white rounded-[2rem] shadow-lg border border-gray-100 p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            {/* Decorative Background Element */}
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#132A5B] opacity-5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>

            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-[#132A5B] to-[#0f1f42] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/30">
                    <MdLock size={24} className="text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-[#132A5B] tracking-tight">Change Password</h2>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Secure your account</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Current Password Field */}
                <div className="space-y-2">
                    <label htmlFor="currentPassword" className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <MdLock size={14} />
                        Current Password
                    </label>
                    <div className="relative">
                        <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => {
                                setCurrentPassword(e.target.value);
                                if (errors.currentPassword) setErrors(prev => ({ ...prev, currentPassword: undefined }));
                            }}
                            onBlur={handleCurrentPasswordBlur}
                            placeholder="••••••••••••"
                            className="w-full px-6 py-4 pr-12 rounded-2xl bg-[#EAECED]/50 border-2 border-transparent focus:border-[#00A3E0]/30 focus:bg-white transition-all outline-none text-[#132A5B] font-bold shadow-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#00A3E0] transition-colors"
                        >
                            {showCurrentPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                        </button>
                    </div>
                    {errors.currentPassword && (
                        <p className="text-red-500 text-xs font-medium ml-1 flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {errors.currentPassword}
                        </p>
                    )}
                </div>

                {/* New Password Field */}
                <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <MdLock size={14} />
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showNewPassword ? 'text' : 'password'}
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => {
                                setNewPassword(e.target.value);
                                if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: undefined }));
                            }}
                            onBlur={handleNewPasswordBlur}
                            placeholder="••••••••••••"
                            className="w-full px-6 py-4 pr-12 rounded-2xl bg-[#EAECED]/50 border-2 border-transparent focus:border-[#00A3E0]/30 focus:bg-white transition-all outline-none text-[#132A5B] font-bold shadow-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#00A3E0] transition-colors"
                        >
                            {showNewPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                        </button>
                    </div>
                    {errors.newPassword && (
                        <p className="text-red-500 text-xs font-medium ml-1 flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {errors.newPassword}
                        </p>
                    )}
                    <p className="text-xs text-gray-400 ml-1">Minimum 6 characters required</p>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <MdLock size={14} />
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                            }}
                            onBlur={handleConfirmPasswordBlur}
                            placeholder="••••••••••••"
                            className="w-full px-6 py-4 pr-12 rounded-2xl bg-[#EAECED]/50 border-2 border-transparent focus:border-[#00A3E0]/30 focus:bg-white transition-all outline-none text-[#132A5B] font-bold shadow-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#00A3E0] transition-colors"
                        >
                            {showConfirmPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-red-500 text-xs font-medium ml-1 flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {errors.confirmPassword}
                        </p>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading || !!hasErrors || !isFormComplete}
                    className="w-full py-5 mt-6 rounded-2xl bg-gradient-to-r from-[#132A5B] to-[#0f1f42] text-white font-black text-sm uppercase tracking-[0.2em] shadow-[0_15px_30px_-5px_rgba(19,42,91,0.4)] hover:shadow-[0_20px_40px_-5px_rgba(19,42,91,0.5)] transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Changing Password...
                        </>
                    ) : (
                        <>
                            <MdCheckCircle size={20} />
                            Update Password
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
