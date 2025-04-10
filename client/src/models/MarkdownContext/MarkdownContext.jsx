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

// Генератор уникальных ID для заголовков
const generateHeadingId = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
}

const MarkdownComponents = {
  h1: ({ children, ...props }) => {
    const id = generateHeadingId(children)
    return (
      <Typography
        variant="h4"
        gutterBottom
        id={id}
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
    )
  },
  h2: ({ children, ...props }) => {
    const id = generateHeadingId(children)
    return (
      <Typography
        variant="h5"
        gutterBottom
        id={id}
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
    )
  },
  h3: ({ children, ...props }) => {
    const id = generateHeadingId(children)
    return (
      <Typography
        variant="h6"
        gutterBottom
        id={id}
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
    )
  },
  p: (props) => (
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
    />
  ),
  ul: (props) => (
    <List
      sx={{
        pl: 2,
        mb: 2,
        listStyleType: 'disc',
      }}
      {...props}
    />
  ),
  li: (props) => (
    <ListItem
      sx={{
        display: 'list-item',
        py: 0.5,
        pl: 1,
        lineHeight: 1.6,
      }}
      {...props}
    />
  ),
  a: (props) => (
    <Link
      sx={{
        color: 'primary.main',
        textDecoration: 'underline',
        '&:hover': {
          color: 'primary.dark',
        },
      }}
      {...props}
    />
  ),
  strong: (props) => (
    <Typography
      component="strong"
      sx={{
        fontWeight: 600,
        color: 'text.primary',
      }}
      {...props}
    />
  ),
  em: (props) => (
    <Typography
      component="em"
      sx={{
        fontStyle: 'italic',
        color: 'text.secondary',
      }}
      {...props}
    />
  ),
  blockquote: (props) => (
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
    />
  ),
  code: (props) => (
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
    />
  ),
}

function MarkdownContext({ markdown, header }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [headings, setHeadings] = useState([])
  const [currentHeading, setCurrentHeading] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const headingRefs = useRef({})
  const sidebarRef = useRef(null)
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
    const matches = [...markdown.matchAll(headingRegex)] // Используем matchAll для получения позиций
    setHeadings([])
    if (matches.length > 0) {
      const extractedHeadings = matches.map((match) => {
        const [fullMatch, hashes, text] = match
        const level = hashes.length
        const id = generateHeadingId(text)
        return {
          level,
          text,
          id,
          position: match.index, // Используем позицию в тексте для уникальности
        }
      })

      // Удаляем дубликаты по ID (если такие есть)
      const uniqueHeadings = extractedHeadings.reduce((acc, heading) => {
        if (!acc.some((h) => h.id === heading.id)) {
          acc.push(heading)
        }
        return acc
      }, [])

      setHeadings(uniqueHeadings)
    }
  }, [markdown])

  // Настройка IntersectionObserver для отслеживания видимости заголовков
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentHeading(entry.target.id)

            // Прокручиваем sidebar к активному элементу
            const activeItem = document.getElementById(
              `sidebar-item-${entry.target.id}`
            )
            if (activeItem && sidebarRef.current) {
              const sidebar = sidebarRef.current
              const itemTop = activeItem.offsetTop
              const itemHeight = activeItem.offsetHeight
              const sidebarHeight = sidebar.offsetHeight

              // Центрируем активный элемент в sidebar
              sidebar.scrollTo({
                top: itemTop - sidebarHeight / 2 + itemHeight / 2,
                behavior: 'smooth',
              })
            }
          }
        })
      },
      {
        rootMargin: '0px 0px -60% 0px',
        threshold: 0.5,
      }
    )

    headingRefs.current = headings.map((heading) =>
      document.getElementById(heading.id)
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
      // Добавляем небольшую задержку для гарантированной прокрутки
      setTimeout(() => {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })

          // Обновляем URL без перезагрузки страницы
          window.history.replaceState(null, null, `#${id}`)
        }
      }, 50)
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
  }

  const renderSidebarContent = () => (
    <>
      <Typography textAlign="center" variant="h6" mb={2}>
        Содержание
      </Typography>
      <List>
        {headings.map((heading) => (
          <ListItem
            key={`${heading.id}-${heading.position}`} // Уникальный ключ с ID и позицией
            id={`sidebar-item-${heading.id}`}
            disablePadding
            dense
          >
            <Link
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
              }}
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
    </>
  )

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
      <Box component="aside" sx={styles.sidebarDesktop} ref={sidebarRef}>
        {renderSidebarContent()}
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
        {renderSidebarContent()}
      </Drawer>
    </Box>
  )
}

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

//   const styles = {
//     root: {
//       display: 'flex',
//       position: 'relative',
//       width: '100%',
//     },
//     content: {
//       flexGrow: 1,
//       width: '100%',
//       maxWidth: { md: 'calc(100% - 300px)' },
//       padding: 3,
//       '& p, & ul, & ol': {
//         maxWidth: '800px',
//         marginLeft: 'auto',
//         marginRight: 'auto',
//       },
//       '& h1, & h2, & h3, & h4, & h5, & h6': {
//         scrollMarginTop: '80px',
//       },
//     },
//     sidebarDesktop: {
//       width: 300,
//       position: 'sticky',
//       top: 0,
//       height: '100vh',
//       overflowY: 'auto',
//       bgcolor: 'background.paper',
//       boxShadow: 1,
//       p: 2,
//       display: {
//         xs: 'none',
//         md: 'block',
//       },
//       borderRight: '1px solid',
//       borderColor: 'divider',
//       '&::-webkit-scrollbar': {
//         width: '6px',
//       },
//       '&::-webkit-scrollbar-thumb': {
//         backgroundColor: theme.palette.action.hover,
//         borderRadius: '3px',
//       },
//     },
//     sidebarMobile: {
//       width: 280,
//       height: '100%',
//       bgcolor: 'background.paper',
//       p: 2,
//     },
//     link: (level, isActive) => ({
//       textAlign: 'left',
//       display: 'block',
//       width: '100%',
//       py: 0.5,
//       pl: level * 2,
//       pr: 1,
//       textDecoration: 'none',
//       borderRadius: 1,
//       bgcolor: isActive ? 'action.selected' : 'transparent',
//       '&:hover': {
//         bgcolor: 'action.hover',
//       },
//     }),
//     menuButton: {
//       position: 'fixed',
//       bottom: 16,
//       right: 16,
//       zIndex: 1200,
//       display: { md: 'none' },
//       bgcolor: 'primary.main',
//       color: 'primary.contrastText',
//       '&:hover': {
//         bgcolor: 'primary.dark',
//       },
//     },
//   }

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
