import { apiSlice } from '../api/apiSlice';

export const userApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getProfile: builder.query({
            query: () => '/user/profile',
            providesTags: ['User'],
        }),
        updateProfile: builder.mutation({
            query: (data) => ({
                url: '/user/profile',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['User'],
        }),
        changePassword: builder.mutation({
            query: (data: { current_password: string; new_password: string }) => ({
                url: '/user/password',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['User'],
        }),
        uploadProfileImage: builder.mutation({
            query: (formData: FormData) => ({
                url: '/user/profile/image',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['User'],
        }),
    }),
    overrideExisting: true,
});

export const { 
    useGetProfileQuery, 
    useUpdateProfileMutation,
    useChangePasswordMutation,
    useUploadProfileImageMutation,
} = userApi;
