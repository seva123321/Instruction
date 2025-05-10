import { useContext } from 'react'

import { AuthContext } from '../hoc/AuthProvider'

const useAuth = () => useContext(AuthContext)

export default useAuth
