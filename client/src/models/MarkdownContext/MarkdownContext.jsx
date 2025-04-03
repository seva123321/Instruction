import { useState, useRef, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import {
  Box,
  Typography,
  List,
  ListItem,
  Link,
  Container,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import './Markdown.css'

const MarkdownComponents = {
  h1: (props) => {
    const id = props.children.toString().toLowerCase().replace(/\s+/g, '-')
    return (
      <Typography
        variant="h4"
        gutterBottom
        id={id}
        sx={{ textAlign: 'center' }}
        {...props}
      />
    )
  },
  h2: (props) => {
    const id = props.children.toString().toLowerCase().replace(/\s+/g, '-')
    return (
      <Typography
        variant="h5"
        gutterBottom
        id={id}
        sx={{ textAlign: 'center' }}
        {...props}
      />
    )
  },
  h3: (props) => {
    const id = props.children.toString().toLowerCase().replace(/\s+/g, '-')
    return <Typography variant="h6" gutterBottom id={id} {...props} />
  },
  p: (props) => (
    <Typography
      component="p"
      gutterBottom
      sx={{ textAlign: 'justify' }}
      {...props}
    />
  ),
  ul: (props) => <List {...props} />,
  li: (props) => <ListItem {...props} />,
}

function MarkdownContext({ markdown, header }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [headings, setHeadings] = useState([])
  const [currentHeading, setCurrentHeading] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const headingRefs = useRef({})
  const location = useLocation()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1))
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [location])

  // Извлечение заголовков из markdown
  useEffect(() => {
    const headingRegex = /^(#{1,3})\s+(.*)$/gm
    const matches = markdown.match(headingRegex)
    setHeadings([])
    if (matches) {
      const extractedHeadings = matches.map((heading) => {
        const level = heading.match(/#/g).length
        const text = heading.replace(/^(#{1,3})\s+/, '')
        const id = text.toLowerCase().replace(/\s+/g, '-')
        return {
          level,
          text,
          id,
        }
      })

      setHeadings(extractedHeadings)
    }
  }, [markdown])

  // Настройка IntersectionObserver для отслеживания видимости заголовков
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentHeading(entry.target.id)
          }
        })
      },
      {
        rootMargin: '0px 0px -90% 0px',
        threshold: 0.5,
      }
    )

    headingRefs.current = headings.map(
      (heading) => document.getElementById(heading.id)
      // eslint-disable-next-line function-paren-newline
    )

    headingRefs.current.forEach((heading) => {
      if (heading) {
        observer.observe(heading)
      }
    })

    return () => {
      headingRefs.current.forEach((heading) => {
        if (heading) {
          observer.unobserve(heading)
        }
      })
    }
  }, [headings])

  const scrollToHeading = useCallback(
    (id) => {
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }
      if (isMobile) {
        setMobileOpen(false)
      }
    },
    [isMobile]
  )

  const styles = {
    root: {
      display: 'flex',
      position: 'relative',
      width: '100%',
    },
    content: {
      flexGrow: 1,
      width: '100%',
      maxWidth: { md: 'calc(100% - 300px)' },
      padding: 3,
    },
    sidebarDesktop: {
      width: 300,
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
      bgcolor: 'background.paper',
      boxShadow: 1,
      p: 2,
      display: {
        xs: 'none',
        md: 'block',
      },
      borderRight: '1px solid',
      borderColor: 'divider',
      direction: 'rtl',
      '& > *': {
        direction: 'ltr',
      },
    },
    sidebarMobile: {
      width: 280,
      height: '100%',
      bgcolor: 'background.paper',
      p: 2,
    },
    link: (level, isActive) => ({
      textAlign: 'left',
      display: 'block',
      width: '100%',
      py: 0.5,
      pl: level * 2,
      pr: 1,
      textDecoration: 'none',
      borderRadius: 1,
      bgcolor: isActive ? 'action.selected' : 'transparent',
      '&:hover': {
        bgcolor: 'action.hover',
      },
    }),
    menuButton: {
      position: 'fixed',
      bottom: 16,
      right: 16,
      zIndex: 1200,
      display: { md: 'none' },
      bgcolor: 'primary.main',
      color: 'primary.contrastText',
      '&:hover': {
        bgcolor: 'primary.dark',
      },
    },
  }

  return (
    <Box sx={styles.root}>
      {/* Основное содержимое */}
      <Box component="main" sx={styles.content}>
        <Container maxWidth="lg">
          <Typography variant="h3" gutterBottom>
            {header}
          </Typography>
          <ReactMarkdown components={MarkdownComponents}>
            {markdown}
          </ReactMarkdown>
        </Container>
      </Box>

      {/* Навигационная панель для десктопа */}
      <Box component="aside" sx={styles.sidebarDesktop}>
        <Typography textAlign="center" variant="h6" mb={2}>
          Содержание
        </Typography>
        <List>
          {headings.map((heading) => (
            <ListItem key={heading.id} disablePadding dense>
              <Link
                href={`#${heading.id}`}
                sx={styles.link(heading.level, currentHeading === heading.id)}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToHeading(heading.id)
                }}
              >
                {heading.text}
              </Link>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Кнопка меню для мобильных */}
      <IconButton
        sx={styles.menuButton}
        onClick={handleDrawerToggle}
        aria-label="open navigation"
      >
        {mobileOpen ? <CloseIcon /> : <MenuIcon />}
      </IconButton>

      {/* Навигационная панель для мобильных */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: {
            xs: 'block',
            md: 'none',
          },
          '& .MuiDrawer-paper': styles.sidebarMobile,
        }}
        anchor="right"
      >
        <Typography textAlign="center" variant="h6" mb={2}>
          Содержание
        </Typography>
        <List>
          {headings.map((heading) => (
            <ListItem key={heading.id} disablePadding dense>
              <Link
                href={`#${heading.id}`}
                sx={styles.link(heading.level, currentHeading === heading.id)}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToHeading(heading.id)
                }}
              >
                {heading.text}
              </Link>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  )
}

export default MarkdownContext
