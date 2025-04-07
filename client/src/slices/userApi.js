import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import API_CONFIG from '../config'
import { getCsrfToken } from '../utils/cookies'

const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_CONFIG.PROXY_PREFIX}/`, // Теперь будет /api/auth/
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
  endpoints: (build) => ({
    login: build.mutation({
      query: (body) => ({
        url: 'auth/login/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      }),
    }),
    signUp: build.mutation({
      query: (body) => ({
        url: 'auth/signup/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      }),
    }),
    faceLogin: build.mutation({
      query: (body) => ({
        url: 'auth/face_login/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
    }),
    patchProfile: build.mutation({
      query: (body) => ({
        url: 'users/profile/',
        method: 'PATCH',
        body,
      }),
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
/*
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import  API_CONFIG  from '../config'
import { getCookie } from '../utils/cookies'

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.AUTH_API,
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json')
      const csrfToken = getCookie('csrftoken')
      if (csrfToken) {
        headers.set('X-CSRFToken', csrfToken)
      }
      return headers
    },
  }),
  endpoints: (build) => ({
    login: build.mutation({
      query: (body) => ({
        url: 'login/',
        method: 'POST',
        body,
      }),
    }),
    signUp: build.mutation({
      query: (body) => ({
        url: 'signup/',
        method: 'POST',
        body,
      }),
    }),
    faceLogin: build.mutation({
      query: (body) => ({
        url: 'face_login/',
        method: 'POST',
        body,
      }),
    }),
    logout: build.mutation({
      query: () => ({
        url: 'logout/',
        method: 'POST',
      }),
    }),
  }),
})

export const {
  useSignUpMutation,
  useLoginMutation,
  useFaceLoginMutation,
  useLogoutMutation,
} = userApi
*/
