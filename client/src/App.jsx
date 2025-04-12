import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'

import Layout from '@/components/Layout'

const InstructionsPage = lazy(() => import('@/pages/InstructionsPage'))
const TestingPage = lazy(() => import('@/pages/TestingPage'))
const TestOnePage = lazy(() => import('@/models/TestOnePage'))
const KnowBaseDocsPage = lazy(() => import('@/pages/KnowBaseDocsPage'))
const KnowBaseVideosPage = lazy(() => import('@/pages/KnowBaseVideosPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const SuccessPage = lazy(() => import('@/pages/SuccessPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const RegPage = lazy(() => import('@/pages/RegPage'))
const AuthPage = lazy(() => import('@/pages/AuthPage'))

import { AuthProvider } from './hoc/AuthProvider'
import RequireAuth from './hoc/RequireAuth'
import LoadingIndicator from '@/components/LoadingIndicator'

// import ThemeProvider from './hoc/ThemeProvider'

function App() {
  return (
    <AuthProvider>
      {/* <ThemeProvider> */}
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route
          path="/auth/login"
          element={
            <Suspense fallback={<LoadingIndicator />}>
              <RegPage />
            </Suspense>
          }
        />
        <Route
          path="/auth/signup"
          element={
            <Suspense fallback={<LoadingIndicator />}>
              <AuthPage />
            </Suspense>
          }
        />
        <Route path="/" element={<Layout />}>
          <Route
            path="instructions"
            element={
              <RequireAuth>
                <InstructionsPage />
              </RequireAuth>
            }
          />
          <Route
            path="instructions/:id"
            element={
              <RequireAuth>
                <InstructionsPage />
              </RequireAuth>
            }
          />
          <Route
            path="knowladge/nlas"
            element={
              <RequireAuth>
                <KnowBaseDocsPage />
              </RequireAuth>
            }
          />
          {/* @TODO when add audio */}
          {/* <Route
            path="knowladge/audios"
            element={
              <RequireAuth>
                <KnowBasePageAudios />
              </RequireAuth>
            }
          /> */}
          <Route
            path="knowladge/videos"
            element={
              <RequireAuth>
                <KnowBaseVideosPage />
              </RequireAuth>
            }
          />
          <Route
            path="tests"
            element={
              <RequireAuth>
                <TestingPage />
              </RequireAuth>
            }
          />
          <Route
            path="tests/:id"
            element={
              <RequireAuth>
                <TestOnePage />
              </RequireAuth>
            }
          />
          <Route
            path="profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="mysuccess"
            element={
              <RequireAuth>
                <SuccessPage />
              </RequireAuth>
            }
          />
        </Route>
        <Route path="/admin/*" element={<AdminRedirect />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {/* </ThemeProvider> */}
    </AuthProvider>
  )
}

function AdminRedirect() {
  window.location.href = 'http://localhost:8000/admin' // Порт Django
  return null
}
export default App

// // App.js
// import { Routes, Route, Navigate } from 'react-router-dom'
// import { lazy, Suspense, useEffect } from 'react'
// import Layout from '@/components/Layout'
// import LoadingIndicator from '@/components/LoadingIndicator'
// import { AuthProvider } from './hoc/AuthProvider'
// import RequireAuth from './hoc/RequireAuth'

// // Preload components
// const preloadComponents = async () => {
//   const components = [
//     import('@/pages/InstructionsPage'),
//     import('@/pages/TestingPage'),
//     import('@/models/TestOnePage'),
//     import('@/pages/KnowBaseDocsPage'),
//     import('@/pages/KnowBaseVideosPage'),
//     import('@/pages/ProfilePage'),
//     import('@/pages/SuccessPage'),
//     import('@/pages/NotFoundPage'),
//     import('@/pages/RegPage'),
//     import('@/pages/AuthPage'),
//   ]
//   await Promise.all(
//     components.map((component) =>
//       component.catch((e) => console.warn('Preload failed:', e))
//     )
//   )
// }

// // Lazy components with fallback
// const TestOnePage = lazy(() =>
//   import('@/models/TestOnePage').catch(() => ({
//     default: () => (
//       <div>Оффлайн-режим: тест недоступен без предварительной загрузки</div>
//     ),
//   }))
// )

// const TestingPage = lazy(() => import('@/pages/TestingPage'))
// const InstructionsPage = lazy(() => import('@/pages/InstructionsPage'))
// const KnowBaseDocsPage = lazy(() => import('@/pages/KnowBaseDocsPage'))
// const KnowBaseVideosPage = lazy(() => import('@/pages/KnowBaseVideosPage'))
// const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
// const SuccessPage = lazy(() => import('@/pages/SuccessPage'))
// const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
// const RegPage = lazy(() => import('@/pages/RegPage'))
// const AuthPage = lazy(() => import('@/pages/AuthPage'))

// function App() {
//   useEffect(() => {
//     // Preload components when online
//     if (navigator.onLine) {
//       preloadComponents()
//     }
//   }, [])

//   return (
//     <AuthProvider>
//       <Routes>
//         <Route path="/" element={<Navigate to="/auth/login" replace />} />
//         <Route
//           path="/auth/login"
//           element={
//             <Suspense fallback={<LoadingIndicator />}>
//               <RegPage />
//             </Suspense>
//           }
//         />
//         <Route
//           path="/auth/signup"
//           element={
//             <Suspense fallback={<LoadingIndicator />}>
//               <AuthPage />
//             </Suspense>
//           }
//         />
//         <Route path="/" element={<Layout />}>
//           <Route
//             path="instructions"
//             element={
//               <RequireAuth>
//                 <InstructionsPage />
//               </RequireAuth>
//             }
//           />
//           <Route
//             path="instructions/:id"
//             element={
//               <RequireAuth>
//                 <InstructionsPage />
//               </RequireAuth>
//             }
//           />
//           <Route
//             path="knowladge/nlas"
//             element={
//               <RequireAuth>
//                 <KnowBaseDocsPage />
//               </RequireAuth>
//             }
//           />
//           <Route
//             path="knowladge/videos"
//             element={
//               <RequireAuth>
//                 <KnowBaseVideosPage />
//               </RequireAuth>
//             }
//           />
//           <Route
//             path="tests"
//             element={
//               <RequireAuth>
//                 <TestingPage />
//               </RequireAuth>
//             }
//           />
//           <Route
//             path="tests/:id"
//             element={
//               <RequireAuth>
//                 <TestOnePage />
//               </RequireAuth>
//             }
//           />
//           <Route
//             path="profile"
//             element={
//               <RequireAuth>
//                 <ProfilePage />
//               </RequireAuth>
//             }
//           />
//           <Route
//             path="mysuccess"
//             element={
//               <RequireAuth>
//                 <SuccessPage />
//               </RequireAuth>
//             }
//           />
//         </Route>
//         <Route path="/admin/*" element={<AdminRedirect />} />
//         <Route path="*" element={<NotFoundPage />} />
//       </Routes>
//     </AuthProvider>
//   )
// }

// function AdminRedirect() {
//   window.location.href = 'http://localhost:8000/admin'
//   return null
// }

// export default App
