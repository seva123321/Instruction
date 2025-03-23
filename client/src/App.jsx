import { Routes, Route } from 'react-router-dom'

import InstructionPage from '@/pages/InstructionPage'
import KnowBasePage from '@/pages/KnowBasePage'
import NotFoundPage from '@/pages/NotFoundPage'
import TestingPage from '@/pages/TestingPage'
import SuccessPage from '@/pages/SuccessPage'
import Layout from '@/components/Layout'
import ProfilePage from '@/pages/ProfilePage'
import RegPage from '@/pages/RegPage'

import RequireAuth from './hoc/RequireAuth'
import { AuthProvider } from './hoc/AuthProvider'
// import ThemeProvider from './hoc/ThemeProvider'
import AuthPage from './pages/AuthPage'

function App() {
  return (
    <AuthProvider>
      {/* <ThemeProvider> */}
      <Routes>
        <Route index element={<RegPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<Layout />}>
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
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {/* </ThemeProvider> */}
    </AuthProvider>
  )
}

export default App
