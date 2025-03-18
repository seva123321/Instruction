import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import Fab from '@mui/material/Fab'

import MenuBox from '../MenuBox'
import { ScrollTop } from '../Scroll/Scroll'

import style from './Layout.module.scss'

function Layout() {
  return (
    <>
      <header>{/* <Header /> */}</header>
      <Box sx={{ display: 'flex' }}>
        <MenuBox />

        <main className={style.container}>
          <Outlet />
        </main>
      </Box>
      <ScrollTop>
        <Fab size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </ScrollTop>
    </>
  )
}

export default Layout
