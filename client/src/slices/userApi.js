/* eslint-disable no-param-reassign */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import API_CONFIG from '../config'
import { getCsrfToken } from '../utils/cookies'

const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_CONFIG.PROXY_PREFIX}/`,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const csrfToken = getCsrfToken()
      headers.set('Content-Type', 'application/json')
      if (csrfToken) {
        headers.set('X-CSRFToken', csrfToken)
      }
      return headers
    },
  }),
  tagTypes: ['Profile'],
  endpoints: (build) => ({
    login: build.mutation({
      query: (body) => ({
        url: 'auth/login/',
        method: 'POST',
        body,
      }),
    }),
    signUp: build.mutation({
      query: (body) => ({
        url: 'auth/signup/',
        method: 'POST',
        body,
      }),
    }),
    faceLogin: build.mutation({
      query: (body) => ({
        url: 'auth/face_login/',
        method: 'POST',
        body,
      }),
    }),
    logout: build.mutation({
      query: () => ({
        url: 'auth/logout/',
        method: 'POST',
      }),
    }),
    getProfile: build.query({
      query: () => 'users/profile/',
      providesTags: ['Profile'],
    }),
    patchProfile: build.mutation({
      query: (body) => ({
        url: 'users/profile/',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Profile'],
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            userApi.util.updateQueryData('getProfile', undefined, (draft) => {
              Object.assign(draft, data)
            })
          )
        } catch (error) {
          throw new Error('Error updating cache:', error)
        }
      },
    }),
  }),
})

export const {
  useSignUpMutation,
  useLoginMutation,
  useFaceLoginMutation,
  useLogoutMutation,
  useGetProfileQuery,
  usePatchProfileMutation,
} = userApi

export default userApi
