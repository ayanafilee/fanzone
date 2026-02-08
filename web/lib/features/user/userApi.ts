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
    }),
    overrideExisting: true,
});

export const { useGetProfileQuery, useUpdateProfileMutation } = userApi;
