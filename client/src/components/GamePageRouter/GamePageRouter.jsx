// GamePageRouter.jsx
import { useLocation } from 'react-router-dom'
import { lazy, Suspense, forwardRef, useMemo } from 'react'

import LoadingIndicator from '@/components/LoadingIndicator'
import NotFoundPage from '@/pages/NotFoundPage'

const GamePageRouter = forwardRef((props, ref) => {
  const location = useLocation()
  const gameType = location.pathname.split('/').pop()
  const level = new URLSearchParams(location.search).get('level')

  const GameComponent = useMemo(() => {
    const components = {
      fire_safety: {
        1: lazy(() => import('../../games/FireSafetyLevel1')),
        2: lazy(() => import('../../games/FireSafetyLevel2')),
        3: lazy(() => import('../../games/FireSafetyLevel3')),
      },
    }
    return components[gameType]?.[level] || (() => <NotFoundPage />)
  }, [gameType, level])

  return (
    <Suspense fallback={<LoadingIndicator />}>
      <GameComponent ref={ref} />
    </Suspense>
  )
})

export default GamePageRouter
