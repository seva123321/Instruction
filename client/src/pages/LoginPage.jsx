import { useLocation, useNavigate } from 'react-router-dom'

import useAuth from '../hook/useAuth'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()

  const fromPage = location.state?.from?.pathname || '/'

  const handleSubmit = (e) => {
    e.preventDefault()
    const form = e.target
    const user = form.username.value

    signIn(user, () => navigate(fromPage), { replace: true })
  }

  return (
    <div>
      <h1>LoginPage</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="login">
          Name:
          <input id="login" type="text" name="username" />
        </label>
        <button type="submit">Войти</button>
      </form>
    </div>
  )
}

export default LoginPage
