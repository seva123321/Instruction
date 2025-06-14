import { useRef, useEffect, memo, useMemo, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import {
  Box,
  Typography,
  List,
  ListItem,
  Link as MuiLink,
  Container,
  IconButton,
  useTheme,
  SwipeableDrawer,
} from '@mui/material'
import { Close as CloseIcon, Menu as MenuIcon } from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'

import {
  setHeadings,
  setCurrentHeading,
  toggleMobileOpen,
} from '@/slices/markdownSlice'

import './Markdown.css'

// Генератор уникальных ID для заголовков
const generateHeadingId = (text) =>
  text
    .toString()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)

const createMarkdownComponents = () => ({
  h1: ({ children, ...props }) => (
    <Typography
      variant="h4"
      gutterBottom
      id={generateHeadingId(children)}
      sx={{
        textAlign: 'center',
        fontWeight: 700,
        color: 'text.primary',
        mt: 4,
        mb: 3,
        lineHeight: 1.3,
      }}
      {...props}
    >
      {children}
    </Typography>
  ),
  h2: ({ children, ...props }) => (
    <Typography
      variant="h5"
      gutterBottom
      id={generateHeadingId(children)}
      sx={{
        textAlign: 'center',
        fontWeight: 600,
        color: 'text.primary',
        mt: 3,
        mb: 2,
        lineHeight: 1.3,
      }}
      {...props}
    >
      {children}
    </Typography>
  ),
  h3: ({ children, ...props }) => (
    <Typography
      variant="h6"
      gutterBottom
      id={generateHeadingId(children)}
      sx={{
        fontWeight: 500,
        color: 'text.primary',
        mt: 2,
        mb: 1.5,
        lineHeight: 1.4,
      }}
      {...props}
    >
      {children}
    </Typography>
  ),
  p: ({ children, ...props }) => (
    <Typography
      component="p"
      gutterBottom
      sx={{
        textAlign: 'justify',
        fontSize: '1.1rem',
        lineHeight: 1.7,
        mb: 2,
        textIndent: '1.5em',
        '&:first-letter': {
          fontSize: '1.2em',
          fontWeight: 500,
        },
      }}
      {...props}
    >
      {children}
    </Typography>
  ),
  ul: ({ children, ...props }) => (
    <List
      sx={{
        pl: 2,
        mb: 2,
        listStyleType: 'disc',
      }}
      {...props}
    >
      {children}
    </List>
  ),
  li: ({ children, ...props }) => (
    <ListItem
      sx={{
        display: 'list-item',
        py: 0.5,
        pl: 1,
        lineHeight: 1.6,
      }}
      {...props}
    >
      {children}
    </ListItem>
  ),
  a: ({ children, href, ...props }) => (
    <MuiLink
      href={href}
      sx={{
        color: 'primary.main',
        textDecoration: 'underline',
        '&:hover': {
          color: 'primary.dark',
        },
      }}
      {...props}
    >
      {children}
    </MuiLink>
  ),
  strong: ({ children, ...props }) => (
    <Typography
      component="strong"
      sx={{
        fontWeight: 600,
        color: 'text.primary',
      }}
      {...props}
    >
      {children}
    </Typography>
  ),
  em: ({ children, ...props }) => (
    <Typography
      component="em"
      sx={{
        fontStyle: 'italic',
        color: 'text.secondary',
      }}
      {...props}
    >
      {children}
    </Typography>
  ),
  blockquote: ({ children, ...props }) => (
    <Box
      component="blockquote"
      sx={{
        borderLeft: '4px solid',
        borderColor: 'primary.main',
        pl: 3,
        py: 1,
        my: 2,
        backgroundColor: 'action.hover',
        fontStyle: 'italic',
        color: 'text.secondary',
      }}
      {...props}
    >
      {children}
    </Box>
  ),
  code: ({ children, ...props }) => (
    <Box
      component="code"
      sx={{
        fontFamily: 'monospace',
        backgroundColor: 'background.default',
        px: 1,
        py: 0.5,
        borderRadius: 1,
        fontSize: '0.9em',
      }}
      {...props}
    >
      {children}
    </Box>
  ),
})

const SidebarContent = memo(
  ({ headings, currentHeading, scrollToHeading, styles }) => (
    <>
      <Typography textAlign="center" variant="h6" mt={2} mb={2}>
        Содержание
      </Typography>
      <List>
        {headings.map((heading) => (
          <ListItem
            key={`${heading.id}-${heading.position}`}
            id={`sidebar-item-${heading.id}`}
            disablePadding
            dense
          >
            <MuiLink
              href={`#${heading.id}`}
              sx={{
                ...styles.link(heading.level, currentHeading === heading.id),
                lineHeight: 1.6,
                flexGrow: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                transition: 'background-color 0.3s ease',
              }}
              onClick={(e) => {
                e.preventDefault()
                scrollToHeading(heading.id)
              }}
            >
              {heading.text}
            </MuiLink>
          </ListItem>
        ))}
      </List>
    </>
  )
)

const MarkdownContext = memo(({ markdown, header }) => {
  const theme = useTheme()
  const dispatch = useDispatch()
  const { headings, currentHeading, mobileOpen } = useSelector(
    (state) => state.markdown
  )
  const headingRefs = useRef({})
  const sidebarRef = useRef(null)
  const location = useLocation()
  const updateTimeoutRef = useRef(null)
  const lastHeadingRef = useRef(null)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

  const markdownComponents = useMemo(
    () => createMarkdownComponents(theme),
    [theme]
  )

  const handleDrawerToggle = () => {
    dispatch(toggleMobileOpen())
  }

  const handleDrawerClose = useCallback(() => {
    dispatch(toggleMobileOpen(false))
  }, [dispatch])

  const handleDrawerOpen = useCallback(() => {
    dispatch(toggleMobileOpen(true))
  }, [dispatch])

  const scrollToHeading = useCallback(
    (id) => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }

      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
        window.history.replaceState(null, null, `#${id}`)
        dispatch(setCurrentHeading(id))
        lastHeadingRef.current = id
      }
    },
    [dispatch]
  )

  const updateCurrentHeading = useCallback(
    (id) => {
      if (id !== lastHeadingRef.current) {
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current)
        }

        updateTimeoutRef.current = setTimeout(() => {
          lastHeadingRef.current = id
          dispatch(setCurrentHeading(id))
        }, 300)
      }
    },
    [dispatch]
  )

  useEffect(
    () => () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    },
    []
  )

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
        dispatch(setCurrentHeading(id))
        lastHeadingRef.current = id
      }
    }
  }, [location, dispatch])

  useEffect(() => {
    const headingRegex = /^(#{1,3})\s+(.*)$/gm
    const matches = [...markdown.matchAll(headingRegex)]

    if (matches.length > 0) {
      const extractedHeadings = matches.map((match) => {
        // eslint-disable-next-line no-unused-vars
        const [_, hashes, text] = match
        return {
          level: hashes.length,
          text,
          id: generateHeadingId(text),
          position: match.index,
        }
      })

      const uniqueHeadings = extractedHeadings.filter(
        (heading, index, self) =>
          index === self.findIndex((h) => h.id === heading.id)
      )

      dispatch(setHeadings(uniqueHeadings))
    } else {
      dispatch(setHeadings([]))
    }
  }, [markdown, dispatch])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            updateCurrentHeading(entry.target.id)

            const activeItem = document.getElementById(
              `sidebar-item-${entry.target.id}`
            )

            if (activeItem && sidebarRef.current) {
              const { offsetTop: itemTop, offsetHeight: itemHeight } =
                activeItem
              const { offsetHeight: sidebarHeight } = sidebarRef.current

              sidebarRef.current.scrollTo({
                top: itemTop - sidebarHeight / 2 + itemHeight / 2,
                behavior: 'smooth',
              })
            }
          }
        })
      },
      { rootMargin: '0px 0px -60% 0px', threshold: 0.5 }
    )

    // eslint-disable-next-line prettier/prettier
    const currentRefs = headings.map(
      (heading) => document.getElementById(heading.id)
      // eslint-disable-next-line function-paren-newline
    )
    currentRefs.forEach((heading) => heading && observer.observe(heading))
    headingRefs.current = currentRefs

    return () => {
      headingRefs.current.forEach(
        (heading) => heading && observer.unobserve(heading)
      )
    }
  }, [headings, updateCurrentHeading])

  const styles = useMemo(
    () => ({
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
        '& p, & ul, & ol': {
          maxWidth: '800px',
          marginLeft: 'auto',
          marginRight: 'auto',
        },
        '& h1, & h2, & h3, & h4, & h5, & h6': {
          scrollMarginTop: '80px',
        },
        [theme.breakpoints.down('sm')]: {
          p: '16px 0',
        },
      },
      sidebarDesktop: {
        width: 300,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        bgcolor: 'background.paper',
        boxShadow: 1,
        mt: 3,
        p: 2,
        display: {
          xs: 'none',
          md: 'block',
        },
        borderRight: '1px solid',
        borderColor: 'divider',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.action.hover,
          borderRadius: '3px',
        },
      },
      sidebarMobile: {
        width: 280,
        height: '100%',
        bgcolor: 'background.paper',
        p: 2,
        ...(isIOS && {
          paddingBottom: 'env(safe-area-inset-bottom)',
        }),
      },
      drawerPaper: {
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.action.hover,
          borderRadius: '3px',
        },
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
    }),
    [theme, isIOS]
  )

  return (
    <Box sx={styles.root}>
      <Box component="main" sx={styles.content}>
        <Container maxWidth="lg">
          <Typography variant="h3" gutterBottom>
            {header}
          </Typography>
          <ReactMarkdown components={markdownComponents}>
            {markdown}
          </ReactMarkdown>
        </Container>
      </Box>

      <Box component="aside" sx={styles.sidebarDesktop} ref={sidebarRef}>
        <SidebarContent
          headings={headings}
          currentHeading={currentHeading}
          scrollToHeading={scrollToHeading}
          styles={styles}
        />
      </Box>

      <IconButton
        sx={styles.menuButton}
        onClick={handleDrawerToggle}
        aria-label="open navigation"
      >
        {mobileOpen ? <CloseIcon /> : <MenuIcon />}
      </IconButton>

      <SwipeableDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerClose}
        onOpen={handleDrawerOpen}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            ...styles.sidebarMobile,
            ...styles.drawerPaper,
          },
        }}
        slotProps={{
          sx: styles.drawerPaper,
        }}
        anchor="right"
        disableBackdropTransition={!isIOS}
        disableDiscovery={isIOS}
        swipeAreaWidth={20}
      >
        <SidebarContent
          headings={headings}
          currentHeading={currentHeading}
          scrollToHeading={scrollToHeading}
          styles={styles}
        />
      </SwipeableDrawer>
    </Box>
  )
})

export default MarkdownContext
