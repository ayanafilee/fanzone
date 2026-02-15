import { apiSlice } from '../api/apiSlice';
import { setCredentials, logOut } from './authSlice';

export const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // Map access_token to token and refresh_token to refreshToken
                    dispatch(setCredentials({
                        token: data.access_token,
                        refreshToken: data.refresh_token,
                        user: data.user
                    }));
                } catch (err) {
                    console.log("Login mutation error:", err);
                }
            },
        }),
        register: builder.mutation({
            query: (userData) => ({
                url: '/auth/register',
                method: 'POST',
                body: userData,
            }),
        }),
        logout: builder.mutation({
            query: (token) => ({
                url: '/auth/logout',
                method: 'POST',
                body: { refresh_token: token }
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                dispatch(logOut());
                try {
                    await queryFulfilled
                } catch (err) {
                    console.error(err)
                }
            }
        })
    }),
    overrideExisting: true,
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation } = authApi;
