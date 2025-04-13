import { Outlet } from 'react-router-dom'
import { Box, Fab } from '@mui/material'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { useState, Suspense } from 'react'

import MenuBox from '@/components/MenuBox'
import LoadingIndicator from '@/components/LoadingIndicator'
import ScrollTop from '@/components/Scroll'
import FontSizeControls from '@/components/FontSizeControls'

function Layout() {
  const [fontSize, setFontSize] = useState(1)

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
      padding: '3rem 0',
      maxWidth: 1200,
      margin: '0 auto',
      '& h1': { fontSize: `${2.5 * fontSize}rem` },
      '& h2': { fontSize: `${2 * fontSize}rem` },
      '& h3': { fontSize: `${1.75 * fontSize}rem` },
      '& p, & li': { fontSize: `${1.1 * fontSize}rem` },
    },
  }

  return (
    <Box sx={styles.root}>
      <div id="back-to-top-anchor" />

      <FontSizeControls fontSize={fontSize} setFontSize={setFontSize} />

      <Box sx={styles.container}>
        <MenuBox />
        <Box component="main" sx={styles.mainContent}>
          <Suspense fallback={<LoadingIndicator />}>
            <Outlet />
          </Suspense>
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
