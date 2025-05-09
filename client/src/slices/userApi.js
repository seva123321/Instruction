/* eslint-disable arrow-body-style */
/* eslint-disable no-param-reassign */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import API_CONFIG from '../config'
import { getCsrfToken } from '../utils/cookies'
import encryptWithAESGCM from '../service/cryptoAes'

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
      query: (body) => {
        return {
          url: 'auth/signup/',
          method: 'POST',
          body: {
            ...body.userData,
            face_descriptor: encryptWithAESGCM(
              body.userData.face_descriptor,
              body.aesKey.key
            ),
            key_id: body.aesKey.key_id,
          },
        }
      },
    }),
    faceLogin: build.mutation({
      query: (body) => ({
        url: 'auth/face_login/',
        method: 'POST',
        body: {
          face_descriptor: encryptWithAESGCM(
            body.face_descriptor,
            body.aesKey.key
          ),
          key_id: body.aesKey.key_id,
        },
        fetchFn: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
      }),
    }),

    logout: build.mutation({
      query: () => ({
        url: 'auth/logout/',
        method: 'POST',
      }),
    }),
    getAesKey: build.query({
      query: () => 'generate_key/',
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
    getRating: build.query({
      query: () => 'rating/',
    }),
  }),
})

export const {
  useSignUpMutation,
  useLoginMutation,
  useFaceLoginMutation,
  useLogoutMutation,
  useGetAesKeyQuery,
  useGetProfileQuery,
  usePatchProfileMutation,
  useGetRatingQuery,
} = userApi

export default userApi
