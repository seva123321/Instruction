import { createContext, useCallback, useMemo, useState } from 'react'

import {
  useSignUpMutation,
  useLoginMutation,
  useFaceLoginMutation,
  useLogoutMutation,
} from '../slices/userApi'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState('TODO') // @TODO null

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

  const auth = useCallback(
    async (userData) => {
      try {
        await postSignup(userData).unwrap()
        setUser(userData)
        return true
      } catch (error) {
        return false
      }
    },
    [postSignup]
  )

  const signIn = useCallback(
    async (authData) => {
      try {
        if (authData.face_descriptor) {
          await postFaceLogin(authData).unwrap()
        } else {
          await postLogin(authData).unwrap()
        }
        setUser(authData)
        return true
      } catch (error) {
        return false
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

// import { createContext, useMemo, useState } from 'react'
// import {
//   useSignUpMutation,
//   useLoginMutation,
//   useFaceLoginMutation,
//   useLogoutMutation,
// } from '../slices/userApi'

// export const AuthContext = createContext(null)

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null)

//   const [postLogin, { isLoading: isLoadingLogin, error: loginError }] =
//     useLoginMutation()
//   const [postSignup, { isLoading: isLoadingSignup, error: signupError }] =
//     useSignUpMutation()
//   const [
//     postFaceLogin,
//     { isLoading: isLoadingFaceLogin, error: faceLoginError },
//   ] = useFaceLoginMutation()
//   const [postLogout, { isLoading: isLoadingLogout, error: logoutError }] =
//     useLogoutMutation()

//   const auth = async (newUser, cb) => {
//     const result = await postSignup(newUser)
//     if (!result.error) {
//       setUser(newUser)
//       cb?.()
//     }
//   }

//   const signIn = async (newUser, cb) => {
//     const result = newUser.face_descriptor
//       ? await postFaceLogin(newUser)
//       : await postLogin(newUser)

//     if (!result.error) {
//       setUser(newUser)
//       cb?.()
//     }
//   }

//   const signOut = async (cb) => {
//     const result = await postLogout()
//     if (!result.error) {
//       setUser(null)
//       cb?.()
//     }
//   }

//   const value = useMemo(
//     () => ({
//       user,
//       auth,
//       signIn,
//       signOut,
//       isLoading:
//         isLoadingLogin ||
//         isLoadingSignup ||
//         isLoadingFaceLogin ||
//         isLoadingLogout,
//       error: loginError || signupError || faceLoginError || logoutError,
//     }),
//     [
//       user,
//       auth,
//       signIn,
//       signOut,
//       isLoadingLogin,
//       isLoadingSignup,
//       isLoadingFaceLogin,
//       isLoadingLogout,
//       loginError,
//       signupError,
//       faceLoginError,
//       logoutError,
//     ]
//   )

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
// }
