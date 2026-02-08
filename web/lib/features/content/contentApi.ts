import { apiSlice } from '../api/apiSlice';
import { Content } from '../admin/adminApi';

interface GetContentParams {
    club_id?: string;
    category?: string;
}

export const contentApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getContent: builder.query<Content[], GetContentParams>({
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
