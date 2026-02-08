import { apiSlice } from '../api/apiSlice';

export const clubsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getClubs: builder.query({
            query: () => '/clubs',
            providesTags: ['Clubs'],
        }),
    }),
    overrideExisting: true,
});

export const { useGetClubsQuery } = clubsApi;
