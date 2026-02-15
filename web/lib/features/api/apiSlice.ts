import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';
import { RootState } from '../../store';
import { setCredentials, logOut } from '../auth/authSlice';

// Create a new mutex
const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token || localStorage.getItem('token');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // wait until the mutex is available without locking it
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // checking whether the mutex is locked
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshToken = (api.getState() as RootState).auth.refreshToken || localStorage.getItem('refreshToken');

        if (refreshToken) {
          const refreshResult = await baseQuery(
            {
              url: '/auth/refresh',
              method: 'POST',
              body: { refresh_token: refreshToken },
            },
            api,
            extraOptions
          );

          if (refreshResult.data) {
            const { access_token } = refreshResult.data as { access_token: string };
            // store the new token
            api.dispatch(setCredentials({
              token: access_token,
              // Keep existing user/refresh token if not returned
              refreshToken: refreshToken,
              user: (api.getState() as RootState).auth.user || undefined
            }));

            // retry the initial query
            result = await baseQuery(args, api, extraOptions);
          } else {
            api.dispatch(logOut());
          }
        } else {
          api.dispatch(logOut());
        }
      } finally {
        // release must be called once the mutex should be released again.
        release();
      }
    } else {
      // wait until the mutex is available without locking it
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
  tagTypes: ['User', 'Clubs', 'Leagues', 'Content', 'Highlights', 'WatchLinks', 'Analytics', 'Activities'],
});
