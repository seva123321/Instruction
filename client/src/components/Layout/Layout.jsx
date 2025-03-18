import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'

import MenuItem from '../MenuItem'

import style from './Layout.module.scss'

function Layout() {
  return (
    <Box sx={{ display: 'flex' }}>
      <nav>
        <MenuItem />
      </nav>

      <main className={style.container}>
        <Outlet />
      </main>
    </Box>
  )
}

export default Layout
