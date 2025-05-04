import { createContext } from 'react'

import { useGetGameQuery } from '@/slices/gameApi'

export const GameContext = createContext(null)

export const GameProvider = ({ children }) => {
  const { data } = useGetGameQuery()
  const hasMegaPower = data?.remaining_mega_powers > 0

  return (
    <GameContext.Provider value={{ data, hasMegaPower }}>
      {children}
    </GameContext.Provider>
  )
}
