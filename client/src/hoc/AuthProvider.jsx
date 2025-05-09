/* eslint-disable operator-linebreak */
import { createContext, useCallback, useEffect, useMemo, useState } from 'react'

import {
  useSignUpMutation,
  useLoginMutation,
  useFaceLoginMutation,
  useLogoutMutation,
  useGetAesKeyQuery,
} from '@/slices/userApi'
import { secureStorage } from '@/service/utilsFunction'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => secureStorage.get('user'))
  const [isInitialized, setIsInitialized] = useState(false)

  const [postLogin, { isLoading: isLoadingLogin }] = useLoginMutation()
  const [postSignup, { isLoading: isLoadingSignup }] = useSignUpMutation()
  const [postFaceLogin, { isLoading: isLoadingFaceLogin }] =
    useFaceLoginMutation()
  const [postLogout, { isLoading: isLoadingLogout }] = useLogoutMutation()
  const {
    data: aesKey,
    isError: isErrorAes,
    refetch: refetchAesKey,
  } = useGetAesKeyQuery()

  const hasSessionCookie = useCallback(() => {
    return document.cookie
      .split(';')
      .some((cookie) => cookie.trim().startsWith('sessionid='))
  }, [])

  // Проверяем авторизацию при загрузке
  useEffect(() => {
    const verifyAuth = async () => {
      const storedUser = secureStorage.get('user')

      // Если пользователь в хранилище и есть кука sessionid → считаем авторизованным
      if (storedUser && hasSessionCookie()) {
        setUser(storedUser)
      } else {
        secureStorage.remove('user')
        setUser(null)
      }

      setIsInitialized(true)
    }

    verifyAuth()
  }, [hasSessionCookie])

  const auth = useCallback(
    async (userData) => {
      try {
        const { data: currentAesKey } = await refetchAesKey()
        if (!currentAesKey) {
          throw new Error('AES key not available')
        }

        const response = await postSignup({
          userData,
          aesKey: currentAesKey,
        }).unwrap()

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
        // const response = authData.face_descriptor
        //   ? await postFaceLogin(authData).unwrap()
        //   : await postLogin(authData).unwrap()
        let response
        if (authData.face_descriptor) {
          const { data: currentAesKey } = await refetchAesKey()

          if (!currentAesKey) {
            throw new Error('AES key not available')
          }

          console.log('aesKey AuthProvider > ', currentAesKey)

          response = await postFaceLogin({
            face_descriptor: authData.face_descriptor,
            aesKey: currentAesKey,
          }).unwrap()
        } else {
          response = await postLogin(authData).unwrap()
        }

        secureStorage.set('user', response)
        setUser(response)
        return response
      } catch (error) {
        secureStorage.remove('user')
        setUser(null)
        throw error
      }
    },
    [postFaceLogin, postLogin, refetchAesKey]
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
      isAuthenticated: !!user,
      auth,
      signIn,
      signOut,
      isInitialized,
      isLoading:
        isLoadingLogin ||
        isLoadingSignup ||
        isLoadingFaceLogin ||
        isLoadingLogout,
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
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
