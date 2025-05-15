import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'

import Layout from '@/components/Layout'
import LoadingIndicator from '@/components/LoadingIndicator'
import TestingPage from '@/pages/TestingPage'
import TestOnePage from '@/models/TestOnePage'
import SwiperGame from '@/models/SwiperGame'

import { AuthProvider } from './hoc/AuthProvider'
import { GameProvider } from './hoc/GameProvider'
import RequireAuth from './hoc/RequireAuth'

const InstructionsPage = lazy(() => import('@/pages/InstructionsPage'))
const KnowBaseDocsPage = lazy(() => import('@/pages/KnowBaseDocsPage'))
const KnowBaseVideosPage = lazy(() => import('@/pages/KnowBaseVideosPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const SuccessPage = lazy(() => import('@/pages/SuccessPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const RegPage = lazy(() => import('@/pages/RegPage'))
const AuthPage = lazy(() => import('@/pages/AuthPage'))
const CalendarResults = lazy(() => import('@/models/CalendarResults'))
const RatingPage = lazy(() => import('@/pages/RatingPage'))
const QuizPageProvider = lazy(() =>
  import('./hoc/QuizPageProvider').then(({ QuizPageProvider }) => ({
    default: QuizPageProvider,
  }))
)
const GamePageRouter = lazy(() => import('@/components/GamePageRouter'))
const GamePage = lazy(() => import('@/pages/GamePage'))

function App() {
  return (
    <AuthProvider>
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
            path="success"
            element={
              <RequireAuth>
                <Suspense fallback={<LoadingIndicator />}>
                  <SuccessPage />
                </Suspense>
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="calendar" replace />} />
            <Route
              path="calendar"
              element={
                <Suspense fallback={<LoadingIndicator />}>
                  <CalendarResults />
                </Suspense>
              }
            />
            <Route
              path="rating"
              element={
                <Suspense fallback={<LoadingIndicator />}>
                  <RatingPage />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="game"
            element={
              <RequireAuth>
                <GameProvider>
                  <GamePage />
                </GameProvider>
              </RequireAuth>
            }
          />
          <Route
            path="game/swiper"
            element={
              <RequireAuth>
                <GameProvider>
                  <SwiperGame />
                </GameProvider>
              </RequireAuth>
            }
          />
          <Route
            path="game/:gameType" // fire_safety
            element={
              <RequireAuth>
                <QuizPageProvider>
                  <GamePageRouter />
                </QuizPageProvider>
              </RequireAuth>
            }
          />
        </Route>
        <Route path="/admin/*" element={<AdminRedirect />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}

function AdminRedirect() {
  window.location.href = 'http://localhost:8000/admin' // Порт Django
  return null
}
export default App
