import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Box, List } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import SchoolIcon from '@mui/icons-material/School'
import GradingIcon from '@mui/icons-material/Grading'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import HeadphonesIcon from '@mui/icons-material/Headphones'
import SmartDisplayIcon from '@mui/icons-material/SmartDisplay'
import ImportContactsIcon from '@mui/icons-material/ImportContacts';

import MenuItem from '../MenuItem'

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
    icon: <GradingIcon />,
  },
  {
    title: 'База знаний',
    icon: <SchoolIcon />,
    children: [
      {
        title: 'Правовые документы',
        path: '/knowladge/nla',
        icon: <ImportContactsIcon />,
      },
      {
        title: 'Аудио',
        path: '/knowladge/audio',
        icon: <HeadphonesIcon />,
      },
      {
        title: 'Видео',
        path: '/knowladge/video',
        icon: <SmartDisplayIcon />,
      },
    ],
  },
  {
    title: 'Тестирование',
    path: '/test',
    icon: <FactCheckIcon />,
  },
  {
    title: 'Мои успехи',
    path: '/mysuccess',
    icon: <EmojiEventsIcon />,
  },
]

function Layout() {
  const [openIndex, setOpenIndex] = useState(null)

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <nav>
        <List>
          {NAVIGATION.map((item, index) => (
            <MenuItem
              key={item.title}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
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
