import { apiSlice } from '../api/apiSlice';

export interface Club {
    id: string;
    name: string;
    logo_url: string;
    league_id: string;
}

export const clubsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getClubs: builder.query<Club[], void>({
            query: () => '/clubs',
            providesTags: (result) =>
                result
                    ? [...result.map(({ id }) => ({ type: 'Clubs' as const, id })), { type: 'Clubs', id: 'LIST' }]
                    : [{ type: 'Clubs', id: 'LIST' }],
        }),
        getClubById: builder.query<Club, string>({
            query: (id) => `/clubs/${id}`,
            providesTags: (result, error, id) => [{ type: 'Clubs', id }],
        }),
        addClub: builder.mutation<Club, Omit<Club, 'id'>>({
            query: (newClub) => ({
                url: '/admin/clubs',
                method: 'POST',
                body: newClub,
            }),
            invalidatesTags: [{ type: 'Clubs', id: 'LIST' }],
        }),
        updateClub: builder.mutation<void, Partial<Club> & { id: string }>({
            query: ({ id, ...patch }) => ({
                url: `/admin/clubs/${id}`,
                method: 'PUT',
                body: patch,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Clubs', id },
                { type: 'Clubs', id: 'LIST' }
            ],
        }),
        deleteClub: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/admin/clubs/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Clubs', id },
                { type: 'Clubs', id: 'LIST' }
            ],
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetClubsQuery,
    useGetClubByIdQuery,
    useAddClubMutation,
    useUpdateClubMutation,
    useDeleteClubMutation,
} = clubsApi;
