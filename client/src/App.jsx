import { Routes, Route, Navigate } from 'react-router-dom'

import KnowBasePage from '@/pages/KnowBasePage'
import KnowBasePageDocs from '@/pages/KnowBaseDocsPage'
import NotFoundPage from '@/pages/NotFoundPage'
import TestingPage from '@/pages/TestingPage'
import SuccessPage from '@/pages/SuccessPage'
import Layout from '@/components/Layout'
import ProfilePage from '@/pages/ProfilePage'
import RegPage from '@/pages/RegPage'

import InstructionsPage from './pages/InstructionsPage'
import TestOnePage from './models/TestOnePage/TestOnePage'
import AuthPage from './pages/AuthPage'
import { AuthProvider } from './hoc/AuthProvider'
import RequireAuth from './hoc/RequireAuth'
import KnowBaseVideosPage from './pages/KnowBaseVideosPage'

// import ThemeProvider from './hoc/ThemeProvider'

function App() {
  return (
    <AuthProvider>
      {/* <ThemeProvider> */}
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth/login" element={<RegPage />} />
        <Route path="/auth/signup" element={<AuthPage />} />
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
            path="knowladge"
            element={
              <RequireAuth>
                <KnowBasePage />
              </RequireAuth>
            }
          />
          <Route
            path="knowladge/nlas"
            element={
              <RequireAuth>
                <KnowBasePageDocs />
              </RequireAuth>
            }
          />
          <Route
            path="knowladge/audios"
            element={
              <RequireAuth>
                <KnowBasePage />
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
          {/* <Route
            path="tests"
            element={
              <RequireAuth>
                <TestingPage />
              </RequireAuth>
            }
          >
            <Route path=":id" element={<TestOnePage />} />
          </Route> */}
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
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {/* </ThemeProvider> */}
    </AuthProvider>
  )
}

export default App
