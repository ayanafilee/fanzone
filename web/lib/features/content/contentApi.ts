import { apiSlice } from '../api/apiSlice';

interface GetContentParams {
    club_id?: string;
    category?: string;
}

export const contentApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getContent: builder.query({
            query: (params: GetContentParams) => ({
                url: '/content',
                params,
            }),
            providesTags: ['Content'],
        }),
    }),
    overrideExisting: true,
});

export const { useGetContentQuery } = contentApi;
