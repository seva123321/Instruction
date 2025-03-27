import { useState, useCallback } from 'react'

const useTestState = (initialState) => {
  const [state, setState] = useState(initialState)
  const updateState = useCallback(
    (updates) => setState((prev) => ({ ...prev, ...updates })),
    []
  )
  return [state, updateState]
}

export default useTestState
