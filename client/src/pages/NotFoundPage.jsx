import React from 'react'
import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div>
      Страница не найдена. К сожалению, такой страницы больше нет или она
      никогда не существовала. Перейдите
      <Link to="/auth/login">на главную</Link>
    </div>
  )
}

export default NotFoundPage
