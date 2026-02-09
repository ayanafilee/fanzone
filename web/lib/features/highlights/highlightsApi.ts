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
        getSpecificHighlight: builder.query({
            query: (id: string) => `/highlights/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Highlights', id }],
        }),
    }),
    overrideExisting: true,
});

export const { useGetHighlightsQuery, useGetSpecificHighlightQuery } = highlightsApi;
