import { Outlet } from 'react-router-dom'
import { Box, Fab } from '@mui/material'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { useState } from 'react'

import MenuBox from '../MenuBox'
import { ScrollTop } from '../Scroll/Scroll'
import FontSizeControls from '../FontSizeControls' // Импортируем компонент

function Layout() {
  const [fontSize, setFontSize] = useState(1) // Состояние для размера шрифта

  const styles = {
    root: {
      display: 'flex',
      minHeight: '100vh',
      flexDirection: 'column',
      fontSize: `${fontSize * 100}%`, // Применяем размер шрифта ко всему Layout
    },
    container: {
      display: 'flex',
      flex: 1,
    },
    mainContent: {
      flex: 1,
      padding: '2rem',
      maxWidth: 1200,
      margin: '0 auto',
      '& h1': { fontSize: `${2.5 * fontSize}rem` }, // Масштабируем заголовки
      '& h2': { fontSize: `${2 * fontSize}rem` },
      '& h3': { fontSize: `${1.75 * fontSize}rem` },
      '& p, & li': { fontSize: `${1.1 * fontSize}rem` },
    },
  }

  return (
    <Box sx={styles.root}>
      <div id="back-to-top-anchor" />

      {/* Добавляем компонент управления шрифтом */}
      <FontSizeControls fontSize={fontSize} setFontSize={setFontSize} />

      <Box sx={styles.container}>
        <MenuBox />
        <Box component="main" sx={styles.mainContent}>
          <Outlet />
        </Box>
      </Box>

      <ScrollTop>
        <Fab size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </ScrollTop>
    </Box>
  )
}

export default Layout
