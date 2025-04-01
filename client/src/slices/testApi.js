import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import API_CONFIG from '../config'
import { getCsrfToken } from '../utils/cookies'

const testApi = createApi({
  reducerPath: 'testApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_CONFIG.PROXY_PREFIX}/`, //    '/api/'
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
  tagTypes: ['test'],
  endpoints: (build) => ({
    getTests: build.query({
      query: () => 'tests/',
      providesTags: ['test'],
    }),
    getTestById: build.query({
      query: (id) => {
        if (!id) {
          throw new Error('ID is required')
        }
        return `tests/${id}/`
      },
      transformErrorResponse: (response) => response.data,
    }),
    postTestResult: build.mutation({
      query: (body) => ({
        url: 'test_result/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      }),
    }),
  }),
})

export const { useGetTestsQuery, useGetTestByIdQuery } = testApi
export default testApi
