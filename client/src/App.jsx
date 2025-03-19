import { Routes, Route } from 'react-router-dom'

import InstructionPage from '@/pages/InstructionPage'
import KnowBasePage from '@/pages/KnowBasePage'
import NotFoundPage from '@/pages/NotFoundPage'
import TestingPage from '@/pages/TestingPage'
import SuccessPage from '@/pages/SuccessPage'
import Layout from '@/components/Layout'
import ProfilePage from '@/pages/ProfilePage'
import LoginPage from '@/pages/LoginPage'

import RequireAuth from './hoc/RequireAuth'
import { AuthProvider } from './hoc/AuthProvider'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LoginPage />} />
          <Route
            path="instruction"
            element={
              <RequireAuth>
                <InstructionPage />
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
            path="knowladge/nla"
            element={
              <RequireAuth>
                <KnowBasePage />
              </RequireAuth>
            }
          />
          <Route
            path="knowladge/audio"
            element={
              <RequireAuth>
                <KnowBasePage />
              </RequireAuth>
            }
          />
          <Route
            path="knowladge/video"
            element={
              <RequireAuth>
                <KnowBasePage />
              </RequireAuth>
            }
          />
          <Route
            path="test"
            element={
              <RequireAuth>
                <TestingPage />
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
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
