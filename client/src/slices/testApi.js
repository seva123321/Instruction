// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
// import API_CONFIG from '../config'
// import { getCsrfToken } from '../utils/cookies'
// import { getTestFromDB } from '@/service/offlineDB'

// // Создаем кастомный baseQuery с обработкой оффлайн-режима
// const baseQueryWithOfflineSupport = async (args, api, extraOptions) => {
//   const isOnline = navigator.onLine
//   const baseQuery = fetchBaseQuery({
//     baseUrl: `${API_CONFIG.PROXY_PREFIX}/`,
//     credentials: 'include',
//     prepareHeaders: (headers) => {
//       const csrfToken = getCsrfToken()
//       headers.set('Content-Type', 'application/json')
//       if (csrfToken) {
//         headers.set('X-CSRFToken', csrfToken)
//       }
//       return headers
//     },
//   })

//   // Если онлайн - выполняем обычный запрос
//   if (isOnline) {
//     return baseQuery(args, api, extraOptions)
//   }

//   // Если оффлайн и это запрос теста по ID
//   if (
//     typeof args === 'string' &&
//     args.startsWith('tests/') &&
//     args.endsWith('/')
//   ) {
//     const testId = args.split('/')[1]
//     try {
//       const test = await getTestFromDB(testId)
//       if (test) {
//         return { data: test }
//       }
//       return {
//         error: {
//           status: 'OFFLINE',
//           data: { message: 'Test not available offline' },
//         },
//       }
//     } catch (error) {
//       return {
//         error: {
//           status: 'OFFLINE_ERROR',
//           data: { message: error.message },
//         },
//       }
//     }
//   }

//   // Для других запросов в оффлайн-режиме
//   return {
//     error: {
//       status: 'OFFLINE',
//       data: { message: 'Operation not available offline' },
//     },
//   }
// }

// const testApi = createApi({
//   reducerPath: 'testApi',
//   baseQuery: baseQueryWithOfflineSupport,
//   tagTypes: ['test'],
//   endpoints: (build) => ({
//     getTests: build.query({
//       query: () => 'tests/',
//       providesTags: ['test'],
//     }),
//     getTestById: build.query({
//       query: (id) => {
//         if (!id) {
//           throw new Error('ID is required')
//         }
//         return `tests/${id}/`
//       },
//       transformErrorResponse: (response) => response.data,
//     }),
//     postTestResult: build.mutation({
//       query: (body) => ({
//         url: 'test_result/',
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body,
//       }),
//       // Добавляем обработку оффлайн-режима для сохранения результатов
//       async onQueryStarted(args, { dispatch, queryFulfilled, getState }) {
//         if (!navigator.onLine) {
//           try {
//             // Здесь можно добавить логику сохранения в IndexedDB для последующей синхронизации
//             console.log('Result saved for offline sync', args)
//           } catch (error) {
//             console.error('Failed to save offline result', error)
//           }
//         }
//       },
//     }),
//   }),
// })

// export const {
//   useGetTestsQuery,
//   useGetTestByIdQuery,
//   useLazyGetTestByIdQuery,
//   usePostTestResultMutation,
// } = testApi
// export default testApi

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import API_CONFIG from '../config'
import { getCsrfToken } from '../utils/cookies'

const testApi = createApi({
  reducerPath: 'testApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_CONFIG.PROXY_PREFIX}/`,
    credentials: 'include', // важно для отправки кук
    prepareHeaders: (headers) => {
      const csrfToken = getCsrfToken()
      // Устанавливаем CSRF-токен, если он есть
      if (csrfToken) {
        headers.set('X-CSRFToken', csrfToken)
      }
      // Устанавливаем Content-Type по умолчанию для всех запросов
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
      // Не нужно дублировать headers здесь, они уже установлены в prepareHeaders
    }),
  }),
})

// const testApi = createApi({
//   reducerPath: 'testApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: `${API_CONFIG.PROXY_PREFIX}/`, //    '/api/'
//     credentials: 'include',
//     prepareHeaders: (headers) => {
//       const csrfToken = getCsrfToken()
//       headers.set('Content-Type', 'application/json')
//       if (csrfToken) {
//         headers.set('X-CSRFToken', csrfToken)
//       }
//       return headers
//     },
//   }),
//   tagTypes: ['test'],
//   endpoints: (build) => ({
//     getTests: build.query({
//       query: () => 'tests/',
//       providesTags: ['test'],
//     }),
//     getTestById: build.query({
//       query: (id) => {
//         if (!id) {
//           throw new Error('ID is required')
//         }
//         return `tests/${id}/`
//       },
//       transformErrorResponse: (response) => response.data,
//     }),
//     postTestResult: build.mutation({
//       query: (body) => ({
//         url: 'test_results/',
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body,
//       }),
//     }),
//   }),
// })

export const {
  useGetTestsQuery,
  useGetTestByIdQuery,
  useLazyGetTestByIdQuery,
  useLazyGetTestsQuery,
  usePostTestResultMutation,
} = testApi
export default testApi
