import { createContext } from 'react'

import { useGetGameQuery } from '@/slices/gameApi'

export const GameContext = createContext(null)

export const GameProvider = ({ children }) => {
  const { data } = useGetGameQuery()
  const hasMegaPower = data?.remainingMegaPowers > 0

  return (
    <GameContext.Provider value={{ data, hasMegaPower }}>
      {children}
    </GameContext.Provider>
  )
}
