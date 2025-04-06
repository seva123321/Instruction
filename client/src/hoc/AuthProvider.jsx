import { createContext, useCallback, useMemo, useState } from 'react'

import {
  useSignUpMutation,
  useLoginMutation,
  useFaceLoginMutation,
  useLogoutMutation,
} from '../slices/userApi'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null) // @TODO null

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
