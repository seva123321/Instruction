import { Routes, Route } from 'react-router-dom'

import HomePage from '@/pages/HomePage'
import InstructionPage from '@/pages/InstructionPage'
import KnowBasePage from '@/pages/KnowBasePage'
import NotFoundPage from '@/pages/NotFoundPage'
import TestingPage from '@/pages/TestingPage'
import SuccessPage from '@/pages/SuccessPage'
import Layout from '@/components/Layout'
import ProfilePage from '@/pages/ProfilePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="instruction" element={<InstructionPage />} />
        <Route path="knowladge" element={<KnowBasePage />} />
        <Route path="knowladge/nla" element={<KnowBasePage />} />
        <Route path="knowladge/audio" element={<KnowBasePage />} />
        <Route path="knowladge/video" element={<KnowBasePage />} />
        <Route path="test" element={<TestingPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="mysuccess" element={<SuccessPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
