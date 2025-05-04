import { useContext } from 'react'

import { GameContext } from '../hoc/GameProvider'

const useGame = () => useContext(GameContext)

export default useGame
