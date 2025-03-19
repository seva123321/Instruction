import { createContext, useCallback, useMemo, useState } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const signIn = useCallback((newUser, cb) => {
    setUser(newUser)
    cb()
  }, [])
  const signOut = useCallback((cb) => {
    setUser(null)
    cb()
  }, [])

  const value = useMemo(
    () => ({
      user,
      signIn,
      signOut,
    }),
    [user, signIn, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
