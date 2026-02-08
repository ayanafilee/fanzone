import { apiSlice } from '../api/apiSlice';

interface GetHighlightsParams {
    club_id?: string;
}

export const highlightsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getHighlights: builder.query({
            query: (params: GetHighlightsParams) => ({
                url: '/highlights',
                params,
            }),
            providesTags: ['Highlights'],
        }),
    }),
    overrideExisting: true,
});

export const { useGetHighlightsQuery } = highlightsApi;
