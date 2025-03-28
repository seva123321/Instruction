import { createContext, useCallback, useMemo, useState } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null) //@TODO useState(null)

  const auth = useCallback((newUser) => {
    console.log('newUserData > ', newUser)
    fetch('http://127.0.0.1:8000/api/auth/signup/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(newUser),
    })
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.error(err))
    setUser(newUser)
    cb()
  }, [])

  const signIn = useCallback((newUser, cb) => {
    console.log('newUser', newUser)
    if (newUser.face_descriptor) {
      fetch('http://127.0.0.1:8000/api/auth/face_login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(newUser),
      })
        .then((res) => res.json())
        .then((data) => console.log(data))
        .catch((err) => console.error(err))
      setUser(newUser)
      cb()
      return
    }
    fetch('http://127.0.0.1:8000/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(newUser),
    })
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.error(err))
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
      auth,
      signIn,
      signOut,
    }),
    [user, auth, signIn, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
