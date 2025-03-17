import React from 'react'
import { Outlet, Link } from 'react-router-dom' // Используем Link вместо CustomLink для выпадающего списка

import CustomLink from '../CustomLink'

import style from './Layout.module.scss'

function Layout() {
  return (
    <>
      <header className={style.header}>
        <nav>
          <ul className={style.header__list}>
            <li>
              <CustomLink to="/">Главная</CustomLink>
            </li>
            <li>
              <CustomLink to="/instruction">Инструктаж</CustomLink>
            </li>
            <li>
              <div className={style.dropdown}>
                <button type="button" className={style.dropbtn}>
                  База знаний
                </button>
                <div className={style.dropdownContent}>
                  <Link to="/knowladge/nla">Правовые документы</Link>
                  <Link to="/knowladge/audio">Аудио</Link>
                  <Link to="/knowladge/video">Видео</Link>
                </div>
              </div>
            </li>
            <li>
              <CustomLink to="/test">Тестирование</CustomLink>
            </li>
            <li>
              <CustomLink to="/mysuccess">Мои успехи</CustomLink>
            </li>
          </ul>
        </nav>
      </header>

      <main className={style.container}>
        <Outlet />
      </main>
      <footer className={style.container} />
    </>
  )
}

export default Layout
