export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export const validateName = (name: string): ValidationResult => {
    if (!name || name.trim().length === 0) {
        return { isValid: false, error: 'Name is required' };
    }
    if (name.length > 100) {
        return { isValid: false, error: 'Name must not exceed 100 characters' };
    }
    return { isValid: true };
};

export const validateEmail = (email: string): ValidationResult => {
    if (!email || email.trim().length === 0) {
        return { isValid: false, error: 'Email is required' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'Please enter a valid email address' };
    }
    return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
    if (!password || password.length === 0) {
        return { isValid: false, error: 'Password is required' };
    }
    if (password.length < 6) {
        return { isValid: false, error: 'Password must be at least 6 characters' };
    }
    return { isValid: true };
};

export const validatePasswordMatch = (password: string, confirm: string): ValidationResult => {
    if (password !== confirm) {
        return { isValid: false, error: 'Passwords must match' };
    }
    return { isValid: true };
};

export const validateImageFile = (file: File): ValidationResult => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
        return { isValid: false, error: 'Image must be less than 5MB' };
    }
    if (!validTypes.includes(file.type)) {
        return { isValid: false, error: 'Image must be JPEG, PNG, GIF, or WebP' };
    }
    return { isValid: true };
};
