import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { API_CONFIG } from '../config'

const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_CONFIG.FULL_URL}api/auth/`,
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json')
      return headers
    },
  }),
  endpoints: (build) => ({
    login: build.mutation({
      query: (body) => ({
        url: 'login/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      }),
    }),
    signUp: build.mutation({
      query: (body) => ({
        url: 'signup/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      }),
    }),
    faceLogin: build.mutation({
      query: (body) => ({
        url: 'face_login/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

export default userApi
/*
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_CONFIG } from '../config'
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
