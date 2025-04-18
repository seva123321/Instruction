import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import API_CONFIG from '../config'
import { getCsrfToken } from '../utils/cookies'

const instructionApi = createApi({
  reducerPath: 'instructionApi',
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
  tagTypes: ['Instruction'],
  endpoints: (build) => ({
    getInstructions: build.query({
      query: () => 'instructions/',
      providesTags: ['Instruction'],
    }),

    getInstructionById: build.query({
      query: (id) => {
        if (!id) {
          throw new Error('ID is required')
        }
        return `instructions/${id}/`
      },
      transformErrorResponse: (response) => response.data,
    }),
    getResultInstructions: build.query({
      query: () => 'instruction_results/',
    }),
    postInstructionResults: build.mutation({
      query: (body) => ({
        url: 'instruction_results/',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useGetInstructionsQuery,
  useGetInstructionByIdQuery,
  useGetResultInstructionsQuery,
  usePostInstructionResultsMutation,
} = instructionApi

export default instructionApi
