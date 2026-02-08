import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null, // Initialize from localStorage in a real app or use a persistence library
    token: null,
    refreshToken: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ user?: User; token: string; refreshToken: string }>
        ) => {
            const { user, token, refreshToken } = action.payload;
            state.user = user || state.user;
            state.token = token;
            state.refreshToken = refreshToken;
            state.isAuthenticated = true;
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
            }
        },
        logOut: (state) => {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        },
        loadUserFromStorage: (state) => {
            const token = localStorage.getItem('token');
            const refreshToken = localStorage.getItem('refreshToken');
            const user = localStorage.getItem('user');

            if (token && refreshToken) {
                state.token = token;
                state.refreshToken = refreshToken;
                state.isAuthenticated = true;
                if (user) {
                    try {
                        state.user = JSON.parse(user);
                    } catch (e) {
                        console.error("Failed to parse user from storage", e);
                    }
                }
            }
        }
    },
});

export const { setCredentials, logOut, loadUserFromStorage } = authSlice.actions;

export default authSlice.reducer;
