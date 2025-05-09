import { createContext, useMemo } from 'react'

import { useGetGameQuery } from '@/slices/gameApi'

export const GameContext = createContext(null)

export function GameProvider({ children }) {
  const { data } = useGetGameQuery()

  const hasMegaPower = useMemo(() => data?.remaining_mega_powers > 0, [data])

  const contextValue = useMemo(
    () => ({
      data,
      hasMegaPower,
    }),
    [data, hasMegaPower]
  )

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  )
}
