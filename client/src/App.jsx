import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'

import Layout from '@/components/Layout'
import LoadingIndicator from '@/components/LoadingIndicator'

import { AuthProvider } from './hoc/AuthProvider'
import RequireAuth from './hoc/RequireAuth'

import TestingPage from '@/pages/TestingPage'
import TestOnePage from '@/models/TestOnePage'

const InstructionsPage = lazy(() => import('@/pages/InstructionsPage'))
// const TestingPage = lazy(() => import('@/pages/TestingPage'))
// const TestOnePage = lazy(() => import('@/models/TestOnePage'))
const KnowBaseDocsPage = lazy(() => import('@/pages/KnowBaseDocsPage'))
const KnowBaseVideosPage = lazy(() => import('@/pages/KnowBaseVideosPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const SuccessPage = lazy(() => import('@/pages/SuccessPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const RegPage = lazy(() => import('@/pages/RegPage'))
const AuthPage = lazy(() => import('@/pages/AuthPage'))

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
