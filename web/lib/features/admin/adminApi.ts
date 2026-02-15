import { apiSlice } from '../api/apiSlice';

interface MultilingualText {
    en: string;
    am: string;
    om: string;
}

interface CreateContentRequest {
    title: MultilingualText;
    body: MultilingualText;
    image_url: string;
    category: string;
    club_id: string;
}

export interface Content {
    id: string;
    title: MultilingualText;
    body: MultilingualText;
    image_url: string;
    category: string;
    club_id: string;
    created_at: string;
}

interface AdminStats {
    admins: number;
    content: number;
    highlights: number;
    users: number;
    leagues: number;
    clubs: number;
    watch_links: number;
}

export interface Highlight {
    id: string;
    match_title: string;
    youtube_url: string;
    club_ids: string[];
}

export interface WatchLink {
    id: string;
    name: string;
    url: string;
    type: string;
    logo_url: string;
}

export interface UserInfo {
    id: string;
    name: string;
    email: string;
    role: string;
    language?: string;
    fav_club_id?: string;
    created_at: string;
    profileImage?: string; // Kept for potential future use or if present in other responses
    is_active?: boolean;
}

export interface AdminAnalytics {
    user_growth: { month: string; count: number }[];
    club_popularity: { club_name: string; fan_count: number }[];
    languages: {
        en: number;
        am: number;
        om: number;
    };
}

export interface AdminActivity {
    id: string;
    user_id: string;
    user_name: string;
    action: string;
    entity: string;
    detail: string;
    timestamp: string;
}

export const adminApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createContent: builder.mutation({
            query: (data: CreateContentRequest) => ({
                url: '/admin/content',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Content'],
        }),
        updateContent: builder.mutation({
            query: ({ id, ...data }: Partial<Content> & { id: string }) => ({
                url: `/admin/content/${id}`,
                method: 'PUT',
                body: data,
            }),
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
            query: (data: Omit<Highlight, 'id'>) => ({
                url: '/admin/highlights',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Highlights'],
        }),
        updateHighlight: builder.mutation({
            query: ({ id, ...data }: Partial<Highlight> & { id: string }) => ({
                url: `/admin/highlights/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Highlights'],
        }),
        deleteHighlight: builder.mutation({
            query: (id: string) => ({
                url: `/admin/highlights/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Highlights'],
        }),
        createWatchLink: builder.mutation({
            query: (data: Omit<WatchLink, 'id'>) => ({
                url: '/admin/watch-links',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['WatchLinks'],
        }),
        updateWatchLink: builder.mutation({
            query: ({ id, ...data }: Partial<WatchLink> & { id: string }) => ({
                url: `/admin/watch-links/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['WatchLinks'],
        }),
        deleteWatchLink: builder.mutation({
            query: (id: string) => ({
                url: `/admin/watch-links/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['WatchLinks'],
        }),
        getStats: builder.query<AdminStats, void>({
            query: () => '/admin/stats',
        }),
        getAllUsers: builder.query<UserInfo[], void>({
            query: () => '/admin/users',
            providesTags: ['User'],
        }),
        getAllAdmins: builder.query<UserInfo[], void>({
            query: () => '/super-admin/admins',
            providesTags: ['User'],
        }),
        getAnalytics: builder.query<AdminAnalytics, void>({
            query: () => '/admin/analytics',
            providesTags: ['Analytics'],
        }),
        getActivities: builder.query<AdminActivity[], void>({
            query: () => '/admin/activities',
            providesTags: ['Activities'],
        }),
    }),
    overrideExisting: true,
});

export const {
    useCreateContentMutation,
    useUpdateContentMutation,
    useDeleteContentMutation,
    useCreateHighlightMutation,
    useUpdateHighlightMutation,
    useDeleteHighlightMutation,
    useCreateWatchLinkMutation,
    useUpdateWatchLinkMutation,
    useDeleteWatchLinkMutation,
    useGetStatsQuery,
    useGetAnalyticsQuery,
    useGetActivitiesQuery,
    useGetAllUsersQuery,
    useGetAllAdminsQuery,
} = adminApi;
