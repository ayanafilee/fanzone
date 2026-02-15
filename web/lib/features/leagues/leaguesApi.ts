import { apiSlice } from '../api/apiSlice';

export interface League {
    id: string;
    name: string;
    logo_url: string;
    country: string;
}

export const leaguesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getLeagues: builder.query<League[], void>({
            query: () => '/leagues',
            providesTags: (result) =>
                result
                    ? [...result.map(({ id }) => ({ type: 'Leagues' as const, id })), { type: 'Leagues', id: 'LIST' }]
                    : [{ type: 'Leagues', id: 'LIST' }],
        }),
        getLeagueById: builder.query<League, string>({
            query: (id) => `/leagues/${id}`,
            providesTags: (result, error, id) => [{ type: 'Leagues', id }],
        }),
        addLeague: builder.mutation<League, Omit<League, 'id'>>({
            query: (newLeague) => ({
                url: '/admin/leagues',
                method: 'POST',
                body: newLeague,
            }),
            invalidatesTags: [{ type: 'Leagues', id: 'LIST' }],
        }),
        updateLeague: builder.mutation<void, Partial<League> & { id: string }>({
            query: ({ id, ...patch }) => ({
                url: `/admin/leagues/${id}`,
                method: 'PUT',
                body: patch,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Leagues', id },
                { type: 'Leagues', id: 'LIST' }
            ],
        }),
        deleteLeague: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/admin/leagues/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Leagues', id },
                { type: 'Leagues', id: 'LIST' }
            ],
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetLeaguesQuery,
    useGetLeagueByIdQuery,
    useAddLeagueMutation,
    useUpdateLeagueMutation,
    useDeleteLeagueMutation,
} = leaguesApi;
