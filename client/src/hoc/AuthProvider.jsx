/* eslint-disable operator-linebreak */
import { createContext, useCallback, useEffect, useMemo, useState } from 'react'

import {
  useSignUpMutation,
  useLoginMutation,
  useFaceLoginMutation,
  useLogoutMutation,
  useCheckSessionMutation,
} from '@/slices/userApi'
import { secureStorage } from '@/service/utilsFunction'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => secureStorage.get('user'))
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
  const [checkSession] = useCheckSessionMutation()

  useEffect(() => {
    const verifySession = async () => {
      try {
        const { data } = await checkSession().unwrap()

        if (data?.user) {
          const userData = { ...data.user, isAuthenticated: true }
          secureStorage.set('user', userData)
          setUser(userData)
        }
      } catch (error) {
        if (error?.data?.error !== 401) {
          return
        }
        secureStorage.remove('user')
        setUser(null)
      } finally {
        setIsInitialized(true)
      }
    }

    verifySession()
  }, [checkSession])

  const auth = useCallback(
    async (userData) => {
      try {
        const response = await postSignup(userData).unwrap()
        secureStorage.set('user', response)
        setUser(response)
        return response
      } catch (error) {
        secureStorage.remove('user')
        setUser(null)
        throw error
      }
    },
    [postSignup]
  )

  const signIn = useCallback(
    async (authData) => {
      try {
        const response = authData.face_descriptor
          ? await postFaceLogin(authData).unwrap()
          : await postLogin(authData).unwrap()

        secureStorage.set('user', response)
        setUser(response)
        return response
      } catch (error) {
        secureStorage.remove('user')
        setUser(null)
        throw error
      }
    },
    [postFaceLogin, postLogin]
  )

  const signOut = useCallback(
    async (cb) => {
      await postLogout().unwrap()
      secureStorage.remove('user')
      setUser(null)
      cb?.()
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
