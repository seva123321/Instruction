import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Box, Typography, List, ListItem, ListItemIcon } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import DescriptionIcon from '@mui/icons-material/Description'
import LayersIcon from '@mui/icons-material/Layers'
import style from './Layout.module.scss'

const NAVIGATION = [
  {
    title: 'Главная',
    path: '/',
    icon: <DashboardIcon />,
  },
  {
    title: 'Инструктаж',
    path: '/instruction',
    icon: <ShoppingCartIcon />,
  },
  {
    title: 'База знаний',
    children: [
      {
        title: 'Правовые документы',
        path: '/knowladge/nla',
      },
      {
        title: 'Аудио',
        path: '/knowladge/audio',
      },
      {
        title: 'Видео',
        path: '/knowladge/video',
      },
    ],
  },
  {
    title: 'Тестирование',
    path: '/test',
    icon: <DescriptionIcon />,
  },
  {
    title: 'Мои успехи',
    path: '/mysuccess',
    icon: <LayersIcon />,
  },
]

function Layout() {
  return (
    <Box sx={{ display: 'flex' }}>
      <nav>
        <List>
          {NAVIGATION.map((item) => (
            <ListItem
              key={item.title}
              component="div" //{item.children ? 'div' : Link}
              to={item.path}
            >
              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              <Link to={item.path} className={style.link}>
                {item.title}
              </Link>
              {/* {item.children && (
                <div className={style.dropdown}>
                  <button type="button" className={style.dropbtn}>
                    {item.title}
                  </button>
                  <div className={style.dropdownContent}>
                    {item.children.map((child) => (
                      <Link key={child.path} to={child.path}>
                        {child.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )} */}
            </ListItem>
          ))}
        </List>
      </nav>

      <main className={style.container}>
        <Outlet />
      </main>
    </Box>
  )
}

export default Layout

// import React from 'react'
// import { Outlet, Link } from 'react-router-dom'
// // Используем Link вместо CustomLink для выпадающего списка

// import CustomLink from '../CustomLink'

// import style from './Layout.module.scss'

// function Layout() {
//   return (
//     <>
//       <header className={style.header}>
//         <nav>
//           <ul className={style.header__list}>
//             <li>
//               <CustomLink to="/">Главная</CustomLink>
//             </li>
//             <li>
//               <CustomLink to="/instruction">Инструктаж</CustomLink>
//             </li>
//             <li>
//               <div className={style.dropdown}>
//                 <button type="button" className={style.dropbtn}>
//                   База знаний
//                 </button>
//                 <div className={style.dropdownContent}>
//                   <Link to="/knowladge/nla">Правовые документы</Link>
//                   <Link to="/knowladge/audio">Аудио</Link>
//                   <Link to="/knowladge/video">Видео</Link>
//                 </div>
//               </div>
//             </li>
//             <li>
//               <CustomLink to="/test">Тестирование</CustomLink>
//             </li>
//             <li>
//               <CustomLink to="/mysuccess">Мои успехи</CustomLink>
//             </li>
//           </ul>
//         </nav>
//       </header>

//       <main className={style.container}>
//         <Outlet />
//       </main>
//       <footer className={style.container} />
//     </>
//   )
// }

// export default Layout
