import { apiSlice } from '../api/apiSlice';

interface MultilingualText {
    en: string;
    am: string;
    om: string;
}

interface CreateContentRequest {
    title: MultilingualText;
    description: MultilingualText;
    club_id?: string | 'ALL'; // "ALL" means no specific club
    // Add other content fields as necessary, assuming a generic structure for now
    type: string;
    url?: string;
}

interface AdminStats {
    admins: number;
    content: number;
    highlights: number;
    users: number;
    watch_links: number;
}

export const adminApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createClub: builder.mutation({
            query: (data) => ({
                url: '/admin/clubs',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Clubs'],
        }),
        createContent: builder.mutation({
            query: (data: CreateContentRequest) => {
                // Validation logic can also be done here or in the component.
                // RTK Query doesn't stop the request here unless we throw, but types enforce structure.
                // We will rely on TypeScript to enforce the shape of `data` which includes all 3 languages.

                return {
                    url: '/admin/content',
                    method: 'POST',
                    body: data,
                };
            },
            invalidatesTags: ['Content'],
        }),
        deleteContent: builder.mutation({
            query: (id: string) => ({
                url: `/admin/content/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Content'],
        }),
        createHighlight: builder.mutation({
            query: (data) => ({
                url: '/admin/highlights',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Highlights'],
        }),
        createWatchLink: builder.mutation({
            query: (data) => ({
                url: '/admin/watch-links',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['WatchLinks'],
        }),
        getStats: builder.query<AdminStats, void>({
            query: () => '/admin/stats',
        }),
    }),
    overrideExisting: true,
});

export const {
    useCreateClubMutation,
    useCreateContentMutation,
    useDeleteContentMutation,
    useCreateHighlightMutation,
    useCreateWatchLinkMutation,
    useGetStatsQuery,
} = adminApi;
