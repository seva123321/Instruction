import { createContext, useCallback, useEffect, useMemo, useState } from 'react'

import {
  useSignUpMutation,
  useLoginMutation,
  useFaceLoginMutation,
  useLogoutMutation,
} from '../slices/userApi'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const [postLogin, { isLoading: isLoadingLogin, error: loginError }] =
    useLoginMutation()
  const [postSignup, { isLoading: isLoadingSignup, error: signupError }] =
    useSignUpMutation()
  const [
    postFaceLogin,
    { isLoading: isLoadingFaceLogin, error: faceLoginError },
  ] = useFaceLoginMutation()
  const [postLogout, { isLoading: isLoadingLogout, error: logoutError }] =
    useLogoutMutation()

  useEffect(() => {
    const checkSession = () => {
      const hasSession = document.cookie.includes('sessionid')
      setUser(hasSession ? { isAuthenticated: true } : null)
      setIsInitialized(true)
    }
    checkSession()
  }, [])

  const auth = useCallback(
    async (userData) => {
      try {
        const response = await postSignup(userData).unwrap()
        setUser(response)
        return response
      } catch (error) {
        return error
      }
    },
    [postSignup]
  )
  const signIn = useCallback(
    async (authData) => {
      try {
        let response = ''
        if (authData.face_descriptor) {
          response = await postFaceLogin(authData).unwrap()
        } else {
          response = await postLogin(authData).unwrap()
        }
        setUser(response)
        return response
      } catch (error) {
        return error
      }
    },
    [postFaceLogin, postLogin]
  )

  const signOut = useCallback(
    async (cb) => {
      const result = await postLogout()
      if (!result.error) {
        setUser(null)
        cb?.()
      }
    },
    [postLogout]
  )

  const value = useMemo(
    () => ({
      user,
      auth,
      signIn,
      signOut,
      isInitialized,
      isLoading:
        isLoadingLogin ||
        isLoadingSignup ||
        isLoadingFaceLogin ||
        isLoadingLogout,
      error: loginError || signupError || faceLoginError || logoutError,
    }),
    [
      user,
      auth,
      signIn,
      signOut,
      isInitialized,
      isLoadingLogin,
      isLoadingSignup,
      isLoadingFaceLogin,
      isLoadingLogout,
      loginError,
      signupError,
      faceLoginError,
      logoutError,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
