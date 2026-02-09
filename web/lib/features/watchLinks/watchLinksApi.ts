import { apiSlice } from '../api/apiSlice';

export const watchLinksApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getWatchLinks: builder.query({
            query: () => '/watch-links',
            providesTags: ['WatchLinks'],
        }),
        getSpecificWatchLink: builder.query({
            query: (id: string) => `/watch-links/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'WatchLinks', id }],
        }),
    }),
    overrideExisting: true,
});

export const { useGetWatchLinksQuery, useGetSpecificWatchLinkQuery } = watchLinksApi;
