import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import API_CONFIG from '../config'
import { getCsrfToken } from '../utils/cookies'

const gameApi = createApi({
  reducerPath: 'gameApi',
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
  tagTypes: ['game'],
  endpoints: (build) => ({
    getGame: build.query({
      query: () => 'game/',
      providesTags: ['game'],
    }),
    getGameQuiz: build.query({
      query: () => 'game/quiz/',
    }),
    getGameSwiper: build.query({
      query: () => 'game/swiper/',
    }),
    postSwiperResult: build.mutation({
      query: (body) => ({
        url: 'game/swiper_result/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['game'],
    }),
  }),
})

export const {
  useGetGameQuery,
  useGetGameSwiperQuery,
  useGetGameQuizQuery,
  usePostSwiperResultMutation,
} = gameApi
export default gameApi
