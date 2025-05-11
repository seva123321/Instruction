import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import API_CONFIG from '../config'
import { getCsrfToken } from '../utils/cookies'

const knowladgeApi = createApi({
  reducerPath: 'knowladgeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_CONFIG.PROXY_PREFIX}/knowladge/`,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const csrfToken = getCsrfToken()

      if (csrfToken) {
        headers.set('X-CSRFToken', csrfToken)
      }

      headers.set('Content-Type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['KnowladgeNLAs', 'KnowladgeVideos'],
  endpoints: (build) => ({
    getKnowladgeNLAs: build.query({
      query: () => ({
        url: 'nlas/',
        method: 'GET',
      }),
      providesTags: ['KnowladgeNLAs'],
      // Добавляем трансформацию ответа при необходимости
      transformResponse: (response) => response?.results || response,
    }),
    getKnowladgeVideos: build.query({
      query: () => ({
        url: 'videos/',
        method: 'GET',
      }),
      providesTags: ['KnowladgeVideos'],
      transformResponse: (response) => response?.results || response,
    }),
    // Добавляем мутации для создания/обновления/удаления при необходимости
    createKnowladgeVideo: build.mutation({
      query: (videoData) => ({
        url: 'videos/',
        method: 'POST',
        body: videoData,
      }),
      invalidatesTags: ['KnowladgeVideos'],
    }),
  }),
})

export const {
  useGetKnowladgeNLAsQuery,
  useGetKnowladgeVideosQuery,
  useCreateKnowladgeVideoMutation,
} = knowladgeApi

export default knowladgeApi
