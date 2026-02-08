import { apiSlice } from '../api/apiSlice';

export const watchLinksApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getWatchLinks: builder.query({
            query: () => '/watch-links',
            providesTags: ['WatchLinks'],
        }),
    }),
    overrideExisting: true,
});

export const { useGetWatchLinksQuery } = watchLinksApi;
