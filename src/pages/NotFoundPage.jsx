import React from 'react'
import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div>
      Страница не найдена. Перейдите
      <Link to="/">на главную</Link>
    </div>
  )
}

export default NotFoundPage
