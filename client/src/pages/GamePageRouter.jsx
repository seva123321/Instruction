// GamePageRouter.jsx
import { useLocation } from 'react-router-dom'
import { lazy, Suspense, forwardRef } from 'react'

import LoadingIndicator from '@/components/LoadingIndicator'
import NotFoundPage from '@/pages/NotFoundPage'

const GamePageRouter = forwardRef((props, ref) => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const level = searchParams.get('level')
  const gameType = location.pathname.split('/').pop()

  const gameComponents = {
    fire_safety: {
      1: lazy(() => import('../games/FireSafetyLevel1')),
      2: lazy(() => import('../games/FireSafetyLevel2')),
    },
  }

  const GameComponent =
    gameComponents[gameType]?.[level] || (() => <NotFoundPage />)

  return (
    <Suspense fallback={<LoadingIndicator />}>
      <GameComponent ref={ref} />
    </Suspense>
  )
})

export default GamePageRouter

// import { useLocation } from 'react-router-dom'
// import { lazy, Suspense, useRef } from 'react'
// import { Button, Box } from '@mui/material'
// import LoadingIndicator from '@/components/LoadingIndicator'
// import NotFoundPage from '@/pages/NotFoundPage'

// function GamePageRouter({ children }) {
//   const location = useLocation()
//   const searchParams = new URLSearchParams(location.search)
//   const level = searchParams.get('level')
//   const gameRef = useRef(null)

//   const handleShowAnswer = () => {
//     if (gameRef.current?.playAnimationSequence) {
//       gameRef.current.playAnimationSequence()
//     } else {
//       console.warn('Анимация не найдена')
//     }
//   }

//   return (
//     <Box sx={{ position: 'relative', height: '100vh' }}>
//       <Suspense fallback={<LoadingIndicator />}>
//         {children && React.cloneElement(children, { ref: gameRef })}
//       </Suspense>

//       <Box
//         sx={{
//           position: 'absolute',
//           bottom: 20,
//           left: '50%',
//           transform: 'translateX(-50%)',
//           zIndex: 1000,
//         }}
//       >
//         <Button
//           onClick={handleShowAnswer}
//           variant="contained"
//           color="primary"
//           size="large"
//         >
//           Показать ответ
//         </Button>
//       </Box>
//     </Box>
//   )
// }

// export default GamePageRouter

// import { lazy, Suspense } from 'react'
// import GamePageRouter from './GamePageRouter'

// // Создаем маппинг компонентов
// const levelComponents = {
//   1: lazy(() => import('../games/FireSafetyLevel1')),
//   2: lazy(() => import('../games/FireSafetyLevel2')),
// }

// function ParentComponent() {
//   const location = useLocation()
//   const searchParams = new URLSearchParams(location.search)
//   const level = searchParams.get('level')

//   const GameComponent = levelComponents[level] || (() => <NotFoundPage />)

//   return (
//     <GamePageRouter>
//       <Suspense fallback={<LoadingIndicator />}>
//         <GameComponent />
//       </Suspense>
//     </GamePageRouter>
//   )
// }
