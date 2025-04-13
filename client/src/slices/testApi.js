import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import API_CONFIG from '../config'
import { getCsrfToken } from '../utils/cookies'

const testApi = createApi({
  reducerPath: 'testApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_CONFIG.PROXY_PREFIX}/`,
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
        url: 'test_results/',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useGetTestsQuery,
  useGetTestByIdQuery,
  useLazyGetTestByIdQuery,
  useLazyGetTestsQuery,
  usePostTestResultMutation,
} = testApi
export default testApi
