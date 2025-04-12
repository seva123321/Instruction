import { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react'
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
  Drawer,
  useTheme,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
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

const createMarkdownComponents = (theme) => ({
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

const useStyles = (theme) =>
  useMemo(
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
    [theme]
  )

const SidebarContent = memo(
  ({ headings, currentHeading, scrollToHeading, styles }) => {
    return (
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
                  transition: 'background-color 0.3s ease', // Добавляем плавный переход
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
  }
)

const MarkdownContext = memo(({ markdown, header }) => {
  const theme = useTheme()
  const styles = useStyles(theme)
  const [headings, setHeadings] = useState([])
  const [currentHeading, setCurrentHeading] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const headingRefs = useRef({})
  const sidebarRef = useRef(null)
  const location = useLocation()
  const updateTimeoutRef = useRef(null) // Таймер для задержки обновления
  const lastHeadingRef = useRef(null) // Последний активный заголовок

  const markdownComponents = useMemo(
    () => createMarkdownComponents(theme),
    [theme]
  )

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen((prev) => !prev)
  }, [])

  const scrollToHeading = useCallback((id) => {
    // Очищаем предыдущий таймер при клике
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
      setCurrentHeading(id) // Мгновенное обновление при клике
      lastHeadingRef.current = id
    }
  }, [])

  // Оптимизированное обновление текущего заголовка с задержкой
  const updateCurrentHeading = useCallback((id) => {
    if (id !== lastHeadingRef.current) {
      // Очищаем предыдущий таймер
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }

      // Устанавливаем новый таймер с задержкой 300мс
      updateTimeoutRef.current = setTimeout(() => {
        lastHeadingRef.current = id
        setCurrentHeading(id)
      }, 300)
    }
  }, [])

  useEffect(() => {
    return () => {
      // Очищаем таймер при размонтировании
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
        setCurrentHeading(id)
        lastHeadingRef.current = id
      }
    }
  }, [location])

  useEffect(() => {
    const headingRegex = /^(#{1,3})\s+(.*)$/gm
    const matches = [...markdown.matchAll(headingRegex)]

    if (matches.length > 0) {
      const extractedHeadings = matches.map((match) => {
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

      setHeadings(uniqueHeadings)
    } else {
      setHeadings([])
    }
  }, [markdown])

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

    const currentRefs = headings.map((heading) =>
      document.getElementById(heading.id)
    )
    currentRefs.forEach((heading) => heading && observer.observe(heading))
    headingRefs.current = currentRefs

    return () => {
      headingRefs.current.forEach(
        (heading) => heading && observer.unobserve(heading)
      )
    }
  }, [headings, updateCurrentHeading])

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

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': styles.sidebarMobile,
        }}
        anchor="right"
      >
        <SidebarContent
          headings={headings}
          currentHeading={currentHeading}
          scrollToHeading={scrollToHeading}
          styles={styles}
        />
      </Drawer>
    </Box>
  )
})

export default MarkdownContext

// import { useState, useRef, useEffect, useCallback } from 'react'
// import { useLocation } from 'react-router-dom'
// import ReactMarkdown from 'react-markdown'
// import {
//   Box,
//   Typography,
//   List,
//   ListItem,
//   Link,
//   Container,
//   IconButton,
//   Drawer,
//   useMediaQuery,
//   useTheme,
// } from '@mui/material'
// import MenuIcon from '@mui/icons-material/Menu'
// import CloseIcon from '@mui/icons-material/Close'
// import './Markdown.css'

// const MarkdownComponents = {
//   h1: (props) => {
//     const id = props.children
//       .toString()
//       .toLowerCase()
//       .replace(/\s+/g, '-')
//       .slice(0, 35)
//     return (
//       <Typography
//         variant="h4"
//         gutterBottom
//         id={id}
//         sx={{
//           textAlign: 'center',
//           fontWeight: 700,
//           color: 'text.primary',
//           mt: 4,
//           mb: 3,
//           lineHeight: 1.3,
//         }}
//         {...props}
//       />
//     )
//   },
//   h2: (props) => {
//     const id = props.children
//       .toString()
//       .toLowerCase()
//       .replace(/\s+/g, '-')
//       .slice(0, 35)
//     return (
//       <Typography
//         variant="h5"
//         gutterBottom
//         id={id}
//         sx={{
//           textAlign: 'center',
//           fontWeight: 600,
//           color: 'text.primary',
//           mt: 3,
//           mb: 2,
//           lineHeight: 1.3,
//         }}
//         {...props}
//       />
//     )
//   },
//   h3: (props) => {
//     const id = props.children
//       .toString()
//       .toLowerCase()
//       .replace(/\s+/g, '-')
//       .slice(0, 35)
//     return (
//       <Typography
//         variant="h6"
//         gutterBottom
//         id={id}
//         sx={{
//           fontWeight: 500,
//           color: 'text.primary',
//           mt: 2,
//           mb: 1.5,
//           lineHeight: 1.4,
//         }}
//         {...props}
//       />
//     )
//   },
//   p: (props) => (
//     <Typography
//       component="p"
//       gutterBottom
//       sx={{
//         textAlign: 'justify',
//         fontSize: '1.1rem',
//         lineHeight: 1.7,
//         mb: 2,
//         textIndent: '1.5em',
//         '&:first-letter': {
//           fontSize: '1.2em',
//           fontWeight: 500,
//         },
//       }}
//       {...props}
//     />
//   ),
//   ul: (props) => (
//     <List
//       sx={{
//         pl: 2,
//         mb: 2,
//         listStyleType: 'disc',
//       }}
//       {...props}
//     />
//   ),
//   li: (props) => (
//     <ListItem
//       sx={{
//         display: 'list-item',
//         py: 0.5,
//         pl: 1,
//         lineHeight: 1.6,
//       }}
//       {...props}
//     />
//   ),
//   a: (props) => (
//     <Link
//       sx={{
//         color: 'primary.main',
//         textDecoration: 'underline',
//         '&:hover': {
//           color: 'primary.dark',
//         },
//       }}
//       {...props}
//     />
//   ),
//   strong: (props) => (
//     <Typography
//       component="strong"
//       sx={{
//         fontWeight: 600,
//         color: 'text.primary',
//       }}
//       {...props}
//     />
//   ),
//   em: (props) => (
//     <Typography
//       component="em"
//       sx={{
//         fontStyle: 'italic',
//         color: 'text.secondary',
//       }}
//       {...props}
//     />
//   ),
//   blockquote: (props) => (
//     <Box
//       component="blockquote"
//       sx={{
//         borderLeft: '4px solid',
//         borderColor: 'primary.main',
//         pl: 3,
//         py: 1,
//         my: 2,
//         backgroundColor: 'action.hover',
//         fontStyle: 'italic',
//         color: 'text.secondary',
//       }}
//       {...props}
//     />
//   ),
//   code: (props) => (
//     <Box
//       component="code"
//       sx={{
//         fontFamily: 'monospace',
//         backgroundColor: 'background.default',
//         px: 1,
//         py: 0.5,
//         borderRadius: 1,
//         fontSize: '0.9em',
//       }}
//       {...props}
//     />
//   ),
// }

// function MarkdownContext({ markdown, header }) {
//   const theme = useTheme()
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'))
//   const [headings, setHeadings] = useState([])
//   const [currentHeading, setCurrentHeading] = useState(null)
//   const [mobileOpen, setMobileOpen] = useState(false)
//   const headingRefs = useRef({})
//   const sidebarRef = useRef(null)
//   const location = useLocation()

//   const handleDrawerToggle = () => {
//     setMobileOpen(!mobileOpen)
//   }

//   useEffect(() => {
//     if (location.hash) {
//       const element = document.getElementById(location.hash.slice(1))
//       if (element) {
//         element.scrollIntoView({ behavior: 'smooth' })
//       }
//     }
//   }, [location])

//   // Извлечение заголовков из markdown
//   useEffect(() => {
//     const headingRegex = /^(#{1,3})\s+(.*)$/gm
//     const matches = markdown.match(headingRegex)
//     setHeadings([])
//     if (matches) {
//       const extractedHeadings = matches.map((heading) => {
//         const level = heading.match(/#/g).length
//         const text = heading.replace(/^(#{1,3})\s+/, '')
//         const id = text.toLowerCase().replace(/\s+/g, '-').slice(0, 35)
//         return {
//           level,
//           text,
//           id,
//         }
//       })

//       setHeadings(extractedHeadings)
//     }
//   }, [markdown])

//   // Настройка IntersectionObserver для отслеживания видимости заголовков
//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             setCurrentHeading(entry.target.id)

//             // Прокручиваем sidebar к активному элементу
//             const activeItem = document.getElementById(
//               `sidebar-item-${entry.target.id}`
//             )
//             if (activeItem && sidebarRef.current) {
//               const sidebar = sidebarRef.current
//               const itemTop = activeItem.offsetTop
//               const itemHeight = activeItem.offsetHeight
//               const sidebarHeight = sidebar.offsetHeight

//               // Центрируем активный элемент в sidebar
//               sidebar.scrollTo({
//                 top: itemTop - sidebarHeight / 2 + itemHeight / 2,
//                 behavior: 'smooth',
//               })
//             }
//           }
//         })
//       },
//       {
//         rootMargin: '0px 0px -60% 0px',
//         threshold: 0.5,
//       }
//     )

//     headingRefs.current = headings.map((heading) =>
//       document.getElementById(heading.id)
//     )

//     headingRefs.current.forEach((heading) => {
//       if (heading) {
//         observer.observe(heading)
//       }
//     })

//     return () => {
//       headingRefs.current.forEach((heading) => {
//         if (heading) {
//           observer.unobserve(heading)
//         }
//       })
//     }
//   }, [headings])

//   const scrollToHeading = useCallback(
//     (id) => {
//       const element = document.getElementById(id)
//       if (element) {
//         element.scrollIntoView({
//           behavior: 'smooth',
//           block: 'start',
//         })
//       }
//       if (isMobile) {
//         setMobileOpen(false)
//       }
//     },
//     [isMobile]
//   )

// const styles = {
//   root: {
//     display: 'flex',
//     position: 'relative',
//     width: '100%',
//   },
//   content: {
//     flexGrow: 1,
//     width: '100%',
//     maxWidth: { md: 'calc(100% - 300px)' },
//     padding: 3,
//     '& p, & ul, & ol': {
//       maxWidth: '800px',
//       marginLeft: 'auto',
//       marginRight: 'auto',
//     },
//     '& h1, & h2, & h3, & h4, & h5, & h6': {
//       scrollMarginTop: '80px',
//     },
//   },
//   sidebarDesktop: {
//     width: 300,
//     position: 'sticky',
//     top: 0,
//     height: '100vh',
//     overflowY: 'auto',
//     bgcolor: 'background.paper',
//     boxShadow: 1,
//     p: 2,
//     display: {
//       xs: 'none',
//       md: 'block',
//     },
//     borderRight: '1px solid',
//     borderColor: 'divider',
//     '&::-webkit-scrollbar': {
//       width: '6px',
//     },
//     '&::-webkit-scrollbar-thumb': {
//       backgroundColor: theme.palette.action.hover,
//       borderRadius: '3px',
//     },
//   },
//   sidebarMobile: {
//     width: 280,
//     height: '100%',
//     bgcolor: 'background.paper',
//     p: 2,
//   },
//   link: (level, isActive) => ({
//     textAlign: 'left',
//     display: 'block',
//     width: '100%',
//     py: 0.5,
//     pl: level * 2,
//     pr: 1,
//     textDecoration: 'none',
//     borderRadius: 1,
//     bgcolor: isActive ? 'action.selected' : 'transparent',
//     '&:hover': {
//       bgcolor: 'action.hover',
//     },
//   }),
//   menuButton: {
//     position: 'fixed',
//     bottom: 16,
//     right: 16,
//     zIndex: 1200,
//     display: { md: 'none' },
//     bgcolor: 'primary.main',
//     color: 'primary.contrastText',
//     '&:hover': {
//       bgcolor: 'primary.dark',
//     },
//   },
// }

//   const renderSidebarContent = () => (
//     <>
//       <Typography textAlign="center" variant="h6" mb={2}>
//         Содержание
//       </Typography>
//       <List>
//         {headings.map((heading) => (
//           <ListItem
//             key={heading.id}
//             id={`sidebar-item-${heading.id}`}
//             disablePadding
//             dense
//           >
//             <Link
//               href={`#${heading.id}`}
//               sx={{
//                 ...styles.link(heading.level, currentHeading === heading.id),
//                 lineHeight: 1.6,
//                 flexGrow: 1,
//                 overflow: 'hidden',
//                 textOverflow: 'ellipsis',
//                 display: '-webkit-box',
//                 WebkitLineClamp: 4,
//                 WebkitBoxOrient: 'vertical',
//               }}
//               onClick={(e) => {
//                 e.preventDefault()
//                 scrollToHeading(heading.id)
//               }}
//             >
//               {heading.text}
//             </Link>
//           </ListItem>
//         ))}
//       </List>
//     </>
//   )
//   console.log('render MarkdownContext > ')

//   return (
//     <Box sx={styles.root}>
//       {/* Основное содержимое */}
//       <Box component="main" sx={styles.content}>
//         <Container maxWidth="lg">
//           <Typography variant="h3" gutterBottom>
//             {header}
//           </Typography>
//           <ReactMarkdown components={MarkdownComponents}>
//             {markdown}
//           </ReactMarkdown>
//         </Container>
//       </Box>

//       {/* Навигационная панель для десктопа */}
//       <Box component="aside" sx={styles.sidebarDesktop} ref={sidebarRef}>
//         {renderSidebarContent()}
//       </Box>

//       {/* Кнопка меню для мобильных */}
//       <IconButton
//         sx={styles.menuButton}
//         onClick={handleDrawerToggle}
//         aria-label="open navigation"
//       >
//         {mobileOpen ? <CloseIcon /> : <MenuIcon />}
//       </IconButton>

//       {/* Навигационная панель для мобильных */}
//       <Drawer
//         variant="temporary"
//         open={mobileOpen}
//         onClose={handleDrawerToggle}
//         ModalProps={{
//           keepMounted: true,
//         }}
//         sx={{
//           display: {
//             xs: 'block',
//             md: 'none',
//           },
//           '& .MuiDrawer-paper': styles.sidebarMobile,
//         }}
//         anchor="right"
//       >
//         {renderSidebarContent()}
//       </Drawer>
//     </Box>
//   )
// }

// export default MarkdownContext
