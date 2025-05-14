// GamePageRouter.jsx
import { useLocation } from 'react-router-dom'
import { lazy, Suspense, forwardRef, useMemo } from 'react'

import LoadingIndicator from '@/components/LoadingIndicator'
import NotFoundPage from '@/pages/NotFoundPage'

const GamePageRouter = forwardRef((props, ref) => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const level = searchParams.get('level')
  const gameType = location.pathname.split('/').pop()

  const gameComponents = useMemo(
    () => ({
      fire_safety: {
        1: lazy(() => import('../games/FireSafetyLevel1')),
        2: lazy(() => import('../games/FireSafetyLevel2')),
      },
    }),
    []
  )

  const GameComponent =
    gameComponents[gameType]?.[level] || (() => <NotFoundPage />)

  return (
    <Suspense fallback={<LoadingIndicator />}>
      <GameComponent ref={ref} />
    </Suspense>
  )
})

export default GamePageRouter
